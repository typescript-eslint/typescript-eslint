import * as fs from 'fs';
import glob from 'glob';
import * as path from 'path';
import * as ts from 'typescript';

import { clearWatchCaches } from '../../src/create-program/createWatchProgram';
import { createProgramFromConfigFile as createProgram } from '../../src/create-program/useProvidedPrograms';
import type { ParseAndGenerateServicesResult } from '../../src/parser';
import { parseAndGenerateServices } from '../../src/parser';
import type { TSESTreeOptions } from '../../src/parser-options';
import type { TSESTree } from '../../src/ts-estree';
import {
  createSnapshotTestBlock,
  formatSnapshotName,
  parseCodeAndGenerateServices,
} from '../../tools/test-utils';

const FIXTURES_DIR = './tests/fixtures/semanticInfo';
const testFiles = glob.sync(`**/*.src.ts`, {
  cwd: FIXTURES_DIR,
});

function createOptions(fileName: string): TSESTreeOptions & { cwd?: string } {
  return {
    loc: true,
    range: true,
    tokens: true,
    comment: true,
    jsx: false,
    errorOnUnknownASTType: true,
    filePath: fileName,
    tsconfigRootDir: path.join(process.cwd(), FIXTURES_DIR),
    project: `./tsconfig.json`,
    loggerFn: false,
  };
}

// ensure tsconfig-parser watch caches are clean for each test
beforeEach(() => clearWatchCaches());

describe('semanticInfo', () => {
  // test all AST snapshots
  testFiles.forEach(filename => {
    const code = fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf8');
    it(
      formatSnapshotName(filename, FIXTURES_DIR, path.extname(filename)),
      createSnapshotTestBlock(
        code,
        createOptions(filename),
        /*generateServices*/ true,
      ),
    );
  });

  it(`should cache the created ts.program`, () => {
    const filename = testFiles[0];
    const code = fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf8');
    const options = createOptions(filename);
    const optionsProjectString = {
      ...options,
      project: './tsconfig.json',
    };
    expect(
      parseAndGenerateServices(code, optionsProjectString).services.program,
    ).toBe(
      parseAndGenerateServices(code, optionsProjectString).services.program,
    );
  });

  it(`should handle "project": "./tsconfig.json" and "project": ["./tsconfig.json"] the same`, () => {
    const filename = testFiles[0];
    const code = fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf8');
    const options = createOptions(filename);
    const optionsProjectString = {
      ...options,
      project: './tsconfig.json',
    };
    const optionsProjectArray = {
      ...options,
      project: ['./tsconfig.json'],
    };
    expect(parseAndGenerateServices(code, optionsProjectString)).toEqual(
      parseAndGenerateServices(code, optionsProjectArray),
    );
  });

  it(`should resolve absolute and relative tsconfig paths the same`, () => {
    const filename = testFiles[0];
    const code = fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf8');
    const options = createOptions(filename);
    const optionsAbsolutePath = {
      ...options,
      project: `${__dirname}/../fixtures/semanticInfo/tsconfig.json`,
    };
    const optionsRelativePath = {
      ...options,
      project: `./tsconfig.json`,
    };
    const absolutePathResult = parseAndGenerateServices(
      code,
      optionsAbsolutePath,
    );
    const relativePathResult = parseAndGenerateServices(
      code,
      optionsRelativePath,
    );
    if (absolutePathResult.services.program === undefined) {
      throw new Error('Unable to create ts.program for absolute tsconfig');
    } else if (relativePathResult.services.program === undefined) {
      throw new Error('Unable to create ts.program for relative tsconfig');
    }
    expect(
      absolutePathResult.services.program.getResolvedProjectReferences(),
    ).toEqual(
      relativePathResult.services.program.getResolvedProjectReferences(),
    );
  });

  // case-specific tests
  it('isolated-file tests', () => {
    const fileName = path.resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const parseResult = parseCodeAndGenerateServices(
      fs.readFileSync(fileName, 'utf8'),
      createOptions(fileName),
    );

    testIsolatedFile(parseResult);
  });

  it('isolated-vue-file tests', () => {
    const fileName = path.resolve(FIXTURES_DIR, 'extra-file-extension.vue');
    const parseResult = parseCodeAndGenerateServices(
      fs.readFileSync(fileName, 'utf8'),
      {
        ...createOptions(fileName),
        extraFileExtensions: ['.vue'],
      },
    );

    testIsolatedFile(parseResult);
  });

  it('non-existent-estree-nodes tests', () => {
    const fileName = path.resolve(
      FIXTURES_DIR,
      'non-existent-estree-nodes.src.ts',
    );
    const parseResult = parseCodeAndGenerateServices(
      fs.readFileSync(fileName, 'utf8'),
      createOptions(fileName),
    );

    expect(parseResult).toHaveProperty('services.esTreeNodeToTSNodeMap');
    const binaryExpression = (
      parseResult.ast.body[0] as TSESTree.VariableDeclaration
    ).declarations[0].init!;
    const tsBinaryExpression =
      parseResult.services.esTreeNodeToTSNodeMap.get(binaryExpression);
    expect(tsBinaryExpression.kind).toEqual(ts.SyntaxKind.BinaryExpression);

    const computedPropertyString = (
      (parseResult.ast.body[1] as TSESTree.ClassDeclaration).body
        .body[0] as TSESTree.PropertyDefinition
    ).key;
    const tsComputedPropertyString =
      parseResult.services.esTreeNodeToTSNodeMap.get(computedPropertyString);
    expect(tsComputedPropertyString.kind).toEqual(ts.SyntaxKind.StringLiteral);
  });

  it('imported-file tests', () => {
    const fileName = path.resolve(FIXTURES_DIR, 'import-file.src.ts');
    const parseResult = parseCodeAndGenerateServices(
      fs.readFileSync(fileName, 'utf8'),
      createOptions(fileName),
    );

    // get type checker
    expect(parseResult).toHaveProperty('services.program.getTypeChecker');
    const checker = parseResult.services.program.getTypeChecker();

    // get array node (ast shape validated by snapshot)
    // node is defined in other file than the parsed one
    const arrayBoundName = (
      (
        (parseResult.ast.body[1] as TSESTree.ExpressionStatement)
          .expression as TSESTree.CallExpression
      ).callee as TSESTree.MemberExpression
    ).object as TSESTree.Identifier;
    expect(arrayBoundName.name).toBe('arr');

    expect(parseResult).toHaveProperty('services.esTreeNodeToTSNodeMap');
    const tsArrayBoundName =
      parseResult.services.esTreeNodeToTSNodeMap.get(arrayBoundName);
    expect(tsArrayBoundName).toBeDefined();
    checkNumberArrayType(checker, tsArrayBoundName);

    expect(
      parseResult.services.tsNodeToESTreeNodeMap.get(tsArrayBoundName),
    ).toBe(arrayBoundName);
  });

  it('non-existent file tests', () => {
    const parseResult = parseCodeAndGenerateServices(
      `const x = [parseInt("5")];`,
      {
        ...createOptions('<input>'),
        project: undefined,
        preserveNodeMaps: true,
      },
    );

    expect(parseResult.services.program).toBeDefined();

    // get bound name
    const boundName = (parseResult.ast.body[0] as TSESTree.VariableDeclaration)
      .declarations[0].id as TSESTree.Identifier;
    expect(boundName.name).toBe('x');

    const tsBoundName =
      parseResult.services.esTreeNodeToTSNodeMap.get(boundName);
    expect(tsBoundName).toBeDefined();

    expect(parseResult.services.tsNodeToESTreeNodeMap.get(tsBoundName)).toBe(
      boundName,
    );
  });

  it('non-existent file should provide parents nodes', () => {
    const parseResult = parseCodeAndGenerateServices(
      `function M() { return Base }`,
      { ...createOptions('<input>'), project: undefined },
    );

    expect(parseResult.services.program).toBeDefined();
  });

  it(`non-existent file should throw error when project provided`, () => {
    expect(() =>
      parseCodeAndGenerateServices(
        `function M() { return Base }`,
        createOptions('<input>'),
      ),
    ).toThrow(
      /ESLint was configured to run on `<tsconfigRootDir>\/estree\.ts` using/,
    );
  });

  it('non-existent project file', () => {
    const fileName = path.resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const badConfig = createOptions(fileName);
    badConfig.project = './tsconfigs.json';
    expect(() =>
      parseCodeAndGenerateServices(
        fs.readFileSync(fileName, 'utf8'),
        badConfig,
      ),
    ).toThrow(/Cannot read file .+tsconfigs\.json'/);
  });

  it('fail to read project file', () => {
    const fileName = path.resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const badConfig = createOptions(fileName);
    badConfig.project = '.';
    expect(() =>
      parseCodeAndGenerateServices(
        fs.readFileSync(fileName, 'utf8'),
        badConfig,
      ),
    ).toThrow(
      // case insensitive because unix based systems are case insensitive
      /Cannot read file .+semanticInfo'./i,
    );
  });

  it('malformed project file', () => {
    const fileName = path.resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const badConfig = createOptions(fileName);
    badConfig.project = './badTSConfig/tsconfig.json';
    expect(() =>
      parseCodeAndGenerateServices(
        fs.readFileSync(fileName, 'utf8'),
        badConfig,
      ),
    ).toThrowErrorMatchingSnapshot();
  });

  it('default program produced with option', () => {
    const parseResult = parseCodeAndGenerateServices('var foo = 5;', {
      ...createOptions('<input>'),
      createDefaultProgram: true,
    });

    expect(parseResult.services.program).toBeDefined();
  });

  it('empty programs array should throw', () => {
    const fileName = path.resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const badConfig = createOptions(fileName);
    badConfig.programs = [];
    expect(() => parseAndGenerateServices('const foo = 5;', badConfig)).toThrow(
      'You have set parserOptions.programs to an empty array. This will cause all files to not be found in existing programs. Either provide one or more existing TypeScript Program instances in the array, or remove the parserOptions.programs setting.',
    );
  });

  it(`first matching provided program instance is returned in result`, () => {
    const filename = testFiles[0];
    const program1 = createProgram(path.join(FIXTURES_DIR, 'tsconfig.json'));
    const program2 = createProgram(path.join(FIXTURES_DIR, 'tsconfig.json'));
    const code = fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf8');
    const options = createOptions(filename);
    const optionsProjectString = {
      ...options,
      programs: [program1, program2],
      project: './tsconfig.json',
    };
    const parseResult = parseAndGenerateServices(code, optionsProjectString);
    expect(parseResult.services.program).toBe(program1);
  });

  it('file not in provided program instance(s)', () => {
    const filename = 'non-existent-file.ts';
    const program1 = createProgram(path.join(FIXTURES_DIR, 'tsconfig.json'));
    const options = createOptions(filename);
    const optionsWithSingleProgram = {
      ...options,
      programs: [program1],
    };
    expect(() =>
      parseAndGenerateServices('const foo = 5;', optionsWithSingleProgram),
    ).toThrow(
      `The file was not found in any of the provided program instance(s): ${filename}`,
    );

    const program2 = createProgram(path.join(FIXTURES_DIR, 'tsconfig.json'));
    const optionsWithMultiplePrograms = {
      ...options,
      programs: [program1, program2],
    };
    expect(() =>
      parseAndGenerateServices('const foo = 5;', optionsWithMultiplePrograms),
    ).toThrow(
      `The file was not found in any of the provided program instance(s): ${filename}`,
    );
  });

  it('createProgram fails on non-existent file', () => {
    expect(() => createProgram('tsconfig.non-existent.json')).toThrow();
  });

  it('createProgram fails on tsconfig with errors', () => {
    expect(() =>
      createProgram(path.join(FIXTURES_DIR, 'badTSConfig', 'tsconfig.json')),
    ).toThrow();
  });
});

function testIsolatedFile(
  parseResult: ParseAndGenerateServicesResult<TSESTreeOptions>,
): void {
  // get type checker
  expect(parseResult).toHaveProperty('services.program.getTypeChecker');
  const checker = parseResult.services.program.getTypeChecker();

  // get number node (ast shape validated by snapshot)
  const declaration = (parseResult.ast.body[0] as TSESTree.VariableDeclaration)
    .declarations[0];
  const arrayMember = (declaration.init! as TSESTree.ArrayExpression)
    .elements[0];
  expect(parseResult).toHaveProperty('services.esTreeNodeToTSNodeMap');

  // get corresponding TS node
  const tsArrayMember =
    parseResult.services.esTreeNodeToTSNodeMap.get(arrayMember);
  expect(tsArrayMember).toBeDefined();
  expect(tsArrayMember.kind).toBe(ts.SyntaxKind.NumericLiteral);
  expect((tsArrayMember as ts.NumericLiteral).text).toBe('3');

  // get type of TS node
  const arrayMemberType = checker.getTypeAtLocation(tsArrayMember);
  expect(arrayMemberType.flags).toBe(ts.TypeFlags.NumberLiteral);
  // using an internal api
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((arrayMemberType as any).value).toBe(3);

  // make sure it maps back to original ESTree node
  expect(parseResult).toHaveProperty('services.tsNodeToESTreeNodeMap');
  expect(parseResult.services.tsNodeToESTreeNodeMap.get(tsArrayMember)).toBe(
    arrayMember,
  );

  // get bound name
  const boundName = declaration.id as TSESTree.Identifier;
  expect(boundName.name).toBe('x');
  const tsBoundName = parseResult.services.esTreeNodeToTSNodeMap.get(boundName);
  expect(tsBoundName).toBeDefined();
  checkNumberArrayType(checker, tsBoundName);
  expect(parseResult.services.tsNodeToESTreeNodeMap.get(tsBoundName)).toBe(
    boundName,
  );
}

/**
 * Verifies that the type of a TS node is number[] as expected
 * @param {ts.TypeChecker} checker
 * @param {ts.Node} tsNode
 */
function checkNumberArrayType(checker: ts.TypeChecker, tsNode: ts.Node): void {
  const nodeType = checker.getTypeAtLocation(tsNode);
  expect(nodeType.flags).toBe(ts.TypeFlags.Object);
  expect((nodeType as ts.ObjectType).objectFlags).toBe(
    ts.ObjectFlags.Reference,
  );
  const typeArguments = checker.getTypeArguments(nodeType as ts.TypeReference);
  expect(typeArguments).toHaveLength(1);
  expect(typeArguments[0].flags).toBe(ts.TypeFlags.Number);
}

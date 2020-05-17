import { readFileSync } from 'fs';
import glob from 'glob';
import { extname, join, resolve } from 'path';
import * as ts from 'typescript';
import { TSESTreeOptions } from '../../src/parser-options';
import {
  createSnapshotTestBlock,
  formatSnapshotName,
  parseCodeAndGenerateServices,
} from '../../tools/test-utils';
import {
  clearCaches,
  parseAndGenerateServices,
  ParseAndGenerateServicesResult,
} from '../../src';
import { TSESTree } from '../../src/ts-estree';

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
    useJSXTextNode: false,
    errorOnUnknownASTType: true,
    filePath: fileName,
    tsconfigRootDir: join(process.cwd(), FIXTURES_DIR),
    project: `./tsconfig.json`,
    loggerFn: false,
  };
}

// ensure tsconfig-parser caches are clean for each test
beforeEach(() => clearCaches());

describe('semanticInfo', () => {
  // test all AST snapshots
  testFiles.forEach(filename => {
    const code = readFileSync(join(FIXTURES_DIR, filename), 'utf8');
    it(
      formatSnapshotName(filename, FIXTURES_DIR, extname(filename)),
      createSnapshotTestBlock(
        code,
        createOptions(filename),
        /*generateServices*/ true,
      ),
    );
  });

  it(`should cache the created ts.program`, () => {
    const filename = testFiles[0];
    const code = readFileSync(join(FIXTURES_DIR, filename), 'utf8');
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
    const code = readFileSync(join(FIXTURES_DIR, filename), 'utf8');
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
    const code = readFileSync(join(FIXTURES_DIR, filename), 'utf8');
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
    const fileName = resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const parseResult = parseCodeAndGenerateServices(
      readFileSync(fileName, 'utf8'),
      createOptions(fileName),
    );

    testIsolatedFile(parseResult);
  });

  it('isolated-vue-file tests', () => {
    const fileName = resolve(FIXTURES_DIR, 'extra-file-extension.vue');
    const parseResult = parseCodeAndGenerateServices(
      readFileSync(fileName, 'utf8'),
      {
        ...createOptions(fileName),
        extraFileExtensions: ['.vue'],
      },
    );

    testIsolatedFile(parseResult);
  });

  it('non-existent-estree-nodes tests', () => {
    const fileName = resolve(FIXTURES_DIR, 'non-existent-estree-nodes.src.ts');
    const parseResult = parseCodeAndGenerateServices(
      readFileSync(fileName, 'utf8'),
      createOptions(fileName),
    );

    expect(parseResult).toHaveProperty('services.esTreeNodeToTSNodeMap');
    const binaryExpression = (parseResult.ast
      .body[0] as TSESTree.VariableDeclaration).declarations[0].init!;
    const tsBinaryExpression = parseResult.services.esTreeNodeToTSNodeMap.get(
      binaryExpression,
    );
    expect(tsBinaryExpression.kind).toEqual(ts.SyntaxKind.BinaryExpression);

    const computedPropertyString = ((parseResult.ast
      .body[1] as TSESTree.ClassDeclaration).body
      .body[0] as TSESTree.ClassProperty).key;
    const tsComputedPropertyString = parseResult.services.esTreeNodeToTSNodeMap.get(
      computedPropertyString,
    );
    expect(tsComputedPropertyString.kind).toEqual(ts.SyntaxKind.StringLiteral);
  });

  it('imported-file tests', () => {
    const fileName = resolve(FIXTURES_DIR, 'import-file.src.ts');
    const parseResult = parseCodeAndGenerateServices(
      readFileSync(fileName, 'utf8'),
      createOptions(fileName),
    );

    // get type checker
    expect(parseResult).toHaveProperty('services.program.getTypeChecker');
    const checker = parseResult.services.program.getTypeChecker();

    // get array node (ast shape validated by snapshot)
    // node is defined in other file than the parsed one
    const arrayBoundName = (((parseResult.ast
      .body[1] as TSESTree.ExpressionStatement)
      .expression as TSESTree.CallExpression)
      .callee as TSESTree.MemberExpression).object as TSESTree.Identifier;
    expect(arrayBoundName.name).toBe('arr');

    expect(parseResult).toHaveProperty('services.esTreeNodeToTSNodeMap');
    const tsArrayBoundName = parseResult.services.esTreeNodeToTSNodeMap.get(
      arrayBoundName,
    );
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

    const tsBoundName = parseResult.services.esTreeNodeToTSNodeMap.get(
      boundName,
    );
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
    ).toThrow(/The file does not match your project config: estree.ts/);
  });

  it('non-existent project file', () => {
    const fileName = resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const badConfig = createOptions(fileName);
    badConfig.project = './tsconfigs.json';
    expect(() =>
      parseCodeAndGenerateServices(readFileSync(fileName, 'utf8'), badConfig),
    ).toThrow(/Cannot read file .+tsconfigs\.json'/);
  });

  it('fail to read project file', () => {
    const fileName = resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const badConfig = createOptions(fileName);
    badConfig.project = '.';
    expect(() =>
      parseCodeAndGenerateServices(readFileSync(fileName, 'utf8'), badConfig),
    ).toThrow(
      // case insensitive because unix based systems are case insensitive
      /Cannot read file .+semanticInfo'./i,
    );
  });

  it('malformed project file', () => {
    const fileName = resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const badConfig = createOptions(fileName);
    badConfig.project = './badTSConfig/tsconfig.json';
    expect(() =>
      parseCodeAndGenerateServices(readFileSync(fileName, 'utf8'), badConfig),
    ).toThrowErrorMatchingSnapshot();
  });

  it('default program produced with option', () => {
    const parseResult = parseCodeAndGenerateServices('var foo = 5;', {
      ...createOptions('<input>'),
      createDefaultProgram: true,
    });

    expect(parseResult.services.program).toBeDefined();
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
  const tsArrayMember = parseResult.services.esTreeNodeToTSNodeMap.get(
    arrayMember,
  );
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

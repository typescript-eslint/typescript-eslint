/**
 * @fileoverview Tests for semantic information
 * @author Benjamin Lichtman
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { readFileSync } from 'fs';
import glob from 'glob';
import { extname, join, resolve } from 'path';
import ts from 'typescript';
import { ParserOptions } from '../../src/parser-options';
import {
  createSnapshotTestBlock,
  formatSnapshotName,
  parseCodeAndGenerateServices
} from '../../tools/test-utils';

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR = './tests/fixtures/semanticInfo';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.ts`);

function createOptions(fileName: string): ParserOptions & { cwd?: string } {
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
    project: './tsconfig.json',
    loggerFn: false
  };
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('semanticInfo', () => {
  // test all AST snapshots
  testFiles.forEach(filename => {
    const code = readFileSync(filename, 'utf8');
    it(
      formatSnapshotName(filename, FIXTURES_DIR, extname(filename)),
      createSnapshotTestBlock(
        code,
        createOptions(filename),
        /*generateServices*/ true
      )
    );
  });

  // case-specific tests
  it('isolated-file tests', () => {
    const fileName = resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const parseResult = parseCodeAndGenerateServices(
      readFileSync(fileName, 'utf8'),
      createOptions(fileName)
    );

    testIsolatedFile(parseResult);
  });

  it('isolated-vue-file tests', () => {
    const fileName = resolve(FIXTURES_DIR, 'extra-file-extension.vue');
    const parseResult = parseCodeAndGenerateServices(
      readFileSync(fileName, 'utf8'),
      {
        ...createOptions(fileName),
        extraFileExtensions: ['.vue']
      }
    );

    testIsolatedFile(parseResult);
  });

  it('imported-file tests', () => {
    const fileName = resolve(FIXTURES_DIR, 'import-file.src.ts');
    const parseResult = parseCodeAndGenerateServices(
      readFileSync(fileName, 'utf8'),
      createOptions(fileName)
    );

    // get type checker
    expect(parseResult).toHaveProperty('services.program.getTypeChecker');
    const checker = parseResult.services.program!.getTypeChecker();

    // get array node (ast shape validated by snapshot)
    // node is defined in other file than the parsed one
    const arrayBoundName = (parseResult.ast as any).body[1].expression.callee
      .object;
    expect(arrayBoundName.name).toBe('arr');

    expect(parseResult).toHaveProperty('services.esTreeNodeToTSNodeMap');
    const tsArrayBoundName = parseResult.services.esTreeNodeToTSNodeMap!.get(
      arrayBoundName
    );
    expect(tsArrayBoundName).toBeDefined();
    checkNumberArrayType(checker, tsArrayBoundName);

    expect(
      parseResult.services.tsNodeToESTreeNodeMap!.get(tsArrayBoundName)
    ).toBe(arrayBoundName);
  });

  it('non-existent file tests', () => {
    const parseResult = parseCodeAndGenerateServices(
      `const x = [parseInt("5")];`,
      createOptions('<input>')
    );

    // get type checker
    expect(parseResult).toHaveProperty('services.program.getTypeChecker');
    const checker = parseResult.services.program!.getTypeChecker();

    // get bound name
    const boundName = (parseResult.ast as any).body[0].declarations[0].id;
    expect(boundName.name).toBe('x');

    const tsBoundName = parseResult.services.esTreeNodeToTSNodeMap!.get(
      boundName
    );
    expect(tsBoundName).toBeDefined();

    checkNumberArrayType(checker, tsBoundName);

    expect(parseResult.services.tsNodeToESTreeNodeMap!.get(tsBoundName)).toBe(
      boundName
    );
  });

  it('non-existent file should provide parents nodes', () => {
    const parseResult = parseCodeAndGenerateServices(
      `function M() { return Base }`,
      createOptions('<input>')
    );

    // https://github.com/JamesHenry/typescript-estree/issues/77
    expect(parseResult.services.program).toBeDefined();
    expect(
      parseResult.services.program!.getSourceFile('<input>')
    ).toBeDefined();
    expect(
      parseResult.services.program!.getSourceFile('<input>')!.statements[0]
        .parent
    ).toBeDefined();
  });

  it('non-existent project file', () => {
    const fileName = resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const badConfig = createOptions(fileName);
    badConfig.project = './tsconfigs.json';
    expect(() =>
      parseCodeAndGenerateServices(readFileSync(fileName, 'utf8'), badConfig)
    ).toThrowError(/File .+tsconfigs\.json' not found/);
  });

  it('fail to read project file', () => {
    const fileName = resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const badConfig = createOptions(fileName);
    badConfig.project = '.';
    expect(() =>
      parseCodeAndGenerateServices(readFileSync(fileName, 'utf8'), badConfig)
    ).toThrowError(/File .+semanticInfo' not found/);
  });

  it('malformed project file', () => {
    const fileName = resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const badConfig = createOptions(fileName);
    badConfig.project = './badTSConfig/tsconfig.json';
    expect(() =>
      parseCodeAndGenerateServices(readFileSync(fileName, 'utf8'), badConfig)
    ).toThrowErrorMatchingSnapshot();
  });
});

function testIsolatedFile(parseResult: any) {
  // get type checker
  expect(parseResult).toHaveProperty('services.program.getTypeChecker');
  const checker = parseResult.services.program!.getTypeChecker();

  // get number node (ast shape validated by snapshot)
  const arrayMember = (parseResult.ast as any).body[0].declarations[0].init
    .elements[0];
  expect(parseResult).toHaveProperty('services.esTreeNodeToTSNodeMap');

  // get corresponding TS node
  const tsArrayMember = parseResult.services.esTreeNodeToTSNodeMap!.get(
    arrayMember
  );
  expect(tsArrayMember).toBeDefined();
  expect(tsArrayMember.kind).toBe(ts.SyntaxKind.NumericLiteral);
  expect((tsArrayMember as ts.NumericLiteral).text).toBe('3');

  // get type of TS node
  const arrayMemberType: any = checker.getTypeAtLocation(tsArrayMember);
  expect(arrayMemberType.flags).toBe(ts.TypeFlags.NumberLiteral);
  expect(arrayMemberType.value).toBe(3);

  // make sure it maps back to original ESTree node
  expect(parseResult).toHaveProperty('services.tsNodeToESTreeNodeMap');
  expect(parseResult.services.tsNodeToESTreeNodeMap!.get(tsArrayMember)).toBe(
    arrayMember
  );

  // get bound name
  const boundName = (parseResult.ast as any).body[0].declarations[0].id;
  expect(boundName.name).toBe('x');
  const tsBoundName = parseResult.services.esTreeNodeToTSNodeMap!.get(
    boundName
  );
  expect(tsBoundName).toBeDefined();
  checkNumberArrayType(checker, tsBoundName);
  expect(parseResult.services.tsNodeToESTreeNodeMap!.get(tsBoundName)).toBe(
    boundName
  );
}

/**
 * Verifies that the type of a TS node is number[] as expected
 * @param {ts.TypeChecker} checker
 * @param {ts.Node} tsNode
 */
function checkNumberArrayType(checker: ts.TypeChecker, tsNode: ts.Node) {
  const nodeType = checker.getTypeAtLocation(tsNode);
  expect(nodeType.flags).toBe(ts.TypeFlags.Object);
  expect((nodeType as ts.ObjectType).objectFlags).toBe(
    ts.ObjectFlags.Reference
  );
  expect((nodeType as ts.TypeReference).typeArguments).toHaveLength(1);
  expect((nodeType as ts.TypeReference).typeArguments![0].flags).toBe(
    ts.TypeFlags.Number
  );
}

import { TSESLint } from '@typescript-eslint/experimental-utils';
import * as typescriptESTree from '@typescript-eslint/typescript-estree';
import { parse, parseForESLint, Syntax } from '../../src/parser';
import * as scope from '../../src/analyze-scope';

const { AST_NODE_TYPES } = typescriptESTree;

describe('parser', () => {
  it('parse() should return just the AST from parseForESLint()', () => {
    const code = 'const valid = true;';
    expect(parse(code)).toEqual(parseForESLint(code).ast);
  });

  it('parseForESLint() should work if options are `null`', () => {
    const code = 'const valid = true;';
    expect(() => parseForESLint(code, null)).not.toThrow();
  });

  it('parseForESLint() should set the sourceType to script, if an invalid one is provided', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(typescriptESTree, 'parseAndGenerateServices');
    const spyScope = jest.spyOn(scope, 'analyzeScope');
    // intentionally wrong sourceType
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseForESLint(code, { sourceType: 'foo' as any });
    expect(spy).toHaveBeenCalledWith(code, {
      ecmaFeatures: {},
      jsx: false,
      sourceType: 'script',
      useJSXTextNode: true,
    });
    expect(spyScope).toHaveBeenCalledWith(expect.any(Object), {
      ecmaFeatures: {},
      sourceType: 'script',
    });
  });

  it('parseAndGenerateServices() should be called with options', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(typescriptESTree, 'parseAndGenerateServices');
    const config: TSESLint.ParserOptions = {
      loc: false,
      comment: false,
      range: false,
      tokens: false,
      sourceType: 'module' as 'module',
      ecmaVersion: 2018,
      ecmaFeatures: {
        globalReturn: false,
        jsx: false,
      },
      // ts-estree specific
      filePath: 'tests/fixtures/services/isolated-file.src.ts',
      project: 'tsconfig.json',
      useJSXTextNode: false,
      errorOnUnknownASTType: false,
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      tsconfigRootDir: 'tests/fixtures/services',
      extraFileExtensions: ['.foo'],
    };
    parseForESLint(code, config);
    expect(spy).toHaveBeenCalledWith(code, {
      jsx: false,
      ...config,
    });
  });

  it('Syntax should contain a frozen object of AST_NODE_TYPES', () => {
    expect(Syntax).toEqual(AST_NODE_TYPES);
    expect(
      // intentionally breaking the readonly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => ((Syntax as any).ArrayExpression = 'foo'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot assign to read only property 'ArrayExpression' of object '#<Object>'"`,
    );
  });

  it('`warnOnUnsupportedTypeScriptVersion: false` should set `loggerFn: false` on typescript-estree', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(typescriptESTree, 'parseAndGenerateServices');
    parseForESLint(code, { warnOnUnsupportedTypeScriptVersion: true });
    expect(spy).toHaveBeenCalledWith(code, {
      ecmaFeatures: {},
      jsx: false,
      sourceType: 'script',
      useJSXTextNode: true,
    });
    parseForESLint(code, { warnOnUnsupportedTypeScriptVersion: false });
    expect(spy).toHaveBeenCalledWith(code, {
      ecmaFeatures: {},
      jsx: false,
      sourceType: 'script',
      useJSXTextNode: true,
      loggerFn: false,
      warnOnUnsupportedTypeScriptVersion: false,
    });
  });
});

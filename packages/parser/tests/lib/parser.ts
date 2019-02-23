import * as typescriptESTree from '@typescript-eslint/typescript-estree';
import { parse, parseForESLint, Syntax } from '../../src/parser';
import * as scope from '../../src/analyze-scope';

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
    const config = {
      loc: false,
      comment: false,
      range: false,
      tokens: false,
      sourceType: 'module' as 'module',
      ecmaVersion: 10,
      ecmaFeatures: {
        globalReturn: false,
        jsx: false,
      },
      // ts-estree specific
      filePath: 'test/foo',
      project: 'tsconfig.json',
      useJSXTextNode: false,
      errorOnUnknownASTType: false,
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      tsconfigRootDir: './',
      extraFileExtensions: ['foo'],
    };
    parseForESLint(code, config);
    expect(spy).toHaveBeenCalledWith(code, {
      jsx: false,
      ...config,
    });
  });

  it('Syntax should contain a frozen object of typescriptESTree.AST_NODE_TYPES', () => {
    expect(Syntax).toEqual(typescriptESTree.AST_NODE_TYPES);
    expect(
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

import { TSESLint } from '@typescript-eslint/experimental-utils';
import * as typescriptESTree from '@typescript-eslint/typescript-estree/dist/parser';
import * as scopeManager from '@typescript-eslint/scope-manager/dist/analyze';
import { parse, parseForESLint } from '../../src/parser';

describe('parser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parse() should return just the AST from parseForESLint()', () => {
    const code = 'const valid = true;';
    expect(parse(code)).toEqual(parseForESLint(code).ast);
  });

  it('parseForESLint() should work if options are `null`', () => {
    const code = 'const valid = true;';
    expect(() => parseForESLint(code, null)).not.toThrow();
  });

  it('parseAndGenerateServices() should be called with options', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(typescriptESTree, 'parseAndGenerateServices');
    const config: TSESLint.ParserOptions = {
      loc: false,
      comment: false,
      range: false,
      tokens: false,
      sourceType: 'module' as const,
      ecmaVersion: 2018,
      ecmaFeatures: {
        globalReturn: false,
        jsx: false,
      },
      // ts-estree specific
      filePath: 'isolated-file.src.ts',
      project: 'tsconfig.json',
      useJSXTextNode: false,
      errorOnUnknownASTType: false,
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      tsconfigRootDir: 'tests/fixtures/services',
      extraFileExtensions: ['.foo'],
    };
    parseForESLint(code, config);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(code, {
      jsx: false,
      ...config,
    });
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
      warnOnUnsupportedTypeScriptVersion: true,
    });
    spy.mockClear();
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

  it('analyze() should be called with options', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(scopeManager, 'analyze');
    const config: TSESLint.ParserOptions = {
      loc: false,
      comment: false,
      range: false,
      tokens: false,
      sourceType: 'module' as const,
      ecmaVersion: 2018,
      ecmaFeatures: {
        globalReturn: false,
        jsx: false,
      },
      // scope-manager specific
      lib: ['dom.iterable'],
      jsxPragma: 'Foo',
      jsxFragmentName: 'Bar',
      // ts-estree specific
      filePath: 'isolated-file.src.ts',
      project: 'tsconfig.json',
      useJSXTextNode: false,
      errorOnUnknownASTType: false,
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      tsconfigRootDir: 'tests/fixtures/services',
      extraFileExtensions: ['.foo'],
    };
    parseForESLint(code, config);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(expect.anything(), {
      ecmaVersion: 2018,
      globalReturn: false,
      lib: ['dom.iterable'],
      jsxPragma: 'Foo',
      jsxFragmentName: 'Bar',
      sourceType: 'module',
    });
  });
});

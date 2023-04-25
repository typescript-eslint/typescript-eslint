import * as scopeManager from '@typescript-eslint/scope-manager';
import type { ParserOptions } from '@typescript-eslint/types';
import * as typescriptESTree from '@typescript-eslint/typescript-estree';
import path from 'path';

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
    const config: ParserOptions = {
      loc: false,
      comment: false,
      range: false,
      tokens: false,
      sourceType: 'module' as const,
      ecmaFeatures: {
        globalReturn: false,
        jsx: false,
      },
      // ts-estree specific
      filePath: './isolated-file.src.ts',
      project: 'tsconfig.json',
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      tsconfigRootDir: path.join(__dirname, '../fixtures/services'),
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
      warnOnUnsupportedTypeScriptVersion: true,
    });
    spy.mockClear();
    parseForESLint(code, { warnOnUnsupportedTypeScriptVersion: false });
    expect(spy).toHaveBeenCalledWith(code, {
      ecmaFeatures: {},
      jsx: false,
      sourceType: 'script',
      loggerFn: false,
      warnOnUnsupportedTypeScriptVersion: false,
    });
  });

  it('analyze() should be called with options', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(scopeManager, 'analyze');
    const config: ParserOptions = {
      loc: false,
      comment: false,
      range: false,
      tokens: false,
      sourceType: 'module' as const,
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
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      tsconfigRootDir: path.join(__dirname, '../fixtures/services'),
      extraFileExtensions: ['.foo'],
    };
    parseForESLint(code, config);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(expect.anything(), {
      globalReturn: false,
      lib: ['dom.iterable'],
      jsxPragma: 'Foo',
      jsxFragmentName: 'Bar',
      sourceType: 'module',
    });
  });
});

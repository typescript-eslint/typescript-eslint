import * as scopeManager from '@typescript-eslint/scope-manager';
import type { ParserOptions } from '@typescript-eslint/types';
import * as typescriptESTree from '@typescript-eslint/typescript-estree';
import path from 'path';
import { ScriptTarget } from 'typescript';

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
      sourceType: 'module' as const,
      ecmaFeatures: {
        globalReturn: false,
        jsx: false,
      },
      // ts-estree specific
      filePath: './isolated-file.src.ts',
      project: 'tsconfig.json',
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      tsconfigRootDir: path.resolve(__dirname, '../fixtures/services'),
      extraFileExtensions: ['.foo'],
    };
    parseForESLint(code, config);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(code, {
      comment: true,
      jsx: false,
      loc: true,
      range: true,
      tokens: true,
      ...config,
    });
  });

  it('overrides `errorOnTypeScriptSyntacticAndSemanticIssues: false` when provided `errorOnTypeScriptSyntacticAndSemanticIssues: false`', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(typescriptESTree, 'parseAndGenerateServices');
    parseForESLint(code, { errorOnTypeScriptSyntacticAndSemanticIssues: true });
    expect(spy).toHaveBeenCalledWith(code, {
      comment: true,
      ecmaFeatures: {},
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      jsx: false,
      loc: true,
      range: true,
      sourceType: 'script',
      tokens: true,
    });
  });

  it('sets `loggerFn: false` on typescript-estree when provided `warnOnUnsupportedTypeScriptVersion: false`', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(typescriptESTree, 'parseAndGenerateServices');
    parseForESLint(code, { warnOnUnsupportedTypeScriptVersion: false });
    expect(spy).toHaveBeenCalledWith(code, {
      comment: true,
      ecmaFeatures: {},
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      jsx: false,
      loc: true,
      loggerFn: false,
      range: true,
      sourceType: 'script',
      tokens: true,
      warnOnUnsupportedTypeScriptVersion: false,
    });
  });

  it('sets `loggerFn: false` on typescript-estree when provided `warnOnUnsupportedTypeScriptVersion: true`', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(typescriptESTree, 'parseAndGenerateServices');
    parseForESLint(code, { warnOnUnsupportedTypeScriptVersion: true });
    expect(spy).toHaveBeenCalledWith(code, {
      comment: true,
      ecmaFeatures: {},
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      jsx: false,
      loc: true,
      range: true,
      sourceType: 'script',
      tokens: true,
      warnOnUnsupportedTypeScriptVersion: true,
    });
  });

  it('should call analyze() with inferred analyze options when no analyze options are provided', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(scopeManager, 'analyze');
    const config: ParserOptions = {
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      filePath: 'isolated-file.src.ts',
      project: 'tsconfig.json',
      tsconfigRootDir: path.join(__dirname, '../fixtures/services'),
    };

    parseForESLint(code, config);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(expect.anything(), {
      globalReturn: undefined,
      jsxFragmentName: undefined,
      jsxPragma: undefined,
      lib: ['lib'],
      sourceType: 'script',
    });
  });

  it.each([
    ['esnext.full', ScriptTarget.ESNext],
    ['es2022.full', ScriptTarget.ES2022],
    ['es2021.full', ScriptTarget.ES2021],
    ['es2020.full', ScriptTarget.ES2020],
    ['es2019.full', ScriptTarget.ES2019],
    ['es2018.full', ScriptTarget.ES2018],
    ['es2017.full', ScriptTarget.ES2017],
    ['es2016.full', ScriptTarget.ES2016],
    ['es6', ScriptTarget.ES2015],
    ['lib', ScriptTarget.ES5],
    ['lib', undefined],
  ])(
    'calls analyze() with `lib: [%s]` when the compiler options target is %s',
    (lib, target) => {
      const code = 'const valid = true;';
      const spy = jest.spyOn(scopeManager, 'analyze');
      const config: ParserOptions = {
        filePath: 'isolated-file.src.ts',
        project: 'tsconfig.json',
        tsconfigRootDir: path.join(__dirname, '../fixtures/services'),
      };

      jest
        .spyOn(typescriptESTree, 'parseAndGenerateServices')
        .mockReturnValueOnce({
          ast: {},
          services: {
            program: {
              getCompilerOptions: () => ({ target }),
            },
          },
        } as typescriptESTree.ParseAndGenerateServicesResult<typescriptESTree.TSESTreeOptions>);

      parseForESLint(code, config);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          lib: [lib],
        }),
      );
    },
  );

  it('calls analyze() with the provided analyze options when analyze options are provided', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(scopeManager, 'analyze');
    const config: ParserOptions = {
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

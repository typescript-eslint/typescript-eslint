import type { ParserOptions } from '@typescript-eslint/types';

import * as scopeManager from '@typescript-eslint/scope-manager';
import * as typescriptESTree from '@typescript-eslint/typescript-estree';
import path from 'node:path';
import { ScriptTarget } from 'typescript';

import { parse, parseForESLint } from '../../src/parser';

describe('parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const spy = vi.spyOn(typescriptESTree, 'parseAndGenerateServices');
    const config: ParserOptions = {
      ecmaFeatures: {
        globalReturn: false,
        jsx: false,
      },
      sourceType: 'module' as const,
      // ts-estree specific
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      extraFileExtensions: ['.foo'],
      filePath: './isolated-file.src.ts',
      project: 'tsconfig.json',
      tsconfigRootDir: path.join(__dirname, '..', 'fixtures', 'services'),
    };
    parseForESLint(code, config);
    expect(spy).toHaveBeenCalledExactlyOnceWith(code, {
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
    const spy = vi.spyOn(typescriptESTree, 'parseAndGenerateServices');
    parseForESLint(code, { errorOnTypeScriptSyntacticAndSemanticIssues: true });
    expect(spy).toHaveBeenCalledExactlyOnceWith(code, {
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
    const spy = vi.spyOn(typescriptESTree, 'parseAndGenerateServices');
    parseForESLint(code, { warnOnUnsupportedTypeScriptVersion: false });
    expect(spy).toHaveBeenCalledExactlyOnceWith(code, {
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
    const spy = vi.spyOn(typescriptESTree, 'parseAndGenerateServices');
    parseForESLint(code, { warnOnUnsupportedTypeScriptVersion: true });
    expect(spy).toHaveBeenCalledExactlyOnceWith(code, {
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
    const spy = vi.spyOn(scopeManager, 'analyze');
    const config: ParserOptions = {
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      filePath: 'isolated-file.src.ts',
      project: 'tsconfig.json',
      tsconfigRootDir: path.join(__dirname, '..', 'fixtures', 'services'),
    };

    parseForESLint(code, config);

    expect(spy).toHaveBeenCalledExactlyOnceWith(expect.anything(), {
      globalReturn: undefined,
      jsxFragmentName: undefined,
      jsxPragma: undefined,
      lib: ['lib'],
      sourceType: 'script',
    });
  });

  it.for([
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
  ] as const)(
    'calls analyze() with `lib: [%s]` when the compiler options target is %s',
    ([lib, target], { expect }) => {
      const code = 'const valid = true;';
      const spy = vi.spyOn(scopeManager, 'analyze');
      const config: ParserOptions = {
        filePath: 'isolated-file.src.ts',
        project: 'tsconfig.json',
        tsconfigRootDir: path.join(__dirname, '..', 'fixtures', 'services'),
      };

      vi.spyOn(
        typescriptESTree,
        'parseAndGenerateServices',
      ).mockReturnValueOnce({
        ast: {},
        services: {
          program: {
            getCompilerOptions: () => ({ target }),
          },
        },
      } as typescriptESTree.ParseAndGenerateServicesResult<typescriptESTree.TSESTreeOptions>);

      parseForESLint(code, config);

      expect(spy).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        expect.objectContaining({
          lib: [lib],
        }),
      );
    },
  );

  it('calls analyze() with the provided analyze options when analyze options are provided', () => {
    const code = 'const valid = true;';
    const spy = vi.spyOn(scopeManager, 'analyze');
    const config: ParserOptions = {
      ecmaFeatures: {
        globalReturn: false,
        jsx: false,
      },
      sourceType: 'module' as const,
      // scope-manager specific
      jsxFragmentName: 'Bar',
      jsxPragma: 'Foo',
      lib: ['dom.iterable'],
      // ts-estree specific
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      extraFileExtensions: ['.foo'],
      filePath: 'isolated-file.src.ts',
      project: 'tsconfig.json',
      tsconfigRootDir: path.join(__dirname, '..', 'fixtures', 'services'),
    };

    parseForESLint(code, config);

    expect(spy).toHaveBeenCalledExactlyOnceWith(expect.anything(), {
      globalReturn: false,
      jsxFragmentName: 'Bar',
      jsxPragma: 'Foo',
      lib: ['dom.iterable'],
      sourceType: 'module',
    });
  });
});

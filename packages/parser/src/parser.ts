import type {
  AnalyzeOptions,
  ScopeManager,
} from '@typescript-eslint/scope-manager';
import { analyze } from '@typescript-eslint/scope-manager';
import type { Lib, TSESTree } from '@typescript-eslint/types';
import { ParserOptions } from '@typescript-eslint/types';
import type {
  AST,
  ParserServices,
  TSESTreeOptions,
} from '@typescript-eslint/typescript-estree';
import { parseAndGenerateServices } from '@typescript-eslint/typescript-estree';
import type { VisitorKeys } from '@typescript-eslint/visitor-keys';
import { visitorKeys } from '@typescript-eslint/visitor-keys';
import debug from 'debug';
import type * as ts from 'typescript';
import { ScriptTarget } from 'typescript';

const log = debug('typescript-eslint:parser:parser');

interface ESLintProgram extends AST<{ comment: true; tokens: true }> {
  comments: TSESTree.Comment[];
  range: [number, number];
  tokens: TSESTree.Token[];
}

interface ParseForESLintResult {
  ast: ESLintProgram;
  services: ParserServices;
  visitorKeys: VisitorKeys;
  scopeManager: ScopeManager;
}

function validateBoolean(
  value: boolean | undefined,
  fallback = false,
): boolean {
  if (typeof value !== 'boolean') {
    return fallback;
  }
  return value;
}

const LIB_FILENAME_REGEX = /lib\.(.+)\.d\.[cm]?ts$/;
function getLib(compilerOptions: ts.CompilerOptions): Lib[] {
  if (compilerOptions.lib) {
    return compilerOptions.lib.reduce<Lib[]>((acc, lib) => {
      const match = LIB_FILENAME_REGEX.exec(lib.toLowerCase());
      if (match) {
        acc.push(match[1] as Lib);
      }

      return acc;
    }, []);
  }

  const target = compilerOptions.target ?? ScriptTarget.ES5;
  // https://github.com/microsoft/TypeScript/blob/ae582a22ee1bb052e19b7c1bc4cac60509b574e0/src/compiler/utilitiesPublic.ts#L13-L36
  switch (target) {
    case ScriptTarget.ESNext:
      return ['esnext.full'];
    case ScriptTarget.ES2022:
      return ['es2022.full'];
    case ScriptTarget.ES2021:
      return ['es2021.full'];
    case ScriptTarget.ES2020:
      return ['es2020.full'];
    case ScriptTarget.ES2019:
      return ['es2019.full'];
    case ScriptTarget.ES2018:
      return ['es2018.full'];
    case ScriptTarget.ES2017:
      return ['es2017.full'];
    case ScriptTarget.ES2016:
      return ['es2016.full'];
    case ScriptTarget.ES2015:
      return ['es6'];
    default:
      return ['lib'];
  }
}

function parse(
  code: ts.SourceFile | string,
  options?: ParserOptions,
): ParseForESLintResult['ast'] {
  return parseForESLint(code, options).ast;
}

function parseForESLint(
  code: ts.SourceFile | string,
  parserOptions?: ParserOptions | null,
): ParseForESLintResult {
  if (!parserOptions || typeof parserOptions !== 'object') {
    parserOptions = {};
  } else {
    parserOptions = { ...parserOptions };
  }
  // https://eslint.org/docs/user-guide/configuring#specifying-parser-options
  // if sourceType is not provided by default eslint expect that it will be set to "script"
  if (
    parserOptions.sourceType !== 'module' &&
    parserOptions.sourceType !== 'script'
  ) {
    parserOptions.sourceType = 'script';
  }
  if (typeof parserOptions.ecmaFeatures !== 'object') {
    parserOptions.ecmaFeatures = {};
  }

  /**
   * Allow the user to suppress the warning from typescript-estree if they are using an unsupported
   * version of TypeScript
   */
  const warnOnUnsupportedTypeScriptVersion = validateBoolean(
    parserOptions.warnOnUnsupportedTypeScriptVersion,
    true,
  );

  const tsestreeOptions = {
    jsx: validateBoolean(parserOptions.ecmaFeatures.jsx),
    ...(!warnOnUnsupportedTypeScriptVersion && { loggerFn: false }),
    ...parserOptions,
    // Override errorOnTypeScriptSyntacticAndSemanticIssues and set it to false to prevent use from user config
    // https://github.com/typescript-eslint/typescript-eslint/issues/8681#issuecomment-2000411834
    errorOnTypeScriptSyntacticAndSemanticIssues: false,
    // comment, loc, range, and tokens should always be set for ESLint usage
    // https://github.com/typescript-eslint/typescript-eslint/issues/8347
    comment: true,
    loc: true,
    range: true,
    tokens: true,
  } satisfies TSESTreeOptions;

  const analyzeOptions: AnalyzeOptions = {
    globalReturn: parserOptions.ecmaFeatures.globalReturn,
    jsxPragma: parserOptions.jsxPragma,
    jsxFragmentName: parserOptions.jsxFragmentName,
    lib: parserOptions.lib,
    sourceType: parserOptions.sourceType,
  };

  const { ast, services } = parseAndGenerateServices(code, tsestreeOptions);
  ast.sourceType = parserOptions.sourceType;

  if (services.program) {
    // automatically apply the options configured for the program
    const compilerOptions = services.program.getCompilerOptions();
    if (analyzeOptions.lib == null) {
      analyzeOptions.lib = getLib(compilerOptions);
      log('Resolved libs from program: %o', analyzeOptions.lib);
    }
    if (
      analyzeOptions.jsxPragma === undefined &&
      compilerOptions.jsxFactory != null
    ) {
      // in case the user has specified something like "preact.h"
      const factory = compilerOptions.jsxFactory.split('.')[0].trim();
      analyzeOptions.jsxPragma = factory;
      log('Resolved jsxPragma from program: %s', analyzeOptions.jsxPragma);
    }
    if (
      analyzeOptions.jsxFragmentName === undefined &&
      compilerOptions.jsxFragmentFactory != null
    ) {
      // in case the user has specified something like "preact.Fragment"
      const fragFactory = compilerOptions.jsxFragmentFactory
        .split('.')[0]
        .trim();
      analyzeOptions.jsxFragmentName = fragFactory;
      log(
        'Resolved jsxFragmentName from program: %s',
        analyzeOptions.jsxFragmentName,
      );
    }
  }

  const scopeManager = analyze(ast, analyzeOptions);

  // if not defined - override from the parserOptions
  services.emitDecoratorMetadata ??=
    parserOptions.emitDecoratorMetadata === true;
  services.experimentalDecorators ??=
    parserOptions.experimentalDecorators === true;

  return { ast, services, scopeManager, visitorKeys };
}

export { parse, parseForESLint, ParserOptions };

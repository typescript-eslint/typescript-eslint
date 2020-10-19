import { ParserOptions, TSESTree, Lib } from '@typescript-eslint/types';
import {
  parseAndGenerateServices,
  ParserServices,
  TSESTreeOptions,
  visitorKeys,
} from '@typescript-eslint/typescript-estree';
import {
  analyze,
  AnalyzeOptions,
  ScopeManager,
} from '@typescript-eslint/scope-manager';
import debug from 'debug';
import { CompilerOptions, ScriptTarget } from 'typescript';

const log = debug('typescript-eslint:parser:parser');

interface ParseForESLintResult {
  ast: TSESTree.Program & {
    range?: [number, number];
    tokens?: TSESTree.Token[];
    comments?: TSESTree.Comment[];
  };
  services: ParserServices;
  visitorKeys: typeof visitorKeys;
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

const LIB_FILENAME_REGEX = /lib\.(.+)\.d\.ts$/;
function getLib(compilerOptions: CompilerOptions): Lib[] {
  if (compilerOptions.lib) {
    return compilerOptions.lib.reduce((acc, lib) => {
      const match = LIB_FILENAME_REGEX.exec(lib.toLowerCase());
      if (match) {
        acc.push(match[1] as Lib);
      }

      return acc;
    }, [] as Lib[]);
  }

  const target = compilerOptions.target ?? ScriptTarget.ES5;
  // https://github.com/Microsoft/TypeScript/blob/59ad375234dc2efe38d8ee0ba58414474c1d5169/src/compiler/utilitiesPublic.ts#L13-L32
  switch (target) {
    case ScriptTarget.ESNext:
      return ['esnext.full'];
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
  code: string,
  options?: ParserOptions,
): ParseForESLintResult['ast'] {
  return parseForESLint(code, options).ast;
}

function parseForESLint(
  code: string,
  options?: ParserOptions | null,
): ParseForESLintResult {
  if (!options || typeof options !== 'object') {
    options = {};
  } else {
    options = { ...options };
  }
  // https://eslint.org/docs/user-guide/configuring#specifying-parser-options
  // if sourceType is not provided by default eslint expect that it will be set to "script"
  if (options.sourceType !== 'module' && options.sourceType !== 'script') {
    options.sourceType = 'script';
  }
  if (typeof options.ecmaFeatures !== 'object') {
    options.ecmaFeatures = {};
  }

  const parserOptions: TSESTreeOptions = {};
  Object.assign(parserOptions, options, {
    useJSXTextNode: validateBoolean(options.useJSXTextNode, true),
    jsx: validateBoolean(options.ecmaFeatures.jsx),
  });
  const analyzeOptions: AnalyzeOptions = {
    ecmaVersion: options.ecmaVersion,
    globalReturn: options.ecmaFeatures.globalReturn,
    jsxPragma: options.jsxPragma,
    jsxFragmentName: options.jsxFragmentName,
    lib: options.lib,
    sourceType: options.sourceType,
  };

  if (typeof options.filePath === 'string') {
    const tsx = options.filePath.endsWith('.tsx');
    if (tsx || options.filePath.endsWith('.ts')) {
      parserOptions.jsx = tsx;
    }
  }

  /**
   * Allow the user to suppress the warning from typescript-estree if they are using an unsupported
   * version of TypeScript
   */
  const warnOnUnsupportedTypeScriptVersion = validateBoolean(
    options.warnOnUnsupportedTypeScriptVersion,
    true,
  );
  if (!warnOnUnsupportedTypeScriptVersion) {
    parserOptions.loggerFn = false;
  }

  const { ast, services } = parseAndGenerateServices(code, parserOptions);
  ast.sourceType = options.sourceType;

  if (services.hasFullTypeInformation) {
    // automatically apply the options configured for the program
    const compilerOptions = services.program.getCompilerOptions();
    if (analyzeOptions.lib == null) {
      analyzeOptions.lib = getLib(compilerOptions);
      log('Resolved libs from program: %o', analyzeOptions.lib);
    }
    if (parserOptions.jsx === true) {
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
  }

  const scopeManager = analyze(ast, analyzeOptions);

  return { ast, services, scopeManager, visitorKeys };
}

export { parse, parseForESLint, ParserOptions };

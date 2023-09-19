import {
  parseSync as swcParse,
  ParseOptions as SwcParserOptions,
} from '@swc/core';
import {
  analyze,
  AnalyzeOptions,
  ScopeManager,
} from '@typescript-eslint/scope-manager';
import type { Lib, TSESTree, ParserOptions } from '@typescript-eslint/types';
import { visitorKeys } from '@typescript-eslint/visitor-keys';
import debug from 'debug';
import type * as ts from 'typescript';
import { ScriptTarget } from 'typescript';
import { convert } from './convert';

const log = debug('typescript-eslint:swc-estree:parser');

interface ParseForESLintResult {
  ast: TSESTree.Program & {
    range?: [number, number];
    tokens?: TSESTree.Token[];
    comments?: TSESTree.Comment[];
  };
  services: null;
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

  const parserOptions: SwcParserOptions = {
    syntax: 'typescript',
    comments: true,
    tsx: validateBoolean(options.ecmaFeatures.jsx),
    decorators: true,
    dynamicImport: true,
    script: options.sourceType === 'script',
    target: 'esnext',
  };
  const analyzeOptions: AnalyzeOptions = {
    globalReturn: options.ecmaFeatures.globalReturn,
    jsxPragma: options.jsxPragma,
    jsxFragmentName: options.jsxFragmentName,
    lib: options.lib,
    sourceType: options.sourceType,
  };

  const ast = convert(swcParse(code, parserOptions));
  ast.sourceType = options.sourceType;

  const scopeManager = analyze(ast, analyzeOptions);

  return { ast, services, scopeManager, visitorKeys };
}

export { parse, parseForESLint, ParserOptions };

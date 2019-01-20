import traverser from 'eslint/lib/util/traverser';
import {
  AST_NODE_TYPES,
  parseAndGenerateServices,
  ParserOptions as ParserOptionsTsESTree
} from '@typescript-eslint/typescript-estree';
import { analyzeScope } from './analyze-scope';
import { ParserOptions } from './parser-options';
import { visitorKeys } from './visitor-keys';
import { Program } from 'typescript';

const packageJSON = require('../package.json');

interface ParserServices {
  program: Program | undefined;
  esTreeNodeToTSNodeMap: WeakMap<object, any> | undefined;
  tsNodeToESTreeNodeMap: WeakMap<object, any> | undefined;
}

interface ParseForESLintResult {
  ast: any;
  services: ParserServices;
  visitorKeys: typeof visitorKeys;
  scopeManager: ReturnType<typeof analyzeScope>;
}

function validateBoolean(
  value: boolean | undefined,
  fallback: boolean = false
): boolean {
  if (typeof value !== 'boolean') {
    return fallback;
  }
  return value;
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

export const version = packageJSON.version;

export const Syntax = Object.freeze(AST_NODE_TYPES);

export function parse(code: string, options?: ParserOptions) {
  return parseForESLint(code, options).ast;
}

export function parseForESLint(
  code: string,
  options?: ParserOptions | null
): ParseForESLintResult {
  if (!options || typeof options !== 'object') {
    options = {};
  }
  // https://eslint.org/docs/user-guide/configuring#specifying-parser-options
  // if sourceType is not provided by default eslint expect that it will be set to "script"
  if (options.sourceType !== 'module' && options.sourceType !== 'script') {
    options.sourceType = 'script';
  }
  if (typeof options.ecmaFeatures !== 'object') {
    options.ecmaFeatures = {};
  }

  const parserOptions: ParserOptionsTsESTree = {
    useJSXTextNode: validateBoolean(options.useJSXTextNode, true),
    range: validateBoolean(options.range, true), // TODO: this option is ignored by typescript-estree
    loc: validateBoolean(options.loc, true), // TODO: this option is ignored by typescript-estree
    tokens: validateBoolean(options.tokens, true),
    jsx: validateBoolean(options.ecmaFeatures.jsx),
    comment: validateBoolean(options.comment, true),
    errorOnUnknownASTType: validateBoolean(options.errorOnUnknownASTType),
    errorOnTypeScriptSyntacticAndSemanticIssues: validateBoolean(
      options.errorOnTypeScriptSyntacticAndSemanticIssues
    )
  };

  if (options.project) {
    parserOptions.project = options.project;
  }

  if (typeof options.tsconfigRootDir === 'string') {
    parserOptions.tsconfigRootDir = options.tsconfigRootDir;
  }

  if (options.extraFileExtensions) {
    parserOptions.extraFileExtensions = options.extraFileExtensions;
  }

  if (typeof options.filePath === 'string') {
    parserOptions.filePath = options.filePath;

    const tsx = options.filePath.endsWith('.tsx');
    if (tsx || options.filePath.endsWith('.ts')) {
      parserOptions.jsx = tsx;
    }
  }

  const { ast, services } = parseAndGenerateServices(code, parserOptions);
  ast.sourceType = options.sourceType;

  traverser.traverse(ast, {
    enter(node: any) {
      switch (node.type) {
        // Function#body cannot be null in ESTree spec.
        case 'FunctionExpression':
          if (!node.body) {
            node.type = `TSEmptyBody${node.type}` as AST_NODE_TYPES;
          }
          break;
        // no default
      }
    }
  });

  const scopeManager = analyzeScope(ast, options);
  return { ast, services, scopeManager, visitorKeys };
}

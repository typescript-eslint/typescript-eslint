import traverser from 'eslint/lib/util/traverser';
import * as typescriptESTree from '@typescript-eslint/typescript-estree';
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

export const version = packageJSON.version;

export function parse(code: string, options?: ParserOptions) {
  return parseForESLint(code, options).ast;
}

export const Syntax = Object.freeze(typescriptESTree.AST_NODE_TYPES);

export function parseForESLint<T extends ParserOptions = ParserOptions>(
  code: string,
  options?: T | null
): ParseForESLintResult {
  if (typeof options !== 'object' || options === null) {
    options = { useJSXTextNode: true } as T;
  } else if (typeof options.useJSXTextNode !== 'boolean') {
    options = Object.assign({}, options, { useJSXTextNode: true });
  }
  if (typeof options.filePath === 'string') {
    const tsx = options.filePath.endsWith('.tsx');
    if (tsx || options.filePath.endsWith('.ts')) {
      options = Object.assign({}, options, { jsx: tsx });
    }
  }

  // https://eslint.org/docs/user-guide/configuring#specifying-parser-options
  // if sourceType is not provided by default eslint expect that it will be set to "script"
  options.sourceType = options.sourceType || 'script';
  if (options.sourceType !== 'module' && options.sourceType !== 'script') {
    options.sourceType = 'script';
  }

  const { ast, services } = typescriptESTree.parseAndGenerateServices(
    code,
    options
  );
  ast.sourceType = options.sourceType;

  traverser.traverse(ast, {
    enter: (node: any) => {
      switch (node.type) {
        // Function#body cannot be null in ESTree spec.
        case 'FunctionExpression':
          if (!node.body) {
            node.type = `TSEmptyBody${
              node.type
            }` as typescriptESTree.AST_NODE_TYPES;
          }
          break;
        // no default
      }
    }
  });

  const scopeManager = analyzeScope(ast, options);
  return { ast, services, scopeManager, visitorKeys };
}

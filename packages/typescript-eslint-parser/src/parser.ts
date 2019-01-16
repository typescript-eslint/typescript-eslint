import traverser from 'eslint/lib/util/traverser';
import * as typescriptESTree from 'typescript-estree';
import { analyzeScope } from './analyze-scope';
import { ParserOptions } from './parser-options';
import { visitorKeys } from './visitor-keys';

const packageJSON = require('../package.json');

interface ParseForESLintResult {
  ast: any;
  visitorKeys: typeof visitorKeys;
  scopeManager: ReturnType<typeof analyzeScope>;
}

export const version = packageJSON.version;

export function parse(code: string, options: ParserOptions) {
  return parseForESLint(code, options).ast;
}

export const Syntax = (function() {
  const types = Object.create(null);
  const astNodeTypes = typescriptESTree.AST_NODE_TYPES;
  for (const name in astNodeTypes) {
    if (astNodeTypes.hasOwnProperty(name)) {
      types[name] = astNodeTypes[name];
    }
  }
  return Object.freeze(types);
})();

export function parseForESLint<T extends ParserOptions = ParserOptions>(
  code: string,
  options?: T
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

  const ast = typescriptESTree.parse(code, options);
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
  return { ast, scopeManager, visitorKeys };
}

import {
  AST_NODE_TYPES,
  parseAndGenerateServices,
  TSEStreeOptions,
  ParserServices,
} from '@typescript-eslint/typescript-estree';
import { TSESLint } from '@typescript-eslint/util';
import traverser from 'eslint/lib/util/traverser';
import { analyzeScope } from './analyze-scope';
import { visitorKeys } from './visitor-keys';

type ParserOptions = TSESLint.ParserOptions;

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
const packageJSON = require('../package.json');

interface ParseForESLintResult {
  ast: any;
  services: ParserServices;
  visitorKeys: typeof visitorKeys;
  scopeManager: ReturnType<typeof analyzeScope>;
}

function validateBoolean(
  value: boolean | undefined,
  fallback: boolean = false,
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
  options?: ParserOptions | null,
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

  const parserOptions: TSEStreeOptions = {};
  Object.assign(parserOptions, options, {
    useJSXTextNode: validateBoolean(options.useJSXTextNode, true),
    jsx: validateBoolean(options.ecmaFeatures.jsx),
  });

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
    },
  });

  const scopeManager = analyzeScope(ast, options);
  return { ast, services, scopeManager, visitorKeys };
}

export { ParserServices, ParserOptions };

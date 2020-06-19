import { ParserOptions, TSESTree } from '@typescript-eslint/types';
import {
  parseAndGenerateServices,
  ParserServices,
  TSESTreeOptions,
  visitorKeys,
} from '@typescript-eslint/typescript-estree';
import { analyzeScope } from './analyze-scope';

interface ParseForESLintResult {
  ast: TSESTree.Program & {
    range?: [number, number];
    tokens?: TSESTree.Token[];
    comments?: TSESTree.Comment[];
  };
  services: ParserServices;
  visitorKeys: typeof visitorKeys;
  scopeManager: ReturnType<typeof analyzeScope>;
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

  const scopeManager = analyzeScope(ast, options);
  return { ast, services, scopeManager, visitorKeys };
}

export { parse, parseForESLint, ParserOptions };

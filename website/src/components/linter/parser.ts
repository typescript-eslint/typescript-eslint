import type { AST } from '@typescript-eslint/typescript-estree/dist/parser';
import { analyze } from '@typescript-eslint/scope-manager/dist/analyze';
import { visitorKeys } from '@typescript-eslint/visitor-keys/dist/visitor-keys';
import { astConverter } from '@typescript-eslint/typescript-estree/dist/ast-converter';
import { createASTProgram } from './create-ast-program';
import type { ParserOptions, TSESTree } from '@typescript-eslint/types';
import type {
  ParserServices,
  TSESTreeOptions,
} from '@typescript-eslint/typescript-estree/dist/parser-options';
import { extra } from '../lib/config';

// TODO: this is not exported
export interface ParseForESLintResult {
  ast: TSESTree.Program & {
    range?: [number, number];
    tokens?: TSESTree.Token[];
    comments?: TSESTree.Comment[];
  };
  services: ParserServices;
  visitorKeys: typeof visitorKeys;
  scopeManager: ReturnType<typeof analyze>;
}

interface ParseAndGenerateServicesResult<T extends TSESTreeOptions> {
  ast: AST<T>;
  services: ParserServices;
}

function parseAndGenerateServices<T extends TSESTreeOptions = TSESTreeOptions>(
  code: string,
  options: T,
): ParseAndGenerateServicesResult<T> {
  const { ast, program } = createASTProgram(code, options);
  const { estree, astMaps } = astConverter(
    ast!,
    {
      ...extra,
      code,
      jsx: options.jsx ?? false,
    },
    true,
  );
  return {
    ast: estree as AST<T>,
    services: {
      hasFullTypeInformation: true,
      program,
      esTreeNodeToTSNodeMap: astMaps.esTreeNodeToTSNodeMap,
      tsNodeToESTreeNodeMap: astMaps.tsNodeToESTreeNodeMap,
    },
  };
}

export function parseForESLint(
  code: string,
  parserOptions: ParserOptions,
): ParseForESLintResult {
  const { ast, services } = parseAndGenerateServices(code, {
    ...parserOptions,
    jsx: parserOptions.ecmaFeatures?.jsx ?? false,
    useJSXTextNode: true,
    projectFolderIgnoreList: [],
  });
  const scopeManager = analyze(ast, {
    ecmaVersion: parserOptions.ecmaVersion,
    globalReturn: parserOptions.ecmaFeatures?.globalReturn ?? false,
    sourceType: parserOptions.sourceType ?? 'script',
  });
  return { ast, services, scopeManager, visitorKeys };
}

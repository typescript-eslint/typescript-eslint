import type { AST } from '@typescript-eslint/typescript-estree/dist/parser';
import { analyze } from '@typescript-eslint/scope-manager/dist/analyze';
import { visitorKeys } from '@typescript-eslint/visitor-keys/dist/visitor-keys';
import { astConverter } from '@typescript-eslint/typescript-estree/dist/ast-converter';
import { createASTProgram } from './create-ast-program';
import type { ParserOptions } from '@typescript-eslint/types';
import type { Linter } from '@typescript-eslint/experimental-utils/dist/ts-eslint/Linter';
import type {
  ParserServices,
  TSESTreeOptions,
} from '@typescript-eslint/typescript-estree/dist/parser-options';
import { extra } from '../lib/config';

export type ParseForESLintResult = Linter.ESLintParseResult;

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
    ecmaVersion:
      parserOptions.ecmaVersion === 'latest' ? 1e8 : parserOptions.ecmaVersion,
    globalReturn: parserOptions.ecmaFeatures?.globalReturn ?? false,
    sourceType: parserOptions.sourceType ?? 'script',
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return { ast, services, scopeManager, visitorKeys };
}

import { analyze } from '@typescript-eslint/scope-manager/dist/analyze';
import { visitorKeys } from '@typescript-eslint/visitor-keys/dist/visitor-keys';
import { astConverter } from '@typescript-eslint/typescript-estree/dist/ast-converter';
import { createASTProgram } from './create-ast-program.js';
import { extra } from './config.js';

function parseAndGenerateServices(code, options) {
  const { ast, program } = createASTProgram(code, options);
  const { estree, astMaps } = astConverter(
    ast,
    { ...extra, code, jsx: options.jsx ?? false },
    true,
  );

  return {
    ast: estree,
    services: {
      hasFullTypeInformation: true,
      program,
      esTreeNodeToTSNodeMap: astMaps.esTreeNodeToTSNodeMap,
      tsNodeToESTreeNodeMap: astMaps.tsNodeToESTreeNodeMap,
    },
  };
}

export function parseForESLint(code, parserOptions) {
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

  return {
    ast,
    services,
    scopeManager,
    visitorKeys,
  };
}

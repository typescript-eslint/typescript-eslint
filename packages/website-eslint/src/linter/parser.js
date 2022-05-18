import { analyze } from '@typescript-eslint/scope-manager/dist/analyze';
import { visitorKeys } from '@typescript-eslint/visitor-keys/dist/visitor-keys';
import { astConverter } from '@typescript-eslint/typescript-estree/dist/ast-converter';
import { extra } from './config.js';
import { CompilerHost } from './CompilerHost';
import { createProgram } from 'typescript';

export function createASTProgram(code, isJsx, compilerOptions, libs) {
  const fileName = isJsx ? '/demo.tsx' : '/demo.ts';
  const compilerHost = new CompilerHost(libs, isJsx);

  compilerHost.files[fileName] = code;
  const program = createProgram(
    Object.keys(compilerHost.files),
    compilerOptions,
    compilerHost,
  );
  const ast = program.getSourceFile(fileName);
  return {
    ast,
    program,
  };
}

export function parseForESLint(code, eslintOptions, compilerOptions, libs) {
  const isJsx = eslintOptions.ecmaFeatures?.jsx ?? false;

  const { ast: tsAst, program } = createASTProgram(
    code,
    isJsx,
    compilerOptions,
    libs,
  );

  const { estree: ast, astMaps } = astConverter(
    tsAst,
    { ...extra, code, jsx: isJsx },
    true,
  );

  const services = {
    hasFullTypeInformation: true,
    program,
    esTreeNodeToTSNodeMap: astMaps.esTreeNodeToTSNodeMap,
    tsNodeToESTreeNodeMap: astMaps.tsNodeToESTreeNodeMap,
  };

  const scopeManager = analyze(ast, {
    ecmaVersion:
      eslintOptions.ecmaVersion === 'latest' ? 1e8 : eslintOptions.ecmaVersion,
    globalReturn: eslintOptions.ecmaFeatures?.globalReturn ?? false,
    sourceType: eslintOptions.sourceType ?? 'script',
  });

  return {
    ast,
    tsAst,
    services,
    scopeManager,
    visitorKeys,
  };
}

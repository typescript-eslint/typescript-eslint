import type { analyze } from '@typescript-eslint/scope-manager/dist/analyze';
import type { astConverter } from '@typescript-eslint/typescript-estree/dist/ast-converter';
import type { getScriptKind } from '@typescript-eslint/typescript-estree/dist/create-program/getScriptKind';
import type { TSESLint } from '@typescript-eslint/utils';

export interface LintUtils {
  createLinter: () => TSESLint.Linter;
  analyze: typeof analyze;
  visitorKeys: TSESLint.SourceCode.VisitorKeys;
  astConverter: typeof astConverter;
  getScriptKind: typeof getScriptKind;
}

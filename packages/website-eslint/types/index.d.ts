import type { TSESLint } from '@typescript-eslint/utils';

import { analyze } from '@typescript-eslint/scope-manager/dist/analyze';
import { astConverter } from '@typescript-eslint/typescript-estree/dist/ast-converter';
import { getScriptKind } from '@typescript-eslint/typescript-estree/dist/create-program/shared';

export interface LintUtils {
  createLinter: () => TSESLint.Linter;
  analyze: typeof analyze;
  visitorKeys: TSESLint.SourceCode.VisitorKeys;
  astConverter: typeof astConverter;
  getScriptKind: typeof getScriptKind;
}

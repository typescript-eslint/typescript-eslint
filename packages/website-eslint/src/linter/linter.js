// @ts-check

import 'vs/language/typescript/tsWorker';

// @ts-expect-error -- we don't do types for the plugins
import rules from '@typescript-eslint/eslint-plugin/dist/rules';
import { Linter } from 'eslint';

export function createLinter() {
  const linter = new Linter();
  for (const name in rules) {
    linter.defineRule(`@typescript-eslint/${name}`, rules[name]);
  }
  return linter;
}

export { analyze } from '@typescript-eslint/scope-manager/dist/analyze';
export { visitorKeys } from '@typescript-eslint/visitor-keys/dist/visitor-keys';
export { astConverter } from '@typescript-eslint/typescript-estree/dist/ast-converter';
export { getScriptKind } from '@typescript-eslint/typescript-estree/dist/create-program/getScriptKind';

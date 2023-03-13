import 'vs/language/typescript/tsWorker';
import { Linter } from 'eslint';
import rules from '@typescript-eslint/eslint-plugin/dist/rules';
import esquery from 'esquery';

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

export { esquery };

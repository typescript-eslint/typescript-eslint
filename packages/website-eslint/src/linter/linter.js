/*
NOTE - this file intentionally uses deep `/use-at-your-own-risk` imports into our packages.
This is so that rollup can properly tree-shake and only include the necessary code.
This saves us having to mock unnecessary things and reduces our bundle size.
*/
// @ts-check

import 'vs/language/typescript/tsWorker';

import rules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import { Linter } from 'eslint';
import esquery from 'esquery';

export function createLinter() {
  const linter = new Linter();
  for (const name in rules) {
    linter.defineRule(`@typescript-eslint/${name}`, rules[name]);
  }
  return linter;
}

export { analyze } from '@typescript-eslint/scope-manager/use-at-your-own-risk/analyze';
export { visitorKeys } from '@typescript-eslint/visitor-keys/use-at-your-own-risk/visitor-keys';
export { astConverter } from '@typescript-eslint/typescript-estree/use-at-your-own-risk/ast-converter';
export { getScriptKind } from '@typescript-eslint/typescript-estree/use-at-your-own-risk/getScriptKind';

export { esquery };

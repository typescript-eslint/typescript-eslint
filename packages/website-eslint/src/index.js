// @ts-check

import { rules } from '@typescript-eslint/eslint-plugin';
import { analyze } from '@typescript-eslint/scope-manager';
import {
  astConverter,
  getScriptKind,
} from '@typescript-eslint/typescript-estree/use-at-your-own-risk';
import { visitorKeys } from '@typescript-eslint/visitor-keys';
import { Linter } from 'eslint';
import esquery from 'esquery';

// don't change exports to export *
exports.getScriptKind = getScriptKind;
exports.analyze = analyze;
exports.visitorKeys = visitorKeys;
exports.astConverter = astConverter;
exports.esquery = esquery;

exports.createLinter = function () {
  const linter = new Linter();
  for (const name in rules) {
    linter.defineRule(`@typescript-eslint/${name}`, rules[name]);
  }
  return linter;
};

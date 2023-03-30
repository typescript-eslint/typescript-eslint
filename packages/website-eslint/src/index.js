/*
NOTE - this file intentionally uses deep `/use-at-your-own-risk` imports into our packages.
This is so that rollup can properly tree-shake and only include the necessary code.
This saves us having to mock unnecessary things and reduces our bundle size.
*/
// @ts-check

import eslintJs from '@eslint/js';
import * as plugin from '@typescript-eslint/eslint-plugin';
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
  for (const name in plugin.rules) {
    linter.defineRule(`@typescript-eslint/${name}`, plugin.rules[name]);
  }
  return linter;
};

/** @type {Record<string, unknown>} */
const configs = {};

for (const name in eslintJs.configs) {
  configs[`eslint:${name}`] = eslintJs.configs[name];
}

for (const name in plugin.configs) {
  const value = plugin.configs[name];
  if (value.extends && Array.isArray(value.extends)) {
    value.extends = value.extends.map(name =>
      name.replace(/^\.\/configs\//, 'plugin:@typescript-eslint/'),
    );
  }
  configs[`plugin:@typescript-eslint/${name}`] = value;
}

exports.configs = configs;

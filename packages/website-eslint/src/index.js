// TODO: Maybe we can share this forked typing more effectively?
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../website/typings/esquery.d.ts" />

/*
NOTE - this file intentionally uses deep `/use-at-your-own-risk` imports into our packages.
This is so that esbuild can properly tree-shake and only include the necessary code.
This saves us having to mock unnecessary things and reduces our bundle size.
*/

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
  const linter = new Linter({ configType: 'eslintrc' });
  for (const name in plugin.rules) {
    linter.defineRule(
      `@typescript-eslint/${name}`,
      /** @type {import('eslint').Rule.RuleModule} */ (
        /** @type {unknown} */ (plugin.rules[name])
      ),
    );
  }
  return linter;
};

/** @type {Record<string, unknown>} */
const configs = {};

for (const [name, value] of Object.entries(eslintJs.configs)) {
  configs[`eslint:${name}`] = value;
}

for (const [name, value] of Object.entries(plugin.configs)) {
  if (value.extends && Array.isArray(value.extends)) {
    value.extends = value.extends.map(name =>
      name.replace(/^\.\/configs\//, 'plugin:@typescript-eslint/'),
    );
  }
  configs[`plugin:@typescript-eslint/${name}`] = value;
}

exports.configs = configs;

// TODO: Maybe we can share this forked typing more effectively?
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../website/typings/esquery.d.ts" />

/*
NOTE - this file intentionally uses deep `/use-at-your-own-risk` imports into our packages.
This is so that esbuild can properly tree-shake and only include the necessary code.
This saves us having to mock unnecessary things and reduces our bundle size.
*/

import js from '@eslint/js';
import rawPlugin from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/raw-plugin';
import { analyze } from '@typescript-eslint/scope-manager';
import {
  astConverter,
  getScriptKind,
} from '@typescript-eslint/typescript-estree/use-at-your-own-risk';
import { visitorKeys } from '@typescript-eslint/visitor-keys';
import { Linter } from 'eslint';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import esquery from 'esquery';

// don't change exports to export *
exports.getScriptKind = getScriptKind;
exports.analyze = analyze;
exports.visitorKeys = visitorKeys;
exports.astConverter = astConverter;
exports.esquery = esquery;

exports.createLinter = function () {
  return new Linter();
};

// Some configs bring in their own `languageOptions.parser`. This would
// override the browser-compatible parser used by the Playground with the
// default Node parser, and cause an error, so it's stripped out here.
/** @type {(config: Record<string, any>) => Record<string, any>} */
const stripParser = config => {
  if (!config.languageOptions?.parser) {
    return config;
  }
  const { parser: _parser, ...languageOptions } = config.languageOptions;
  return { ...config, languageOptions };
};

/** @type {(config: Record<string, any> | Record<string, any>[]) => unknown} */
const stripParserFromConfig = config =>
  Array.isArray(config) ? config.map(stripParser) : stripParser(config);

/** @type {Record<string, unknown>} */
const configs = {};

for (const [name, value] of Object.entries(js.configs)) {
  configs[`js/${name}`] = stripParserFromConfig(value);
}

for (const [name, value] of Object.entries(rawPlugin.flatConfigs)) {
  configs[`@typescript-eslint/${name}`] = stripParserFromConfig(value);
}

exports.configs = configs;

exports.plugin = rawPlugin.plugin;

exports.builtinRules = builtinRules;

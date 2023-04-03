import type * as ts from 'typescript';

import { isRecord } from '../ast/utils';
import { parseJSONObject, toJson } from '../lib/json';
import type { EslintRC, TSConfig } from '../types';

export function parseESLintRC(code?: string): EslintRC {
  if (code) {
    try {
      const parsed = parseJSONObject(code);
      if ('rules' in parsed && isRecord(parsed.rules)) {
        return parsed as EslintRC;
      }
      return { ...parsed, rules: {} };
    } catch (e) {
      console.error(e);
    }
  }
  return { rules: {} };
}

export function parseTSConfig(code?: string): TSConfig {
  if (code) {
    try {
      const parsed = window.ts.parseConfigFileTextToJson(
        '/tsconfig.json',
        code,
      );
      if (parsed.error) {
        console.error(parsed.error);
      }
      if (isRecord(parsed.config)) {
        return parsed.config as TSConfig;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return { compilerOptions: {} };
}

const moduleRegexp = /(module\.exports\s*=)/g;

function constrainedScopeEval(obj: string): unknown {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function(`
    "use strict";
    var module = { exports: {} };
    (${obj});
    return module.exports
  `)();
}

export function tryParseEslintModule(value: string): string {
  try {
    if (moduleRegexp.test(value)) {
      const newValue = toJson(constrainedScopeEval(value));
      if (newValue !== value) {
        return newValue;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return value;
}

export function getTypescriptOptions(): ts.OptionDeclarations[] {
  const allowedCategories = [
    'Command-line Options',
    'Projects',
    'Compiler Diagnostics',
    'Editor Support',
    'Output Formatting',
    'Watch and Build Modes',
    'Source Map Options',
  ];

  const filteredNames = [
    'moduleResolution',
    'moduleDetection',
    'plugins',
    'typeRoots',
    'jsx',
  ];

  return window.ts.optionDeclarations.filter(
    item =>
      (item.type === 'boolean' ||
        item.type === 'list' ||
        item.type instanceof Map) &&
      item.description &&
      item.category &&
      !allowedCategories.includes(item.category.message) &&
      !filteredNames.includes(item.name),
  );
}

export const defaultTsConfig = toJson({
  compilerOptions: {
    strictNullChecks: true,
  },
});

export const defaultEslintConfig = toJson({
  rules: {},
});

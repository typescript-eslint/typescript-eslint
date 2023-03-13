import { isRecord } from '@site/src/components/ast/utils';
import type { EslintRC, TSConfig } from '@site/src/components/types';
import json5 from 'json5';

export interface OptionDeclarations {
  name: string;
  type?: unknown;
  category?: { message: string };
  description?: { message: string };
  element?: {
    type: unknown;
  };
}

export function parseESLintRC(code?: string): EslintRC {
  if (code) {
    try {
      const parsed: unknown = json5.parse(code);
      if (isRecord(parsed)) {
        if ('rules' in parsed && isRecord(parsed.rules)) {
          return parsed as EslintRC;
        }
        return { ...parsed, rules: {} };
      }
    } catch (e) {
      // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.error(parsed.error);
      }
      if (isRecord(parsed.config)) {
        return parsed.config as TSConfig;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.error(e);
  }
  return value;
}

export function toJson(cfg: unknown): string {
  return JSON.stringify(cfg, null, 2);
}

export function toJsonConfig(cfg: unknown, prop: string): string {
  return toJson({ [prop]: cfg });
}

export function getTypescriptOptions(): OptionDeclarations[] {
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

  // @ts-expect-error: definition is not fully correct
  return (window.ts.optionDeclarations as OptionDeclarations[]).filter(
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

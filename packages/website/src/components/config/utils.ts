import type { CompilerFlags, RulesRecord } from '@site/src/components/types';

import { parse } from 'json5';
import { isRecord } from '@site/src/components/ast/utils';

export interface OptionDeclarations {
  name: string;
  type?: unknown;
  category?: { message: string };
  description?: { message: string };
}

export function parseESLintRC(code?: string): RulesRecord {
  if (code) {
    try {
      const parsed: unknown = parse(code);
      if (isRecord(parsed) && 'rules' in parsed && isRecord(parsed.rules)) {
        return parsed.rules as RulesRecord;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
  return {};
}

export function parseTSConfig(code?: string): CompilerFlags {
  if (code) {
    try {
      const parsed: unknown = parse(code);
      if (
        isRecord(parsed) &&
        'compilerOptions' in parsed &&
        isRecord(parsed.compilerOptions)
      ) {
        return parsed.compilerOptions as CompilerFlags;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
  return {};
}

export function toJsonConfig(cfg: unknown, prop: string): string {
  return JSON.stringify(
    {
      [prop]: cfg,
    },
    null,
    2,
  );
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
    'lib',
    'plugins',
    'typeRoots',
    'jsx',
  ];

  // @ts-expect-error: definition is not fully correct
  return (window.ts.optionDeclarations as OptionDeclarations[]).filter(
    item =>
      (item.type === 'boolean' || item.type instanceof Map) &&
      item.description &&
      item.category &&
      !allowedCategories.includes(item.category.message) &&
      !filteredNames.includes(item.name),
  );
}

export const defaultTsConfig = toJsonConfig(
  {
    strictNullChecks: true,
  },
  'compilerOptions',
);

export const defaultEslintConfig = toJsonConfig({}, 'rules');

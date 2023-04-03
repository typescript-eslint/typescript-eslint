import { isRecord } from '@site/src/components/ast/utils';
import type { EslintRC, TSConfig } from '@site/src/components/types';
import json5 from 'json5';

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

export function toJson(cfg: unknown): string {
  return JSON.stringify(cfg, null, 2);
}

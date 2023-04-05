import { isRecord } from '../ast/utils';
import type { EslintRC, TSConfig } from '../types';
import { ensureObject, parseJSONObject, toJson } from './json';

/**
 * Parse a .eslintrc string into an object.
 * This function is pretty naive, as it only validates rules and extends.
 */
export function parseESLintRC(code?: string): EslintRC {
  if (code) {
    try {
      const parsed = parseJSONObject(code);
      if ('rules' in parsed) {
        parsed.rules = ensureObject(parsed.rules);
      }
      if ('extends' in parsed) {
        parsed.extends =
          Array.isArray(parsed.extends) || typeof parsed.extends === 'string'
            ? parsed.extends
            : [];
      }
      return parsed as EslintRC;
    } catch (e) {
      console.error(e);
    }
  }
  return { rules: {} };
}

/**
 * Parse a tsconfig.json string into an object.
 * This is done by typescript compiler.
 */
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

/**
 * Evaluate a string that contains a module.exports assignment.
 */
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

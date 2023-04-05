import json5 from 'json5';

import { isRecord } from '../ast/utils';

/**
 * Validates that the passed value is a record, if not return an empty object
 */
export function ensureObject(obj: unknown): Record<string, unknown> {
  return isRecord(obj) ? obj : {};
}

/**
 * Parse a JSON string into an object. If the string is not valid JSON, return an empty object.
 */
export function parseJSONObject(code?: string): Record<string, unknown> {
  if (code) {
    try {
      return ensureObject(json5.parse(code));
    } catch (e) {
      console.error(e);
    }
  }
  return {};
}

/**
 * Convert a config object to a JSON string
 */
export function toJson(cfg: unknown): string {
  return JSON.stringify(cfg, null, 2);
}

/**
 * Convert a config object to a JSON string, wrapping it in a property
 */
export function toJsonConfig(cfg: unknown, prop: string): string {
  return toJson({ [prop]: cfg });
}

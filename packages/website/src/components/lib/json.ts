import json5 from 'json5';

import { isRecord } from '../ast/utils';

export function ensureObject(obj: unknown): Record<string, unknown> {
  return isRecord(obj) ? obj : {};
}

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

export function toJson(cfg: unknown): string {
  return JSON.stringify(cfg, null, 2);
}

export function toJsonConfig(cfg: unknown, prop: string): string {
  return toJson({ [prop]: cfg });
}

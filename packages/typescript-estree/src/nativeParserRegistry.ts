import type { ParseAndGenerateServicesResult } from './parser';
import type { TSESTreeOptions } from './parser-options';
import type { ParseSettings } from './parseSettings';

export type ParseAndGenerateNativeServices = <T extends TSESTreeOptions>(
  parseSettings: ParseSettings,
) => ParseAndGenerateServicesResult<T>;

export interface NativeBackend {
  clearProjectService: () => void;
  parse: ParseAndGenerateNativeServices;
}

let backend: NativeBackend | undefined;
let loaded = false;

/** Keeps `./native`, and so the optional `@typescript/native`, off every other import path. */
export function registerNativeBackend(registered: NativeBackend): void {
  backend = registered;
  loaded = true;
}

/** `undefined` for a missing `@typescript/native`, and when run from source. */
export function getNativeParser(): ParseAndGenerateNativeServices | undefined {
  if (!loaded) {
    loaded = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./native');
    } catch {
      backend = undefined;
    }
  }
  return backend?.parse;
}

export function clearNativeBackendCaches(): void {
  backend?.clearProjectService();
}

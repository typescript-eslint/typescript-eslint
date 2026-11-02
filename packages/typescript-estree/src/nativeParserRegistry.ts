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

// Bundlers follow literal require() paths, which would pull in the optional @typescript/native.
const tsgoBackendPath = './native';

let backend: NativeBackend | undefined;
let loadError: unknown;
let loaded = false;

export function registerNativeBackend(registered: NativeBackend): void {
  backend = registered;
  loadError = undefined;
  loaded = true;
}

export function getNativeParser(): ParseAndGenerateNativeServices | undefined {
  if (!loaded) {
    loaded = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(tsgoBackendPath);
    } catch (error) {
      backend = undefined;
      loadError = error;
    }
  }
  return backend?.parse;
}

export function getNativeBackendLoadError(): unknown {
  return loadError;
}

export function clearNativeBackendCaches(): void {
  backend?.clearProjectService();
}

import type { ParseAndGenerateServicesResult } from './parser';
import type { TSESTreeOptions } from './parser-options';
import type { ParseSettings } from './parseSettings';

export type ParseAndGenerateNativeServices = <T extends TSESTreeOptions>(
  parseSettings: ParseSettings,
) => ParseAndGenerateServicesResult<T>;

let registeredNativeParser: ParseAndGenerateNativeServices | undefined;
let loaded = false;

/**
 * Registers the native backend's parse entry point, so that importing
 * `./native` is enough to enable it. Nothing else in this package depends on
 * the optional `@typescript/native` package.
 */
export function registerNativeParser(
  parser: ParseAndGenerateNativeServices,
): void {
  registeredNativeParser = parser;
  loaded = true;
}

/**
 * Loads the native backend on first use. Returns `undefined` when it cannot be
 * resolved, which covers both a missing `@typescript/native` and this package's
 * own tests: those run from source, where `require` resolves nothing.
 */
export function getNativeParser(): ParseAndGenerateNativeServices | undefined {
  if (!loaded) {
    loaded = true;
    try {
      registeredNativeParser =
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
        (require('./native') as typeof import('./native'))
          .parseAndGenerateNativeServices;
    } catch {
      registeredNativeParser = undefined;
    }
  }
  return registeredNativeParser;
}

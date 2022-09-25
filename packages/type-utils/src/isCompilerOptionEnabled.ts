import * as ts from 'typescript';

import type { StrictCompilerOption } from './isStrictCompilerOptionEnabled';
import { isStrictCompilerOptionEnabled } from './isStrictCompilerOptionEnabled';

/**
 * Checks if a given compiler option is enabled.
 * It handles dependencies of options, e.g. `declaration` is implicitly enabled by `composite` or `strictNullChecks` is enabled by `strict`.
 * However, it does not check dependencies that are already checked and reported as errors, e.g. `checkJs` without `allowJs`.
 * This function only handles boolean flags.
 */
export function isCompilerOptionEnabled(
  options: ts.CompilerOptions,
  option: keyof ts.CompilerOptions,
): boolean {
  switch (option) {
    case 'stripInternal':
    case 'declarationMap':
    case 'emitDeclarationOnly':
      return (
        options[option] === true &&
        isCompilerOptionEnabled(options, 'declaration')
      );
    case 'declaration':
      return (
        options.declaration ?? isCompilerOptionEnabled(options, 'composite')
      );
    case 'incremental':
      return options.incremental === undefined
        ? isCompilerOptionEnabled(options, 'composite')
        : options.incremental;
    case 'skipDefaultLibCheck':
      return (
        options.skipDefaultLibCheck ??
        isCompilerOptionEnabled(options, 'skipLibCheck')
      );
    case 'suppressImplicitAnyIndexErrors':
      return (
        options.suppressImplicitAnyIndexErrors === true &&
        isCompilerOptionEnabled(options, 'noImplicitAny')
      );
    case 'allowSyntheticDefaultImports':
      return options.allowSyntheticDefaultImports !== undefined
        ? options.allowSyntheticDefaultImports
        : isCompilerOptionEnabled(options, 'esModuleInterop') ||
            options.module === ts.ModuleKind.System;
    case 'noUncheckedIndexedAccess':
      return (
        options.noUncheckedIndexedAccess === true &&
        isCompilerOptionEnabled(options, 'strictNullChecks')
      );
    case 'allowJs':
      return options.allowJs === undefined
        ? isCompilerOptionEnabled(options, 'checkJs')
        : options.allowJs;
    case 'noImplicitAny':
    case 'noImplicitThis':
    case 'strictNullChecks':
    case 'strictFunctionTypes':
    case 'strictPropertyInitialization':
    case 'alwaysStrict':
    case 'strictBindCallApply':
      type AssertEqual<T, U extends T> = U; // make sure all strict options are handled here
      return isStrictCompilerOptionEnabled(
        options,
        <AssertEqual<typeof option, StrictCompilerOption>>option,
      );
  }

  return options[option] === true;
}

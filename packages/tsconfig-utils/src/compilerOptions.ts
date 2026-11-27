import type * as ts from 'typescript';

/**
 * Compiler options required to avoid critical functionality issues
 */
export const CORE_COMPILER_OPTIONS: {
  noEmit: true;
  noUnusedLocals: true;
  noUnusedParameters: true;
} = {
  // Required to avoid parse from causing emit to occur
  noEmit: true,

  // Flags required to make no-unused-vars work
  noUnusedLocals: true,
  noUnusedParameters: true,
} satisfies ts.CompilerOptions;

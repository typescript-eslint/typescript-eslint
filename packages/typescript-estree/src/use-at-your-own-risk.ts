// required by website
export * from './ast-converter';
export * from './create-program/getScriptKind';
// required by packages/type-utils
export { getCanonicalFileName } from './create-program/shared';

// required by packages/utils/src/ts-estree.ts
export * from './getModifiers';
export type { ParseSettings } from './parseSettings';

export { typescriptVersionIsAtLeast } from './version-check';

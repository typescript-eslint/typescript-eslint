// required by website
export * from './ast-converter';
export * from './create-program/getScriptKind';
export type { ParseSettings } from './parseSettings';

// required by packages/utils/src/ts-estree.ts
export * from './getModifiers';
export { typescriptVersionIsAtLeast } from './version-check';

// required by packages/type-utils
export { getCanonicalFileName } from './create-program/shared';

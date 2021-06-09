export * from './parser';
export { ParserServices, TSESTreeOptions } from './parser-options';
export { simpleTraverse } from './simple-traverse';
export * from './ts-estree';
export { clearCaches } from './create-program/createWatchProgram';
export { createProgramFromConfigFile as createProgram } from './create-program/useProvidedPrograms';

// re-export for backwards-compat
export { visitorKeys } from '@typescript-eslint/visitor-keys';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const version: string = require('../package.json').version;

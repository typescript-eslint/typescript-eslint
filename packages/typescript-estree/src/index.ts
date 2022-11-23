export {
  AST,
  parse,
  parseAndGenerateServices,
  parseWithNodeMaps,
  ParseAndGenerateServicesResult,
  ParseWithNodeMapsResult,
  clearProgramCache,
} from './parser';
export {
  ParserServices,
  ParserServicesWithTypeInformation,
  ParserServicesWithoutTypeInformation,
  TSESTreeOptions,
} from './parser-options';
export { simpleTraverse } from './simple-traverse';
export * from './ts-estree';
export { clearWatchCaches as clearCaches } from './create-program/createWatchProgram';
export { createProgramFromConfigFile as createProgram } from './create-program/useProvidedPrograms';
export * from './create-program/getScriptKind';
export { typescriptVersionIsAtLeast } from './version-check';
export * from './getModifiers';

// re-export for backwards-compat
export { visitorKeys } from '@typescript-eslint/visitor-keys';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const version: string = require('../package.json').version;

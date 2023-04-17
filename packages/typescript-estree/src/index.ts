export {
  AST,
  parse,
  parseAndGenerateServices,
  parseWithNodeMaps,
  ParseAndGenerateServicesResult,
  ParseWithNodeMapsResult,
} from './parser';
export {
  ParserServices,
  ParserServicesWithTypeInformation,
  ParserServicesWithoutTypeInformation,
  TSESTreeOptions,
} from './parser-options';
export { simpleTraverse } from './simple-traverse';
export * from './ts-estree';
export { createProgramFromConfigFile as createProgram } from './create-program/useProvidedPrograms';
export * from './create-program/getScriptKind';
export { typescriptVersionIsAtLeast } from './version-check';
export * from './getModifiers';
export { TSError } from './node-utils';
export * from './clear-caches';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const version: string = require('../package.json').version;

export * from './clear-caches';
export * from './create-program/getScriptKind';
export { getCanonicalFileName } from './create-program/shared';
export { createProgramFromConfigFile as createProgram } from './create-program/useProvidedPrograms';
export * from './getModifiers';
export { TSError } from './node-utils';
export {
  AST,
  parse,
  parseAndGenerateServices,
  ParseAndGenerateServicesResult,
} from './parser';
export {
  ParserServices,
  ParserServicesWithoutTypeInformation,
  ParserServicesWithTypeInformation,
  TSESTreeOptions,
} from './parser-options';
export { simpleTraverse } from './simple-traverse';
export * from './ts-estree';
export { typescriptVersionIsAtLeast } from './version-check';
export { withoutProjectParserOptions } from './withoutProjectParserOptions';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const version: string = require('../package.json').version;

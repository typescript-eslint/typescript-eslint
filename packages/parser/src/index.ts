export { parse, parseForESLint, type ParserOptions } from './parser';
export {
  clearCaches,
  createProgram,
  type ParserServices,
  type ParserServicesWithoutTypeInformation,
  type ParserServicesWithTypeInformation,
  withoutProjectParserOptions,
} from '@typescript-eslint/typescript-estree';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const version: string = require('../package.json').version;

export const meta = {
  name: 'typescript-eslint/parser',
  version,
};

export { parse, parseForESLint, ParserOptions } from './parser';
export {
  ParserServices,
  ParserServicesWithTypeInformation,
  ParserServicesWithoutTypeInformation,
  clearCaches,
  createProgram,
} from '@typescript-eslint/typescript-estree';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const version: string = require('../package.json').version;

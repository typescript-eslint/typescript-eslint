export {
  clearCaches,
  createProgram,
} from '@typescript-eslint/typescript-estree';
export type {
  ParserServices,
  ParserServicesWithTypeInformation,
  ParserServicesWithoutTypeInformation,
} from '@typescript-eslint/typescript-estree';
export { parse, parseForESLint } from './parser';
export type { ParserOptions } from './parser';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const version: string = require('../package.json').version;

export const meta = {
  name: 'typescript-eslint/parser',
  version,
};

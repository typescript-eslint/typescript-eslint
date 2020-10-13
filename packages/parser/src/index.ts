export { parse, parseForESLint, ParserOptions } from './parser';
export {
  ParserServices,
  clearCaches,
} from '@typescript-eslint/typescript-estree';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
export const version: string = require('../package.json').version;

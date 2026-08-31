import * as ts from 'typescript';

// intentionally executing code before rest of the require()s. This will not work with ESM.

const [versionMajor, _versionMinor] = ts.versionMajorMinor
  .split('.')
  .map(Number);

if (versionMajor >= 7) {
  // eslint-disable-next-line no-console
  console.error(
    [
      "typescript-eslint's classic parser backend does not support TypeScript 7 installed as 'typescript'.",
      "The experimental TypeScript 7.1 native backend requires side-by-side 'typescript' and '@typescript/native' aliases. See https://typescript-eslint.io/packages/parser#experimental-typescript-71-native-backend.",
    ].join('\n'),
  );
  throw new Error(
    "typescript-eslint's classic parser backend does not support TypeScript 7 installed as 'typescript'.",
  );
}

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

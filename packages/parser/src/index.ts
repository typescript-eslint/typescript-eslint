import * as ts from 'typescript';

// intentionally executing code before rest of the require()s. This will not work with ESM.

const [versionMajor, _versionMinor] = ts.versionMajorMinor
  .split('.')
  .map(Number);

if (versionMajor >= 7) {
  // eslint-disable-next-line no-console
  console.error(
    [
      'typescript-eslint does not support TS 7.0',
      'Please see https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0 to run typescript-eslint using the TS 6 API.',
      "See also https://github.com/typescript-eslint/typescript-eslint/issues/10940 for tracking typescript-eslint's support for TS >=7.1",
    ].join('\n'),
  );
  throw new Error('typescript-eslint does not support TS 7.0');
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

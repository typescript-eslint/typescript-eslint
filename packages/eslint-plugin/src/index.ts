/* eslint-disable import/first -- intentionally executing code before rest of the require()s. This will not work with ESM. */

import * as ts from 'typescript';

const [versionMajor, _versionMinor] = ts.versionMajorMinor
  .split('.')
  .map(Number);

if (versionMajor >= 7) {
  // eslint-disable-next-line no-console
  console.error(
    [
      'typescript-eslint does not support TS 7.',
      'Please see https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0 to run typescript-eslint using the TS 6 API.',
      "See also https://github.com/typescript-eslint/typescript-eslint/issues/10940 for tracking typescript-eslint's support for TS 7",
    ].join('\n'),
  );
  throw new Error('typescript-eslint does not support TS 7.');
}

import rawPlugin from './raw-plugin';

export = rawPlugin.plugin;

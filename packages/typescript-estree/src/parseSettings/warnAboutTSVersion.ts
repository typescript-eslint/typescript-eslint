import semver from 'semver';
import * as ts from 'typescript';

import type { ParseSettings } from './index';

/**
 * This needs to be kept in sync with package.json in the typescript-eslint monorepo
 */
export const SUPPORTED_TYPESCRIPT_VERSIONS = '>=4.8.4 <5.8.0';

/*
 * The semver package will ignore prerelease ranges, and we don't want to explicitly document every one
 * List them all separately here, so we can automatically create the full string
 */
const SUPPORTED_PRERELEASE_RANGES: string[] = [];
const ACTIVE_TYPESCRIPT_VERSION = ts.version;
const isRunningSupportedTypeScriptVersion = semver.satisfies(
  ACTIVE_TYPESCRIPT_VERSION,
  [SUPPORTED_TYPESCRIPT_VERSIONS, ...SUPPORTED_PRERELEASE_RANGES].join(' || '),
);

let warnedAboutTSVersion = false;

export function warnAboutTSVersion(
  parseSettings: ParseSettings,
  passedLoggerFn: boolean,
): void {
  if (isRunningSupportedTypeScriptVersion || warnedAboutTSVersion) {
    return;
  }

  if (
    passedLoggerFn ||
    // See https://github.com/typescript-eslint/typescript-eslint/issues/7896
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (typeof process === 'undefined' ? false : process.stdout?.isTTY)
  ) {
    const border = '=============';
    const versionWarning = [
      border,
      'WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.',
      'You may find that it works just fine, or you may not.',
      `SUPPORTED TYPESCRIPT VERSIONS: ${SUPPORTED_TYPESCRIPT_VERSIONS}`,
      `YOUR TYPESCRIPT VERSION: ${ACTIVE_TYPESCRIPT_VERSION}`,
      'Please only submit bug reports when using the officially supported version.',
      border,
    ].join('\n\n');

    parseSettings.log(versionWarning);
  }

  warnedAboutTSVersion = true;
}

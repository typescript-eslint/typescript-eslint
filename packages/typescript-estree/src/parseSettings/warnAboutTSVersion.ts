import semver from 'semver';
import * as ts from 'typescript';

import type { ParseSettings } from './index';
/**
 * This needs to be kept in sync with /docs/users/Versioning.mdx
 * in the typescript-eslint monorepo
 */
const SUPPORTED_TYPESCRIPT_VERSIONS = '>=4.3.5 <5.4.0';

/*
 * The semver package will ignore prerelease ranges, and we don't want to explicitly document every one
 * List them all separately here, so we can automatically create the full string
 */
const SUPPORTED_PRERELEASE_RANGES: string[] = [];
const ACTIVE_TYPESCRIPT_VERSION = ts.version;
const isRunningSupportedTypeScriptVersion = semver.satisfies(
  ACTIVE_TYPESCRIPT_VERSION,
  [SUPPORTED_TYPESCRIPT_VERSIONS]
    .concat(SUPPORTED_PRERELEASE_RANGES)
    .join(' || '),
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

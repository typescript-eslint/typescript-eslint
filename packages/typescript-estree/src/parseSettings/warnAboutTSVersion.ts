import semver from 'semver';
import * as ts from 'typescript';

import type { ParseSettings } from './index';
/**
 * This needs to be kept in sync with the top-level README.md in the
 * typescript-eslint monorepo
 */
const SUPPORTED_TYPESCRIPT_VERSIONS = '>=3.3.1 <4.9.0';

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

export function warnAboutTSVersion(parseSettings: ParseSettings): void {
  if (!isRunningSupportedTypeScriptVersion && !warnedAboutTSVersion) {
    const isTTY =
      typeof process === 'undefined' ? false : process.stdout?.isTTY;
    if (isTTY) {
      const border = '=============';
      const versionWarning = [
        border,
        'WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.',
        'You may find that it works just fine, or you may not.',
        `SUPPORTED TYPESCRIPT VERSIONS: ${SUPPORTED_TYPESCRIPT_VERSIONS}`,
        `YOUR TYPESCRIPT VERSION: ${ACTIVE_TYPESCRIPT_VERSION}`,
        'Please only submit bug reports when using the officially supported version.',
        border,
      ];
      parseSettings.log(versionWarning.join('\n\n'));
    }
    warnedAboutTSVersion = true;
  }
}

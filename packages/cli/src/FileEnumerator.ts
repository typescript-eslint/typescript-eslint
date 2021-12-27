import { version } from 'eslint/package.json';
import * as semver from 'semver';

const isESLintV8 = semver.major(version) >= 8;

declare class _FileEnumerator {
  constructor(options?: {
    readonly cwd?: string;
    readonly extensions?: string | null;
    readonly globInputPaths?: boolean;
    readonly errorOnUnmatchedPattern?: boolean;
    readonly ignore?: boolean;
  });

  iterateFiles(
    patternOrPatterns: string | readonly string[],
  ): IterableIterator<{
    readonly filePath: string;
    readonly config: unknown;
    readonly ignored: boolean;
  }>;
}

const FileEnumerator = (
  isESLintV8
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      require('eslint/use-at-your-own-risk').FileEnumerator
    : require('eslint/lib/cli-engine/file-enumerator')
) as typeof _FileEnumerator;

export { FileEnumerator };

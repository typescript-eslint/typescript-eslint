import type { Linter, ParserOptions } from '@typescript-eslint/utils/ts-eslint';

import type { DependencyConstraint } from './DependencyConstraint';

// need to keep this in sync with the schema in `config-schema.ts`
export interface RuleTesterConfig extends Linter.Config {
  /**
   * The default parser to use for tests.
   * @default '@typescript-eslint/parser'
   */
  readonly parser: string;
  /**
   * The default parser options to use for tests.
   */
  readonly parserOptions?: Readonly<ParserOptions>;
  /**
   * Constraints that must pass in the current environment for any tests to run.
   */
  readonly dependencyConstraints?: DependencyConstraint;
  /**
   * The default filenames to use for type-aware tests.
   * @default { ts: 'file.ts', tsx: 'react.tsx' }
   */
  readonly defaultFilenames?: Readonly<{
    ts: string;
    tsx: string;
  }>;
  /**
   * Whether or not to do snapshot testing for "invalid" test cases.
   * @default false
   */
  readonly snapshots?:
    | false
    | {
        /**
         * The absolute path to use as the basis for writing snapshots.
         */
        readonly snapshotBasePath: string;
      };
}

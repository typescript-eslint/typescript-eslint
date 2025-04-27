type SnapshotPathFn = (i: number) => string;

interface SuccessSnapshotPaths {
  readonly ast: SnapshotPathFn;
  readonly tokens: SnapshotPathFn;
}

/**
 * We define this as a global type to make it easier to consume from fixtures.
 * It saves us having to import the type into `src` files from a test utils folder.
 * This is a convenient property because it saves us from a lot of `../`!
 */
export interface ASTFixtureConfig {
  /**
   * Prevents the parser from throwing an error if it receives an invalid AST from TypeScript.
   * This case only usually occurs when attempting to lint invalid code.
   */
  readonly allowInvalidAST?: boolean;

  /**
   * Specifies that we expect that babel doesn't yet support the code in this fixture, so we expect that it will error.
   * This should not be used if we expect babel to throw for this feature due to a valid parser error!
   *
   * The value should be a description of why there isn't support - for example a github issue URL.
   */
  readonly expectBabelToNotSupport?: string;
}

export interface Fixture {
  readonly absolute: string;
  readonly config: ASTFixtureConfig;
  readonly ext: string;
  readonly isError: boolean;
  readonly isJSX: boolean;
  readonly name: string;
  readonly relative: string;
  readonly segments: string[];
  readonly snapshotFiles: {
    readonly error: {
      readonly alignment: SnapshotPathFn;
      readonly babel: SnapshotPathFn;
      readonly tsestree: SnapshotPathFn;
    };
    readonly success: {
      readonly alignment: SuccessSnapshotPaths;
      readonly babel: SuccessSnapshotPaths;
      readonly tsestree: SuccessSnapshotPaths;
    };
  };
  readonly snapshotPath: string;
}

export enum ParserResponseType {
  Error = 'Error',
  NoError = 'NoError',
}

export interface ParserResponseSuccess {
  readonly ast: unknown;
  // this exists for the error alignment test snapshots
  readonly error: 'NO ERROR';
  readonly tokens: unknown;
  readonly type: ParserResponseType.NoError;
}
export interface ParserResponseError {
  readonly error: unknown;
  readonly type: ParserResponseType.Error;
}
export type ParserResponse = ParserResponseError | ParserResponseSuccess;

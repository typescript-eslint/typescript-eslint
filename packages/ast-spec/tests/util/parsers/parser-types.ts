export type SnapshotPathFn = (i: number) => string;

export interface SuccessSnapshotPaths {
  readonly ast: SnapshotPathFn;
  readonly tokens: SnapshotPathFn;
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

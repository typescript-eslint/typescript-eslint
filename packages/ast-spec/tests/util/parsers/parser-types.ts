type SnapshotPathFn = (i: number) => string;

interface SuccessSnapshotPaths {
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
    readonly success: {
      readonly tsestree: SuccessSnapshotPaths;
      readonly babel: SuccessSnapshotPaths;
      readonly alignment: SuccessSnapshotPaths;
    };
    readonly error: {
      readonly tsestree: SnapshotPathFn;
      readonly babel: SnapshotPathFn;
      readonly alignment: SnapshotPathFn;
    };
  };
  readonly snapshotPath: string;
}

export enum ParserResponseType {
  Error = 'Error',
  NoError = 'NoError',
}

export interface ParserResponseSuccess {
  readonly type: ParserResponseType.NoError;
  readonly ast: unknown;
  // this exists for the error alignment test snapshots
  readonly error: 'NO ERROR';
  readonly tokens: unknown;
}
export interface ParserResponseError {
  readonly type: ParserResponseType.Error;
  readonly error: unknown;
}
export type ParserResponse = ParserResponseSuccess | ParserResponseError;

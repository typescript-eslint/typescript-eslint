interface SuccessSnapshotPaths {
  readonly ast: string;
  readonly tokens: string;
}

export interface Fixture {
  readonly absolute: string;
  readonly name: string;
  readonly ext: string;
  readonly isError: boolean;
  readonly isJSX: boolean;
  readonly relative: string;
  readonly segments: string[];
  readonly snapshotPath: string;
  readonly snapshotFiles: {
    readonly success: {
      readonly tsestree: SuccessSnapshotPaths;
      readonly babel: SuccessSnapshotPaths;
      readonly alignment: SuccessSnapshotPaths;
    };
    readonly error: {
      readonly tsestree: string;
      readonly babel: string;
      readonly alignment: string;
    };
  };
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

type SnapshotPathFn = (i: number) => string;

interface SuccessSnapshotPaths {
  readonly ast: SnapshotPathFn;
  readonly tokens: SnapshotPathFn;
}

export interface Fixture {
  readonly absolute: string;
  readonly babelParsed: ParserResponse;
  readonly config: ASTFixtureConfig;
  readonly contents: string;
  readonly errorLabel: ErrorLabel;
  readonly ext: string;
  readonly isBabelError: boolean;
  readonly isError: boolean;
  readonly isJSX: boolean;
  readonly isTSESTreeError: boolean;
  readonly name: string;
  readonly relative: string;
  readonly segments: string[];
  readonly TSESTreeParsed: ParserResponse;
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
  readonly vitestSnapshotHeader: string;
}

export enum ErrorLabel {
  Babel = "Babel errored but TSESTree didn't",
  Both = 'Both errored',
  None = 'No errors',
  TSESTree = "TSESTree errored but Babel didn't",
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

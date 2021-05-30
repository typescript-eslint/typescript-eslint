interface SnapshotPaths {
  readonly ast: string;
  readonly tokens: string;
  readonly error: string;
}

export interface Fixture {
  readonly absolute: string;
  readonly name: string;
  readonly ext: string;
  readonly isJSX: boolean;
  readonly relative: string;
  readonly segments: string[];
  readonly snapshotPath: string;
  readonly snapshotFiles: {
    readonly tsestree: SnapshotPaths;
    readonly babel: SnapshotPaths;
    readonly alignment: SnapshotPaths;
  };
}

export interface ParserResponse {
  readonly ast: unknown | 'ERROR';
  readonly tokens: unknown | 'ERROR';
  readonly error: unknown | 'NO ERROR';
}

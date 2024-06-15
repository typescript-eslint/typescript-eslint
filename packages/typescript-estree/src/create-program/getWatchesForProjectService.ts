import path from 'node:path';

import { debug } from 'debug';
import * as ts from 'typescript';

const log = debug(
  'typescript-eslint:typescript-estree:getWatchesForProjectService',
);

export class TrieNode<T> {
  readonly children: Map<string, TrieNode<T>>;
  value?: T;
  constructor(
    public readonly path: string,
    public readonly parent?: TrieNode<T>,
  ) {
    this.children = new Map();
  }
}

export class Trie<T> {
  root: TrieNode<T>;
  count: number;

  constructor() {
    this.root = new TrieNode('');
    this.count = 0;
  }

  insert<U>(filePath: string, apply: (node: TrieNode<T>) => U): U {
    // implicitly blocks a watch on the root of the file system by skipping first part
    const parts = path.resolve(filePath).split(path.sep).slice(1);
    const { currentNode } = parts.reduce(
      ({ currentNode, rootPath }, part) => {
        const currentPath = path.join(rootPath, part);
        let childNode = currentNode.children.get(part);
        if (!childNode) {
          childNode = new TrieNode(currentPath, currentNode);
          currentNode.children.set(part, childNode);
          this.count++;
        }
        return {
          currentNode: childNode,
          rootPath: currentPath,
        };
      },
      {
        currentNode: this.root,
        rootPath: this.root.path,
      },
    );
    const value = apply(currentNode);
    log('Inserted (%d): %s', this.count, filePath);
    return value;
  }

  get(filePath: string): TrieNode<T> | undefined {
    const parts = path.resolve(filePath).split(path.sep).slice(1);
    const { lastNodeWithValue } = parts.reduce(
      ({ currentNode, lastNodeWithValue }, part) => {
        const childNode = currentNode.children.get(part);
        if (!childNode) {
          return { currentNode: currentNode, lastNodeWithValue };
        }
        return {
          currentNode: childNode,
          lastNodeWithValue:
            childNode.value != null ? childNode : lastNodeWithValue,
        };
      },
      {
        currentNode: this.root,
        lastNodeWithValue: null as TrieNode<T> | null,
      },
    );
    log(
      'Retrieved (%d): %s: %s',
      this.count,
      filePath,
      lastNodeWithValue?.path,
    );
    return lastNodeWithValue;
  }
}

export enum WatcherKind {
  FILE,
  DIRECTORY,
}

// TODO: do not know if the cb's need all this info, just anticipating for recursive and file filters
export type WatcherCallback<K extends WatcherKind> = {
  options?: ts.WatchOptions;
} & (
  | {
      kind: K;
      callback: (node: TrieNode<Set<Watcher>>, cb: WatcherCallback<K>) => void;
    }
  | {
      kind: K;
      recursive?: boolean;
      callback: (node: TrieNode<Set<Watcher>>, cb: WatcherCallback<K>) => void;
    }
);

export class Watcher implements ts.FileWatcher {
  constructor(
    private readonly root: Trie<Set<Watcher>>,
    private readonly node: TrieNode<Set<Watcher>>,
    public readonly callback: () => void,
  ) {}
  close(): void {
    if (this.node.value !== undefined) {
      this.node.value.delete(this);
      this.root.count--;
      log('Closed (%d): %s', this.root.count, this.node.path);
    }
  }
}

// TODO: : ensure tsconfigs are handled correctly

const saveWatchCallback = <K extends WatcherKind>(
  path: string,
  cb: WatcherCallback<K>,
): ts.FileWatcher => {
  const watcher = watches.insert(path, node => {
    if (node.value === undefined) {
      node.value = new Set<Watcher>();
    }
    const watcher = new Watcher(watches, node, () => cb.callback(node, cb));
    node.value.add(watcher);
    return watcher;
  });
  return watcher;
};

// stores host request to watch a file
export const saveFileWatchCallback = (
  path: string,
  callback: ts.FileWatcherCallback,
  _pollingInterval?: number,
  options?: ts.WatchOptions,
): ts.FileWatcher =>
  saveWatchCallback(path, {
    kind: WatcherKind.FILE,
    options,
    callback: () => {
      // TODO: make sure filters are respected
      // edits are sent through script info, this is only triggered for new files
      callback(path, ts.FileWatcherEventKind.Created, new Date());
    },
  });

// stores host request to watch a directory
export const saveDirectoryWatchCallback = (
  path: string,
  callback: ts.DirectoryWatcherCallback,
  recursive?: boolean,
  options?: ts.WatchOptions,
): ts.FileWatcher =>
  saveWatchCallback(path, {
    kind: WatcherKind.DIRECTORY,
    options,
    recursive,
    callback: () => {
      // TODO: check recursive and filters
      callback(path);
    },
  });

export const getWatchesForProjectService = (
  service: ts.server.ProjectService & {
    __watches?: Trie<Set<Watcher>>;
  },
): Trie<Set<Watcher>> => {
  if (!service.__watches) {
    service.__watches = new Trie<Set<Watcher>>();
  }
  return service.__watches;
};

//  interface WatchOptions {
//      watchFile?: WatchFileKind;
//      watchDirectory?: WatchDirectoryKind;
//      fallbackPolling?: PollingWatchKind;
//      synchronousWatchDirectory?: boolean;
//      excludeDirectories?: string[];
//      excludeFiles?: string[];
//      [option: string]: CompilerOptionsValue | undefined;
//  }

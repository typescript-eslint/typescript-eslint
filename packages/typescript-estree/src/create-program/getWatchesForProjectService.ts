import path from 'node:path';
// TODO: : ensure tsconfigs are handled
// TODO: make sure filters are respected
// edits are sent through script info, this is only triggered for new files

import { debug } from 'debug';
import * as ts from 'typescript';
import { minimatch } from 'minimatch';

const log = debug(
  'typescript-eslint:typescript-estree:getWatchesForProjectService',
);

export class TrieNode<T extends object> {
  readonly children: Map<string, TrieNode<T>>;
  readonly values: Set<T>;
  constructor(
    public readonly path: string,
    public readonly parent?: TrieNode<T>,
  ) {
    this.children = new Map();
    this.values = new Set();
  }

  insert(value: T): void {
    this.values.add(value);
  }

  delete(value: T): void {
    this.values.delete(value);
  }
}

export class Trie<T extends object> {
  root: TrieNode<T>;
  valueNodes: WeakMap<T, TrieNode<T>>;
  values: WeakSet<T>;

  constructor() {
    this.root = new TrieNode('');
    this.valueNodes = new WeakMap<T, TrieNode<T>>();
    this.values = new WeakSet();
  }

  insert(filePath: string, value: T): T {
    const parts = path.resolve(filePath).split(path.sep);
    const { currentNode } = parts.reduce(
      ({ currentNode, rootPath }, part) => {
        const currentPath = path.join(rootPath, part);
        let childNode = currentNode.children.get(part);
        if (!childNode) {
          childNode = new TrieNode(currentPath, currentNode);
          currentNode.children.set(part, childNode);
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
    currentNode.values.add(value);
    this.values.add(value);
    this.valueNodes.set(value, currentNode);

    log('Inserted node: %s', filePath);
    return value;
  }

  get(filePath: string): TrieNode<T> | undefined {
    const parts = path.resolve(filePath).split(path.sep);
    const { lastNodeWithValues } = parts.reduce(
      ({ currentNode, lastNodeWithValues }, part) => {
        const childNode = currentNode.children.get(part);
        if (!childNode) {
          return { currentNode: currentNode, lastNodeWithValues };
        }
        return {
          currentNode: childNode,
          lastNodeWithValues:
            childNode.values.size !== 0 ? childNode : lastNodeWithValues,
        };
      },
      {
        currentNode: this.root,
        lastNodeWithValues: undefined as TrieNode<T> | undefined,
      },
    );
    log('Retrieved node: %s: %s', filePath, lastNodeWithValues?.path);
    return lastNodeWithValues;
  }

  clean = (node?: TrieNode<T>) => {
    if (node === undefined) {
      return; // TODO:
    }
    if (node.values.size === 0 && node.children.size === 0 && node.parent) {
      node.parent.children.delete(node.path);
      this.clean(node.parent);
    }
  };

  delete(value: T): void {
    const node = this.valueNodes.get(value);
    if (node === undefined) {
      return;
    }
    node.delete(value);
    log('Deleted node: %s', node.path);
    this.clean(node);
  }
}

export enum WatcherKind {
  File,
  Directory,
}

export type WatcherCallback<K extends WatcherKind> = {
  kind: K;
  path: string;
  options?: ts.WatchOptions;
} & (
  | {
      kind: WatcherKind.File;
      callback: ts.FileWatcherCallback;
    }
  | {
      kind: WatcherKind.Directory;
      recursive?: boolean;
      callback: ts.DirectoryWatcherCallback;
    }
);

export class Watcher<K extends WatcherKind> implements ts.FileWatcher {
  constructor(
    private readonly serviceWatches: Trie<Watcher<WatcherKind>>,
    public readonly watcherCallback: WatcherCallback<K>,
  ) {}

  close(): void {
    this.serviceWatches.delete(this);
  }
}

const serviceWatches = new Trie<Watcher<WatcherKind>>();

export const saveFileWatchCallback = (
  path: string,
  callback: ts.FileWatcherCallback,
  _pollingInterval?: number,
  options?: ts.WatchOptions,
): ts.FileWatcher =>
  serviceWatches.insert(
    path,
    new Watcher(serviceWatches, {
      kind: WatcherKind.File,
      path,
      options,
      callback,
    }),
  );

export const saveDirectoryWatchCallback = (
  path: string,
  callback: ts.DirectoryWatcherCallback,
  recursive?: boolean,
  options?: ts.WatchOptions,
): ts.FileWatcher =>
  serviceWatches.insert(
    path,
    new Watcher(serviceWatches, {
      kind: WatcherKind.Directory,
      path,
      options,
      recursive,
      callback,
    }),
  );

export const getWatchesForProjectService = (path: string) =>
  serviceWatches.get(path);

//  interface WatchOptions {
//      excludeDirectories?: string[];
//      excludeFiles?: string[];
//  }

import { createSystem } from '@typescript/vfs';
import type * as Monaco from 'monaco-editor';
import type * as ts from 'typescript';

import { debounce } from '../lib/debounce';
import type { PlaygroundSystem } from '../linter/types';
import type { ConfigModel } from '../types';

export async function addLibFiles(
  system: PlaygroundSystem,
  monaco: typeof Monaco,
): Promise<void> {
  const worker = await monaco.languages.typescript.getTypeScriptWorker();
  const workerInstance = await worker();
  if (workerInstance.getLibFiles) {
    const libs = await workerInstance.getLibFiles();
    if (libs) {
      for (const [name, content] of Object.entries(libs)) {
        system.writeFile('/' + name, content);
      }
    }
  }
}

export function createFileSystem(config: ConfigModel): PlaygroundSystem {
  const files = new Map<string, string>();
  files.set(`/.eslintrc`, config.eslintrc);
  files.set(`/tsconfig.json`, config.tsconfig);
  files.set(`/input${config.fileType}`, config.code);

  const fileWatcherCallbacks = new Map<RegExp, Set<ts.FileWatcherCallback>>();

  const system = createSystem(files) as PlaygroundSystem;

  system.watchFile = (
    path,
    callback,
    pollingInterval = 500,
  ): ts.FileWatcher => {
    const cb = pollingInterval ? debounce(callback, pollingInterval) : callback;

    const escapedPath = path.replace(/\./g, '\\.').replace(/\*/g, '[^/]+');
    const expPath = new RegExp(`^${escapedPath}$`, '');

    let handle = fileWatcherCallbacks.get(expPath);
    if (!handle) {
      handle = new Set();
      fileWatcherCallbacks.set(expPath, handle);
    }
    handle.add(cb);

    return {
      close: (): void => {
        const handle = fileWatcherCallbacks.get(expPath);
        if (handle) {
          handle.delete(cb);
        }
      },
    };
  };

  const triggerCallbacks = (
    path: string,
    type: ts.FileWatcherEventKind,
  ): void => {
    fileWatcherCallbacks.forEach((callbacks, key) => {
      if (key.test(path)) {
        callbacks.forEach(cb => cb(path, type));
      }
    });
  };

  system.deleteFile = (fileName): void => {
    files.delete(fileName);
    triggerCallbacks(fileName, 1);
  };

  system.writeFile = (fileName, contents): void => {
    if (!contents) {
      contents = '';
    }
    const file = files.get(fileName);
    if (file === contents) {
      // do not trigger callbacks if the file has not changed
      return;
    }
    files.set(fileName, contents);
    triggerCallbacks(fileName, file ? 2 : 0);
  };

  system.removeFile = (fileName): void => {
    files.delete(fileName);
  };

  return system;
}

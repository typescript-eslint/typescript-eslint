import type { System } from 'typescript';

import {
  addAllFilesFromFolder,
  createDefaultMapFromNodeModules,
  createSystem,
} from '@typescript/vfs';
import path from 'node:path';

const fsMap: Map<string, string> = createDefaultMapFromNodeModules({});
addAllFilesFromFolder(
  fsMap,
  path.join(__dirname, '../../../node_modules/@types'),
);

function parseVirtualFiles(code: string): [string, string][] {
  const result: [string, string][] = [];

  const lines = code.split(/\r?\n/);
  const cmd = '// @filename: ';

  let currentFileLines: string[] = [];
  const files: [string, string[]][] = [];
  for (const line of lines) {
    if (line.startsWith(cmd)) {
      currentFileLines = [];
      files.push([line.slice(cmd.length).trim(), currentFileLines]);
    } else {
      currentFileLines.push(line);
    }
  }
  for (const [fileName, fileLines] of files) {
    result.push([fileName, fileLines.join('\n')]);
  }
  return result;
}

export function fixture(code: TemplateStringsArray, ...keys: string[]): System {
  const files = parseVirtualFiles(String.raw(code, ...keys));
  return {
    ...createSystem(new Map([...fsMap, ...files])),
    getExecutingFilePath: () => {
      return '/';
    },
  };
}

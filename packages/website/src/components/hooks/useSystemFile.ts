import { useCallback, useEffect, useState } from 'react';

import { parseJSONObject, toJson } from '../lib/json';
import type { PlaygroundSystem } from '../linter/types';

function readJsonFile<T>(system: PlaygroundSystem, fileName: string): T {
  const tsconfig = system.readFile(fileName);
  return parseJSONObject(tsconfig) as T;
}

export function useSystemFile<T extends Record<string, unknown>>(
  system: PlaygroundSystem,
  fileName: string,
): [T, (value: T) => void] {
  const [json, setJson] = useState<T>(() => readJsonFile(system, fileName));

  useEffect(() => {
    const watcher = system.watchFile(fileName, fileName => {
      try {
        setJson(readJsonFile(system, fileName));
      } catch (e) {
        // suppress errors
      }
    });
    return () => watcher.close();
  }, [system, fileName]);

  const updateJson = useCallback(
    (value: T) => {
      setJson(value);
      system.writeFile(fileName, toJson(value));
    },
    [system, fileName],
  );

  return [json, updateJson];
}

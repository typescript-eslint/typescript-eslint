import { useHistory } from '@docusaurus/router';
import * as lz from 'lz-string';
import { useCallback, useState } from 'react';

import { hasOwnProperty } from '../lib/has-own-property';
import { toJsonConfig } from '../lib/json';
import { shallowEqual } from '../lib/shallowEqual';
import type { ConfigModel } from '../types';

function writeQueryParam(value: string | null): string {
  return (value && lz.compressToEncodedURIComponent(value)) ?? '';
}

function readQueryParam(value: string | null, fallback: string): string {
  return (value && lz.decompressFromEncodedURIComponent(value)) ?? fallback;
}

function readShowAST(value: string | null): 'ts' | 'scope' | 'es' | false {
  switch (value) {
    case 'es':
    case 'ts':
    case 'scope':
      return value;
  }
  return value ? 'es' : false;
}

function readLegacyParam(
  data: string | null,
  prop: string,
): string | undefined {
  try {
    return toJsonConfig(JSON.parse(readQueryParam(data, '{}')), prop);
  } catch (e) {
    console.error(e, data, prop);
  }
  return undefined;
}

const parseStateFromUrl = (hash: string): Partial<ConfigModel> | undefined => {
  if (!hash) {
    return;
  }

  try {
    const searchParams = new URLSearchParams(hash);

    let eslintrc: string | undefined;
    if (searchParams.has('eslintrc')) {
      eslintrc = readQueryParam(searchParams.get('eslintrc'), '');
    } else if (searchParams.has('rules')) {
      eslintrc = readLegacyParam(searchParams.get('rules'), 'rules');
    }

    let tsconfig: string | undefined;
    if (searchParams.has('tsconfig')) {
      tsconfig = readQueryParam(searchParams.get('tsconfig'), '');
    } else if (searchParams.has('tsConfig')) {
      tsconfig = readLegacyParam(
        searchParams.get('tsConfig'),
        'compilerOptions',
      );
    }

    return {
      ts: searchParams.get('ts') ?? undefined,
      jsx: searchParams.has('jsx'),
      showAST: readShowAST(searchParams.get('showAST')),
      sourceType:
        searchParams.get('sourceType') === 'script' ? 'script' : 'module',
      code: searchParams.has('code')
        ? readQueryParam(searchParams.get('code'), '')
        : '',
      eslintrc: eslintrc ?? '',
      tsconfig: tsconfig ?? '',
    };
  } catch (e) {
    console.warn(e);
  }
  return undefined;
};

const writeStateToUrl = (newState: ConfigModel): string | undefined => {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('ts', newState.ts.trim());
    searchParams.set('jsx', String(newState.jsx));
    if (newState.sourceType === 'script') {
      searchParams.set('sourceType', newState.sourceType);
    }
    if (newState.showAST) {
      searchParams.set('showAST', newState.showAST);
    }
    searchParams.set('code', writeQueryParam(newState.code));
    searchParams.set('eslintrc', writeQueryParam(newState.eslintrc));
    searchParams.set('tsconfig', writeQueryParam(newState.tsconfig));
    return searchParams.toString();
  } catch (e) {
    console.warn(e);
  }
  return undefined;
};

const retrieveStateFromLocalStorage = (): Partial<ConfigModel> | undefined => {
  try {
    const configString = window.localStorage.getItem('config');
    if (!configString) {
      return undefined;
    }

    const config: unknown = JSON.parse(configString);
    if (typeof config !== 'object' || !config) {
      return undefined;
    }

    const state: Partial<ConfigModel> = {};
    if (hasOwnProperty('ts', config)) {
      const ts = config.ts;
      if (typeof ts === 'string') {
        state.ts = ts;
      }
    }
    if (hasOwnProperty('jsx', config)) {
      const jsx = config.jsx;
      if (typeof jsx === 'boolean') {
        state.jsx = jsx;
      }
    }
    if (hasOwnProperty('showAST', config)) {
      const showAST = config.showAST;
      if (typeof showAST === 'string') {
        state.showAST = readShowAST(showAST);
      }
    }

    return state;
  } catch (e) {
    console.warn(e);
  }
  return undefined;
};

const writeStateToLocalStorage = (newState: ConfigModel): void => {
  const config: Partial<ConfigModel> = {
    ts: newState.ts,
    jsx: newState.jsx,
    showAST: newState.showAST,
  };
  window.localStorage.setItem('config', JSON.stringify(config));
};

function useHashState(
  initialState: ConfigModel,
): [ConfigModel, (cfg: Partial<ConfigModel>) => void] {
  const history = useHistory();
  const [state, setState] = useState<ConfigModel>(() => ({
    ...initialState,
    ...retrieveStateFromLocalStorage(),
    ...parseStateFromUrl(window.location.hash.slice(1)),
  }));

  const updateState = useCallback(
    (cfg: Partial<ConfigModel>) => {
      console.info('[State] updating config diff', cfg);

      setState(oldState => {
        const newState = { ...oldState, ...cfg };

        if (shallowEqual(oldState, newState)) {
          return oldState;
        }

        writeStateToLocalStorage(newState);

        history.replace({
          ...history.location,
          hash: writeStateToUrl(newState),
        });

        if (cfg.ts) {
          window.location.reload();
        }
        return newState;
      });
    },
    [setState, history],
  );

  return [state, updateState];
}

export default useHashState;

import { toJsonConfig } from '@site/src/components/config/utils';
import * as lz from 'lzstring.ts';
import { useCallback, useEffect, useState } from 'react';

import { hasOwnProperty } from '../lib/has-own-property';
import { shallowEqual } from '../lib/shallowEqual';
import type { ConfigModel } from '../types';

function writeQueryParam(value: string): string {
  return lz.LZString.compressToEncodedURIComponent(value);
}

function readQueryParam(value: string | null, fallback: string): string {
  return value
    ? lz.LZString.decompressFromEncodedURIComponent(value) ?? fallback
    : fallback;
}

function readShowAST(value: string | null): 'ts' | 'scope' | 'es' | boolean {
  switch (value) {
    case 'es':
      return 'es';
    case 'ts':
      return 'ts';
    case 'scope':
      return 'scope';
  }
  return Boolean(value);
}

function readLegacyParam(
  data: string | null,
  prop: string,
): string | undefined {
  try {
    return toJsonConfig(JSON.parse(readQueryParam(data, '{}')), prop);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e, data, prop);
  }
  return undefined;
}

const parseStateFromUrl = (hash: string): ConfigModel | undefined => {
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
      // @ts-expect-error: process.env.TS_VERSION
      ts: (searchParams.get('ts') ?? process.env.TS_VERSION).trim(),
      jsx: searchParams.has('jsx'),
      showAST:
        searchParams.has('showAST') && readShowAST(searchParams.get('showAST')),
      sourceType:
        searchParams.has('sourceType') &&
        searchParams.get('sourceType') === 'script'
          ? 'script'
          : 'module',
      code: searchParams.has('code')
        ? readQueryParam(searchParams.get('code'), '')
        : '',
      eslintrc: eslintrc ?? '',
      tsconfig: tsconfig ?? '',
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
  }
  return undefined;
};

const writeStateToUrl = (newState: ConfigModel): string => {
  try {
    return Object.entries({
      ts: newState.ts.trim(),
      jsx: newState.jsx,
      sourceType: newState.sourceType,
      showAST: newState.showAST,
      code: newState.code ? writeQueryParam(newState.code) : undefined,
      eslintrc: newState.eslintrc
        ? writeQueryParam(newState.eslintrc)
        : undefined,
      tsconfig: newState.tsconfig
        ? writeQueryParam(newState.tsconfig)
        : undefined,
    })
      .filter(item => item[1])
      .map(item => `${encodeURIComponent(item[0])}=${item[1]}`)
      .join('&');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
  }
  return '';
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
      if (typeof showAST === 'boolean') {
        state.showAST = showAST;
      } else if (typeof showAST === 'string') {
        state.showAST = readShowAST(showAST);
      }
    }

    return state;
  } catch (e) {
    // eslint-disable-next-line no-console
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
  const [hash, setHash] = useState<string>(window.location.hash.slice(1));
  const [state, setState] = useState<ConfigModel>(() => ({
    ...initialState,
    ...retrieveStateFromLocalStorage(),
    ...parseStateFromUrl(window.location.hash.slice(1)),
  }));
  const [tmpState, setTmpState] = useState<Partial<ConfigModel>>(() => ({
    ...initialState,
    ...retrieveStateFromLocalStorage(),
    ...parseStateFromUrl(window.location.hash.slice(1)),
  }));

  useEffect(() => {
    const newHash = window.location.hash.slice(1);
    if (newHash !== hash) {
      const newState = parseStateFromUrl(newHash);
      if (newState) {
        setState(newState);
        setTmpState(newState);
      }
    }
  }, [hash]);

  useEffect(() => {
    const newState = { ...state, ...tmpState };
    if (!shallowEqual(newState, state)) {
      writeStateToLocalStorage(newState);
      const newHash = writeStateToUrl(newState);
      setState(newState);
      setHash(newHash);

      if (window.location.hash.slice(1) !== newHash) {
        window.history.pushState(
          undefined,
          document.title,
          `${window.location.pathname}#${newHash}`,
        );
      }
    }
  }, [tmpState, state]);

  const onHashChange = (): void => {
    const newHash = window.location.hash;
    // eslint-disable-next-line no-console
    console.info('[State] hash change detected', newHash);
    setHash(newHash);
  };

  useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    return (): void => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const _setState = useCallback((cfg: Partial<ConfigModel>) => {
    // eslint-disable-next-line no-console
    console.info('[State] updating config diff', cfg);
    setTmpState(cfg);
  }, []);

  return [state, _setState];
}

export default useHashState;

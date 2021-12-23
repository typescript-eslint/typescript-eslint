import { useCallback, useEffect, useState } from 'react';

import type { CompilerFlags, ConfigModel, RulesRecord } from '../types';

import * as lz from 'lzstring.ts';
import { shallowEqual } from '../lib/shallowEqual';

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

const parseStateFromUrl = (hash: string): ConfigModel | undefined => {
  if (!hash) {
    return;
  }

  try {
    const searchParams = new URLSearchParams(hash);
    return {
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
      rules: searchParams.has('rules')
        ? (JSON.parse(
            readQueryParam(searchParams.get('rules'), '{}'),
          ) as RulesRecord)
        : undefined,
      tsConfig: searchParams.has('tsConfig')
        ? (JSON.parse(
            readQueryParam(searchParams.get('tsConfig'), '{}'),
          ) as CompilerFlags)
        : undefined,
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
      rules: newState.rules
        ? writeQueryParam(JSON.stringify(newState.rules))
        : undefined,
      tsConfig: newState.tsConfig
        ? writeQueryParam(JSON.stringify(newState.tsConfig))
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

function useHashState(
  initialState: ConfigModel,
): [ConfigModel, (cfg: Partial<ConfigModel>) => void] {
  const [hash, setHash] = useState<string>(window.location.hash.slice(1));
  const [state, setState] = useState<ConfigModel>(() => ({
    ...initialState,
    ...parseStateFromUrl(window.location.hash.slice(1)),
  }));
  const [tmpState, setTmpState] = useState<Partial<ConfigModel>>(() => ({
    ...initialState,
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
    if (
      !shallowEqual(newState, state) ||
      !shallowEqual(newState.rules, state.rules) ||
      !shallowEqual(newState.tsConfig, state.tsConfig)
    ) {
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

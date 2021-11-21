import { useCallback, useEffect, useState } from 'react';

import type { CompilerFlags, ConfigModel, RulesRecord } from '../types';

declare global {
  interface Window {
    LZString: {
      compressToBase64: (input: string) => string;
      decompressFromBase64: (input: string) => string;
      compressToEncodedURIComponent: (input: string) => string;
      decompressFromEncodedURIComponent: (input: string) => string;
    };
  }
}

function writeQueryParam(value: string): string {
  return window.LZString.compressToEncodedURIComponent(value);
}

function readQueryParam(value: string): string {
  return window.LZString.decompressFromEncodedURIComponent(value);
}

const parseStateFromUrl = (hash: string): ConfigModel | undefined => {
  if (!hash) {
    return;
  }

  try {
    const searchParams = new URLSearchParams(hash);
    return {
      ts: searchParams.get('ts') ?? process.env.TS_VERSION,
      jsx: searchParams.has('jsx'),
      showAST: searchParams.has('showAST'),
      sourceType:
        searchParams.has('sourceType') &&
        searchParams.get('sourceType') === 'script'
          ? 'script'
          : 'module',
      code: searchParams.has('code')
        ? readQueryParam(searchParams.get('code')!)
        : '',
      rules: searchParams.has('rules')
        ? (JSON.parse(
            readQueryParam(searchParams.get('rules')!),
          ) as RulesRecord)
        : undefined,
      tsConfig: searchParams.has('tsConfig')
        ? (JSON.parse(
            readQueryParam(searchParams.get('tsConfig')!),
          ) as CompilerFlags)
        : undefined,
    };
  } catch (e) {
    console.warn(e);
  }
  return undefined;
};

const writeStateToUrl = (newState: ConfigModel): string | undefined => {
  try {
    return Object.entries({
      ts: newState.ts,
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
    console.warn(e);
  }
  return undefined;
};

function shallowEqual(
  object1: Record<string, unknown> | ConfigModel | undefined,
  object2: Record<string, unknown> | ConfigModel | undefined,
): boolean {
  if (object1 === object2) {
    return true;
  }
  const keys1 = Object.keys(object1 ?? {});
  const keys2 = Object.keys(object2 ?? {});
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (object1![key] !== object2![key]) {
      return false;
    }
  }
  return true;
}

function useHashState(
  initialState: ConfigModel,
): [ConfigModel, (cfg?: Partial<ConfigModel>) => void] {
  const [hash, setHash] = useState<string>();
  const [state, setState] = useState<ConfigModel>(initialState);
  const [tmpState, setTmpState] = useState<Partial<ConfigModel>>(initialState);

  useEffect(() => {
    if (window.LZString) {
      const newHash = window.location.hash.slice(1);
      if (newHash !== hash) {
        const newState = parseStateFromUrl(newHash);
        if (newState) {
          setState(newState);
          setTmpState(newState);
        }
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

      if ('ts' in tmpState && tmpState.ts !== state.ts) {
        window.location.replace(`${window.location.pathname}#${newHash}`);
        window.location.reload();
      } else {
        window.history.pushState(
          undefined,
          document.title,
          `${window.location.pathname}#${newHash}`,
        );
      }
    }
  }, [tmpState, state]);

  const onHashChange = (): void => {
    console.info('[State] hash change detected', window.location.hash);
    setHash(window.location.hash);
  };

  useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    return (): void => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const _setState = useCallback((cfg?: Partial<ConfigModel>) => {
    console.info('[State] updating config diff', cfg);
    if (cfg) {
      setTmpState(cfg);
    } else {
      const newHash = window.location.hash.slice(1);
      const newState = parseStateFromUrl(newHash);
      if (newState) {
        setState(newState);
        setTmpState(newState);
      }
    }
  }, []);

  return [state, _setState];
}

export default useHashState;

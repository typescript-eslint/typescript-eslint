import { useEffect, useReducer } from 'react';
import { debounce } from '../lib/debounce';

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

const parseStateFromUrl = (): ConfigModel | undefined => {
  const hash = window.location.hash.slice(1);
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

const writeStateToUrl = debounce(
  (newState: ConfigModel, refresh = false): void => {
    try {
      const json: string = Object.entries({
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

      if (refresh) {
        window.location.replace(`${window.location.pathname}#${json}`);
        window.location.reload();
      } else {
        window.history.pushState(
          undefined,
          document.title,
          `${window.location.pathname}#${json}`,
        );
      }
    } catch (e) {
      console.warn(e);
    }
  },
  100,
);

type HashAction<T extends ConfigModel> =
  | { key: keyof T; value: T[keyof T] }
  | T;

function hashReducer(
  prevState: ConfigModel,
  action: HashAction<ConfigModel>,
): ConfigModel {
  if ('key' in action && 'value' in action) {
    const newState = { ...prevState, [action.key]: action.value };
    writeStateToUrl(newState, action.key === 'ts');
    return newState;
  } else {
    return action;
  }
}

type Args<T = ConfigModel, X extends keyof T = keyof T> =
  | [T?]
  | [key: X, value: T[X]];

interface HashStateFn {
  <X extends ConfigModel>(value?: X): void;
  <X extends keyof ConfigModel>(key: X, value: ConfigModel[X]): void;
}

function useHashState(initialState: ConfigModel): [ConfigModel, HashStateFn] {
  const [state, setState] = useReducer(hashReducer, initialState);

  const onHashChange = (): void => {
    const parsedState = parseStateFromUrl();
    if (parsedState) {
      setState(parsedState);
    }
  };

  useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    return (): void => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  return [
    state,
    (...args: Args): void => {
      if (args.length === 2) {
        setState({ key: args[0], value: args[1] });
      } else if (args[0]) {
        setState(args[0]);
      } else {
        onHashChange();
      }
    },
  ];
}

export default useHashState;

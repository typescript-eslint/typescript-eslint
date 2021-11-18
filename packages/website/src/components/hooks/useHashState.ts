import { useEffect, useReducer } from 'react';
import type {
  ParserOptions,
  RulesRecord,
} from '@typescript-eslint/website-eslint';
import { debounce } from '../lib/debounce';

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

export interface HashStateOptions {
  jsx?: boolean;
  sourceType?: ParserOptions['sourceType'];
  rules?: RulesRecord;
  code: string;
  ts: string;
  showAST?: boolean;
}

function writeQueryParam(value: string): string {
  return window.LZString.compressToEncodedURIComponent(value);
}

function readQueryParam(value: string): string {
  return window.LZString.decompressFromEncodedURIComponent(value);
}

const parseStateFromUrl = (): HashStateOptions | undefined => {
  if (typeof window === 'undefined') {
    return;
  }

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
    };
  } catch (e) {
    console.warn(e);
  }
  return undefined;
};

const writeStateToUrl = debounce(
  (newState: HashStateOptions, refresh = false): void => {
    if (typeof window === 'undefined') {
      return;
    }
    const json: string = Object.entries({
      ts: newState.ts,
      jsx: newState.jsx,
      sourceType: newState.sourceType,
      showAST: newState.showAST,
      rules: newState.rules
        ? writeQueryParam(JSON.stringify(newState.rules))
        : undefined,
      code: newState.code ? writeQueryParam(newState.code) : undefined,
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
  },
  100,
);

type HashAction<T extends HashStateOptions> =
  | { key: keyof T; value: T[keyof T] }
  | T;

function hashReducer(
  prevState: HashStateOptions,
  action: HashAction<HashStateOptions>,
): HashStateOptions {
  if ('key' in action && 'value' in action) {
    const newState = { ...prevState, [action.key]: action.value };
    writeStateToUrl(newState, action.key === 'ts');
    return newState;
  } else {
    return action;
  }
}

function useHashState(
  initialState: HashStateOptions,
): [
  HashStateOptions,
  <X extends keyof HashStateOptions>(
    key: X,
    value: HashStateOptions[X],
  ) => void,
] {
  const [state, setState] = useReducer(hashReducer, initialState, prevState => {
    return {
      ...prevState,
      ...parseStateFromUrl(),
    };
  });

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

  return [state, (key, value): void => setState({ key, value })];
}

export default useHashState;

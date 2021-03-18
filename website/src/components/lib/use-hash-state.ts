import { useRef, useState, useEffect } from 'react';
import { ParserOptions } from '@typescript-eslint/parser';
import { debounce } from './debounce';
import type { Linter } from '@typescript-eslint/experimental-utils/dist/ts-eslint/Linter';

export interface HashStateOptions {
  jsx?: boolean;
  sourceType?: ParserOptions['sourceType'];
  rules?: Linter.RulesRecord;
  code: string;
  ts: string;
  showAST?: boolean;
}

function writeQueryParam(value?: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(value)));
}

function readQueryParam(value: string): unknown {
  return JSON.parse(decodeURIComponent(atob(value)));
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
        ? (readQueryParam(searchParams.get('code')!) as string)
        : '',
      rules: searchParams.has('rules')
        ? (readQueryParam(searchParams.get('rules')!) as Record<
            string,
            Linter.RuleEntry
          >)
        : undefined,
    };
  } catch (e) {
    console.warn(e);
  }
  return undefined;
};

const writeStateToUrl = debounce((newState: HashStateOptions): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const json: string = Object.entries({
    ts: newState.ts,
    jsx: newState.jsx,
    sourceType: newState.sourceType,
    showAST: newState.showAST,
    rules: newState.rules ? writeQueryParam(newState.rules) : undefined,
    code: newState.code ? writeQueryParam(newState.code) : undefined,
  })
    .filter(item => item[1])
    .map(item => `${encodeURIComponent(item[0])}=${item[1]}`)
    .join('&');
  window.history.pushState(
    undefined,
    document.title,
    `${window.location.pathname}#${json}`,
  );
}, 100);

function useHashState(
  initialState: HashStateOptions,
): [HashStateOptions, (key: keyof HashStateOptions, value: unknown) => void] {
  const guard = useRef<boolean>(false);

  if (!guard.current) {
    const parsedState = parseStateFromUrl();
    if (parsedState) {
      initialState = parsedState;
    } else if (initialState) {
      writeStateToUrl(initialState);
    }
    guard.current = true;
  }

  const [state, setState] = useState<HashStateOptions>(initialState);
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
    (key: keyof HashStateOptions, value: unknown): void => {
      setState(prevState => {
        const newState = { ...prevState, [key]: value };
        writeStateToUrl(newState);
        return newState;
      });
    },
  ];
}

export default useHashState;

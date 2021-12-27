interface ThrottledFunction<T extends readonly unknown[]> {
  (...args: T): void;
  cleanup: () => void;
  flush: () => void;
  immediate: (...args: T) => void;
}

function throttle<T extends readonly unknown[]>(
  fn: (...args: T) => void,
  waitMs: number,
): ThrottledFunction<T> {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: T;
  const retVal = ((...args) => {
    lastArgs = args;

    if (timeout) {
      return;
    }

    timeout = setTimeout(() => {
      timeout = null;

      fn(...lastArgs);
    }, waitMs);
  }) as ThrottledFunction<T>;

  retVal.cleanup = (): void => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  retVal.immediate = (...args): void => {
    retVal.cleanup();
    fn(...args);
  };
  retVal.flush = (): void => {
    if (timeout) {
      fn(...lastArgs);
    }
    retVal.cleanup;
  };

  return retVal;
}

export type { ThrottledFunction };
export { throttle };

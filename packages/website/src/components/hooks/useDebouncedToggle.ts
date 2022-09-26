import { useCallback, useRef, useState } from 'react';

export default function useDebouncedToggle<T>(
  value: T,
  timeout = 1000,
): [T, (data: T) => void] {
  const [state, setState] = useState<T>(value);
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const update = useCallback(
    (data: T) => {
      setState(data);
      const timeoutId = timeoutIdRef.current;
      if (timeoutId) {
        timeoutIdRef.current = undefined;
        clearTimeout(timeoutId);
      }
      timeoutIdRef.current = setTimeout(() => {
        setState(value);
      }, timeout);
    },
    [timeoutIdRef],
  );

  return [state, update];
}

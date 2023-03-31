import type React from 'react';
import { useCallback, useRef } from 'react';

function useFocus<T extends HTMLOrSVGElement>(): [
  React.RefObject<T>,
  () => void,
] {
  const htmlElRef = useRef<T>(null);
  const setFocus = useCallback((): void => {
    htmlElRef.current?.focus();
  }, []);
  return [htmlElRef, setFocus];
}

export default useFocus;

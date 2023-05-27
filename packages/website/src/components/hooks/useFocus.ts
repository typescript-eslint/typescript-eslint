import type React from 'react';
import { useRef } from 'react';

function useFocus<T extends HTMLOrSVGElement>(): [
  React.RefObject<T>,
  () => void,
] {
  const htmlElRef = useRef<T>(null);
  const setFocus = (): void => {
    htmlElRef.current?.focus();
  };
  return [htmlElRef, setFocus];
}

export default useFocus;

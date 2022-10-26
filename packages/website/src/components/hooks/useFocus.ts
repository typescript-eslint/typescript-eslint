import type React from 'react';
import { useRef } from 'react';

function useFocus(): [React.RefObject<HTMLOrSVGElement>, () => void] {
  const htmlElRef = useRef<HTMLOrSVGElement>(null);
  const setFocus = (): void => {
    htmlElRef.current?.focus();
  };
  return [htmlElRef, setFocus];
}

export default useFocus;

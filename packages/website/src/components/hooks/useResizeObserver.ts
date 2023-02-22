import { type RefObject, useEffect, useRef } from 'react';

const useResizeObserver = (
  element: RefObject<HTMLElement>,
  callback: () => void,
): void => {
  const observer = useRef<ResizeObserver>();

  useEffect(() => {
    const current = element.current;
    observer.current = new ResizeObserver(callback);

    if (current) {
      observer.current.observe(current);
    }

    return () => {
      if (observer.current && current) {
        observer.current.unobserve(current);
      }
    };
  }, [callback, element]);
};

export { useResizeObserver };

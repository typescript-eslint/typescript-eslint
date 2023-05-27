import { useEffect, useMemo } from 'react';

const useResizeObserver = (
  element: HTMLElement | null,
  callback: () => void,
): void => {
  const resizeObserver = useMemo(() => {
    return new ResizeObserver(() => {
      callback();
    });
  }, [callback]);

  useEffect(() => {
    if (element) {
      resizeObserver.observe(element);
    }
    return (): void => {
      if (element) {
        resizeObserver.unobserve(element);
      }
    };
  }, [element, resizeObserver]);
};

export { useResizeObserver };

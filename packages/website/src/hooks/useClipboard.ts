import { useCallback } from 'react';

import { useDebouncedToggle } from './useDebouncedToggle';

export type useClipboardResult = [copied: boolean, copy: () => void];

export function useClipboard(code: () => string): useClipboardResult {
  const [copied, setCopied] = useDebouncedToggle(false);

  const copy = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    void navigator.clipboard.writeText(code()).then(() => {
      setCopied(true);
    });
  }, [setCopied, code]);

  return [copied, copy];
}

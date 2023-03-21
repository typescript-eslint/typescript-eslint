import { useCallback } from 'react';

import { useDebouncedToggle } from './useDebouncedToggle';

export type useClipboardResult = [copied: boolean, copy: () => void];

export function useClipboard(code: () => string): useClipboardResult {
  const [copied, setCopied] = useDebouncedToggle<boolean>(false);

  const copy = useCallback(() => {
    void navigator.clipboard.writeText(code()).then(() => {
      setCopied(true);
    });
  }, [setCopied, code]);

  return [copied, copy];
}

import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';

export function useBool(
  initialState: boolean | (() => boolean),
): [boolean, () => void, Dispatch<SetStateAction<boolean>>] {
  const [value, setValue] = useState(initialState);

  const toggle = useCallback(
    (): void => setValue(currentValue => !currentValue),
    [],
  );

  return [value, toggle, setValue];
}

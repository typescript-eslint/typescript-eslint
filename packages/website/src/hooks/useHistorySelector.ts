import { useHistory } from '@docusaurus/router';
import type * as H from 'history';
import { useSyncExternalStore } from 'react';

export type HistorySelector<T> = (history: H.History<H.LocationState>) => T;

export function useHistorySelector<T>(
  selector: HistorySelector<T>,
  getServerSnapshot: () => T,
): T {
  const history = useHistory();
  return useSyncExternalStore(
    history.listen,
    () => selector(history),
    getServerSnapshot,
  );
}

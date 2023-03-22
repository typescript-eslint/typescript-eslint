import { useHistory } from '@docusaurus/router';
import { useSyncExternalStore } from 'react';
import type * as H from 'history';

export type HistorySelector<T> = (history: H.History<H.LocationState>) => T;

export function useHistorySelector<T>(
  selector: HistorySelector<T>,
  getServerSnapshot: () => T,
) {
  const history = useHistory();
  return useSyncExternalStore(
    history.listen,
    () => selector(history),
    getServerSnapshot,
  );
}

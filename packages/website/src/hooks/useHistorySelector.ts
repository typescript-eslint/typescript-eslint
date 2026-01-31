import type * as H from 'history';

import { useHistory } from '@docusaurus/router';
import { useSyncExternalStore } from 'react';

export type HistorySelector<T> = (history: H.History) => T;

export function useHistorySelector<T>(
  selector: HistorySelector<T>,
  getServerSnapshot: () => T,
): T {
  // by default H.History<LocationState = unknown>
  const history = useHistory() as unknown as H.History;

  return useSyncExternalStore(
    history.listen,
    () => selector(history),
    getServerSnapshot,
  );
}

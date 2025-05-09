import EditIcon from '@site/src/icons/edit.svg';
import clsx from 'clsx';
import React from 'react';

import styles from './EditorTabs.module.css';

export interface EditorTabsProps<T extends boolean | string> {
  readonly active: T;
  readonly additionalTabsInfo?: Record<string, number>;
  readonly change: (name: T) => void;
  readonly showModal?: (name: T) => void;
  readonly showVisualEditor?: boolean;
  readonly tabs: (T | { label: string; value: T })[];
}

function EditorTabs<T extends boolean | string>({
  active,
  additionalTabsInfo,
  change,
  showModal,
  showVisualEditor,
  tabs,
}: EditorTabsProps<T>): React.JSX.Element {
  const tabsWithLabels = tabs.map(tab =>
    typeof tab !== 'object' ? { label: String(tab), value: tab } : tab,
  );

  return (
    <div className={clsx(styles.tabContainer, 'padding--xs')}>
      <div className="button-group" role="tablist">
        {tabsWithLabels.map(item => (
          <button
            aria-selected={active === item.value}
            className={clsx(styles.tabStyle, 'button')}
            disabled={active === item.value}
            key={item.label}
            onClick={(): void => change(item.value)}
            role="tab"
          >
            {item.label}
            {additionalTabsInfo?.[item.label] ? (
              <div className={styles.tabErrors}>
                {additionalTabsInfo[item.label] > 99
                  ? '99+'
                  : additionalTabsInfo[item.label]}
              </div>
            ) : null}
          </button>
        ))}
      </div>
      {showVisualEditor && (
        <button
          className={clsx(styles.tabStyle, 'button')}
          onClick={(): void => showModal?.(active)}
        >
          Visual Editor
          <EditIcon height={12} width={12} />
        </button>
      )}
    </div>
  );
}

export default EditorTabs;

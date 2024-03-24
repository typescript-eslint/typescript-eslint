import EditIcon from '@site/src/icons/edit.svg';
import clsx from 'clsx';
import React from 'react';

import styles from './EditorTabs.module.css';

export interface EditorTabsProps<T extends boolean | string> {
  readonly tabs: (T | { value: T; label: string })[];
  readonly active: T;
  readonly showVisualEditor?: boolean;
  readonly change: (name: T) => void;
  readonly showModal?: (name: T) => void;
  readonly additionalTabsInfo?: Record<string, number>;
  readonly showError?: Record<string, boolean>;
}

function EditorTabs<T extends boolean | string>({
  tabs,
  active,
  showVisualEditor,
  change,
  showModal,
  additionalTabsInfo,
  showError,
}: EditorTabsProps<T>): React.JSX.Element {
  const tabsWithLabels = tabs.map(tab =>
    typeof tab !== 'object' ? { value: tab, label: String(tab) } : tab,
  );

  return (
    <div className={clsx(styles.tabContainer, 'padding--xs')}>
      <div role="tablist" className="button-group">
        {tabsWithLabels.map(item => (
          <button
            role="tab"
            className={clsx(styles.tabStyle, 'button')}
            key={item.label}
            aria-selected={active === item.value}
            disabled={active === item.value}
            onClick={(): void => change(item.value)}
          >
            {item.label}
            {additionalTabsInfo?.[item.label] ? (
              <div>
                {additionalTabsInfo[item.label] > 99
                  ? '99+'
                  : additionalTabsInfo[item.label]}
              </div>
            ) : null}
            {showError?.[item.label] && (
              <img alt="alert" src="./img/alert.svg" />
            )}
          </button>
        ))}
      </div>
      {showVisualEditor && (
        <button
          className={clsx(styles.tabStyle, 'button')}
          onClick={(): void => showModal?.(active)}
        >
          Visual Editor
          <EditIcon width={12} height={12} />
        </button>
      )}
    </div>
  );
}

export default EditorTabs;

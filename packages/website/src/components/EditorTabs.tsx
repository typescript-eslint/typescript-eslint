import EditIcon from '@site/src/icons/edit.svg';
import React from 'react';

import styles from './Playground.module.css';

export interface FileTabsProps<T> {
  readonly tabs: { value: T; label: string }[];
  readonly activeTab: T;
  readonly change: (tab: T) => void;
  readonly showModal?: () => void;
}

export default function EditorTabs<T>({
  tabs,
  activeTab,
  change,
  showModal,
}: FileTabsProps<T>): JSX.Element {
  return (
    <div className={styles.tabContainer}>
      <div role="tablist">
        {tabs.map(item => {
          return (
            <button
              role="tab"
              className={styles.tabStyle}
              key={item.label}
              aria-selected={activeTab === item.value}
              disabled={activeTab === item.value}
              onClick={(): void => change(item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {activeTab !== 'code' && showModal && (
        <button className={styles.tabStyle} onClick={showModal}>
          Visual Editor
          <EditIcon width={12} height={12} />
        </button>
      )}
    </div>
  );
}

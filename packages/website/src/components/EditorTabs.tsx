import EditIcon from '@site/src/icons/edit.svg';
import React from 'react';

import styles from './Playground.module.css';
import type { TabType } from './types';

export interface FileTabsProps {
  readonly tabs: TabType[];
  readonly activeTab: TabType;
  readonly change: (tab: TabType) => void;
  readonly showModal: () => void;
}

export default function EditorTabs({
  tabs,
  activeTab,
  change,
  showModal,
}: FileTabsProps): JSX.Element {
  return (
    <div className={styles.tabContainer}>
      <div role="tablist">
        {tabs.map(item => {
          return (
            <button
              role="tab"
              className={styles.tabStyle}
              key={item}
              aria-selected={activeTab === item}
              disabled={activeTab === item}
              onClick={(): void => change(item)}
            >
              {item}
            </button>
          );
        })}
      </div>
      {activeTab !== 'code' && (
        <button className={styles.tabStyle} onClick={showModal}>
          Visual Editor
          <EditIcon width={12} height={12} />
        </button>
      )}
    </div>
  );
}

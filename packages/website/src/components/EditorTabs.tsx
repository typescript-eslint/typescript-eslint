import React from 'react';
import type { TabType } from './types';
import styles from './Playground.module.css';

export interface FileTabsProps {
  readonly tabs: TabType[];
  readonly activeTab: TabType;
  readonly change: (tab: TabType) => void;
}

export default function EditorTabs({
  tabs,
  activeTab,
  change,
}: FileTabsProps): JSX.Element {
  return (
    <div className={styles.tabContainer}>
      {tabs.map(item => {
        return (
          <button
            className={styles.tabStyle}
            key={item}
            disabled={activeTab === item}
            onClick={(): void => change(item)}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

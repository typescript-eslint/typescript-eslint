import React from 'react';
import type { TabType } from './types';
import styles from './Playground.module.css';
import EditIcon from '@site/src/icons/edit.svg';

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
      <div>
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
      {activeTab !== 'code' && (
        <button className={styles.tabStyle} onClick={showModal}>
          Visual Editor
          <EditIcon width={12} height={12} />
        </button>
      )}
    </div>
  );
}

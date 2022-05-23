import React from 'react';
import type Monaco from 'monaco-editor';
import type { ErrorItem } from './types';

import styles from './ast/ASTViewer.module.css';

export interface ErrorsViewerProps {
  readonly value?: ErrorItem[];
}

function severityClass(severity: Monaco.MarkerSeverity): string {
  switch (severity) {
    case 8:
      return 'danger';
    case 4:
      return 'caution';
    case 2:
      return 'note';
  }
  return 'info';
}

export default function ErrorsViewer(props: ErrorsViewerProps): JSX.Element {
  if (props.value) {
    const values = Object.entries(
      props.value.reduce<Record<string, ErrorItem[]>>((acc, obj) => {
        if (!acc[obj.group]) {
          acc[obj.group] = [];
        }
        acc[obj.group].push(obj);
        return acc;
      }, {}),
    );
    return (
      <div className={styles.list}>
        {values.map(([group, data]) => {
          return (
            <div className="margin-top--sm" key={group}>
              <h4>{group}</h4>
              {data.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`admonition alert alert--${severityClass(
                      item.severity,
                    )}`}
                  >
                    <div className="admonition-content">
                      <div className="row row--no-gutters">
                        <div className="col col--11">
                          {item.message} {item.location}
                        </div>
                        {item.hasFixers && (
                          <div className="col col--1">Fixable</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  return <div className={styles.list}></div>;
}

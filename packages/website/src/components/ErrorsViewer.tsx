import React, { useEffect, useState } from 'react';
import type Monaco from 'monaco-editor';
import type { ErrorItem } from './types';

import styles from './ErrorsViewer.module.css';

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

function ErrorBlock({ item }: { item: ErrorItem }): JSX.Element {
  return (
    <div className={`admonition alert alert--${severityClass(item.severity)}`}>
      <div className="admonition-content">
        <div className="row row--no-gutters">
          <div className="col col--12">
            {item.message} {item.location}
          </div>
          {item.hasFixers && (
            <div className="col col--12">
              {item.fixers.map((fixer, index) => (
                <div key={index} className={styles.fixer}>
                  <span>&gt; {fixer.message}</span>
                  <button
                    className="button button--primary button--sm"
                    onClick={fixer.fix}
                  >
                    apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ErrorsViewer({
  value,
}: ErrorsViewerProps): JSX.Element {
  const [model, setModel] = useState<[string, ErrorItem[]][]>();

  useEffect(() => {
    if (value) {
      setModel(
        Object.entries(
          value.reduce<Record<string, ErrorItem[]>>((acc, obj) => {
            if (!acc[obj.group]) {
              acc[obj.group] = [];
            }
            acc[obj.group].push(obj);
            return acc;
          }, {}),
        ).sort(([a], [b]) => a.localeCompare(b)),
      );
    } else {
      setModel(undefined);
    }
  }, [value]);

  if (model) {
    return (
      <div className={styles.list}>
        {model.map(([group, data]) => {
          return (
            <div className="margin-top--sm" key={group}>
              <h4>{group}</h4>
              {data.map((item, index) => {
                return <ErrorBlock item={item} key={index} />;
              })}
            </div>
          );
        })}
      </div>
    );
  }

  return <div className={styles.list}></div>;
}

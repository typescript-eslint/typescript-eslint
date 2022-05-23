import React from 'react';
import type Monaco from 'monaco-editor';

import styles from './ast/ASTViewer.module.css';
import clsx from 'clsx';

export interface ASTTsViewerProps {
  readonly value?: Monaco.editor.IMarker[];
}

interface POCModel {
  message: string;
  location: string;
  severity: string;
}

function parseSeverity(severity: Monaco.MarkerSeverity): string {
  switch (severity) {
    case 8:
      return 'alert--danger';
    case 4:
      return 'alert--caution';
    case 2:
      return 'alert--note';
  }
  return 'alert--info';
}

export default function ErrorsViewer(props: ASTTsViewerProps): JSX.Element {
  if (props.value) {
    const values = Object.entries(
      props.value.reduce<Record<string, POCModel[]>>((acc, obj) => {
        const isTypescript = obj.owner === 'typescript';
        const code =
          typeof obj.code === 'string' ? obj.code : obj.code?.value ?? '';

        const key = isTypescript ? obj.owner : code;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push({
          message: (isTypescript ? `TS${code}: ` : '') + obj.message,
          location: `${obj.startLineNumber}:${obj.startColumn} - ${obj.endLineNumber}:${obj.endColumn}`,
          severity: parseSeverity(obj.severity),
        });
        return acc;
      }, {}),
    );
    return (
      <div className={styles.list}>
        {values.map(([group, data]) => {
          return (
            <div className="margin-top--sm" key={group}>
              <h4>{group}</h4>
              <div>
                {data.map((item, index) => {
                  return (
                    <div key={index}>
                      <div
                        className={clsx(
                          'admonition admonition-danger alert',
                          item.severity,
                        )}
                      >
                        <div className="admonition-content">
                          <span>
                            {item.message} {item.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return <div className={styles.list}></div>;
}

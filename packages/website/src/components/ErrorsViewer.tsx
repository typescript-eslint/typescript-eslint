import React, { useEffect, useState } from 'react';
import type Monaco from 'monaco-editor';
import clsx from 'clsx';

import type { ErrorItem, ErrorGroup } from './types';
import IconExternalLink from '@theme/Icon/ExternalLink';
import styles from './ErrorsViewer.module.css';

export interface ErrorsViewerProps {
  readonly value?: ErrorGroup[] | Error;
}

export interface ErrorBlockProps {
  readonly item: ErrorItem;
  readonly setIsLocked: (value: boolean) => void;
  readonly isLocked: boolean;
}

export interface FixButtonProps {
  readonly fix: () => void;
  readonly setIsLocked: (value: boolean) => void;
  readonly disabled: boolean;
}

function severityClass(severity: Monaco.MarkerSeverity): string {
  switch (severity) {
    case 8:
      return 'danger';
    case 4:
      return 'warning';
    case 2:
      return 'note';
  }
  return 'info';
}

function FixButton(props: FixButtonProps): JSX.Element {
  return (
    <button
      className="button button--primary button--sm"
      disabled={props.disabled}
      onClick={(): void => {
        props.fix();
        props.setIsLocked(true);
      }}
    >
      fix
    </button>
  );
}

function ErrorBlock({
  item,
  setIsLocked,
  isLocked,
}: ErrorBlockProps): JSX.Element {
  return (
    <div className={`admonition alert alert--${severityClass(item.severity)}`}>
      <div className="admonition-content">
        <div className={clsx(!!item.fixer && styles.fixerContainer)}>
          <div>
            {item.message} {item.location}
          </div>
          {item.fixer && (
            <FixButton
              disabled={isLocked}
              fix={item.fixer.fix}
              setIsLocked={setIsLocked}
            />
          )}
        </div>
        {item.suggestions.length > 0 && (
          <div>
            {item.suggestions.map((fixer, index) => (
              <div
                key={index}
                className={clsx(styles.fixerContainer, styles.fixer)}
              >
                <span>&gt; {fixer.message}</span>
                <FixButton
                  disabled={isLocked}
                  fix={fixer.fix}
                  setIsLocked={setIsLocked}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ErrorsViewer({
  value,
}: ErrorsViewerProps): JSX.Element {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setIsLocked(false);
  }, [value]);

  if (value && !Array.isArray(value)) {
    return (
      <div className={styles.list}>
        <div className="margin-top--sm">
          <h4>ESLint internal error</h4>
          {value?.stack}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {value?.map(({ group, uri, items }) => {
        return (
          <div className="margin-top--sm" key={group}>
            <h4>
              {group}
              {uri && (
                <>
                  {' - '}
                  <a href={uri} target="_blank">
                    docs <IconExternalLink width={13.5} height={13.5} />
                  </a>
                </>
              )}
            </h4>
            {items.map((item, index) => (
              <ErrorBlock
                isLocked={isLocked}
                setIsLocked={setIsLocked}
                item={item}
                key={index}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

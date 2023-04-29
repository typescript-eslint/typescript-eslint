import Link from '@docusaurus/Link';
import IconExternalLink from '@theme/Icon/ExternalLink';
import clsx from 'clsx';
import type Monaco from 'monaco-editor';
import React, { useEffect, useState } from 'react';

import styles from './ErrorsViewer.module.css';
import type { AlertBlockProps } from './layout/AlertBlock';
import AlertBlock from './layout/AlertBlock';
import type { ErrorGroup, ErrorItem } from './types';

export interface ErrorsViewerProps {
  readonly value?: ErrorGroup[];
}

export interface ErrorViewerProps {
  readonly value: Error;
  readonly title: string;
  readonly type: AlertBlockProps['type'];
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

function severityClass(
  severity: Monaco.MarkerSeverity,
): AlertBlockProps['type'] {
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
    <AlertBlock type={severityClass(item.severity)}>
      <div className={clsx(!!item.fixer && styles.fixerContainer)}>
        <pre className={styles.errorPre}>
          {item.message} {item.location}
        </pre>
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
    </AlertBlock>
  );
}

export function ErrorViewer({
  value,
  title,
  type,
}: ErrorViewerProps): JSX.Element {
  return (
    <div className={styles.list}>
      <div className="margin-top--md">
        <AlertBlock type={type}>
          <div className={styles.fixerContainer}>
            <h4>{title}</h4>
          </div>
          <pre className={styles.errorPre}>
            {type === 'danger' ? value?.stack : value.message}
          </pre>
        </AlertBlock>
      </div>
    </div>
  );
}

export function ErrorsViewer({ value }: ErrorsViewerProps): JSX.Element {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setIsLocked(false);
  }, [value]);

  return (
    <div className={styles.list}>
      {value?.length ? (
        value.map(({ group, uri, items }) => {
          return (
            <div className="margin-top--md" key={group}>
              <h4>
                {group}
                {uri && (
                  <>
                    {' - '}
                    <Link href={uri} target="_blank">
                      docs <IconExternalLink width={13.5} height={13.5} />
                    </Link>
                  </>
                )}
              </h4>
              {items.map((item, index) => (
                <div className="margin-bottom--sm" key={index}>
                  <ErrorBlock
                    isLocked={isLocked}
                    setIsLocked={setIsLocked}
                    item={item}
                  />
                </div>
              ))}
            </div>
          );
        })
      ) : (
        <div className="margin-top--md">
          <AlertBlock type="success">
            <div>All is ok!</div>
          </AlertBlock>
        </div>
      )}
    </div>
  );
}

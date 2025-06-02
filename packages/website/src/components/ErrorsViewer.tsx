import type Monaco from 'monaco-editor';

import Link from '@docusaurus/Link';
import IconExternalLink from '@theme/Icon/ExternalLink';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import type { AlertBlockProps } from './layout/AlertBlock';
import type { ErrorGroup, ErrorItem } from './types';

import styles from './ErrorsViewer.module.css';
import AlertBlock from './layout/AlertBlock';

export interface ErrorsViewerProps {
  readonly value?: ErrorGroup[];
}

export interface ErrorViewerProps {
  readonly title: string;
  readonly type: AlertBlockProps['type'];
  readonly value: Error;
}

export interface ErrorBlockProps {
  readonly isLocked: boolean;
  readonly item: ErrorItem;
  readonly setIsLocked: (value: boolean) => void;
}

export interface FixButtonProps {
  readonly children?: React.ReactNode;
  readonly disabled: boolean;
  readonly fix: () => void;
  readonly setIsLocked: (value: boolean) => void;
}

function severityClass(
  severity: Monaco.MarkerSeverity,
): AlertBlockProps['type'] {
  switch (severity) {
    /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison -- Monaco is imported as a type */
    case 2:
      return 'note';
    case 4:
      return 'warning';
    case 8:
      return 'danger';
    /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
  }
  return 'info';
}

function FixButton(props: FixButtonProps): React.JSX.Element {
  return (
    <button
      className="button button--primary button--sm"
      disabled={props.disabled}
      onClick={(): void => {
        props.fix();
        props.setIsLocked(true);
      }}
    >
      {props.children}
    </button>
  );
}

function ErrorBlock({
  isLocked,
  item,
  setIsLocked,
}: ErrorBlockProps): React.JSX.Element {
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
          >
            apply fix
          </FixButton>
        )}
      </div>
      {item.suggestions && item.suggestions.length > 0 && (
        <div>
          {item.suggestions.map((fixer, index) => (
            <div
              className={clsx(styles.fixerContainer, styles.fixer)}
              key={index}
            >
              <span>&gt; {fixer.message}</span>
              <FixButton
                disabled={isLocked}
                fix={fixer.fix}
                setIsLocked={setIsLocked}
              >
                apply suggestion
              </FixButton>
            </div>
          ))}
        </div>
      )}
    </AlertBlock>
  );
}

export function ErrorViewer({
  title,
  type,
  value,
}: ErrorViewerProps): React.JSX.Element {
  return (
    <div className={styles.list}>
      <div className="margin-top--md">
        <AlertBlock type={type}>
          <div className={styles.fixerContainer}>
            <h4>{title}</h4>
          </div>
          <pre className={styles.errorPre}>
            {type === 'danger' ? value.stack : value.message}
          </pre>
        </AlertBlock>
      </div>
    </div>
  );
}

export function ErrorsViewer({ value }: ErrorsViewerProps): React.JSX.Element {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setIsLocked(false);
  }, [value]);

  return (
    <div className={styles.list}>
      {value?.length ? (
        value.map(({ group, items, uri }) => {
          return (
            <div className="margin-top--md" key={group}>
              <h4>
                {group}
                {uri && (
                  <>
                    {' - '}
                    <Link href={uri} target="_blank">
                      docs <IconExternalLink height={13.5} width={13.5} />
                    </Link>
                  </>
                )}
              </h4>
              {items.map((item, index) => (
                <div className="margin-bottom--sm" key={index}>
                  <ErrorBlock
                    isLocked={isLocked}
                    item={item}
                    setIsLocked={setIsLocked}
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

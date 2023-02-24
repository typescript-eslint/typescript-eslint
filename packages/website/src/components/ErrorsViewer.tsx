import Link from '@docusaurus/Link';
import IconExternalLink from '@theme/Icon/ExternalLink';
import clsx from 'clsx';
import type Monaco from 'monaco-editor';
import React, { useEffect, useState } from 'react';

import styles from './ErrorsViewer.module.css';
import type { ErrorGroup, ErrorItem } from './types';

export interface ErrorsViewerProps {
  readonly value?: ErrorGroup[] | Error;
}

interface AlertBlockProps {
  readonly type: 'danger' | 'warning' | 'note' | 'info' | 'success';
  readonly children: React.ReactNode;
  readonly fixer?: boolean;
}

interface ErrorBlockProps {
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

function AlertBlock(props: AlertBlockProps): JSX.Element {
  return (
    <div className={`admonition alert alert--${props.type}`}>
      <div className="admonition-content">{props.children}</div>
    </div>
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
    </AlertBlock>
  );
}

function SuccessBlock(): JSX.Element {
  return (
    <AlertBlock type="success">
      <div className={styles.fixerContainer}>
        <div>All is ok!</div>
      </div>
    </AlertBlock>
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
        <div className="margin-top--md">
          <AlertBlock type="danger">
            <div className={styles.fixerContainer}>
              <h4>Internal error</h4>
            </div>
            {value?.stack}
          </AlertBlock>
        </div>
      </div>
    );
  }

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
                <ErrorBlock
                  isLocked={isLocked}
                  setIsLocked={setIsLocked}
                  item={item}
                  key={index}
                />
              ))}
            </div>
          );
        })
      ) : (
        <div className="margin-top--md">
          <SuccessBlock />
        </div>
      )}
    </div>
  );
}

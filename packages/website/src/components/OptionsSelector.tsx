/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  NavbarSecondaryMenuFiller,
  useWindowSize,
} from '@docusaurus/theme-common';
import CopyIcon from '@site/src/icons/copy.svg';
import IconExternalLink from '@theme/Icon/ExternalLink';
import React, { useCallback } from 'react';

import { useClipboard } from '../hooks/useClipboard';
import Checkbox from './inputs/Checkbox';
import Dropdown from './inputs/Dropdown';
import Tooltip from './inputs/Tooltip';
import Expander from './layout/Expander';
import { createMarkdown, createMarkdownParams } from './lib/markdown';
import styles from './OptionsSelector.module.css';
import type { ConfigModel } from './types';

export interface OptionsSelectorParams {
  readonly state: ConfigModel;
  readonly setState: (cfg: Partial<ConfigModel>) => void;
  readonly tsVersions: readonly string[];
  readonly isLoading: boolean;
}

const ASTOptions = [
  { value: false, label: 'Disabled' },
  { value: 'es', label: 'ESTree' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'scope', label: 'Scope' },
] as const;

function OptionsSelectorContent({
  state,
  setState,
  tsVersions,
  isLoading,
}: OptionsSelectorParams): JSX.Element {
  const [copyLink, copyLinkToClipboard] = useClipboard(() =>
    document.location.toString(),
  );
  const [copyMarkdown, copyMarkdownToClipboard] = useClipboard(() =>
    createMarkdown(state),
  );

  const updateTS = useCallback(
    (version: string) => {
      setState({ ts: version });
    },
    [setState],
  );

  const openIssue = useCallback(() => {
    if (isLoading) {
      return;
    }
    window
      .open(
        `https://github.com/typescript-eslint/typescript-eslint/issues/new?${createMarkdownParams(
          state,
        )}`,
        '_blank',
      )
      ?.focus();
  }, [state, isLoading]);

  return (
    <>
      <Expander label="Info">
        <label className={styles.optionLabel}>
          TypeScript
          <Dropdown
            name="ts"
            className="text--right"
            value={state.ts}
            disabled={!tsVersions.length}
            onChange={updateTS}
            options={(tsVersions.length && tsVersions) || [state.ts]}
          />
        </label>
        <label className={styles.optionLabel}>
          Eslint
          <span>{process.env.ESLINT_VERSION}</span>
        </label>
        <label className={styles.optionLabel}>
          TSEslint
          <span>{process.env.TS_ESLINT_VERSION}</span>
        </label>
      </Expander>
      <Expander label="Options">
        <label className={styles.optionLabel}>
          Enable jsx
          <Checkbox
            name="jsx"
            checked={state.jsx}
            onChange={(e): void => setState({ jsx: e })}
            className={styles.optionCheckbox}
          />
        </label>
        <label className={styles.optionLabel}>
          AST Viewer
          <Dropdown
            name="showAST"
            value={state.showAST}
            onChange={(e): void => setState({ showAST: e })}
            options={ASTOptions}
          />
        </label>
        <label className={styles.optionLabel}>
          Source type
          <Dropdown
            name="sourceType"
            value={state.sourceType}
            onChange={(e): void => setState({ sourceType: e })}
            options={['script', 'module']}
          />
        </label>
      </Expander>
      <Expander label="Actions">
        <button className={styles.optionLabel} onClick={copyLinkToClipboard}>
          Copy Link
          <Tooltip open={copyLink} text="Copied">
            <CopyIcon width="13.5" height="13.5" />
          </Tooltip>
        </button>
        <button
          className={styles.optionLabel}
          onClick={copyMarkdownToClipboard}
        >
          Copy Markdown
          <Tooltip open={copyMarkdown} text="Copied">
            <CopyIcon width="13.5" height="13.5" />
          </Tooltip>
        </button>
        <button className={styles.optionLabel} onClick={openIssue}>
          Report as Issue
          <IconExternalLink width="13.5" height="13.5" />
        </button>
      </Expander>
    </>
  );
}

function OptionsSelector(props: OptionsSelectorParams): JSX.Element {
  const windowSize = useWindowSize();
  if (windowSize === 'mobile') {
    return (
      <NavbarSecondaryMenuFiller
        component={OptionsSelectorContent}
        props={props}
      />
    );
  }
  return <OptionsSelectorContent {...props} />;
}

export default OptionsSelector;

/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useState } from 'react';

import ConfigEslint from './config/ConfigEslint';
import ConfigTypeScript from './config/ConfigTypeScript';
import Expander from './layout/Expander';
import Dropdown from './inputs/Dropdown';
import Checkbox from './inputs/Checkbox';
import Tooltip from './inputs/Tooltip';
import EditIcon from '@site/src/icons/edit.svg';
import CopyIcon from '@site/src/icons/copy.svg';

import useDebouncedToggle from './hooks/useDebouncedToggle';

import { createMarkdown, createMarkdownParams } from './lib/markdown';

import type { RuleDetails } from './types';

import styles from './OptionsSelector.module.css';

import type { CompilerFlags, ConfigModel, RulesRecord } from './types';

export interface OptionsSelectorParams {
  readonly ruleOptions: RuleDetails[];
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

function OptionsSelector({
  ruleOptions,
  state,
  setState,
  tsVersions,
  isLoading,
}: OptionsSelectorParams): JSX.Element {
  const [eslintModal, setEslintModal] = useState<boolean>(false);
  const [typeScriptModal, setTypeScriptModal] = useState<boolean>(false);
  const [copyLink, setCopyLink] = useDebouncedToggle<boolean>(false);
  const [copyMarkdown, setCopyMarkdown] = useDebouncedToggle<boolean>(false);

  const updateTS = useCallback(
    (version: string) => {
      setState({ ts: version });
    },
    [setState],
  );

  const updateRules = useCallback(
    (rules?: RulesRecord) => {
      if (rules) {
        setState({ rules: rules });
      }
      setEslintModal(false);
    },
    [setState],
  );

  const updateTsConfig = useCallback(
    (config?: CompilerFlags) => {
      if (config) {
        setState({ tsConfig: config });
      }
      setTypeScriptModal(false);
    },
    [setState],
  );

  const copyLinkToClipboard = useCallback(() => {
    void navigator.clipboard
      .writeText(document.location.toString())
      .then(() => {
        setCopyLink(true);
      });
  }, []);

  const copyMarkdownToClipboard = useCallback(() => {
    if (isLoading) {
      return;
    }
    void navigator.clipboard.writeText(createMarkdown(state)).then(() => {
      setCopyMarkdown(true);
    });
  }, [state, isLoading]);

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
      {state.rules && ruleOptions.length > 0 && (
        <ConfigEslint
          isOpen={eslintModal}
          ruleOptions={ruleOptions}
          rules={state.rules}
          onClose={updateRules}
        />
      )}
      <ConfigTypeScript
        isOpen={typeScriptModal}
        config={state.tsConfig}
        onClose={updateTsConfig}
      />
      <Expander label="Info">
        <label className={styles.optionLabel}>
          TypeScript
          <Dropdown
            name="ts"
            className="text--right"
            value={state.ts}
            onChange={updateTS}
            options={((tsVersions.length && tsVersions) || [state.ts]).filter(
              item => parseFloat(item) >= 3.3,
            )}
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
        <button
          className={styles.optionLabel}
          onClick={(): void => setEslintModal(true)}
        >
          Eslint Config
          <EditIcon />
        </button>
        <button
          className={styles.optionLabel}
          onClick={(): void => setTypeScriptModal(true)}
        >
          TypeScript Config
          <EditIcon />
        </button>
      </Expander>
      <Expander label="Actions">
        <button className={styles.optionLabel} onClick={copyLinkToClipboard}>
          Copy Link
          <Tooltip open={copyLink} text="Copied">
            <CopyIcon />
          </Tooltip>
        </button>
        <button
          className={styles.optionLabel}
          onClick={copyMarkdownToClipboard}
        >
          Copy Markdown
          <Tooltip open={copyMarkdown} text="Copied">
            <CopyIcon />
          </Tooltip>
        </button>
        <button className={styles.optionLabel} onClick={openIssue}>
          Report as Issue
          <CopyIcon />
        </button>
      </Expander>
    </>
  );
}

export default OptionsSelector;

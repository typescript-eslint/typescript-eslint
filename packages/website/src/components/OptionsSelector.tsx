import React, { useCallback, useState } from 'react';
import type { RulesRecord } from '@typescript-eslint/website-eslint';

import ModalEslint from './modals/ModalEslint';
import ModalTypeScript from './modals/ModalTypeScript';
import Expander from './layout/Expander';
import Dropdown from './inputs/Dropdown';
import type { HashStateOptions } from './hooks/useHashState';

import styles from './OptionsSelector.module.css';
import EditIcon from './icons/EditIcon';

type SourceType = HashStateOptions['sourceType'];

interface OptionsSelectorParams<T = HashStateOptions> {
  ruleOptions: string[];
  state: T;
  setState: <X extends keyof T>(key: X, value: T[X]) => void;
  tsVersions: readonly string[];
}

function OptionsSelector({
  ruleOptions,
  state,
  setState,
  tsVersions,
}: OptionsSelectorParams): JSX.Element {
  const [eslintModal, setEslintModal] = useState<boolean>(false);
  const [typeScriptModal, setTypeScriptModal] = useState<boolean>(false);

  const updateTS = useCallback((version: string) => {
    setState('ts', version);
  }, []);

  const updateRules = useCallback((rules: RulesRecord) => {
    setState('rules', rules);
    setEslintModal(false);
  }, []);

  return (
    <>
      {state.rules && ruleOptions.length > 0 && (
        <ModalEslint
          key="modal-eslint"
          isOpen={eslintModal}
          ruleOptions={ruleOptions}
          rules={state.rules}
          onClose={updateRules}
        />
      )}
      <ModalTypeScript
        key="modal-typescript"
        isOpen={typeScriptModal}
        onClose={(): void => setTypeScriptModal(false)}
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
          <input
            checked={state.jsx}
            onChange={(e): void => setState('jsx', e.target.checked ?? false)}
            name="jsx"
            className={styles.optionCheckbox}
            type="checkbox"
          />
        </label>
        <label className={styles.optionLabel}>
          Show AST
          <input
            checked={state.showAST}
            onChange={(e): void =>
              setState('showAST', e.target.checked ?? false)
            }
            name="ast"
            className={styles.optionCheckbox}
            type="checkbox"
          />
        </label>
        <label className={styles.optionLabel}>
          Source type
          <Dropdown
            name="sourceType"
            value={state.sourceType}
            onChange={(e): void => setState('sourceType', e as SourceType)}
            options={['script', 'module']}
          />
        </label>
        <label
          className={styles.optionLabel}
          onClick={(): void => setEslintModal(true)}
        >
          Eslint Config
          <EditIcon className={styles.clickableIcon} />
        </label>
        <label
          className={styles.optionLabel}
          onClick={(): void => setTypeScriptModal(true)}
        >
          TypeScript Config
          <EditIcon className={styles.clickableIcon} />
        </label>
      </Expander>
    </>
  );
}

export default OptionsSelector;

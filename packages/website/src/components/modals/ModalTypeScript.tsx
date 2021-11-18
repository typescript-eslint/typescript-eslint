import React, { useCallback, useEffect, useReducer, useState } from 'react';
import Modal from './Modal';
import clsx from 'clsx';
import styles from './search.module.css';
import Checkbox from '../inputs/Checkbox';
import useFocus from '../hooks/useFocus';
import tsConfigOptions, { TsConfigOptionsType } from './tsConfigOptions';
import type { CompilerFlags } from '@site/src/components/hooks/useHashState';

interface ModalTypeScriptProps {
  isOpen: boolean;
  onClose: (config: CompilerFlags) => void;
  config?: CompilerFlags;
}

function reducerRules(
  state: CompilerFlags,
  action:
    | { type: 'init'; config?: CompilerFlags }
    | { type: 'toggle'; checked: boolean; name: string },
): CompilerFlags {
  switch (action.type) {
    case 'toggle':
      return {
        ...state,
        [action.name]: action.checked,
      };
    case 'init':
      return {
        ...action.config,
      };
  }
  // @ts-expect-error: Safeguard
  throw new Error();
}

function filterConfig(
  options: TsConfigOptionsType[],
  filter: string,
): TsConfigOptionsType[] {
  return options
    .map(group => ({
      heading: group.heading,
      fields: group.fields.filter(item => String(item.key).includes(filter)),
    }))
    .filter(group => group.fields.length > 0);
}

function ModalTypeScript(props: ModalTypeScriptProps): JSX.Element {
  const [config, updateConfig] = useReducer(reducerRules, {});
  const [filter, setFilter] = useState<string>('');
  const [filterInput, setFilterFocus] = useFocus();

  useEffect(() => {
    updateConfig({
      type: 'init',
      config: props.config,
    });
  }, [props.config]);

  useEffect(() => {
    if (props.isOpen) {
      setFilterFocus();
    }
  }, [props.isOpen]);

  const onClose = useCallback(() => {
    setFilter('');
    props.onClose(config);
  }, [props.onClose, config]);

  return (
    <Modal header="TypeScript Config" isOpen={props.isOpen} onClose={onClose}>
      <>
        <div className={styles.searchBar}>
          <input
            ref={filterInput}
            type="text"
            key="eslint-filter"
            value={filter}
            className={styles.search}
            // @ts-expect-error: Invalid ts types
            onInput={(e): void => setFilter(e.target.value)}
          />
        </div>
        <div className={clsx('thin-scrollbar', styles.searchResultContainer)}>
          {filterConfig(tsConfigOptions, filter).map(group => (
            <div key={group.heading}>
              <h3 className={styles.searchResultGroup}>{group.heading}</h3>
              <div>
                {group.fields.map(item => (
                  <label className={styles.searchResult} key={item.key}>
                    <span>
                      <span>{item.key}</span>
                      <br />
                      <span>{item.label}</span>
                    </span>
                    <Checkbox
                      name={`tsconfig_${item.key}`}
                      value={item.key}
                      checked={config[item.key] ?? false}
                      onChange={(checked, name): void =>
                        updateConfig({ type: 'toggle', checked, name })
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    </Modal>
  );
}

export default ModalTypeScript;

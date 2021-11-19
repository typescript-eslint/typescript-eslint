import React, { useCallback, useEffect, useState } from 'react';
import type { RulesRecord, RuleEntry } from '@typescript-eslint/website-eslint';

import ConfigEditor, { ConfigOptionsType } from './ConfigEditor';
import { RuleDetails } from '../types';

export interface ModalEslintProps {
  readonly isOpen: boolean;
  readonly onClose: (rules: RulesRecord) => void;
  readonly ruleOptions: RuleDetails[];
  readonly rules: RulesRecord;
}

function checkSeverity(value: unknown): boolean {
  if (typeof value === 'string' || typeof value === 'number') {
    return [0, 1, 2, 'off', 'warn', 'error'].includes(value);
  }
  return false;
}

function checkOptions(rule: [string, unknown]): rule is [string, RuleEntry] {
  if (Array.isArray(rule[1])) {
    return rule[1].length > 0 && checkSeverity(rule[1][0]);
  }
  return checkSeverity(rule[1]);
}

function ConfigEslint(props: ModalEslintProps): JSX.Element {
  const [options, updateOptions] = useState<ConfigOptionsType[]>([]);

  useEffect(() => {
    updateOptions([
      {
        heading: 'Rules',
        fields: props.ruleOptions
          .filter(item => item.name.startsWith('@typescript'))
          .map(item => ({
            key: item.name,
            label: item.description,
            defaults: ['error', 2, 'warn', 1, ['error'], ['warn'], [2], [1]],
          })),
      },
      {
        heading: 'Core rules',
        fields: props.ruleOptions
          .filter(item => !item.name.startsWith('@typescript'))
          .map(item => ({
            key: item.name,
            label: item.description,
            defaults: ['error', 2, 'warn', 1, ['error'], ['warn'], [2], [1]],
          })),
      },
    ]);
  }, [props.ruleOptions]);

  const onClose = useCallback(
    (newConfig: Record<string, unknown>) => {
      props.onClose(
        Object.fromEntries(
          Object.entries(newConfig)
            .map<[string, unknown]>(([name, value]) =>
              Array.isArray(value) && value.length === 1
                ? [name, value[0]]
                : [name, value],
            )
            .filter(checkOptions),
        ),
      );
    },
    [props.onClose],
  );

  return (
    <ConfigEditor
      header="Eslint Config"
      options={options}
      values={props.rules ?? {}}
      jsonField="rules"
      isOpen={props.isOpen}
      onClose={onClose}
    />
  );
}

export default ConfigEslint;

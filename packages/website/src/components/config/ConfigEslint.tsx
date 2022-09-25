import React, { useCallback, useEffect, useState } from 'react';

import { shallowEqual } from '../lib/shallowEqual';
import type { ConfigModel, EslintRC, RuleDetails, RuleEntry } from '../types';
import type { ConfigOptionsType } from './ConfigEditor';
import ConfigEditor from './ConfigEditor';
import { parseESLintRC, toJson } from './utils';

export interface ConfigEslintProps {
  readonly isOpen: boolean;
  readonly onClose: (value?: Partial<ConfigModel>) => void;
  readonly ruleOptions: RuleDetails[];
  readonly config?: string;
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

function ConfigEslint(props: ConfigEslintProps): JSX.Element {
  const { isOpen, config, onClose: onCloseProps, ruleOptions } = props;
  const [options, updateOptions] = useState<ConfigOptionsType[]>([]);
  const [configObject, updateConfigObject] = useState<EslintRC>();

  useEffect(() => {
    if (isOpen) {
      updateConfigObject(parseESLintRC(config));
    }
  }, [isOpen, config]);

  useEffect(() => {
    updateOptions([
      {
        heading: 'Rules',
        fields: ruleOptions
          .filter(item => item.name.startsWith('@typescript'))
          .map(item => ({
            key: item.name,
            label: item.description,
            type: 'boolean',
            defaults: ['error', 2, 'warn', 1, ['error'], ['warn'], [2], [1]],
          })),
      },
      {
        heading: 'Core rules',
        fields: ruleOptions
          .filter(item => !item.name.startsWith('@typescript'))
          .map(item => ({
            key: item.name,
            label: item.description,
            type: 'boolean',
            defaults: ['error', 2, 'warn', 1, ['error'], ['warn'], [2], [1]],
          })),
      },
    ]);
  }, [ruleOptions]);

  const onClose = useCallback(
    (newConfig: Record<string, unknown>) => {
      const cfg = Object.fromEntries(
        Object.entries(newConfig)
          .map<[string, unknown]>(([name, value]) =>
            Array.isArray(value) && value.length === 1
              ? [name, value[0]]
              : [name, value],
          )
          .filter(checkOptions),
      );
      if (!shallowEqual(cfg, configObject?.rules)) {
        onCloseProps({
          eslintrc: toJson({ ...(configObject ?? {}), rules: cfg }),
        });
      } else {
        onCloseProps();
      }
    },
    [onCloseProps, configObject],
  );

  return (
    <ConfigEditor
      header="Eslint Config"
      options={options}
      values={configObject?.rules ?? {}}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

export default ConfigEslint;

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ensureObject, parseJSONObject, toJson } from '../lib/json';
import { shallowEqual } from '../lib/shallowEqual';
import type { ConfigModel, RuleDetails } from '../types';
import type { ConfigOptionsField, ConfigOptionsType } from './ConfigEditor';
import ConfigEditor from './ConfigEditor';

export interface ConfigEslintProps {
  readonly onChange: (value: Partial<ConfigModel>) => void;
  readonly ruleOptions: RuleDetails[];
  readonly config?: string;
  readonly className?: string;
}

function ConfigEslint(props: ConfigEslintProps): JSX.Element {
  const { config, onChange: onChangeProp, ruleOptions, className } = props;

  const [configObject, updateConfigObject] = useState<Record<string, unknown>>(
    () => ({}),
  );

  useEffect(() => {
    updateConfigObject(oldConfig => {
      const newConfig = ensureObject(parseJSONObject(config).rules);
      if (shallowEqual(oldConfig, newConfig)) {
        return oldConfig;
      }
      return newConfig;
    });
  }, [config]);

  const options = useMemo((): ConfigOptionsType[] => {
    const mappedRules: ConfigOptionsField[] = ruleOptions.map(item => ({
      key: item.name,
      label: item.description,
      type: 'boolean',
      defaults: ['error', 2, 'warn', 1, ['error'], ['warn'], [2], [1]],
    }));

    return [
      {
        heading: 'Rules',
        fields: mappedRules.filter(item => item.key.startsWith('@typescript')),
      },
      {
        heading: 'Core rules',
        fields: mappedRules.filter(item => !item.key.startsWith('@typescript')),
      },
    ];
  }, [ruleOptions]);

  const onChange = useCallback(
    (newConfig: Record<string, unknown>) => {
      const parsed = parseJSONObject(config);
      parsed.rules = newConfig;
      updateConfigObject(newConfig);
      onChangeProp({ eslintrc: toJson(parsed) });
    },
    [config, onChangeProp],
  );

  return (
    <ConfigEditor
      className={className}
      options={options}
      values={configObject}
      onChange={onChange}
    />
  );
}

export default ConfigEslint;

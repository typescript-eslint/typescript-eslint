import React, { useCallback, useEffect, useMemo, useState } from 'react';

import type { ConfigModel, RuleDetails } from '../types';
import type { ConfigOptionsField, ConfigOptionsType } from './ConfigEditor';

import { ensureObject, parseJSONObject, toJson } from '../lib/json';
import { shallowEqual } from '../lib/shallowEqual';
import ConfigEditor from './ConfigEditor';

export interface ConfigEslintProps {
  readonly className?: string;
  readonly config?: string;
  readonly onChange: (value: Partial<ConfigModel>) => void;
  readonly ruleOptions: RuleDetails[];
}

function ConfigEslint(props: ConfigEslintProps): React.JSX.Element {
  const { className, config, onChange: onChangeProp, ruleOptions } = props;

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
      defaults: ['error', 2, 'warn', 1, ['error'], ['warn'], [2], [1]],
      key: item.name,
      label: item.description,
      type: 'boolean',
    }));

    return [
      {
        fields: mappedRules.filter(item => item.key.startsWith('@typescript')),
        heading: 'Rules',
      },
      {
        fields: mappedRules.filter(item => !item.key.startsWith('@typescript')),
        heading: 'Core rules',
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
      onChange={onChange}
      options={options}
      values={configObject}
    />
  );
}

export default ConfigEslint;

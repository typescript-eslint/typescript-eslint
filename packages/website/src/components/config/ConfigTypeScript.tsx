import React, { useCallback, useEffect, useMemo, useState } from 'react';

import type { ConfigModel } from '../types';
import type { ConfigOptionsType } from './ConfigEditor';

import { ensureObject, parseJSONObject, toJson } from '../lib/json';
import { getTypescriptOptions } from '../lib/jsonSchema';
import { shallowEqual } from '../lib/shallowEqual';
import ConfigEditor from './ConfigEditor';

interface ConfigTypeScriptProps {
  readonly className?: string;
  readonly config?: string;
  readonly onChange: (config: Partial<ConfigModel>) => void;
}

function ConfigTypeScript(props: ConfigTypeScriptProps): React.JSX.Element {
  const { className, config, onChange: onChangeProp } = props;

  const [configObject, updateConfigObject] = useState<Record<string, unknown>>(
    () => ({}),
  );

  useEffect(() => {
    updateConfigObject(oldConfig => {
      const newConfig = ensureObject(parseJSONObject(config).compilerOptions);
      if (shallowEqual(oldConfig, newConfig)) {
        return oldConfig;
      }
      return newConfig;
    });
  }, [config]);

  const options = useMemo((): ConfigOptionsType[] => {
    return Object.values(
      getTypescriptOptions().reduce<Record<string, ConfigOptionsType>>(
        (group, item) => {
          const category = item.category.message;
          group[category] ??= {
            fields: [],
            heading: category,
          };
          if (item.type === 'boolean') {
            group[category].fields.push({
              key: item.name,
              label: item.description.message,
              type: 'boolean',
            });
          } else if (item.type instanceof Map) {
            group[category].fields.push({
              enum: ['', ...item.type.keys()],
              key: item.name,
              label: item.description.message,
              type: 'string',
            });
          }
          return group;
        },
        {},
      ),
    );
  }, []);

  const onChange = useCallback(
    (newConfig: Record<string, unknown>) => {
      const parsed = parseJSONObject(config);
      parsed.compilerOptions = newConfig;
      updateConfigObject(newConfig);
      onChangeProp({ tsconfig: toJson(parsed) });
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

export default ConfigTypeScript;

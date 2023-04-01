import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { shallowEqual } from '../lib/shallowEqual';
import type { CompilerFlags, ConfigModel } from '../types';
import type { ConfigOptionsType } from './ConfigEditor';
import ConfigEditor from './ConfigEditor';
import { getTypescriptOptions, parseTSConfig, toJson } from './utils';

interface ConfigTypeScriptProps {
  readonly onChange: (config: Partial<ConfigModel>) => void;
  readonly config?: string;
  readonly className?: string;
}

function ConfigTypeScript(props: ConfigTypeScriptProps): JSX.Element {
  const { config, onChange: onChangeProp, className } = props;

  const [configObject, updateConfigObject] = useState<Record<string, unknown>>(
    () => ({}),
  );

  useEffect(() => {
    updateConfigObject(oldConfig => {
      const newConfig = parseTSConfig(config).compilerOptions;
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
          const category = item.category!.message;
          group[category] = group[category] ?? {
            heading: category,
            fields: [],
          };
          if (item.type === 'boolean') {
            group[category].fields.push({
              key: item.name,
              type: 'boolean',
              label: item.description!.message,
            });
          } else if (item.type instanceof Map) {
            group[category].fields.push({
              key: item.name,
              type: 'string',
              label: item.description!.message,
              enum: ['', ...Array.from<string>(item.type.keys())],
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
      const parsed = parseTSConfig(config);
      parsed.compilerOptions = newConfig as CompilerFlags;
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

export default ConfigTypeScript;

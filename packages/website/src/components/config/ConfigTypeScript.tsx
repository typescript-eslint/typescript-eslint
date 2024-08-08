import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ensureObject, parseJSONObject, toJson } from '../lib/json';
import { getTypescriptOptions } from '../lib/jsonSchema';
import { shallowEqual } from '../lib/shallowEqual';
import type { ConfigModel } from '../types';
import ConfigEditor from './ConfigEditor';

interface ConfigTypeScriptProps {
  readonly onChange: (config: Partial<ConfigModel>) => void;
  readonly config?: string;
  readonly className?: string;
}

function ConfigTypeScript(props: ConfigTypeScriptProps): React.JSX.Element {
  const { config, onChange: onChangeProp, className } = props;

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

  const options = useMemo(
    () =>
      Object.entries(
        Object.groupBy(
          getTypescriptOptions(),
          ({ category }) => category.message,
        ),
      ).map(([heading, group]) => ({
        heading,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        fields: group!
          .map(({ name, description, type }) => ({
            key: name,
            label: description.message,
            ...(type === 'boolean'
              ? { type: 'boolean' as const }
              : type instanceof Map && {
                  type: 'string' as const,
                  enum: ['', ...Array.from<string>(type.keys())],
                }),
          }))
          .filter(item => 'type' in item),
      })),
    [],
  );

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
      options={options}
      values={configObject}
      onChange={onChange}
    />
  );
}

export default ConfigTypeScript;

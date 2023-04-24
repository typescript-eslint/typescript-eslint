import { useSystemFile } from '@site/src/components/hooks/useSystemFile';
import type { JSONSchema4 } from 'json-schema';
import React, { useCallback, useMemo } from 'react';

import { ensureObject } from '../lib/json';
import { shallowEqual } from '../lib/shallowEqual';
import type { PlaygroundSystem } from '../linter/types';
import ConfigEditor from './ConfigEditor';
import { schemaToConfigOptions } from './utils';

export interface ConfigProps {
  readonly className?: string;
  readonly system: PlaygroundSystem;
}

function ConfigEslint({ className, system }: ConfigProps): JSX.Element {
  const [rawConfig, updateConfigObject] = useSystemFile(system, '/.eslintrc');
  const configObject = useMemo(
    () => ensureObject(rawConfig?.rules),
    [rawConfig],
  );

  const options = useMemo(() => {
    const schemaContent = system.readFile('/schema/eslint.schema');
    if (schemaContent) {
      const schema = JSON.parse(schemaContent) as JSONSchema4;
      if (schema.type === 'object') {
        const props = schema.properties?.rules?.properties;
        if (props) {
          return schemaToConfigOptions(props).reverse();
        }
      }
    }

    return [];
  }, [system]);

  const onChange = useCallback(
    (newConfig: Record<string, unknown>) => {
      if (!shallowEqual(newConfig, ensureObject(rawConfig?.rules))) {
        updateConfigObject({ ...rawConfig, rules: newConfig });
      }
    },
    [rawConfig, updateConfigObject],
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

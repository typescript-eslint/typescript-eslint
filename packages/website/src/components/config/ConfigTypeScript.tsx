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

function ConfigTypeScript({ className, system }: ConfigProps): JSX.Element {
  const [rawConfig, updateConfigObject] = useSystemFile(
    system,
    '/tsconfig.json',
  );
  const configObject = useMemo(
    () => ensureObject(rawConfig?.compilerOptions),
    [rawConfig],
  );

  const options = useMemo(() => {
    const schemaContent = system.readFile('/schema/tsconfig.schema');
    if (schemaContent) {
      const schema = JSON.parse(schemaContent) as JSONSchema4;
      if (schema.type === 'object') {
        const props = schema.properties?.compilerOptions?.properties;
        if (props) {
          return schemaToConfigOptions(props);
        }
      }
    }

    return [];
  }, [system]);

  const onChange = useCallback(
    (newConfig: Record<string, unknown>) => {
      if (!shallowEqual(newConfig, ensureObject(rawConfig?.compilerOptions))) {
        updateConfigObject({ ...rawConfig, compilerOptions: newConfig });
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

export default ConfigTypeScript;

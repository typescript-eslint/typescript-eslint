import React, { useCallback, useEffect, useState } from 'react';

import ConfigEditor, { ConfigOptionsType } from './ConfigEditor';
import type { CompilerFlags, ConfigModel } from '../types';
import { shallowEqual } from '../lib/shallowEqual';
import { getTypescriptOptions, parseTSConfig, toJsonConfig } from './utils';

interface ConfigTypeScriptProps {
  readonly isOpen: boolean;
  readonly onClose: (config?: Partial<ConfigModel>) => void;
  readonly config?: string;
}

function checkOptions(item: [string, unknown]): item is [string, boolean] {
  return typeof item[1] === 'boolean';
}

function ConfigTypeScript(props: ConfigTypeScriptProps): JSX.Element {
  const [tsConfigOptions, updateOptions] = useState<ConfigOptionsType[]>([]);
  const [configObject, updateConfigObject] = useState<CompilerFlags>({});

  useEffect(() => {
    if (props.isOpen) {
      updateConfigObject(props.config ? parseTSConfig(props.config) : {});
    }
  }, [props.isOpen, props.config]);

  useEffect(() => {
    if (window.ts) {
      updateOptions(
        Object.values(
          getTypescriptOptions().reduce<Record<string, ConfigOptionsType>>(
            (group, item) => {
              const category = item.category!.message;
              group[category] = group[category] ?? {
                heading: category,
                fields: [],
              };
              group[category].fields.push({
                key: item.name,
                label: item.description!.message,
              });
              return group;
            },
            {},
          ),
        ),
      );
    }
  }, [props.isOpen]);

  const onClose = useCallback(
    (newConfig: Record<string, unknown>) => {
      const cfg = Object.fromEntries(
        Object.entries(newConfig).filter(checkOptions),
      );
      if (!shallowEqual(cfg, configObject)) {
        props.onClose({ tsconfig: toJsonConfig(cfg, 'compilerOptions') });
      } else {
        props.onClose();
      }
    },
    [props.onClose, configObject],
  );

  return (
    <ConfigEditor
      header="TypeScript Config"
      options={tsConfigOptions}
      values={configObject ?? {}}
      isOpen={props.isOpen}
      onClose={onClose}
    />
  );
}

export default ConfigTypeScript;

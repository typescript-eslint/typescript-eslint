import React, { useCallback, useEffect, useState } from 'react';

import ConfigEditor, { ConfigOptionsType } from './ConfigEditor';
import type { CompilerFlags, ConfigModel } from '../types';
import { shallowEqual } from '../lib/shallowEqual';

interface ModalTypeScriptProps {
  readonly isOpen: boolean;
  readonly onClose: (config?: Partial<ConfigModel>) => void;
  readonly config?: CompilerFlags;
}

interface OptionDeclarations {
  name: string;
  type?: unknown;
  category?: { message: string };
  description?: { message: string };
}

function checkOptions(item: [string, unknown]): item is [string, boolean] {
  return typeof item[1] === 'boolean';
}

function ConfigTypeScript(props: ModalTypeScriptProps): JSX.Element {
  const [tsConfigOptions, updateOptions] = useState<ConfigOptionsType[]>([]);

  useEffect(() => {
    if (window.ts) {
      updateOptions(
        Object.values(
          // @ts-expect-error: definition is not fully correct
          (window.ts.optionDeclarations as OptionDeclarations[])
            .filter(
              item =>
                item.type === 'boolean' &&
                item.description &&
                item.category &&
                ![
                  'Command-line Options',
                  'Modules',
                  'Projects',
                  'Compiler Diagnostics',
                  'Editor Support',
                  'Output Formatting',
                  'Watch and Build Modes',
                  'Source Map Options',
                ].includes(item.category.message),
            )
            .reduce<Record<string, ConfigOptionsType>>((group, item) => {
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
            }, {}),
        ),
      );
    }
  }, [props.isOpen]);

  const onClose = useCallback(
    (newConfig: Record<string, unknown>) => {
      const cfg = Object.fromEntries(
        Object.entries(newConfig).filter(checkOptions),
      );
      if (!shallowEqual(cfg, props.config)) {
        props.onClose({ tsConfig: cfg });
      } else {
        props.onClose();
      }
    },
    [props.onClose, props.config],
  );

  return (
    <ConfigEditor
      header="TypeScript Config"
      options={tsConfigOptions}
      values={props.config ?? {}}
      jsonField="compilerOptions"
      isOpen={props.isOpen}
      onClose={onClose}
    />
  );
}

export default ConfigTypeScript;

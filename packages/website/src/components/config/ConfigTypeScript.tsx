import React, { useCallback } from 'react';
import tsConfigOptions from '../tsConfigOptions.json';

import ConfigEditor from './ConfigEditor';
import type { CompilerFlags } from '../types';
import { shallowEqual } from '../lib/shallowEqual';

interface ModalTypeScriptProps {
  readonly isOpen: boolean;
  readonly onClose: (config?: CompilerFlags) => void;
  readonly config?: CompilerFlags;
}

function checkOptions(item: [string, unknown]): item is [string, boolean] {
  return typeof item[1] === 'boolean';
}

function ConfigTypeScript(props: ModalTypeScriptProps): JSX.Element {
  const onClose = useCallback(
    (newConfig: Record<string, unknown>) => {
      const cfg = Object.fromEntries(
        Object.entries(newConfig).filter(checkOptions),
      );
      if (!shallowEqual(cfg, props.config)) {
        props.onClose(cfg);
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

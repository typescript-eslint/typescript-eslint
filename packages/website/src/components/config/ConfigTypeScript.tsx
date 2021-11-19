import React, { useCallback } from 'react';
import tsConfigOptions from '../tsConfigOptions.json';

import type { CompilerFlags } from '../types';
import ConfigEditor from './ConfigEditor';

interface ModalTypeScriptProps {
  isOpen: boolean;
  onClose: (config: CompilerFlags) => void;
  config?: CompilerFlags;
}

function checkOptions(item: [string, unknown]): item is [string, boolean] {
  return typeof item[1] === 'boolean';
}

function ConfigTypeScript(props: ModalTypeScriptProps): JSX.Element {
  const onClose = useCallback(
    (newConfig: Record<string, unknown>) => {
      props.onClose(
        Object.fromEntries(Object.entries(newConfig).filter(checkOptions)),
      );
    },
    [props.onClose],
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

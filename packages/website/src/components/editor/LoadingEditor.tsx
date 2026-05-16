import React from 'react';

import type { CommonEditorProps } from './types';
import type { SandboxServicesProps } from './useSandboxServices';

import { LoadedEditor } from './LoadedEditor';
import { TS_VERSION_ERROR_MESSAGE } from './loadSandbox';
import { useSandboxServices } from './useSandboxServices';

export type LoadingEditorProps = CommonEditorProps & SandboxServicesProps;

export const LoadingEditor: React.FC<LoadingEditorProps> = props => {
  const services = useSandboxServices(props);

  if (!services) {
    return null;
  }

  if (services instanceof Error) {
    if (services.message === TS_VERSION_ERROR_MESSAGE) {
      props.onChange({
        ts: process.env.TS_VERSION,
      });
      return null;
    }
    return <>{services.stack}</>;
  }

  return <LoadedEditor {...props} {...services} />;
};

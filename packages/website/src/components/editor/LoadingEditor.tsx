import React from 'react';

import { LoadedEditor } from './LoadedEditor';
import type { CommonEditorProps } from './types';
import type { SandboxServicesProps } from './useSandboxServices';
import { useSandboxServices } from './useSandboxServices';

export type LoadingEditorProps = CommonEditorProps & SandboxServicesProps;

export const LoadingEditor: React.FC<LoadingEditorProps> = props => {
  const services = useSandboxServices(props);

  if (!services) {
    return null;
  }

  if (services instanceof Error) {
    return <>{services.stack}</>;
  }

  return <LoadedEditor {...props} {...services} />;
};

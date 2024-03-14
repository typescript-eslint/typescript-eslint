import React from 'react';

import type { ErrorGroup } from '../types';
import { LoadedEditor } from './LoadedEditor';
import type { CommonEditorProps } from './types';
import type { SandboxServicesProps } from './useSandboxServices';
import { useSandboxServices } from './useSandboxServices';

interface ExtendsCommonEditorProps
  extends Omit<CommonEditorProps, 'onMarkersChange'> {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onMarkersChange: React.Dispatch<
    React.SetStateAction<
      | {
          code?: ErrorGroup[];
          tsconfig?: ErrorGroup[];
          eslintrc?: ErrorGroup[];
        }
      | undefined
    >
  >;
}

export type LoadingEditorProps = ExtendsCommonEditorProps &
  SandboxServicesProps;

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

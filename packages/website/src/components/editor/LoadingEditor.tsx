import { loader } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import React, { useEffect, useRef, useState } from 'react';

import Loader from '../layout/Loader';
import type {
  PlaygroundSystem,
  UpdateModel,
  WebLinterModule,
} from '../linter/types';
import type { ErrorGroup } from '../types';
import LoadedEditor from './LoadedEditor';
import { loadWebLinterModule } from './loadWebLinterModule';

export interface LoadingEditorProps {
  readonly className?: string;
  readonly activeFile: string;
  readonly tsVersion: string;
  readonly system: PlaygroundSystem;
  readonly onValidate: (markers: ErrorGroup[]) => void;
  readonly onUpdate: (model: UpdateModel) => void;
  readonly onCursorChange: (offset: number) => void;
  readonly selectedRange?: [number, number];
}

function LoadingEditor(props: LoadingEditorProps): JSX.Element {
  const [isLoading, setLoading] = useState<boolean>(true);
  const monaco = useRef<typeof Monaco>();
  const utils = useRef<WebLinterModule>();

  useEffect(() => {
    loader.config({
      paths: {
        vs: `https://typescript.azureedge.net/cdn/${props.tsVersion}/monaco/min/vs`,
      },
    });

    // This has to be executed in proper order
    loader
      .init()
      .then((instance: typeof Monaco) => {
        monaco.current = instance;
        return loadWebLinterModule();
      })
      .then(instance => {
        utils.current = instance;
        setLoading(false);
      })
      .catch(e => {
        console.log('Unable to initialize editor', e);
      });
    // this can't be reactive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading || !monaco.current || !utils.current) {
    return <Loader />;
  }

  return (
    <LoadedEditor
      className={props.className}
      monaco={monaco.current}
      utils={utils.current}
      {...props}
    />
  );
}

export default LoadingEditor;

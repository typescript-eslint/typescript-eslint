// TODO: remove after v2.0.0-beta.10
declare module '*.svg' {
  import type { ComponentType, SVGProps } from 'react';

  const ReactComponent: ComponentType<SVGProps<SVGSVGElement>>;

  // eslint-disable-next-line import/no-default-export
  export default ReactComponent;
}

declare global {
  declare const process: {
    env: {
      TS_VERSION: string;
      ESLINT_VERSION: string;
      TS_ESLINT_VERSION: string;
    };
  };
}

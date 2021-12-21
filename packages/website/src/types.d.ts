declare global {
  declare const process: {
    env: {
      TS_VERSION: string;
      ESLINT_VERSION: string;
      TS_ESLINT_VERSION: string;
    };
  };
}

import 'process';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TS_VERSION: string;
      IS_SERVER: string;
      ESLINT_VERSION: string;
      TS_ESLINT_VERSION: string;
    }
  }
}

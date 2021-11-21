import 'process';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TS_VERSION: string;
      ESLINT_VERSION: string;
      TS_ESLINT_VERSION: string;
    }
  }
}

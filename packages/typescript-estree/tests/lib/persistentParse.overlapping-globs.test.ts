import {
  baseTests,
  setupPersistentParseTests,
} from '../test-utils/persistentParse';

setupPersistentParseTests();

describe('persistent parse', () => {
  describe.skipIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE === 'true')(
    'tsconfig with overlapping globs',
    () => {
      const tsConfigExcludeBar = {
        exclude: ['./src/bar.ts'],
        include: ['./*', './**/*', './src/**/*'],
      };
      const tsConfigIncludeAll = {
        include: ['./*', './**/*', './src/**/*'],
      };

      baseTests(tsConfigExcludeBar, tsConfigIncludeAll);
    },
  );
});

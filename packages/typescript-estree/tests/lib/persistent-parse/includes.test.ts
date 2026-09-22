import {
  baseTests,
  setupPersistentParseTests,
} from '../../test-utils/persistentParse';

setupPersistentParseTests();

describe('persistent parse', () => {
  describe.skipIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE === 'true')(
    'includes not ending in a slash',
    () => {
      const tsConfigExcludeBar = {
        exclude: ['./src/bar.ts'],
        include: ['src'],
      };
      const tsConfigIncludeAll = {
        exclude: [],
        include: ['src'],
      };

      baseTests(tsConfigExcludeBar, tsConfigIncludeAll);
    },
  );
});

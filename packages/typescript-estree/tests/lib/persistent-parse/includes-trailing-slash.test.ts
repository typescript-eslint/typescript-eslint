import {
  baseTests,
  setupPersistentParseTests,
} from '../../test-utils/persistentParse';

setupPersistentParseTests();

describe('persistent parse', () => {
  /*
  If the includes ends in a slash, typescript will ask for watchers ending in a slash.
  These tests ensure the normalization of code works as expected in this case.
  */
  describe.skipIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE === 'true')(
    'includes ending in a slash',
    () => {
      const tsConfigExcludeBar = {
        exclude: ['./src/bar.ts'],
        include: ['src/'],
      };
      const tsConfigIncludeAll = {
        exclude: [],
        include: ['src/'],
      };

      baseTests(tsConfigExcludeBar, tsConfigIncludeAll);
    },
  );
});

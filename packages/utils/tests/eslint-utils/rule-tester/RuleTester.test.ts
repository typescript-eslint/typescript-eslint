import * as parser from '@typescript-eslint/parser';
import { ESLint } from 'eslint';
import eslintPackageJson from 'eslint/package.json';
import semver from 'semver';

import * as dependencyConstraintsModule from '../../../src/eslint-utils/rule-tester/dependencyConstraints';
import { RuleTester } from '../../../src/eslint-utils/rule-tester/RuleTester';
import type { RuleModule } from '../../../src/ts-eslint';
import { RuleTester as BaseRuleTester } from '../../../src/ts-eslint';

// we can't spy on the exports of an ES module - so we instead have to mock the entire module
jest.mock('../../../src/eslint-utils/rule-tester/dependencyConstraints', () => {
  const dependencyConstraints = jest.requireActual<
    typeof dependencyConstraintsModule
  >('../../../src/eslint-utils/rule-tester/dependencyConstraints');

  return {
    ...dependencyConstraints,
    __esModule: true,
    satisfiesAllDependencyConstraints: jest.fn(
      dependencyConstraints.satisfiesAllDependencyConstraints,
    ),
  };
});
const satisfiesAllDependencyConstraintsMock = jest.mocked(
  dependencyConstraintsModule.satisfiesAllDependencyConstraints,
);

jest.mock(
  'totally-real-dependency/package.json',
  () => ({
    version: '10.0.0',
  }),
  {
    // this is not a real module that will exist
    virtual: true,
  },
);
jest.mock(
  'totally-real-dependency-prerelease/package.json',
  () => ({
    version: '10.0.0-rc.1',
  }),
  {
    // this is not a real module that will exist
    virtual: true,
  },
);

// mock the eslint package.json so that we can manipulate the version in the test
jest.mock('eslint/package.json', () => {
  return {
    // make the version a getter so we can spy on it and change the return value
    get version(): string {
      // fix the version so the test is stable on older ESLint versions
      return '8.0.0';
    },
  };
});

jest.mock('@typescript-eslint/parser', () => {
  return {
    __esModule: true,
    clearCaches: jest.fn(),
  };
});

/* eslint-disable jest/prefer-spy-on --
     need to specifically assign to the properties or else it will use the
     global value */
RuleTester.afterAll = jest.fn();
RuleTester.describe = jest.fn();
RuleTester.it = jest.fn();
RuleTester.itOnly = jest.fn();
/* eslint-enable jest/prefer-spy-on */

const mockedAfterAll = jest.mocked(RuleTester.afterAll);
const mockedDescribe = jest.mocked(RuleTester.describe);
const mockedIt = jest.mocked(RuleTester.it);
const _mockedItOnly = jest.mocked(RuleTester.itOnly);
const runSpy = jest.spyOn(BaseRuleTester.prototype, 'run');
const mockedParserClearCaches = jest.mocked(parser.clearCaches);

const eslintVersionSpy = jest.spyOn(eslintPackageJson, 'version', 'get');

beforeEach(() => {
  jest.clearAllMocks();
});

const NOOP_RULE: RuleModule<'error', []> = {
  meta: {
    messages: {
      error: 'error',
    },
    type: 'problem',
    schema: {},
  },
  defaultOptions: [],
  create() {
    return {};
  },
};

describe('RuleTester', () => {
  if (
    'version' in (ESLint as {}) &&
    semver.satisfies((ESLint as { version: string }).version, '>=8')
  ) {
    it('automatically sets the filename for tests', () => {
      const ruleTester = new RuleTester({
        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: 'tsconfig.json',
          tsconfigRootDir: '/some/path/that/totally/exists/',
        },
      });

      ruleTester.run('my-rule', NOOP_RULE, {
        invalid: [
          {
            code: 'invalid tests should work as well',
            errors: [],
          },
        ],
        valid: [
          'string based valid test',
          {
            code: 'object based valid test',
          },
          {
            code: "explicit filename shouldn't be overwritten",
            filename: '/set/in/the/test.ts',
          },
          {
            code: 'jsx should have the correct filename',
            parserOptions: {
              ecmaFeatures: {
                jsx: true,
              },
            },
          },
          {
            code: 'type-aware parser options should override the constructor config',
            parserOptions: {
              project: 'tsconfig.test-specific.json',
              tsconfigRootDir: '/set/in/the/test/',
            },
          },
        ],
      });

      expect(runSpy.mock.lastCall?.[2]).toMatchInlineSnapshot(`
      {
        "invalid": [
          {
            "code": "invalid tests should work as well",
            "errors": [],
            "filename": "/some/path/that/totally/exists/file.ts",
          },
        ],
        "valid": [
          {
            "code": "string based valid test",
            "filename": "/some/path/that/totally/exists/file.ts",
          },
          {
            "code": "object based valid test",
            "filename": "/some/path/that/totally/exists/file.ts",
          },
          {
            "code": "explicit filename shouldn't be overwritten",
            "filename": "/set/in/the/test.ts",
          },
          {
            "code": "jsx should have the correct filename",
            "filename": "/some/path/that/totally/exists/file.tsx",
            "parserOptions": {
              "ecmaFeatures": {
                "jsx": true,
              },
            },
          },
          {
            "code": "type-aware parser options should override the constructor config",
            "filename": "/set/in/the/test/file.ts",
            "parserOptions": {
              "project": "tsconfig.test-specific.json",
              "tsconfigRootDir": "/set/in/the/test/",
            },
          },
        ],
      }
    `);
    });

    it('schedules the parser caches to be cleared afterAll', () => {
      // it should schedule the afterAll
      expect(mockedAfterAll).toHaveBeenCalledTimes(0);
      const _ruleTester = new RuleTester({
        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: 'tsconfig.json',
          tsconfigRootDir: '/some/path/that/totally/exists/',
        },
      });
      expect(mockedAfterAll).toHaveBeenCalledTimes(1);

      // the provided callback should clear the caches
      const callback = mockedAfterAll.mock.calls[0][0];
      expect(typeof callback).toBe('function');
      expect(mockedParserClearCaches).not.toHaveBeenCalled();
      callback();
      expect(mockedParserClearCaches).toHaveBeenCalledTimes(1);
    });

    it('throws an error if you attempt to set the parser to ts-eslint at the test level', () => {
      const ruleTester = new RuleTester({
        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: 'tsconfig.json',
          tsconfigRootDir: '/some/path/that/totally/exists/',
        },
      });

      expect(() =>
        ruleTester.run('my-rule', NOOP_RULE, {
          valid: [
            {
              code: 'object based valid test',
              parser: '@typescript-eslint/parser',
            },
          ],

          invalid: [],
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Do not set the parser at the test level unless you want to use a parser other than @typescript-eslint/parser"`,
      );
    });

    describe('checks dependencies as specified', () => {
      it('does not check dependencies if there are no dependency constraints', () => {
        const ruleTester = new RuleTester({
          parser: '@typescript-eslint/parser',
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          valid: [
            'const x = 1;',
            { code: 'const x = 2;' },
            // empty object is ignored
            { code: 'const x = 3;', dependencyConstraints: {} },
          ],
          invalid: [],
        });

        expect(satisfiesAllDependencyConstraintsMock).not.toHaveBeenCalled();
      });

      describe('does not check dependencies if is an "only" manually set', () => {
        it('in the valid section', () => {
          const ruleTester = new RuleTester({
            parser: '@typescript-eslint/parser',
          });

          ruleTester.run('my-rule', NOOP_RULE, {
            valid: [
              'const x = 1;',
              { code: 'const x = 2;' },
              {
                code: 'const x = 3;',
                // eslint-disable-next-line eslint-plugin/no-only-tests -- intentional only for test purposes
                only: true,
              },
              {
                code: 'const x = 4;',
                dependencyConstraints: {
                  'totally-real-dependency': '999',
                },
              },
            ],
            invalid: [],
          });

          expect(satisfiesAllDependencyConstraintsMock).not.toHaveBeenCalled();
        });

        it('in the invalid section', () => {
          const ruleTester = new RuleTester({
            parser: '@typescript-eslint/parser',
          });

          ruleTester.run('my-rule', NOOP_RULE, {
            valid: [
              'const x = 1;',
              { code: 'const x = 2;' },
              {
                code: 'const x = 4;',
                dependencyConstraints: {
                  'totally-real-dependency': '999',
                },
              },
            ],
            invalid: [
              {
                code: 'const x = 3;',
                errors: [],
                // eslint-disable-next-line eslint-plugin/no-only-tests -- intentional only for test purposes
                only: true,
              },
            ],
          });

          expect(satisfiesAllDependencyConstraintsMock).not.toHaveBeenCalled();
        });
      });

      it('correctly handles string-based at-least', () => {
        const ruleTester = new RuleTester({
          parser: '@typescript-eslint/parser',
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [
            {
              code: 'failing - major',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': '999',
              },
            },
            {
              code: 'failing - major.minor',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': '999.0',
              },
            },
            {
              code: 'failing - major.minor.patch',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': '999.0.0',
              },
            },
          ],
          valid: [
            {
              code: 'passing - major',
              dependencyConstraints: {
                'totally-real-dependency': '10',
              },
            },
            {
              code: 'passing - major.minor',
              dependencyConstraints: {
                'totally-real-dependency': '10.0',
              },
            },
            {
              code: 'passing - major.minor.patch',
              dependencyConstraints: {
                'totally-real-dependency': '10.0.0',
              },
            },
          ],
        });

        expect(runSpy.mock.lastCall?.[2]).toMatchInlineSnapshot(`
        {
          "invalid": [
            {
              "code": "failing - major",
              "errors": [],
              "filename": "file.ts",
            },
            {
              "code": "failing - major.minor",
              "errors": [],
              "filename": "file.ts",
            },
            {
              "code": "failing - major.minor.patch",
              "errors": [],
              "filename": "file.ts",
            },
          ],
          "valid": [
            {
              "code": "passing - major",
              "filename": "file.ts",
            },
            {
              "code": "passing - major.minor",
              "filename": "file.ts",
            },
            {
              "code": "passing - major.minor.patch",
              "filename": "file.ts",
            },
          ],
        }
      `);
      });

      it('correctly handles object-based semver', () => {
        const ruleTester = new RuleTester({
          parser: '@typescript-eslint/parser',
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [
            {
              code: 'failing - major',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': {
                  range: '^999',
                },
              },
            },
            {
              code: 'failing - major.minor',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': {
                  range: '>=999.0',
                },
              },
            },

            {
              code: 'failing with options',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency-prerelease': {
                  range: '^10',
                  options: {
                    includePrerelease: false,
                  },
                },
              },
            },
          ],
          valid: [
            {
              code: 'passing - major',
              dependencyConstraints: {
                'totally-real-dependency': {
                  range: '^10',
                },
              },
            },
            {
              code: 'passing - major.minor',
              dependencyConstraints: {
                'totally-real-dependency': {
                  range: '<999',
                },
              },
            },
          ],
        });

        expect(runSpy.mock.lastCall?.[2]).toMatchInlineSnapshot(`
        {
          "invalid": [
            {
              "code": "failing - major",
              "errors": [],
              "filename": "file.ts",
            },
            {
              "code": "failing - major.minor",
              "errors": [],
              "filename": "file.ts",
            },
            {
              "code": "failing with options",
              "errors": [],
              "filename": "file.ts",
            },
          ],
          "valid": [
            {
              "code": "passing - major",
              "filename": "file.ts",
            },
            {
              "code": "passing - major.minor",
              "filename": "file.ts",
            },
          ],
        }
      `);
      });

      it('tests without versions should always be run', () => {
        const ruleTester = new RuleTester({
          parser: '@typescript-eslint/parser',
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [
            {
              code: 'no constraints is always run',
              errors: [],
            },
            {
              code: 'empty object is always run',
              errors: [],
              dependencyConstraints: {},
            },
            {
              code: 'failing constraint',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': '99999',
              },
            },
          ],
          valid: [
            'string based is always run',
            {
              code: 'no constraints is always run',
            },
            {
              code: 'empty object is always run',
              dependencyConstraints: {},
            },
            {
              code: 'passing constraint',
              dependencyConstraints: {
                'totally-real-dependency': '10',
              },
            },
          ],
        });

        expect(runSpy.mock.lastCall?.[2]).toMatchInlineSnapshot(`
        {
          "invalid": [
            {
              "code": "no constraints is always run",
              "errors": [],
              "filename": "file.ts",
            },
            {
              "code": "empty object is always run",
              "errors": [],
              "filename": "file.ts",
            },
            {
              "code": "failing constraint",
              "errors": [],
              "filename": "file.ts",
            },
          ],
          "valid": [
            {
              "code": "string based is always run",
              "filename": "file.ts",
            },
            {
              "code": "no constraints is always run",
              "filename": "file.ts",
            },
            {
              "code": "empty object is always run",
              "filename": "file.ts",
            },
            {
              "code": "passing constraint",
              "filename": "file.ts",
            },
          ],
        }
      `);
      });

      it('uses filter instead of "only" for old ESLint versions', () => {
        // need it twice because ESLint internally fetches this value once :(
        eslintVersionSpy.mockReturnValueOnce('1.0.0');
        eslintVersionSpy.mockReturnValueOnce('1.0.0');

        const ruleTester = new RuleTester({
          parser: '@typescript-eslint/parser',
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [
            {
              code: 'failing',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': '999',
              },
            },
            {
              code: 'passing',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': '10',
              },
            },
          ],
          valid: [
            'always passing string test',
            {
              code: 'failing',
              dependencyConstraints: {
                'totally-real-dependency': '999',
              },
            },
            {
              code: 'passing',
              dependencyConstraints: {
                'totally-real-dependency': '10',
              },
            },
          ],
        });

        expect(runSpy.mock.lastCall?.[2]).toMatchInlineSnapshot(`
        {
          "invalid": [
            {
              "code": "failing",
              "errors": [],
              "filename": "file.ts",
            },
            {
              "code": "passing",
              "errors": [],
              "filename": "file.ts",
            },
          ],
          "valid": [
            {
              "code": "always passing string test",
              "filename": "file.ts",
            },
            {
              "code": "failing",
              "filename": "file.ts",
            },
            {
              "code": "passing",
              "filename": "file.ts",
            },
          ],
        }
      `);
      });

      describe('constructor constraints', () => {
        it('skips all tests if a constructor constraint is not satisifed', () => {
          const ruleTester = new RuleTester({
            parser: '@typescript-eslint/parser',
            dependencyConstraints: {
              'totally-real-dependency': '999',
            },
          });

          ruleTester.run('my-rule', NOOP_RULE, {
            invalid: [
              {
                code: 'failing - major',
                errors: [],
              },
            ],
            valid: [
              {
                code: 'passing - major',
              },
            ],
          });

          // trigger the describe block
          expect(mockedDescribe.mock.calls.length).toBeGreaterThanOrEqual(1);
          mockedDescribe.mock.lastCall?.[1]();
          expect(mockedDescribe.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "my-rule",
              [Function],
            ],
          ]
        `);
          expect(mockedIt.mock.lastCall).toMatchInlineSnapshot(`
          [
            "All tests skipped due to unsatisfied constructor dependency constraints",
            [Function],
          ]
        `);
        });

        it('does not skip all tests if a constructor constraint is satisifed', () => {
          const ruleTester = new RuleTester({
            parser: '@typescript-eslint/parser',
            dependencyConstraints: {
              'totally-real-dependency': '10',
            },
          });

          ruleTester.run('my-rule', NOOP_RULE, {
            invalid: [
              {
                code: 'valid',
                errors: [],
              },
            ],
            valid: [
              {
                code: 'valid',
              },
            ],
          });

          // trigger the describe block
          expect(mockedDescribe.mock.calls.length).toBeGreaterThanOrEqual(1);
          mockedDescribe.mock.lastCall?.[1]();
          expect(mockedDescribe.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "my-rule",
              [Function],
            ],
            [
              "valid",
              [Function],
            ],
            [
              "invalid",
              [Function],
            ],
          ]
        `);
          // expect(mockedIt.mock.lastCall).toMatchInlineSnapshot(`undefined`);
        });
      });
    });
  } else {
    it('exists', () => {
      expect(RuleTester).toBeTruthy();
    });
  }
});

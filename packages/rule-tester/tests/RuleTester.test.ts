import * as parser from '@typescript-eslint/parser';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleModule } from '@typescript-eslint/utils/ts-eslint';

import * as dependencyConstraintsModule from '../src/utils/dependencyConstraints';
import { RuleTester } from '../src/RuleTester';
import type { RuleTesterTestFrameworkFunctionBase } from '../src/TestFramework';

// we can't spy on the exports of an ES module - so we instead have to mock the entire module
jest.mock('../src/dependencyConstraints', () => {
  const dependencyConstraints = jest.requireActual<
    typeof dependencyConstraintsModule
  >('../src/dependencyConstraints');

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

jest.mock('@typescript-eslint/parser', () => {
  const actualParser = jest.requireActual<typeof parser>(
    '@typescript-eslint/parser',
  );
  return {
    ...actualParser,
    __esModule: true,
    clearCaches: jest.fn(),
  };
});

/* eslint-disable jest/prefer-spy-on --
     we need to specifically assign to the properties or else it will use the
     global value and register actual tests! */
const IMMEDIATE_CALLBACK: RuleTesterTestFrameworkFunctionBase = (_, cb) => cb();
RuleTester.afterAll =
  jest.fn(/* intentionally don't immediate callback here */);
RuleTester.describe = jest.fn(IMMEDIATE_CALLBACK);
RuleTester.describeSkip = jest.fn(IMMEDIATE_CALLBACK);
RuleTester.it = jest.fn(IMMEDIATE_CALLBACK);
RuleTester.itOnly = jest.fn(IMMEDIATE_CALLBACK);
RuleTester.itSkip = jest.fn(IMMEDIATE_CALLBACK);
/* eslint-enable jest/prefer-spy-on */

const mockedAfterAll = jest.mocked(RuleTester.afterAll);
const mockedDescribe = jest.mocked(RuleTester.describe);
const mockedDescribeSkip = jest.mocked(RuleTester.describeSkip);
const mockedIt = jest.mocked(RuleTester.it);
const _mockedItOnly = jest.mocked(RuleTester.itOnly);
const _mockedItSkip = jest.mocked(RuleTester.itSkip);
const runRuleForItemSpy = jest.spyOn(
  RuleTester.prototype,
  // @ts-expect-error -- method is private
  'runRuleForItem',
) as jest.SpiedFunction<RuleTester['runRuleForItem']>;
const mockedParserClearCaches = jest.mocked(parser.clearCaches);

const EMPTY_PROGRAM: TSESTree.Program = {
  type: AST_NODE_TYPES.Program,
  body: [],
  comments: [],
  loc: { end: { column: 0, line: 0 }, start: { column: 0, line: 0 } },
  sourceType: 'module',
  tokens: [],
  range: [0, 0],
};
runRuleForItemSpy.mockImplementation((_1, _2, testCase) => {
  return {
    messages:
      'errors' in testCase
        ? [
            {
              column: 0,
              line: 0,
              message: 'error',
              messageId: 'error',
              nodeType: AST_NODE_TYPES.Program,
              ruleId: 'my-rule',
              severity: 2,
              source: null,
            },
          ]
        : [],
    output: testCase.code,
    afterAST: EMPTY_PROGRAM,
    beforeAST: EMPTY_PROGRAM,
  };
});

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

function getTestConfigFromCall(): unknown[] {
  return runRuleForItemSpy.mock.calls.map(c => c[2]);
}

describe('RuleTester', () => {
  describe('filenames', () => {
    it('automatically sets the filename for tests', () => {
      const ruleTester = new RuleTester({
        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: 'tsconfig.json',
          tsconfigRootDir: '/some/path/that/totally/exists/',
        },
      });

      ruleTester.run('my-rule', NOOP_RULE, {
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
        invalid: [
          {
            code: 'invalid tests should work as well',
            errors: [{ messageId: 'error' }],
          },
        ],
      });

      expect(getTestConfigFromCall()).toMatchInlineSnapshot(`
        [
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
            "filename": "/some/path/that/totally/exists/react.tsx",
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
          {
            "code": "invalid tests should work as well",
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "/some/path/that/totally/exists/file.ts",
          },
        ]
      `);
    });

    it('allows the automated filenames to be overridden in the constructor', () => {
      const ruleTester = new RuleTester({
        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: 'tsconfig.json',
          tsconfigRootDir: '/some/path/that/totally/exists/',
        },
        defaultFilenames: {
          ts: 'set-in-constructor.ts',
          tsx: 'react-set-in-constructor.tsx',
        },
      });

      ruleTester.run('my-rule', NOOP_RULE, {
        valid: [
          {
            code: 'normal',
          },
          {
            code: 'jsx',
            parserOptions: {
              ecmaFeatures: {
                jsx: true,
              },
            },
          },
        ],
        invalid: [],
      });

      expect(getTestConfigFromCall()).toMatchInlineSnapshot(`
        [
          {
            "code": "normal",
            "filename": "/some/path/that/totally/exists/set-in-constructor.ts",
          },
          {
            "code": "jsx",
            "filename": "/some/path/that/totally/exists/react-set-in-constructor.tsx",
            "parserOptions": {
              "ecmaFeatures": {
                "jsx": true,
              },
            },
          },
        ]
      `);
    });
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
      `"Do not set the parser at the test level unless you want to use a parser other than "@typescript-eslint/parser""`,
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
              errors: [{ messageId: 'error' }],
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
        invalid: [
          {
            code: 'failing - major',
            errors: [{ messageId: 'error' }],
            dependencyConstraints: {
              'totally-real-dependency': '999',
            },
          },
          {
            code: 'failing - major.minor',
            errors: [{ messageId: 'error' }],
            dependencyConstraints: {
              'totally-real-dependency': '999.0',
            },
          },
          {
            code: 'failing - major.minor.patch',
            errors: [{ messageId: 'error' }],
            dependencyConstraints: {
              'totally-real-dependency': '999.0.0',
            },
          },
        ],
      });

      expect(getTestConfigFromCall()).toMatchInlineSnapshot(`
        [
          {
            "code": "passing - major",
            "dependencyConstraints": {
              "totally-real-dependency": "10",
            },
            "filename": "file.ts",
            "skip": false,
          },
          {
            "code": "passing - major.minor",
            "dependencyConstraints": {
              "totally-real-dependency": "10.0",
            },
            "filename": "file.ts",
            "skip": false,
          },
          {
            "code": "passing - major.minor.patch",
            "dependencyConstraints": {
              "totally-real-dependency": "10.0.0",
            },
            "filename": "file.ts",
            "skip": false,
          },
          {
            "code": "failing - major",
            "dependencyConstraints": {
              "totally-real-dependency": "999",
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "skip": true,
          },
          {
            "code": "failing - major.minor",
            "dependencyConstraints": {
              "totally-real-dependency": "999.0",
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "skip": true,
          },
          {
            "code": "failing - major.minor.patch",
            "dependencyConstraints": {
              "totally-real-dependency": "999.0.0",
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "skip": true,
          },
        ]
      `);
    });

    it('correctly handles object-based semver', () => {
      const ruleTester = new RuleTester({
        parser: '@typescript-eslint/parser',
      });

      ruleTester.run('my-rule', NOOP_RULE, {
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
        invalid: [
          {
            code: 'failing - major',
            errors: [{ messageId: 'error' }],
            dependencyConstraints: {
              'totally-real-dependency': {
                range: '^999',
              },
            },
          },
          {
            code: 'failing - major.minor',
            errors: [{ messageId: 'error' }],
            dependencyConstraints: {
              'totally-real-dependency': {
                range: '>=999.0',
              },
            },
          },

          {
            code: 'failing with options',
            errors: [{ messageId: 'error' }],
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
      });

      expect(getTestConfigFromCall()).toMatchInlineSnapshot(`
        [
          {
            "code": "passing - major",
            "dependencyConstraints": {
              "totally-real-dependency": {
                "range": "^10",
              },
            },
            "filename": "file.ts",
            "skip": false,
          },
          {
            "code": "passing - major.minor",
            "dependencyConstraints": {
              "totally-real-dependency": {
                "range": "<999",
              },
            },
            "filename": "file.ts",
            "skip": false,
          },
          {
            "code": "failing - major",
            "dependencyConstraints": {
              "totally-real-dependency": {
                "range": "^999",
              },
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "skip": true,
          },
          {
            "code": "failing - major.minor",
            "dependencyConstraints": {
              "totally-real-dependency": {
                "range": ">=999.0",
              },
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "skip": true,
          },
          {
            "code": "failing with options",
            "dependencyConstraints": {
              "totally-real-dependency-prerelease": {
                "options": {
                  "includePrerelease": false,
                },
                "range": "^10",
              },
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "skip": true,
          },
        ]
      `);
    });

    it('tests without versions should always be run', () => {
      const ruleTester = new RuleTester({
        parser: '@typescript-eslint/parser',
      });

      ruleTester.run('my-rule', NOOP_RULE, {
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
        invalid: [
          {
            code: 'no constraints is always run',
            errors: [{ messageId: 'error' }],
          },
          {
            code: 'empty object is always run',
            errors: [{ messageId: 'error' }],
            dependencyConstraints: {},
          },
          {
            code: 'failing constraint',
            errors: [{ messageId: 'error' }],
            dependencyConstraints: {
              'totally-real-dependency': '99999',
            },
          },
        ],
      });

      expect(getTestConfigFromCall()).toMatchInlineSnapshot(`
        [
          {
            "code": "string based is always run",
            "filename": "file.ts",
            "skip": false,
          },
          {
            "code": "no constraints is always run",
            "filename": "file.ts",
            "skip": false,
          },
          {
            "code": "empty object is always run",
            "dependencyConstraints": {},
            "filename": "file.ts",
            "skip": false,
          },
          {
            "code": "passing constraint",
            "dependencyConstraints": {
              "totally-real-dependency": "10",
            },
            "filename": "file.ts",
            "skip": false,
          },
          {
            "code": "no constraints is always run",
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "skip": false,
          },
          {
            "code": "empty object is always run",
            "dependencyConstraints": {},
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "skip": false,
          },
          {
            "code": "failing constraint",
            "dependencyConstraints": {
              "totally-real-dependency": "99999",
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "skip": true,
          },
        ]
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
          valid: [
            {
              code: 'passing - major',
            },
          ],
          invalid: [
            {
              code: 'failing - major',
              errors: [{ messageId: 'error' }],
            },
          ],
        });

        // trigger the describe block
        expect(mockedDescribeSkip.mock.calls).toHaveLength(1);
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
          valid: [
            {
              code: 'valid',
            },
          ],
          invalid: [
            {
              code: 'invalid',
              errors: [{ messageId: 'error' }],
            },
          ],
        });

        // trigger the describe block
        expect(mockedDescribe.mock.calls).toHaveLength(3);
        expect(mockedDescribeSkip.mock.calls).toHaveLength(0);
        // expect(mockedIt.mock.lastCall).toMatchInlineSnapshot(`undefined`);
      });
    });
  });
});

import rule from '../../src/rules/no-unnecessary-boolean-literal-compare';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-unnecessary-boolean-literal-compare', rule, {
  valid: [
    `
      declare const varAny: any;
      varAny === true;
    `,
    `
      declare const varAny: any;
      varAny == false;
    `,
    `
      declare const varString: string;
      varString === false;
    `,
    `
      declare const varString: string;
      varString === true;
    `,
    `
      declare const varObject: {};
      varObject === true;
    `,
    `
      declare const varObject: {};
      varObject == false;
    `,
    `
      declare const varBooleanOrString: boolean | undefined;
      varBooleanOrString === false;
    `,
    `
      declare const varBooleanOrString: boolean | undefined;
      varBooleanOrString == true;
    `,
    `
      declare const varBooleanOrUndefined: boolean | undefined;
      varBooleanOrUndefined === true;
    `,
    "'false' === true;",
    "'true' === false;",
  ],

  invalid: [
    {
      code: 'true === true;',
      errors: [
        {
          messageId: 'direct',
        },
      ],
      output: 'true;',
    },
    {
      code: 'false !== true;',
      errors: [
        {
          messageId: 'negated',
        },
      ],
      output: '!false;',
    },
    {
      code: `
        declare const varBoolean: boolean;
        if (varBoolean !== false) {
        }
      `,
      errors: [
        {
          messageId: 'negated',
        },
      ],
      output: `
        declare const varBoolean: boolean;
        if (varBoolean) {
        }
      `,
    },
    {
      code: `
        declare const varTrue: true;
        if (varTrue !== true) {
        }
      `,
      errors: [
        {
          messageId: 'negated',
        },
      ],
      output: `
        declare const varTrue: true;
        if (!varTrue) {
        }
      `,
    },
  ],
});

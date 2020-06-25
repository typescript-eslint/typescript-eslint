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
      declare const varNullOrUndefined: null | undefined;
      varNullOrUndefined === false;
    `,
    `
      declare const varBooleanOrString: boolean | string;
      varBooleanOrString === false;
    `,
    `
      declare const varBooleanOrString: boolean | string;
      varBooleanOrString == true;
    `,
    `
      declare const varTrueOrStringOrUndefined: true | string | undefined;
      varTrueOrStringOrUndefined == true;
    `,
    `
      declare const varBooleanOrUndefined: boolean | undefined;
      varBooleanOrUndefined === true;
    `,
    {
      code: `
        declare const varBooleanOrUndefined: boolean | undefined;
        varBooleanOrUndefined === true;
      `,
      options: [{ allowComparingNullableBooleansToFalse: false }],
    },
    {
      code: `
        declare const varBooleanOrUndefined: boolean | undefined;
        varBooleanOrUndefined === false;
      `,
      options: [{ allowComparingNullableBooleansToTrue: false }],
    },
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
    {
      code: `
        declare const varTrueOrUndefined: true | undefined;
        if (varTrueOrUndefined === true) {
        }
      `,
      options: [{ allowComparingNullableBooleansToTrue: false }],
      errors: [
        {
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      output: `
        declare const varTrueOrUndefined: true | undefined;
        if (varTrueOrUndefined) {
        }
      `,
    },
    {
      code: `
        declare const varFalseOrNull: false | null;
        if (varFalseOrNull !== true) {
        }
      `,
      options: [{ allowComparingNullableBooleansToTrue: false }],
      errors: [
        {
          messageId: 'comparingNullableToTrueNegated',
        },
      ],
      output: `
        declare const varFalseOrNull: false | null;
        if (!varFalseOrNull) {
        }
      `,
    },
    {
      code: `
        declare const varBooleanOrNull: boolean | null;
        declare const otherBoolean: boolean;
        if (varBooleanOrNull === false && otherBoolean) {
        }
      `,
      options: [{ allowComparingNullableBooleansToFalse: false }],
      errors: [
        {
          messageId: 'comparingNullableToFalse',
        },
      ],
      output: `
        declare const varBooleanOrNull: boolean | null;
        declare const otherBoolean: boolean;
        if (!(varBooleanOrNull ?? true) && otherBoolean) {
        }
      `,
    },
    {
      code: `
        declare const varBooleanOrNull: boolean | null;
        declare const otherBoolean: boolean;
        if (!(varBooleanOrNull === false) || otherBoolean) {
        }
      `,
      options: [{ allowComparingNullableBooleansToFalse: false }],
      errors: [
        {
          messageId: 'comparingNullableToFalse',
        },
      ],
      output: `
        declare const varBooleanOrNull: boolean | null;
        declare const otherBoolean: boolean;
        if ((varBooleanOrNull ?? true) || otherBoolean) {
        }
      `,
    },
    {
      code: `
        declare const varTrueOrFalseOrUndefined: true | false | undefined;
        declare const otherBoolean: boolean;
        if (varTrueOrFalseOrUndefined !== false && !otherBoolean) {
        }
      `,
      options: [{ allowComparingNullableBooleansToFalse: false }],
      errors: [
        {
          messageId: 'comparingNullableToFalse',
        },
      ],
      output: `
        declare const varTrueOrFalseOrUndefined: true | false | undefined;
        declare const otherBoolean: boolean;
        if ((varTrueOrFalseOrUndefined ?? true) && !otherBoolean) {
        }
      `,
    },
  ],
});

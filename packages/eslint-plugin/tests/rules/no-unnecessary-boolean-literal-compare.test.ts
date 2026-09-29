import { noFormat } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

import rule from '../../src/rules/no-unnecessary-boolean-literal-compare';
import { createRuleTesterWithTypes, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-unnecessary-boolean-literal-compare', rule, {
  assertionOptions: {
    requireData: true,
  },
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
const test: <T>(someCondition: T) => void = someCondition => {
  if (someCondition === true) {
  }
};
    `,
    `
const test: <T>(someCondition: boolean | string) => void = someCondition => {
  if (someCondition === true) {
  }
};
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
    {
      code: `
const test: <T extends boolean | undefined>(
  someCondition: T,
) => void = someCondition => {
  if (someCondition === true) {
  }
};
      `,
      options: [{ allowComparingNullableBooleansToFalse: false }],
    },
    {
      code: `
const test: <T extends boolean | undefined>(
  someCondition: T,
) => void = someCondition => {
  if (someCondition === false) {
  }
};
      `,
      options: [{ allowComparingNullableBooleansToTrue: false }],
    },
    "'false' === true;",
    "'true' === false;",
    `
const unconstrained: <T>(someCondition: T) => void = someCondition => {
  if (someCondition === true) {
  }
};
    `,
    `
const extendsUnknown: <T extends unknown>(
  someCondition: T,
) => void = someCondition => {
  if (someCondition === true) {
  }
};
    `,
    {
      code: `
function test(a?: boolean): boolean {
  // eslint-disable-next-line
  return a !== false;
}
      `,
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootDir, 'unstrict'),
        },
      },
      options: [
        {
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: true,
        },
      ],
    },
  ],

  invalid: [
    {
      code: 'true === true;',
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'direct',
        },
      ],
      output: 'true;',
    },
    {
      code: 'false !== true;',
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 1,
          line: 1,
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
          column: 5,
          endColumn: 25,
          endLine: 3,
          line: 3,
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
          column: 5,
          endColumn: 21,
          endLine: 3,
          line: 3,
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
      errors: [
        {
          column: 5,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
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
      errors: [
        {
          column: 5,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'comparingNullableToTrueNegated',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const varFalseOrNull: false | null;
if (!varFalseOrNull) {
}
      `,
    },
    {
      code: `
const isTrue = (x: boolean | undefined): boolean => x === true;
      `,
      errors: [
        {
          column: 53,
          endColumn: 63,
          endLine: 2,
          line: 2,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
const isTrue = (x: boolean | undefined): boolean => x ?? false;
      `,
    },
    {
      code: `
function isTrue(x: boolean | undefined): boolean {
  return x === true;
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
function isTrue(x: boolean | undefined): boolean {
  return x ?? false;
}
      `,
    },
    {
      code: `
declare const x: boolean | undefined;
const value: boolean = x === true;
      `,
      errors: [
        {
          column: 24,
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;
const value: boolean = x ?? false;
      `,
    },
    {
      code: `
declare const x: boolean | undefined;
declare function acceptsBoolean(value: boolean): void;

acceptsBoolean(x === true);
      `,
      errors: [
        {
          column: 16,
          endColumn: 26,
          endLine: 5,
          line: 5,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;
declare function acceptsBoolean(value: boolean): void;

acceptsBoolean(x ?? false);
      `,
    },
    {
      code: `
declare const x: boolean | undefined;

if (x === true) {
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;

if (x) {
}
      `,
    },
    {
      code: `
declare const x: boolean | undefined;

while (x === true) {}
      `,
      errors: [
        {
          column: 8,
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;

while (x) {}
      `,
    },
    {
      code: `
declare const x: boolean | undefined;

do {} while (x === true);
      `,
      errors: [
        {
          column: 14,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;

do {} while (x);
      `,
    },
    {
      code: `
declare const x: boolean | undefined;

for (; x === true;) {}
      `,
      errors: [
        {
          column: 8,
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;

for (; x;) {}
      `,
    },
    {
      code: `
declare const x: boolean | undefined;

const value = x === true ? 'true' : 'false';
      `,
      errors: [
        {
          column: 15,
          endColumn: 25,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;

const value = x ? 'true' : 'false';
      `,
    },
    {
      code: `
declare const condition: boolean;
declare const x: boolean | undefined;

const value = condition ? x === true : false;
      `,
      errors: [
        {
          column: 27,
          endColumn: 37,
          endLine: 5,
          line: 5,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const condition: boolean;
declare const x: boolean | undefined;

const value = condition ? (x ?? false) : false;
      `,
    },
    {
      code: `
declare const x: boolean | undefined;
declare const other: boolean;

if (other && x === true) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 24,
          endLine: 5,
          line: 5,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;
declare const other: boolean;

if (other && x) {
}
      `,
    },
    {
      code: `
declare const x: boolean | undefined;
declare const other: boolean;

const value: boolean = other && x === true;
      `,
      errors: [
        {
          column: 33,
          endColumn: 43,
          endLine: 5,
          line: 5,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;
declare const other: boolean;

const value: boolean = other && (x ?? false);
      `,
    },
    {
      code: `
declare const x: boolean | undefined;
declare const other: boolean;

const value: boolean = (x && other) === true;
      `,
      errors: [
        {
          column: 24,
          endColumn: 45,
          endLine: 5,
          line: 5,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;
declare const other: boolean;

const value: boolean = (x && other) ?? false;
      `,
    },
    {
      code: `
declare const x: boolean | undefined;
declare const other: boolean;

const value: boolean = (x && other) === false;
      `,
      errors: [
        {
          column: 24,
          endColumn: 46,
          endLine: 5,
          line: 5,
          messageId: 'comparingNullableToFalse',
        },
      ],
      options: [{ allowComparingNullableBooleansToFalse: false }],
      output: `
declare const x: boolean | undefined;
declare const other: boolean;

const value: boolean = !((x && other) ?? true);
      `,
    },
    {
      code: `
declare const x: boolean | undefined;

const value: boolean = true === x;
      `,
      errors: [
        {
          column: 24,
          endColumn: 34,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;

const value: boolean = x ?? false;
      `,
    },
    {
      code: `
declare const x: boolean | undefined;

const value: boolean = x !== true;
      `,
      errors: [
        {
          column: 24,
          endColumn: 34,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToTrueNegated',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;

const value: boolean = !x;
      `,
    },
    {
      code: `
declare const x: boolean | undefined;

const value: boolean = x != true;
      `,
      errors: [
        {
          column: 24,
          endColumn: 33,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToTrueNegated',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;

const value: boolean = !x;
      `,
    },
    {
      code: `
declare const x: boolean | undefined;

const value: boolean = !(x === true);
      `,
      errors: [
        {
          column: 26,
          endColumn: 36,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;

const value: boolean = !x;
      `,
    },
    {
      code: `
declare const x: boolean | undefined;

const value: boolean = !(x !== true);
      `,
      errors: [
        {
          column: 26,
          endColumn: 36,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToTrueNegated',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;

const value: boolean = x ?? false;
      `,
    },
    {
      code: `
declare const varBooleanOrNull: boolean | null;
declare const otherBoolean: boolean;
if (varBooleanOrNull === false && otherBoolean) {
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToFalse',
        },
      ],
      options: [{ allowComparingNullableBooleansToFalse: false }],
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
      errors: [
        {
          column: 7,
          endColumn: 33,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToFalse',
        },
      ],
      options: [{ allowComparingNullableBooleansToFalse: false }],
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
      errors: [
        {
          column: 5,
          endColumn: 40,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToFalse',
        },
      ],
      options: [{ allowComparingNullableBooleansToFalse: false }],
      output: `
declare const varTrueOrFalseOrUndefined: true | false | undefined;
declare const otherBoolean: boolean;
if ((varTrueOrFalseOrUndefined ?? true) && !otherBoolean) {
}
      `,
    },
    {
      code: `
declare const varBoolean: boolean;
if (false !== varBoolean) {
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 25,
          endLine: 3,
          line: 3,
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
declare const varBoolean: boolean;
if (true !== varBoolean) {
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'negated',
        },
      ],
      output: `
declare const varBoolean: boolean;
if (!varBoolean) {
}
      `,
    },
    {
      code: noFormat`
        declare const x;
        if ((x instanceof Error) === false) {
        }
      `,
      errors: [
        {
          column: 13,
          endColumn: 43,
          endLine: 3,
          line: 3,
          messageId: 'direct',
        },
      ],
      output: `
        declare const x;
        if (!(x instanceof Error)) {
        }
      `,
    },
    {
      code: noFormat`
        declare const x;
        if (false === (x instanceof Error)) {
        }
      `,
      errors: [
        {
          column: 13,
          endColumn: 43,
          endLine: 3,
          line: 3,
          messageId: 'direct',
        },
      ],
      output: `
        declare const x;
        if (!(x instanceof Error)) {
        }
      `,
    },
    {
      code: `
declare const x;
if (x instanceof Error === false) {
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'direct',
        },
      ],
      output: `
declare const x;
if (!(x instanceof Error)) {
}
      `,
    },
    {
      code: noFormat`
        declare const x;
        if (typeof x === 'string' === false) {
        }
      `,
      errors: [
        {
          column: 13,
          endColumn: 44,
          endLine: 3,
          line: 3,
          messageId: 'direct',
        },
      ],
      output: `
        declare const x;
        if (!(typeof x === 'string')) {
        }
      `,
    },
    {
      code: noFormat`
        declare const x;
        if (x instanceof Error === (false)) {
        }
      `,
      errors: [
        {
          column: 13,
          endColumn: 43,
          endLine: 3,
          line: 3,
          messageId: 'direct',
        },
      ],
      output: `
        declare const x;
        if (!(x instanceof Error)) {
        }
      `,
    },
    {
      code: noFormat`
        declare const x;
        if ((false) === x instanceof Error) {
        }
      `,
      errors: [
        {
          column: 13,
          endColumn: 43,
          endLine: 3,
          line: 3,
          messageId: 'direct',
        },
      ],
      output: `
        declare const x;
        if (!(x instanceof Error)) {
        }
      `,
    },
    {
      code: `
declare const varBoolean: boolean;
if (!(varBoolean !== false)) {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'negated',
        },
      ],
      output: `
declare const varBoolean: boolean;
if (!varBoolean) {
}
      `,
    },
    {
      code: `
declare const varBoolean: boolean;
if (!(varBoolean === false)) {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'direct',
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
declare const varBoolean: boolean;
if (!(varBoolean instanceof Event == false)) {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 43,
          endLine: 3,
          line: 3,
          messageId: 'direct',
        },
      ],
      output: `
declare const varBoolean: boolean;
if (varBoolean instanceof Event) {
}
      `,
    },
    {
      code: `
declare const varBoolean: boolean;
if (varBoolean instanceof Event == false) {
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 41,
          endLine: 3,
          line: 3,
          messageId: 'direct',
        },
      ],
      output: `
declare const varBoolean: boolean;
if (!(varBoolean instanceof Event)) {
}
      `,
    },
    {
      code: `
declare const varBoolean: boolean;
if (!((varBoolean ?? false) !== false)) {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'negated',
        },
      ],
      output: `
declare const varBoolean: boolean;
if (!(varBoolean ?? false)) {
}
      `,
    },
    {
      code: `
declare const varBoolean: boolean;
if (!((varBoolean ?? false) === false)) {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'direct',
        },
      ],
      output: `
declare const varBoolean: boolean;
if (varBoolean ?? false) {
}
      `,
    },
    {
      code: `
declare const varBoolean: boolean;
if (!((varBoolean ?? true) !== false)) {
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'negated',
        },
      ],
      output: `
declare const varBoolean: boolean;
if (!(varBoolean ?? true)) {
}
      `,
    },
    {
      code: `
const test: <T extends boolean>(someCondition: T) => void = someCondition => {
  if (someCondition === true) {
  }
};
      `,
      errors: [
        {
          column: 7,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'direct',
        },
      ],
      output: `
const test: <T extends boolean>(someCondition: T) => void = someCondition => {
  if (someCondition) {
  }
};
      `,
    },
    {
      code: `
const test: <T extends boolean>(someCondition: T) => void = someCondition => {
  if (!(someCondition !== false)) {
  }
};
      `,
      errors: [
        {
          column: 9,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'negated',
        },
      ],
      output: `
const test: <T extends boolean>(someCondition: T) => void = someCondition => {
  if (!someCondition) {
  }
};
      `,
    },
    {
      code: `
const test: <T extends boolean>(someCondition: T) => void = someCondition => {
  if (!((someCondition ?? true) !== false)) {
  }
};
      `,
      errors: [
        {
          column: 9,
          endColumn: 42,
          endLine: 3,
          line: 3,
          messageId: 'negated',
        },
      ],
      output: `
const test: <T extends boolean>(someCondition: T) => void = someCondition => {
  if (!(someCondition ?? true)) {
  }
};
      `,
    },
    {
      code: `
function foo(): boolean {}
      `,
      errors: [
        {
          column: 1,
          endColumn: 1,
          endLine: 0,
          line: 0,
          messageId: 'noStrictNullCheck',
        },
      ],
      languageOptions: {
        parserOptions: { tsconfigRootDir: path.join(rootDir, 'unstrict') },
      },
      options: [
        { allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false },
      ],
    },
    {
      code: `
declare const a: boolean;
declare const b: boolean;
declare const c: boolean;
(a || b) === true && c;
      `,
      errors: [
        {
          column: 1,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'direct',
        },
      ],
      output: `
declare const a: boolean;
declare const b: boolean;
declare const c: boolean;
(a || b) && c;
      `,
    },
    {
      code: `
declare const x: boolean | undefined;
x === true;
      `,
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;
x ?? false;
      `,
    },
    {
      code: `
declare const x: boolean | undefined;
declare const y: boolean | undefined;
(x || y) === true;
      `,
      errors: [
        {
          column: 1,
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'comparingNullableToTrueDirect',
        },
      ],
      options: [{ allowComparingNullableBooleansToTrue: false }],
      output: `
declare const x: boolean | undefined;
declare const y: boolean | undefined;
(x || y) ?? false;
      `,
    },
  ],
});

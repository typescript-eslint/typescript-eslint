import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('prefer-optional-chain-ternary', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
declare const foo: { bar: number } | null;
foo == null ? null : foo.bar;
    `,
    `
declare const foo: { bar: number } | null;
foo === null ? undefined : foo.bar;
    `,
    `
declare const foo: { bar: number } | null;
declare const other: { bar: number };
foo == null ? undefined : other.bar;
    `,
    `
declare const foo: { bar: number } | null;
foo == null ? undefined : foo;
    `,
    `
declare const foo: { bar: number } | null;
foo != null ? undefined : foo.bar;
    `,
    `
declare const foo: { bar: { baz: number } | null; qux: number };
foo.bar == null ? undefined : foo.qux;
    `,
    `
declare const foo: { bar: number } | null;
foo == null ? undefined : foo.bar + 1;
    `,
    `
declare const foo: { bar: number } | null;
declare const other: { bar: number } | null;
foo == other ? undefined : foo.bar;
    `,
  ],
  invalid: [
    {
      code: `
declare const foo: { bar: number } | null;
foo == null ? undefined : foo.bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number } | null;
foo?.bar;
      `,
    },
    {
      code: `
declare const foo: { bar: number } | undefined;
foo == undefined ? undefined : foo.bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number } | undefined;
foo?.bar;
      `,
    },
    {
      code: `
declare const foo: { bar: number } | null;
null == foo ? undefined : foo.bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number } | null;
foo?.bar;
      `,
    },
    {
      code: `
declare const foo: { bar: number } | null;
foo != null ? foo.bar : undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number } | null;
foo?.bar;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: number } } | null;
foo == null ? undefined : foo.bar.baz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz: number } } | null;
foo?.bar.baz;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz(): number } | null };
foo.bar == null ? undefined : foo.bar.baz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz(): number } | null };
foo.bar?.baz();
      `,
    },
    {
      code: `
declare const foo: Record<string, number> | null;
declare const key: string;
foo == null ? undefined : foo[key];
      `,
      errors: [
        {
          column: 1,
          endColumn: 35,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: Record<string, number> | null;
declare const key: string;
foo?.[key];
      `,
    },
    {
      code: `
declare const foo: (() => number) | null;
foo == null ? undefined : foo();
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: (() => number) | null;
foo?.();
      `,
    },
    {
      code: `
declare const foo: (<T>(value: T) => T) | null;
foo == null ? undefined : foo<string>('a');
      `,
      errors: [
        {
          column: 1,
          endColumn: 43,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: (<T>(value: T) => T) | null;
foo?.<string>('a');
      `,
    },
    {
      code: `
declare const foo: { bar?: { baz: number } } | null;
foo == null ? undefined : foo.bar?.baz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar?: { baz: number } } | null;
foo?.bar?.baz;
      `,
    },
    {
      code: `
declare const foo: { bar: number } | null;
foo == null ? undefined : foo?.bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number } | null;
foo?.bar;
      `,
    },
    {
      code: `
class Foo {
  foo: { bar: number } | undefined;
  method() {
    return this.foo == null ? undefined : this.foo.bar;
  }
}
      `,
      errors: [
        {
          column: 12,
          endColumn: 55,
          endLine: 5,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
class Foo {
  foo: { bar: number } | undefined;
  method() {
    return this.foo?.bar;
  }
}
      `,
    },
    {
      code: `
declare const foo: { bar: number } | null;
foo == null /* nothing */ ? undefined : foo.bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 48,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: null,
    },
  ],
});

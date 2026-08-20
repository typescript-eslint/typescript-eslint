import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('prefer-optional-chain-or-eqeqeq-null', rule, {
  // with the `| null | undefined` type - `=== null` doesn't cover the
  // `undefined` case - so optional chaining is not a valid conversion
  valid: [
    {
      code: `
declare const foo: { bar: number } | null | undefined;
foo === null || foo.bar;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar === null || foo.bar.baz;
      `,
    },
    {
      code: `
declare const foo: (() => number) | null | undefined;
foo === null || foo();
      `,
    },
    {
      code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar === null || foo.bar();
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo === null || foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo === null || foo.bar === null || foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar === null || foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        { baz: { buzz: number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo === null || foo[bar] === null || foo[bar].baz === null || foo[bar].baz.buzz;
      `,
    },
    {
      code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        { baz: { buzz: number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo === null || foo[bar].baz === null || foo[bar].baz.buzz;
      `,
    },
    {
      code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo === null || foo[bar.baz] === null || foo[bar.baz].buzz;
      `,
    },
    {
      code: `
declare const foo:
  | {
      bar:
        { baz: { buzz: () => number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo === null || foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz();
      `,
    },
    {
      code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz();
      `,
    },
    {
      code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz();
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo === null || foo.bar === null || foo.bar.baz.buzz();
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar === null || foo.bar.baz.buzz();
      `,
    },
    {
      code: `
declare const foo:
  | {
      bar:
        { baz: { buzz: (() => number) | null | undefined } } | null | undefined;
    }
  | null
  | undefined;
foo === null ||
  foo.bar === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz();
      `,
    },
    {
      code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar === null ||
  foo.bar() === null ||
  foo.bar().baz === null ||
  foo.bar().baz.buzz === null ||
  foo.bar().baz.buzz();
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null || foo.bar === null || foo.bar.baz === null || foo.bar.baz[buzz]();
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz[buzz] === null ||
  foo.bar.baz[buzz]();
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null ||
  foo?.bar === null ||
  foo?.bar.baz === null ||
  foo?.bar.baz[buzz] === null ||
  foo?.bar.baz[buzz]();
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo === null || foo?.bar.baz === null || foo?.bar.baz[buzz];
      `,
    },
    {
      code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo === null || foo?.() === null || foo?.().bar;
      `,
    },
    {
      code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar === null || foo.bar?.() === null || foo.bar?.().baz;
      `,
    },
    // a chain that *ends* on `=== null` can't be converted either - the chain
    // short-circuits to `true` when the operand is `null`, whereas the optional
    // chain compares `undefined === null` and evaluates to `false`
    // https://github.com/typescript-eslint/typescript-eslint/issues/11840
    {
      code: `
declare const foo: { bar: number } | null;
foo === null || foo.bar === null;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: number } | null };
foo.bar === null || foo.bar.baz === null;
      `,
    },
    {
      code: `
declare const foo: (() => number) | null;
foo === null || foo() === null;
      `,
    },
    {
      code: `
declare const foo: { bar: (() => number) | null };
foo.bar === null || foo.bar() === null;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null;
      `,
    },
    {
      code: `
declare const foo: {
  bar: { baz: { buzz: number } | null } | null;
};
foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz === null;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } } | null } | null;
foo === null || foo.bar === null || foo.bar.baz.buzz === null;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } } | null };
foo.bar === null || foo.bar.baz.buzz === null;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null;
      `,
    },
    {
      code: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo === null ||
  foo[bar] === null ||
  foo[bar].baz === null ||
  foo[bar].baz.buzz === null;
      `,
    },
    {
      code: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo === null || foo[bar].baz === null || foo[bar].baz.buzz === null;
      `,
    },
    {
      code: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | null } | null;
foo === null || foo[bar.baz] === null || foo[bar.baz].buzz === null;
      `,
    },
    {
      code: `
declare const foo: {
  bar: { baz: { buzz: () => number } | null } | null;
} | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz() === null;
      `,
    },
    {
      code: `
declare const foo: {
  bar: {
    baz: { buzz: (() => number) | null } | null;
  } | null;
} | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz() === null;
      `,
    },
    {
      code: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz() === null;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null } | null;
foo === null || foo.bar === null || foo.bar.baz.buzz() === null;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null };
foo.bar === null || foo.bar.baz.buzz() === null;
      `,
    },
    {
      code: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | null } } | null;
} | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz() === null;
      `,
    },
    {
      code: `
declare const foo: {
  bar: () => { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar === null ||
  foo.bar() === null ||
  foo.bar().baz === null ||
  foo.bar().baz.buzz === null ||
  foo.bar().baz.buzz() === null;
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo: {
  bar: { baz: { [k: string]: () => number } | null } | null;
} | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz[buzz]() === null;
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz[buzz] === null ||
  foo.bar.baz[buzz]() === null;
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo === null ||
  foo?.bar === null ||
  foo?.bar.baz === null ||
  foo?.bar.baz[buzz] === null ||
  foo?.bar.baz[buzz]() === null;
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo: { bar: { baz: { [k: string]: number } | null } } | null;
foo === null || foo?.bar.baz === null || foo?.bar.baz[buzz] === null;
      `,
    },
    {
      code: `
declare const foo: (() => { bar: number } | null) | null;
foo === null || foo?.() === null || foo?.().bar === null;
      `,
    },
    {
      code: `
declare const foo: { bar: () => { baz: number } | null };
foo.bar === null || foo.bar?.() === null || foo.bar?.().baz === null;
      `,
    },
  ],
  // `=== null` operands are still convertible when something else ends the
  // chain, because then the ending comparison decides the value
  invalid: [
    {
      code: `
declare const foo: { bar: number | undefined } | null;
foo === null || foo.bar === undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      output: `
declare const foo: { bar: number | undefined } | null;
foo?.bar === undefined;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: number } | null } | null;
foo === null || foo.bar === null || foo.bar.baz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 56,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      output: `
declare const foo: { bar: { baz: number } | null } | null;
foo?.bar?.baz == null;
      `,
    },
    {
      code: `
declare const foo: { bar: number } | null;
foo === null || !foo.bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      output: `
declare const foo: { bar: number } | null;
!foo?.bar;
      `,
    },
  ],
});

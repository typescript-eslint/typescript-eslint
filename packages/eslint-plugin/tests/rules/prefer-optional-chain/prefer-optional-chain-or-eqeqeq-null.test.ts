import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('prefer-optional-chain-or-eqeqeq-null', rule, {
  assertionOptions: {
    requireData: true,
  },
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
    // even with the `| null` type, the chain can't end in `=== null`, because
    // `foo?.bar === null` is false when `foo` is `null`
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
  invalid: [
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
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number } | null;
!foo?.bar;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: number | undefined } | null } | null;
foo === null || foo.bar === null || foo.bar.baz === undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 62,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz: number | undefined } | null } | null;
foo?.bar?.baz === undefined;
      `,
    },
  ],
});

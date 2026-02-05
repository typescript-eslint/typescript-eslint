import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-misused-new';

const ruleTester = new RuleTester();

ruleTester.run('no-misused-new', rule, {
  valid: [
    noFormat`
declare abstract class C {
  foo() {}
  get new();
  bar();
}
    `,
    `
class C {
  constructor();
}
    `,
    `
const foo = class {
  constructor();
};
    `,
    `
const foo = class {
  new(): X;
};
    `,
    // OK if there's a body
    `
class C {
  new() {}
}
    `,
    `
class C {
  constructor() {}
}
    `,
    `
const foo = class {
  new() {}
};
    `,
    `
const foo = class {
  constructor() {}
};
    `,
    // OK if return type is not the interface.
    `
interface I {
  new (): {};
}
    `,
    // 'new' OK in type literal (we don't know the type name)
    'type T = { new (): T };',
    `
export default class {
  constructor();
}
    `,
    `
interface foo {
  new <T>(): bar<T>;
}
    `,
    `
interface foo {
  new <T>(): 'x';
}
    `,
  ],
  invalid: [
    {
      code: `
interface I {
  new (): I;
  constructor(): void;
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'errorMessageInterface',
        },
        {
          column: 3,
          line: 4,
          messageId: 'errorMessageInterface',
        },
      ],
    },
    // Works for generic type.
    {
      code: `
interface G {
  new <T>(): G<T>;
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'errorMessageInterface',
        },
      ],
    },
    // 'constructor' flagged.
    {
      code: `
type T = {
  constructor(): void;
};
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'errorMessageInterface',
        },
      ],
    },
    {
      code: `
class C {
  new(): C;
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'errorMessageClass',
        },
      ],
    },
    {
      code: `
declare abstract class C {
  new(): C;
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'errorMessageClass',
        },
      ],
    },
    {
      code: `
interface I {
  constructor(): '';
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'errorMessageInterface',
        },
      ],
    },
  ],
});

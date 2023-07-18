import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/class-methods-use-this';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('class-methods-use-this', rule, {
  valid: [
    {
      code: `
class Foo implements Bar {
  method() {}
}
      `,
      options: [{ ignoreClassesThatImplementAnInterface: true }],
    },
    {
      code: `
class Foo {
  override method() {}
}
      `,
      options: [{ ignoreOverrideMethods: true }],
    },
    {
      code: `
class Foo implements Bar {
  override method() {}
}
      `,
      options: [
        {
          ignoreClassesThatImplementAnInterface: true,
          ignoreOverrideMethods: true,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  property = () => {};
}
      `,
      options: [{ ignoreClassesThatImplementAnInterface: true }],
    },
    {
      code: `
class Foo {
  override property = () => {};
}
      `,
      options: [{ ignoreOverrideMethods: true }],
    },
    {
      code: `
class Foo implements Bar {
  override property = () => {};
}
      `,
      options: [
        {
          ignoreClassesThatImplementAnInterface: true,
          ignoreOverrideMethods: true,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  property = () => {};
}
      `,
      options: [
        {
          ignoreClassesThatImplementAnInterface: false,
          enforceForClassFields: false,
        },
      ],
    },
    {
      code: `
class Foo {
  override property = () => {};
}
      `,
      options: [
        {
          ignoreOverrideMethods: false,
          enforceForClassFields: false,
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
class Foo implements Bar {
  method() {}
}
      `,
      options: [{ ignoreClassesThatImplementAnInterface: false }],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  override method() {}
}
      `,
      options: [{ ignoreOverrideMethods: false }],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  override method() {}
}
      `,
      options: [
        {
          ignoreClassesThatImplementAnInterface: false,
          ignoreOverrideMethods: false,
        },
      ],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  property = () => {};
}
      `,
      options: [{ ignoreClassesThatImplementAnInterface: false }],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  override property = () => {};
}
      `,
      options: [{ ignoreOverrideMethods: false }],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  override property = () => {};
}
      `,
      options: [
        {
          ignoreClassesThatImplementAnInterface: false,
          ignoreOverrideMethods: false,
        },
      ],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
  ],
});

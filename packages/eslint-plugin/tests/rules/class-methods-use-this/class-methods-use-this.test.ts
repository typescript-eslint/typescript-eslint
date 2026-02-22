import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/class-methods-use-this';

const ruleTester = new RuleTester();

ruleTester.run('class-methods-use-this', rule, {
  invalid: [
    {
      code: `
class Foo {
  method() {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  private method() {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  protected method() {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  accessor method = () => {};
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  private accessor method = () => {};
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  protected accessor method = () => {};
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  #method() {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  get getter(): number {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  private get getter(): number {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  protected get getter(): number {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  get #getter(): number {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  set setter(b: number) {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          ignoreClassesThatImplementAnInterface: false,
          ignoreOverrideMethods: false,
        },
      ],
    },
    {
      code: `
class Foo {
  private set setter(b: number) {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  protected set setter(b: number) {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo {
  set #setter(b: number) {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{}],
    },
    {
      code: `
class Foo implements Bar {
  method() {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreClassesThatImplementAnInterface: false }],
    },
    {
      code: `
class Foo implements Bar {
  #method() {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreClassesThatImplementAnInterface: false }],
    },
    {
      code: `
class Foo implements Bar {
  private method() {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  protected method() {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  get getter(): number {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreClassesThatImplementAnInterface: false }],
    },
    {
      code: `
class Foo implements Bar {
  get #getter(): number {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreClassesThatImplementAnInterface: false }],
    },
    {
      code: `
class Foo implements Bar {
  private get getter(): number {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  protected get getter(): number {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  set setter(v: number) {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreClassesThatImplementAnInterface: false }],
    },
    {
      code: `
class Foo implements Bar {
  set #setter(v: number) {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreClassesThatImplementAnInterface: false }],
    },
    {
      code: `
class Foo implements Bar {
  private set setter(v: number) {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
          ignoreOverrideMethods: false,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  protected set setter(v: number) {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
          ignoreOverrideMethods: false,
        },
      ],
    },
    {
      code: `
class Foo {
  override method() {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreOverrideMethods: false }],
    },
    {
      code: `
class Foo {
  override get getter(): number {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreOverrideMethods: false }],
    },
    {
      code: `
class Foo {
  override set setter(v: number) {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreOverrideMethods: false }],
    },
    {
      code: `
class Foo implements Bar {
  override method() {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          ignoreClassesThatImplementAnInterface: false,
          ignoreOverrideMethods: false,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  override get getter(): number {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          ignoreClassesThatImplementAnInterface: false,
          ignoreOverrideMethods: false,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  override set setter(v: number) {}
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          ignoreClassesThatImplementAnInterface: false,
          ignoreOverrideMethods: false,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  property = () => {};
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreClassesThatImplementAnInterface: false }],
    },
    {
      code: `
class Foo implements Bar {
  #property = () => {};
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreClassesThatImplementAnInterface: false }],
    },
    {
      code: `
class Foo {
  override property = () => {};
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [{ ignoreOverrideMethods: false }],
    },
    {
      code: `
class Foo implements Bar {
  override property = () => {};
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          ignoreClassesThatImplementAnInterface: false,
          ignoreOverrideMethods: false,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  private property = () => {};
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  protected property = () => {};
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
        },
      ],
    },
    {
      code: `
function fn() {
  this.foo = 303;

  class Foo {
    method() {}
  }
}
      `,
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
  ],
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
class Foo implements Bar {
  accessor method = () => {};
}
      `,
      options: [{ ignoreClassesThatImplementAnInterface: true }],
    },
    {
      code: `
class Foo implements Bar {
  get getter() {}
}
      `,
      options: [{ ignoreClassesThatImplementAnInterface: true }],
    },
    {
      code: noFormat`
class Foo implements Bar {
  set setter() {}
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
class Foo {
  private override method() {}
}
      `,
      options: [{ ignoreOverrideMethods: true }],
    },
    {
      code: `
class Foo {
  protected override method() {}
}
      `,
      options: [{ ignoreOverrideMethods: true }],
    },
    {
      code: `
class Foo {
  override accessor method = () => {};
}
      `,
      options: [{ ignoreOverrideMethods: true }],
    },
    {
      code: `
class Foo {
  override get getter(): number {}
}
      `,
      options: [{ ignoreOverrideMethods: true }],
    },
    {
      code: `
class Foo {
  private override get getter(): number {}
}
      `,
      options: [{ ignoreOverrideMethods: true }],
    },
    {
      code: `
class Foo {
  protected override get getter(): number {}
}
      `,
      options: [{ ignoreOverrideMethods: true }],
    },
    {
      code: `
class Foo {
  override set setter(v: number) {}
}
      `,
      options: [{ ignoreOverrideMethods: true }],
    },
    {
      code: `
class Foo {
  private override set setter(v: number) {}
}
      `,
      options: [{ ignoreOverrideMethods: true }],
    },
    {
      code: `
class Foo {
  protected override set setter(v: number) {}
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
  private override method() {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
          // But overridden properties should be ignored.
          ignoreOverrideMethods: true,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  protected override method() {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
          // But overridden properties should be ignored.
          ignoreOverrideMethods: true,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  override get getter(): number {}
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
  private override get getter(): number {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
          // But overridden properties should be ignored.
          ignoreOverrideMethods: true,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  protected override get getter(): number {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
          // But overridden properties should be ignored.
          ignoreOverrideMethods: true,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  override set setter(v: number) {}
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
  private override set setter(v: number) {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
          // But overridden properties should be ignored.
          ignoreOverrideMethods: true,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  protected override set setter(v: number) {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
          // But overridden properties should be ignored.
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
class Foo {
  private override property = () => {};
}
      `,
      options: [{ ignoreOverrideMethods: true }],
    },
    {
      code: `
class Foo {
  protected override property = () => {};
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
          enforceForClassFields: false,
          ignoreClassesThatImplementAnInterface: false,
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
          enforceForClassFields: false,
          ignoreOverrideMethods: false,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  private override property = () => {};
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should check only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
          // But overridden properties should be ignored.
          ignoreOverrideMethods: true,
        },
      ],
    },
    {
      code: `
class Foo implements Bar {
  protected override property = () => {};
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should check only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
          // But overridden properties should be ignored.
          ignoreOverrideMethods: true,
        },
      ],
    },
    {
      code: `
class Foo {
  accessor method = () => {
    this;
  };
}
      `,
    },
    {
      code: `
class Foo {
  accessor method = function () {
    this;
  };
}
      `,
    },
  ],
});

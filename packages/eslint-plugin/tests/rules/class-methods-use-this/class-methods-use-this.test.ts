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
class Foo implements Bar {
  get getter() {}
}
      `,
      options: [{ ignoreClassesThatImplementAnInterface: true }],
    },
    {
      code: `
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
  ],
  invalid: [
    {
      code: `
class Foo {
  method() {}
}
      `,
      options: [{}],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  private method() {}
}
      `,
      options: [{}],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  protected method() {}
}
      `,
      options: [{}],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  #method() {}
}
      `,
      options: [{}],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  get getter(): number {}
}
      `,
      options: [{}],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  private get getter(): number {}
}
      `,
      options: [{}],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  protected get getter(): number {}
}
      `,
      options: [{}],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  get #getter(): number {}
}
      `,
      options: [{}],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  set setter(b: number) {}
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
class Foo {
  private set setter(b: number) {}
}
      `,
      options: [{}],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  protected set setter(b: number) {}
}
      `,
      options: [{}],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
    {
      code: `
class Foo {
  set #setter(b: number) {}
}
      `,
      options: [{}],
      errors: [
        {
          messageId: 'missingThis',
        },
      ],
    },
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
class Foo implements Bar {
  #method() {}
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
class Foo implements Bar {
  private method() {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
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
  protected method() {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
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
  get getter(): number {}
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
class Foo implements Bar {
  get #getter(): number {}
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
class Foo implements Bar {
  private get getter(): number {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
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
  protected get getter(): number {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
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
  set setter(v: number) {}
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
class Foo implements Bar {
  set #setter(v: number) {}
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
class Foo implements Bar {
  private set setter(v: number) {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
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
  protected set setter(v: number) {}
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
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
class Foo {
  override get getter(): number {}
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
class Foo {
  override set setter(v: number) {}
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
  override get getter(): number {}
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
  override set setter(v: number) {}
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
class Foo implements Bar {
  #property = () => {};
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
    {
      code: `
class Foo implements Bar {
  private property = () => {};
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
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
  protected property = () => {};
}
      `,
      options: [
        {
          // _interface_ cannot have `private`/`protected` modifier on members.
          // We should ignore only public members.
          ignoreClassesThatImplementAnInterface: 'public-fields',
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

// The following tests are adapted from the tests in eslint.
// Original Code: https://github.com/eslint/eslint/blob/522d8a32f326c52886c531f43cf6a1ff15af8286/tests/lib/rules/no-unused-private-class-members.js
// License      : https://github.com/eslint/eslint/blob/522d8a32f326c52886c531f43cf6a1ff15af8286/LICENSE

import type { TestCaseError } from '@typescript-eslint/rule-tester';

import { RuleTester } from '@typescript-eslint/rule-tester';

import type { MessageIds } from '../../src/rules/no-unused-private-class-members';

import rule from '../../src/rules/no-unused-private-class-members';

const ruleTester = new RuleTester();

/** Returns an expected error for defined-but-not-used private class member. */
function definedError(
  classMemberName: string,
  addHashTag = true,
): TestCaseError<MessageIds> {
  return {
    data: {
      classMemberName: addHashTag ? `#${classMemberName}` : classMemberName,
    },
    messageId: 'unusedPrivateClassMember',
  };
}

ruleTester.run('no-unused-private-class-members', rule, {
  valid: [
    'class Foo {}',
    `
class Foo {
  publicMember = 42;
}
    `,
    `
class Foo {
  public publicMember = 42;
}
    `,
    `
class Foo {
  protected publicMember = 42;
}
    `,
    `
class C {
  #usedInInnerClass;

  method(a) {
    return class {
      foo = a.#usedInInnerClass;
    };
  }
}
    `,
    `
class C {
  private accessor accessorMember = 42;

  method() {
    return this.accessorMember;
  }
}
    `,
    `
class C {
  private static staticMember = 42;

  static method() {
    return this.staticMember;
  }
}
    `,
    {
      code: `
class C {
  private static staticMember = 42;

  method() {
    return C.staticMember;
  }
}
      `,
      // TODO make this work
      skip: true,
    },

    ...[
      `
class Foo {
  @# = 42;
  method() {
    return this.#;
  }
}
      `,
      `
class Foo {
  @# = 42;
  anotherMember = this.#;
}
      `,
      `
class Foo {
  @# = 42;
  foo() {
    anotherMember = this.#;
  }
}
      `,
      `
class C {
  @#;

  foo() {
    bar((this.# += 1));
  }
}
      `,
      `
class Foo {
  @# = 42;
  method() {
    return someGlobalMethod(this.#);
  }
}
      `,
      `
class C {
  @#;

  foo() {
    return class {};
  }

  bar() {
    return this.#;
  }
}
      `,
      `
class Foo {
  @#;
  method() {
    for (const bar in this.#) {
    }
  }
}
      `,
      `
class Foo {
  @#;
  method() {
    for (const bar of this.#) {
    }
  }
}
      `,
      `
class Foo {
  @#;
  method() {
    [bar = 1] = this.#;
  }
}
      `,
      `
class Foo {
  @#;
  method() {
    [bar] = this.#;
  }
}
      `,
      `
class C {
  @#;

  method() {
    ({ [this.#]: a } = foo);
  }
}
      `,
      `
class C {
  @set #(value) {
    doSomething(value);
  }
  @get #() {
    return something();
  }
  method() {
    this.# += 1;
  }
}
      `,
      `
class Foo {
  @set #(value) {}

  method(a) {
    [this.#] = a;
  }
}
      `,
      `
class C {
  @get #() {
    return something();
  }
  @set #(value) {
    doSomething(value);
  }
  method() {
    this.# += 1;
  }
}
      `,

      //--------------------------------------------------------------------------
      // Method definitions
      //--------------------------------------------------------------------------
      `
class Foo {
  @#() {
    return 42;
  }
  anotherMethod() {
    return this.#();
  }
}
      `,
      `
class C {
  @set #(value) {
    doSomething(value);
  }

  foo() {
    this.# = 1;
  }
}
      `,
    ].flatMap(code => [
      code.replaceAll('#', '#privateMember').replaceAll('@', ''),
      code.replaceAll('#', 'privateMember').replaceAll('@', 'private '),
    ]),
  ],
  invalid: [
    {
      code: `
class C {
  #unusedInOuterClass;

  foo() {
    return class D {
      #unusedInOuterClass;

      bar() {
        return this.#unusedInOuterClass;
      }
    };
  }
}
      `,
      errors: [definedError('unusedInOuterClass')],
    },
    {
      code: `
class C {
  #unusedOnlyInSecondNestedClass;

  foo() {
    return class {
      #unusedOnlyInSecondNestedClass;

      bar() {
        return this.#unusedOnlyInSecondNestedClass;
      }
    };
  }

  baz() {
    return this.#unusedOnlyInSecondNestedClass;
  }

  bar() {
    return class {
      #unusedOnlyInSecondNestedClass;
    };
  }
}
      `,
      errors: [definedError('unusedOnlyInSecondNestedClass')],
    },
    {
      code: `
class C {
  #usedOnlyInTheSecondInnerClass;

  method(a) {
    return class {
      #usedOnlyInTheSecondInnerClass;

      method2(b) {
        foo = b.#usedOnlyInTheSecondInnerClass;
      }

      method3(b) {
        foo = b.#usedOnlyInTheSecondInnerClass;
      }
    };
  }
}
      `,
      errors: [
        {
          ...definedError('usedOnlyInTheSecondInnerClass'),
          line: 3,
        },
      ],
    },
    {
      code: `
class C {
  private accessor accessorMember = 42;
}
      `,
      errors: [definedError('accessorMember', false)],
    },
    {
      code: `
class C {
  private static staticMember = 42;
}
      `,
      errors: [definedError('staticMember', false)],
    },

    // intentionally not handled cases
    {
      code: `
class C {
  private usedInInnerClass;

  method(a: C) {
    return class {
      foo = a.usedInInnerClass;
    };
  }
}
      `,
      errors: [definedError('usedInInnerClass', false)],
    },
    {
      code: `
class C {
  private usedOutsideClass;
}

const instance = new C();
console.log(instance.usedOutsideClass);
      `,
      errors: [definedError('usedOutsideClass', false)],
    },

    ...[
      {
        code: `
class Foo {
  @# = 5;
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class First {}
class Second {
  @# = 5;
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class First {
  @# = 5;
}
class Second {}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class First {
  @# = 5;
  @#2 = 5;
}
      `,
        errors: [definedError('#', false), definedError('#2', false)],
      },
      {
        code: `
class Foo {
  @# = 5;
  method() {
    this.# = 42;
  }
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class Foo {
  @# = 5;
  method() {
    this.# += 42;
  }
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class C {
  @#;

  foo() {
    this.#++;
  }
}
      `,
        errors: [definedError('#', false)],
      },

      //--------------------------------------------------------------------------
      // Unused method definitions
      //--------------------------------------------------------------------------
      {
        code: `
class Foo {
  @#() {}
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class Foo {
  @#() {}
  @#Used() {
    return 42;
  }
  publicMethod() {
    return this.#Used();
  }
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class Foo {
  @set #(value) {}
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class Foo {
  @#;
  method() {
    for (this.# in bar) {
    }
  }
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class Foo {
  @#;
  method() {
    for (this.# of bar) {
    }
  }
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class Foo {
  @#;
  method() {
    ({ x: this.# } = bar);
  }
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class Foo {
  @#;
  method() {
    [...this.#] = bar;
  }
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class Foo {
  @#;
  method() {
    [this.# = 1] = bar;
  }
}
      `,
        errors: [definedError('#', false)],
      },
      {
        code: `
class Foo {
  @#;
  method() {
    [this.#] = bar;
  }
}
      `,
        errors: [definedError('#', false)],
      },
    ].flatMap(({ code, errors }) => [
      {
        code: code.replaceAll('#', '#privateMember').replaceAll('@', ''),
        errors: errors.map(error => ({
          ...error,
          data: {
            classMemberName: (error.data?.classMemberName as string).replaceAll(
              '#',
              '#privateMember',
            ),
          },
        })),
      },
      {
        code: code.replaceAll('#', 'privateMember').replaceAll('@', 'private '),
        errors: errors.map(error => ({
          ...error,
          data: {
            classMemberName: (error.data?.classMemberName as string).replaceAll(
              '#',
              'privateMember',
            ),
          },
        })),
      },
    ]),
  ],
});

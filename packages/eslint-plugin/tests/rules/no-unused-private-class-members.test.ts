// The following tests are adapted from the tests in eslint.
// Original Code: https://github.com/eslint/eslint/blob/522d8a32f326c52886c531f43cf6a1ff15af8286/tests/lib/rules/no-unused-private-class-members.js
// License      : https://github.com/eslint/eslint/blob/522d8a32f326c52886c531f43cf6a1ff15af8286/LICENSE

import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unused-private-class-members';

const ruleTester = new RuleTester();

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
    },
    `
class Test1 {
  constructor(private parameterProperty: number) {}
  method() {
    return this.parameterProperty;
  }
}
    `,
    `
class Test1 {
  constructor(private readonly parameterProperty: number) {}
  method() {
    return this.parameterProperty;
  }
}
    `,
    `
class Test1 {
  constructor(private readonly parameterProperty: number = 1) {}
  method() {
    return this.parameterProperty;
  }
}
    `,
    `
class Foo {
  private prop: number;

  method(thing: Foo) {
    return thing.prop;
  }
}
    `,
    `
class Foo {
  private static staticProp: number;

  method(thing: typeof Foo) {
    return thing.staticProp;
  }
}
    `,
    `
class Foo {
  private prop: number;

  method() {
    const self = this;
    return self.prop;
  }
}
    `,

    `
class Foo {
  #privateMember = 42;
  method() {
    return this.#privateMember;
  }
}
    `,
    `
class Foo {
  private privateMember = 42;
  method() {
    return this.privateMember;
  }
}
    `,
    `
class Foo {
  #privateMember = 42;
  anotherMember = this.#privateMember;
}
    `,
    `
class Foo {
  private privateMember = 42;
  anotherMember = this.privateMember;
}
    `,
    `
class Foo {
  #privateMember = 42;
  foo() {
    anotherMember = this.#privateMember;
  }
}
    `,
    `
class Foo {
  private privateMember = 42;
  foo() {
    anotherMember = this.privateMember;
  }
}
    `,
    `
class C {
  #privateMember;

  foo() {
    bar((this.#privateMember += 1));
  }
}
    `,
    `
class C {
  private privateMember;

  foo() {
    bar((this.privateMember += 1));
  }
}
    `,
    `
class Foo {
  #privateMember = 42;
  method() {
    return someGlobalMethod(this.#privateMember);
  }
}
    `,
    `
class Foo {
  private privateMember = 42;
  method() {
    return someGlobalMethod(this.privateMember);
  }
}
    `,
    `
class C {
  #privateMember;

  foo() {
    return class {};
  }

  bar() {
    return this.#privateMember;
  }
}
    `,
    `
class C {
  private privateMember;

  foo() {
    return class {};
  }

  bar() {
    return this.privateMember;
  }
}
    `,
    `
class Foo {
  #privateMember;
  method() {
    for (const bar in this.#privateMember) {
    }
  }
}
    `,
    `
class Foo {
  private privateMember;
  method() {
    for (const bar in this.privateMember) {
    }
  }
}
    `,
    `
class Foo {
  #privateMember;
  method() {
    for (const bar of this.#privateMember) {
    }
  }
}
    `,
    `
class Foo {
  private privateMember;
  method() {
    for (const bar of this.privateMember) {
    }
  }
}
    `,
    `
class Foo {
  #privateMember;
  method() {
    [bar = 1] = this.#privateMember;
  }
}
    `,
    `
class Foo {
  private privateMember;
  method() {
    [bar = 1] = this.privateMember;
  }
}
    `,
    `
class Foo {
  #privateMember;
  method() {
    [bar] = this.#privateMember;
  }
}
    `,
    `
class Foo {
  private privateMember;
  method() {
    [bar] = this.privateMember;
  }
}
    `,
    `
class C {
  #privateMember;

  method() {
    ({ [this.#privateMember]: a } = foo);
  }
}
    `,
    `
class C {
  private privateMember;

  method() {
    ({ [this.privateMember]: a } = foo);
  }
}
    `,
    `
class C {
  set #privateMember(value) {
    doSomething(value);
  }
  get #privateMember() {
    return something();
  }
  method() {
    this.#privateMember += 1;
  }
}
    `,
    `
class C {
  private set privateMember(value) {
    doSomething(value);
  }
  private get privateMember() {
    return something();
  }
  method() {
    this.privateMember += 1;
  }
}
    `,
    `
class Foo {
  set #privateMember(value) {}

  method(a) {
    [this.#privateMember] = a;
  }
}
    `,
    `
class Foo {
  private set privateMember(value) {}

  method(a) {
    [this.privateMember] = a;
  }
}
    `,
    `
class C {
  get #privateMember() {
    return something();
  }
  set #privateMember(value) {
    doSomething(value);
  }
  method() {
    this.#privateMember += 1;
  }
}
    `,
    `
class C {
  private get privateMember() {
    return something();
  }
  private set privateMember(value) {
    doSomething(value);
  }
  method() {
    this.privateMember += 1;
  }
}
    `,
    `
class Foo {
  private privateMember;
  private privateMember2;

  method() {
    const { privateMember, privateMember2 } = this;
    console.log(privateMember, privateMember2);
  }
}
    `,
    `
class Foo {
  private static staticMember = 1;
  static method() {
    const { staticMember } = this;
    console.log(staticMember);
  }
}
    `,
    `
class Foo {
  private privateMember = 1;
  method() {
    const { privateMember } = this;
    const obj = { privateMember };
    return obj;
  }
}
    `,
    //--------------------------------------------------------------------------
    // Method definitions
    //--------------------------------------------------------------------------
    `
class Foo {
  #privateMember() {
    return 42;
  }
  anotherMethod() {
    return this.#privateMember();
  }
}
    `,
    `
class Foo {
  private privateMember() {
    return 42;
  }
  anotherMethod() {
    return this.privateMember();
  }
}
    `,
    `
class C {
  set #privateMember(value) {
    doSomething(value);
  }

  foo() {
    this.#privateMember = 1;
  }
}
    `,
    `
class C {
  private set privateMember(value) {
    doSomething(value);
  }

  foo() {
    this.privateMember = 1;
  }
}
    `,
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
      errors: [
        {
          data: {
            classMemberName: '#unusedInOuterClass',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
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
      errors: [
        {
          data: {
            classMemberName: '#unusedOnlyInSecondNestedClass',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
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
          data: {
            classMemberName: '#usedOnlyInTheSecondInnerClass',
          },
          line: 3,
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class C {
  private accessor accessorMember = 42;
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'accessorMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class C {
  private static staticMember = 42;
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'staticMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Test1 {
  constructor(private parameterProperty: number) {}
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'parameterProperty',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Test1 {
  constructor(private readonly parameterProperty: number) {}
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'parameterProperty',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Test1 {
  constructor(private readonly parameterProperty: number = 1) {}
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'parameterProperty',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },

    {
      // usage of a property outside the class
      code: `
class C {
  private usedOutsideClass;
}

const instance = new C();
console.log(instance.usedOutsideClass);
      `,
      errors: [
        {
          data: {
            classMemberName: 'usedOutsideClass',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      // usage of a property outside the class
      code: `
class C {
  private usedOutsideClass;
}

const instance = new C();
console.log(instance['usedOutsideClass']);
      `,
      errors: [
        {
          data: {
            classMemberName: 'usedOutsideClass',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      // too much indirection so we just bail
      code: `
class Foo {
  private prop: number;

  method() {
    const self1 = this;
    const self2 = self1;
    return self2.prop;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'prop',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },

    {
      code: `
class Foo {
  #privateMember = 5;
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember = 5;
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class First {}
class Second {
  #privateMember = 5;
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class First {}
class Second {
  private privateMember = 5;
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class First {
  #privateMember = 5;
}
class Second {}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class First {
  private privateMember = 5;
}
class Second {}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class First {
  #privateMember = 5;
  #privateMember2 = 5;
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
        {
          data: {
            classMemberName: '#privateMember2',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class First {
  private privateMember = 5;
  private privateMember2 = 5;
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
        {
          data: {
            classMemberName: 'privateMember2',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  #privateMember = 5;
  method() {
    this.#privateMember = 42;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember = 5;
  method() {
    this.privateMember = 42;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  #privateMember = 5;
  method() {
    this.#privateMember += 42;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember = 5;
  method() {
    this.privateMember += 42;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class C {
  #privateMember;

  foo() {
    this.#privateMember++;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class C {
  private privateMember;

  foo() {
    this.privateMember++;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },

    //--------------------------------------------------------------------------
    // Unused method definitions
    //--------------------------------------------------------------------------
    {
      code: `
class Foo {
  #privateMember() {}
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember() {}
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  #privateMember() {}
  #privateMemberUsed() {
    return 42;
  }
  publicMethod() {
    return this.#privateMemberUsed();
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember() {}
  private privateMemberUsed() {
    return 42;
  }
  publicMethod() {
    return this.privateMemberUsed();
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  set #privateMember(value) {}
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private set privateMember(value) {}
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  #privateMember;
  method() {
    for (this.#privateMember in bar) {
    }
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember;
  method() {
    for (this.privateMember in bar) {
    }
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  #privateMember;
  method() {
    for (this.#privateMember of bar) {
    }
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember;
  method() {
    for (this.privateMember of bar) {
    }
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  #privateMember;
  method() {
    ({ x: this.#privateMember } = bar);
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember;
  method() {
    ({ x: this.privateMember } = bar);
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  #privateMember;
  method() {
    [...this.#privateMember] = bar;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember;
  method() {
    [...this.privateMember] = bar;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  #privateMember;
  method() {
    [this.#privateMember = 1] = bar;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember;
  method() {
    [this.privateMember = 1] = bar;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  #privateMember;
  method() {
    [this.#privateMember] = bar;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: '#privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember;
  method() {
    [this.privateMember] = bar;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember;
  method() {
    const { privateMember } = this;
    const obj = { privateMember: 1 };
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
    {
      code: `
class Foo {
  private privateMember = 1;

  method() {
    const { privateMember } = this;
  }
}
      `,
      errors: [
        {
          data: {
            classMemberName: 'privateMember',
          },
          messageId: 'unusedPrivateClassMember',
        },
      ],
    },
  ],
});

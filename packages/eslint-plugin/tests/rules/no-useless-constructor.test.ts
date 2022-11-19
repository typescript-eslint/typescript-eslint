import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/no-useless-constructor';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: rootDir,
  },
  parser: '@typescript-eslint/parser',
});

const error = {
  messageId: 'noUselessConstructor' as const,
  type: AST_NODE_TYPES.MethodDefinition,
};

ruleTester.run('no-useless-constructor', rule, {
  valid: [
    'class A {}',
    `
class A {
  constructor() {
    doSomething();
  }
}
    `,
    `
class A extends B {
  constructor() {}
}
    `,
    `
class A extends B {
  constructor() {
    super('foo');
  }
}
    `,
    `
class A extends B {
  constructor(foo, bar) {
    super(foo, bar, 1);
  }
}
    `,
    `
class A extends B {
  constructor() {
    super();
    doSomething();
  }
}
    `,
    `
class A extends B {
  constructor(...args) {
    super(...args);
    doSomething();
  }
}
    `,
    `
class A {
  dummyMethod() {
    doSomething();
  }
}
    `,
    `
class A extends B.C {
  constructor() {
    super(foo);
  }
}
    `,
    `
class A extends B.C {
  constructor([a, b, c]) {
    super(...arguments);
  }
}
    `,
    `
class A extends B.C {
  constructor(a = f()) {
    super(...arguments);
  }
}
    `,
    `
class A extends B {
  constructor(a, b, c) {
    super(a, b);
  }
}
    `,
    `
class A extends B {
  constructor(foo, bar) {
    super(foo);
  }
}
    `,
    `
class A extends B {
  constructor(test) {
    super();
  }
}
    `,
    `
class A extends B {
  constructor() {
    foo;
  }
}
    `,
    `
class A extends B {
  constructor(foo, bar) {
    super(bar);
  }
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/15
    `
declare class A {
  constructor();
}
    `,
    `
class A {
  constructor();
}
    `,
    `
abstract class A {
  constructor();
}
    `,
    `
abstract class A {
  abstract constructor();
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/48
    `
class A {
  constructor(private name: string) {}
}
    `,
    `
class A {
  constructor(public name: string) {}
}
    `,
    `
class A {
  constructor(protected name: string) {}
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/pull/167#discussion_r252638401
    `
class A {
  private constructor() {}
}
    `,
    `
class A {
  protected constructor() {}
}
    `,
    `
class A extends B {
  public constructor() {}
}
    `,
    `
class A extends B {
  protected constructor(foo, bar) {
    super(bar);
  }
}
    `,
    `
class A extends B {
  private constructor(foo, bar) {
    super(bar);
  }
}
    `,
    `
class A extends B {
  public constructor(foo) {
    super(foo);
  }
}
    `,
    `
class A extends B {
  public constructor(foo) {}
}
    `,
    // type definition / overload
    `
class A {
  constructor(foo);
}
    `,
    `
class A extends Object {
  constructor(@Foo foo: string) {
    super(foo);
  }
}
    `,
    `
class A extends Object {
  constructor(foo: string, @Bar() bar) {
    super(foo, bar);
  }
}
    `,
    `
class A {
  public constructor() {
    console.log('Hello, world!');
  }
}
class B extends A {
  private constructor() {
    super();
  }
}
    `,
    `
class A {
  constructor() {
    console.log('Hello, world!');
  }
}
class B extends A {
  private constructor() {
    super();
  }
}
    `,
    `
class A {
  public constructor() {
    console.log('Hello, world!');
  }
}
class B extends A {
  protected constructor() {
    super();
  }
}
    `,
    `
class A {
  protected constructor() {}
}
class B extends A {
  public constructor() {
    super();
  }
}
    `,
    `
class A {
  protected constructor() {}
}
class B extends A {
  constructor() {
    super();
  }
}
    `,
    `
class A {
  protected constructor() {}
}
class B extends A {
  private constructor() {
    super();
  }
}
    `,
    `
class A {
  public other() {}
}
class B extends A {
  public other() {
    super.other();
  }
}
    `,
  ],
  invalid: [
    {
      code: `
class A {
  constructor() {}
}
      `,
      errors: [error],
    },
    {
      code: `
class A extends B {
  constructor() {
    super();
  }
}
      `,
      errors: [error],
    },
    {
      code: `
class A extends B {
  constructor(foo) {
    super(foo);
  }
}
      `,
      errors: [error],
    },
    {
      code: `
class A extends B {
  constructor(foo, bar) {
    super(foo, bar);
  }
}
      `,
      errors: [error],
    },
    {
      code: `
class A extends B {
  constructor(...args) {
    super(...args);
  }
}
      `,
      errors: [error],
    },
    {
      code: `
class A extends B.C {
  constructor() {
    super(...arguments);
  }
}
      `,
      errors: [error],
    },
    {
      code: `
class A extends B {
  constructor(a, b, ...c) {
    super(...arguments);
  }
}
      `,
      errors: [error],
    },
    {
      code: `
class A extends B {
  constructor(a, b, ...c) {
    super(a, b, ...c);
  }
}
      `,
      errors: [error],
    },
    {
      code: `
class A {
  public constructor() {}
}
      `,
      errors: [error],
    },
    {
      code: `
class A {
  public constructor() {
    console.log('Hello, world!');
  }
}
class B extends A {
  public constructor() {
    super();
  }
}
      `,
      errors: [error],
    },
    {
      code: `
class A {
  constructor() {
    console.log('Hello, world!');
  }
}
class B extends A {
  public constructor() {
    super();
  }
}
      `,
      errors: [error],
    },
    {
      code: `
class A {
  public constructor() {
    console.log('Hello, world!');
  }
}
class B extends A {
  constructor() {
    super();
  }
}
      `,
      errors: [error],
    },
    {
      code: `
class A {
  protected constructor() {
    console.log('Hello, world!');
  }
}
class B extends A {
  protected constructor() {
    super();
  }
}
      `,
      errors: [error],
    },
    {
      code: `
class A {
  private constructor() {
    console.log('Hello, world!');
  }
}
class B extends A {
  private constructor() {
    super();
  }
}
      `,
      errors: [error],
    },
  ],
});

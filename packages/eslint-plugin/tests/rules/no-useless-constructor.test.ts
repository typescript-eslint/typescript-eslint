import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/no-useless-constructor';

const ruleTester = new RuleTester();

ruleTester.run('no-useless-constructor', rule, {
  invalid: [
    {
      code: `
class A {
  constructor() {}
}
      `,
      errors: [
        {
          messageId: 'noUselessConstructor',
          suggestions: [
            {
              messageId: 'removeConstructor',
              output: `
class A {
${'  '}
}
      `,
            },
          ],
          type: AST_NODE_TYPES.MethodDefinition,
        },
      ],
    },
    {
      code: `
class A extends B {
  constructor() {
    super();
  }
}
      `,
      errors: [
        {
          messageId: 'noUselessConstructor',
          suggestions: [
            {
              messageId: 'removeConstructor',
              output: `
class A extends B {
${'  '}
}
      `,
            },
          ],
          type: AST_NODE_TYPES.MethodDefinition,
        },
      ],
    },
    {
      code: `
class A extends B {
  constructor(foo) {
    super(foo);
  }
}
      `,
      errors: [
        {
          messageId: 'noUselessConstructor',
          suggestions: [
            {
              messageId: 'removeConstructor',
              output: `
class A extends B {
${'  '}
}
      `,
            },
          ],
          type: AST_NODE_TYPES.MethodDefinition,
        },
      ],
    },
    {
      code: `
class A extends B {
  constructor(foo, bar) {
    super(foo, bar);
  }
}
      `,
      errors: [
        {
          messageId: 'noUselessConstructor',
          suggestions: [
            {
              messageId: 'removeConstructor',
              output: `
class A extends B {
${'  '}
}
      `,
            },
          ],
          type: AST_NODE_TYPES.MethodDefinition,
        },
      ],
    },
    {
      code: `
class A extends B {
  constructor(...args) {
    super(...args);
  }
}
      `,
      errors: [
        {
          messageId: 'noUselessConstructor',
          suggestions: [
            {
              messageId: 'removeConstructor',
              output: `
class A extends B {
${'  '}
}
      `,
            },
          ],
          type: AST_NODE_TYPES.MethodDefinition,
        },
      ],
    },
    {
      code: `
class A extends B.C {
  constructor() {
    super(...arguments);
  }
}
      `,
      errors: [
        {
          messageId: 'noUselessConstructor',
          suggestions: [
            {
              messageId: 'removeConstructor',
              output: `
class A extends B.C {
${'  '}
}
      `,
            },
          ],
          type: AST_NODE_TYPES.MethodDefinition,
        },
      ],
    },
    {
      code: `
class A extends B {
  constructor(a, b, ...c) {
    super(...arguments);
  }
}
      `,
      errors: [
        {
          messageId: 'noUselessConstructor',
          suggestions: [
            {
              messageId: 'removeConstructor',
              output: `
class A extends B {
${'  '}
}
      `,
            },
          ],
          type: AST_NODE_TYPES.MethodDefinition,
        },
      ],
    },
    {
      code: `
class A extends B {
  constructor(a, b, ...c) {
    super(a, b, ...c);
  }
}
      `,
      errors: [
        {
          messageId: 'noUselessConstructor',
          suggestions: [
            {
              messageId: 'removeConstructor',
              output: `
class A extends B {
${'  '}
}
      `,
            },
          ],
          type: AST_NODE_TYPES.MethodDefinition,
        },
      ],
    },
    {
      code: `
class A {
  public constructor() {}
}
      `,
      errors: [
        {
          messageId: 'noUselessConstructor',
          suggestions: [
            {
              messageId: 'removeConstructor',
              output: `
class A {
${'  '}
}
      `,
            },
          ],
          type: AST_NODE_TYPES.MethodDefinition,
        },
      ],
    },
  ],
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
  ],
});

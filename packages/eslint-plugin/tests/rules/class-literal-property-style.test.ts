import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/class-literal-property-style';

const ruleTester = new RuleTester();

ruleTester.run('class-literal-property-style', rule, {
  invalid: [
    {
      code: `
class Mx {
  get p1() {
    return 'hello world';
  }
}
      `,
      errors: [
        {
          column: 7,
          line: 3,
          messageId: 'preferFieldStyle',
          suggestions: [
            {
              messageId: 'preferFieldStyleSuggestion',
              output: `
class Mx {
  readonly p1 = 'hello world';
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Mx {
  get p1() {
    return \`hello world\`;
  }
}
      `,
      errors: [
        {
          column: 7,
          line: 3,
          messageId: 'preferFieldStyle',
          suggestions: [
            {
              messageId: 'preferFieldStyleSuggestion',
              output: `
class Mx {
  readonly p1 = \`hello world\`;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Mx {
  static get p1() {
    return 'hello world';
  }
}
      `,
      errors: [
        {
          column: 14,
          line: 3,
          messageId: 'preferFieldStyle',
          suggestions: [
            {
              messageId: 'preferFieldStyleSuggestion',
              output: `
class Mx {
  static readonly p1 = 'hello world';
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Mx {
  public static get foo() {
    return 1;
  }
}
      `,
      errors: [
        {
          column: 21,
          line: 3,
          messageId: 'preferFieldStyle',
          suggestions: [
            {
              messageId: 'preferFieldStyleSuggestion',
              output: `
class Mx {
  public static readonly foo = 1;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Mx {
  public get [myValue]() {
    return 'a literal value';
  }
}
      `,
      errors: [
        {
          column: 15,
          line: 3,
          messageId: 'preferFieldStyle',
          suggestions: [
            {
              messageId: 'preferFieldStyleSuggestion',
              output: `
class Mx {
  public readonly [myValue] = 'a literal value';
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Mx {
  public get [myValue]() {
    return 12345n;
  }
}
      `,
      errors: [
        {
          column: 15,
          line: 3,
          messageId: 'preferFieldStyle',
          suggestions: [
            {
              messageId: 'preferFieldStyleSuggestion',
              output: `
class Mx {
  public readonly [myValue] = 12345n;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Mx {
  public readonly [myValue] = 'a literal value';
}
      `,
      errors: [
        {
          column: 20,
          line: 3,
          messageId: 'preferGetterStyle',
          suggestions: [
            {
              messageId: 'preferGetterStyleSuggestion',
              output: `
class Mx {
  public get [myValue]() { return 'a literal value'; }
}
      `,
            },
          ],
        },
      ],
      options: ['getters'],
    },
    {
      code: `
class Mx {
  readonly p1 = 'hello world';
}
      `,
      errors: [
        {
          column: 12,
          line: 3,
          messageId: 'preferGetterStyle',
          suggestions: [
            {
              messageId: 'preferGetterStyleSuggestion',
              output: `
class Mx {
  get p1() { return 'hello world'; }
}
      `,
            },
          ],
        },
      ],
      options: ['getters'],
    },
    {
      code: `
class Mx {
  readonly p1 = \`hello world\`;
}
      `,
      errors: [
        {
          column: 12,
          line: 3,
          messageId: 'preferGetterStyle',
          suggestions: [
            {
              messageId: 'preferGetterStyleSuggestion',
              output: `
class Mx {
  get p1() { return \`hello world\`; }
}
      `,
            },
          ],
        },
      ],
      options: ['getters'],
    },
    {
      code: `
class Mx {
  static readonly p1 = 'hello world';
}
      `,
      errors: [
        {
          column: 19,
          line: 3,
          messageId: 'preferGetterStyle',
          suggestions: [
            {
              messageId: 'preferGetterStyleSuggestion',
              output: `
class Mx {
  static get p1() { return 'hello world'; }
}
      `,
            },
          ],
        },
      ],
      options: ['getters'],
    },
    {
      code: `
class Mx {
  protected get p1() {
    return 'hello world';
  }
}
      `,
      errors: [
        {
          column: 17,
          line: 3,
          messageId: 'preferFieldStyle',
          suggestions: [
            {
              messageId: 'preferFieldStyleSuggestion',
              output: `
class Mx {
  protected readonly p1 = 'hello world';
}
      `,
            },
          ],
        },
      ],
      options: ['fields'],
    },
    {
      code: `
class Mx {
  protected readonly p1 = 'hello world';
}
      `,
      errors: [
        {
          column: 22,
          line: 3,
          messageId: 'preferGetterStyle',
          suggestions: [
            {
              messageId: 'preferGetterStyleSuggestion',
              output: `
class Mx {
  protected get p1() { return 'hello world'; }
}
      `,
            },
          ],
        },
      ],
      options: ['getters'],
    },
    {
      code: `
class Mx {
  public static get p1() {
    return 'hello world';
  }
}
      `,
      errors: [
        {
          column: 21,
          line: 3,
          messageId: 'preferFieldStyle',
          suggestions: [
            {
              messageId: 'preferFieldStyleSuggestion',
              output: `
class Mx {
  public static readonly p1 = 'hello world';
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Mx {
  public static readonly p1 = 'hello world';
}
      `,
      errors: [
        {
          column: 26,
          line: 3,
          messageId: 'preferGetterStyle',
          suggestions: [
            {
              messageId: 'preferGetterStyleSuggestion',
              output: `
class Mx {
  public static get p1() { return 'hello world'; }
}
      `,
            },
          ],
        },
      ],
      options: ['getters'],
    },
    {
      code: `
class Mx {
  public get myValue() {
    return gql\`
      {
        user(id: 5) {
          firstName
          lastName
        }
      }
    \`;
  }
}
      `,
      errors: [
        {
          column: 14,
          line: 3,
          messageId: 'preferFieldStyle',
          suggestions: [
            {
              messageId: 'preferFieldStyleSuggestion',
              output: `
class Mx {
  public readonly myValue = gql\`
      {
        user(id: 5) {
          firstName
          lastName
        }
      }
    \`;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Mx {
  public readonly myValue = gql\`
    {
      user(id: 5) {
        firstName
        lastName
      }
    }
  \`;
}
      `,
      errors: [
        {
          column: 19,
          line: 3,
          messageId: 'preferGetterStyle',
          suggestions: [
            {
              messageId: 'preferGetterStyleSuggestion',
              output: `
class Mx {
  public get myValue() { return gql\`
    {
      user(id: 5) {
        firstName
        lastName
      }
    }
  \`; }
}
      `,
            },
          ],
        },
      ],
      options: ['getters'],
    },
    {
      code: `
class A {
  private readonly foo: string = 'bar';
  constructor(foo: string) {
    const bar = new (class {
      private readonly foo: string = 'baz';
      constructor() {
        this.foo = 'qux';
      }
    })();
  }
}
      `,
      errors: [
        {
          column: 20,
          line: 3,
          messageId: 'preferGetterStyle',
          suggestions: [
            {
              messageId: 'preferGetterStyleSuggestion',
              output: `
class A {
  private get foo() { return 'bar'; }
  constructor(foo: string) {
    const bar = new (class {
      private readonly foo: string = 'baz';
      constructor() {
        this.foo = 'qux';
      }
    })();
  }
}
      `,
            },
          ],
        },
      ],
      options: ['getters'],
    },
    {
      code: `
class A {
  private readonly ['foo']: string = 'bar';
  constructor(foo: string) {
    const bar = new (class {
      private readonly foo: string = 'baz';
      constructor() {}
    })();

    if (bar) {
      this.foo = 'baz';
    }
  }
}
      `,
      errors: [
        {
          column: 24,
          line: 6,
          messageId: 'preferGetterStyle',
          suggestions: [
            {
              messageId: 'preferGetterStyleSuggestion',
              output: `
class A {
  private readonly ['foo']: string = 'bar';
  constructor(foo: string) {
    const bar = new (class {
      private get foo() { return 'baz'; }
      constructor() {}
    })();

    if (bar) {
      this.foo = 'baz';
    }
  }
}
      `,
            },
          ],
        },
      ],
      options: ['getters'],
    },
    {
      code: `
class A {
  private readonly foo: string = 'bar';
  constructor(foo: string) {
    function func() {
      this.foo = 'aa';
    }
  }
}
      `,
      errors: [
        {
          column: 20,
          line: 3,
          messageId: 'preferGetterStyle',
          suggestions: [
            {
              messageId: 'preferGetterStyleSuggestion',
              output: `
class A {
  private get foo() { return 'bar'; }
  constructor(foo: string) {
    function func() {
      this.foo = 'aa';
    }
  }
}
      `,
            },
          ],
        },
      ],
      options: ['getters'],
    },
  ],
  valid: [
    `
class Mx {
  declare readonly p1 = 1;
}
    `,
    `
class Mx {
  readonly p1 = 'hello world';
}
    `,
    `
class Mx {
  p1 = 'hello world';
}
    `,
    `
class Mx {
  static p1 = 'hello world';
}
    `,
    `
class Mx {
  p1: string;
}
    `,
    `
class Mx {
  get p1();
}
    `,
    `
class Mx {
  get p1() {}
}
    `,
    `
abstract class Mx {
  abstract get p1(): string;
}
    `,
    `
      class Mx {
        get mySetting() {
          if (this._aValue) {
            return 'on';
          }

          return 'off';
        }
      }
    `,
    `
      class Mx {
        get mySetting() {
          return \`build-\${process.env.build}\`;
        }
      }
    `,
    `
      class Mx {
        getMySetting() {
          if (this._aValue) {
            return 'on';
          }

          return 'off';
        }
      }
    `,
    `
      class Mx {
        public readonly myButton = styled.button\`
          color: \${props => (props.primary ? 'hotpink' : 'turquoise')};
        \`;
      }
    `,
    `
      class Mx {
        set p1(val) {}
        get p1() {
          return '';
        }
      }
    `,
    `
      let p1 = 'p1';
      class Mx {
        set [p1](val) {}
        get [p1]() {
          return '';
        }
      }
    `,
    `
      let p1 = 'p1';
      class Mx {
        set [/* before set */ p1 /* after set */](val) {}
        get [/* before get */ p1 /* after get */]() {
          return '';
        }
      }
    `,
    `
      class Mx {
        set ['foo'](val) {}
        get foo() {
          return '';
        }
        set bar(val) {}
        get ['bar']() {
          return '';
        }
        set ['baz'](val) {}
        get baz() {
          return '';
        }
      }
    `,
    {
      code: `
        class Mx {
          public get myButton() {
            return styled.button\`
              color: \${props => (props.primary ? 'hotpink' : 'turquoise')};
            \`;
          }
        }
      `,
      options: ['fields'],
    },
    {
      code: `
class Mx {
  declare public readonly foo = 1;
}
      `,
      options: ['getters'],
    },
    {
      code: `
class Mx {
  get p1() {
    return 'hello world';
  }
}
      `,
      options: ['getters'],
    },
    {
      code: `
class Mx {
  p1 = 'hello world';
}
      `,
      options: ['getters'],
    },
    {
      code: `
class Mx {
  p1: string;
}
      `,
      options: ['getters'],
    },
    {
      code: `
class Mx {
  readonly p1 = [1, 2, 3];
}
      `,
      options: ['getters'],
    },
    {
      code: `
class Mx {
  static p1: string;
}
      `,
      options: ['getters'],
    },
    {
      code: `
class Mx {
  static get p1() {
    return 'hello world';
  }
}
      `,
      options: ['getters'],
    },
    {
      code: `
        class Mx {
          public readonly myButton = styled.button\`
            color: \${props => (props.primary ? 'hotpink' : 'turquoise')};
          \`;
        }
      `,
      options: ['getters'],
    },
    {
      code: `
        class Mx {
          public get myButton() {
            return styled.button\`
              color: \${props => (props.primary ? 'hotpink' : 'turquoise')};
            \`;
          }
        }
      `,
      options: ['getters'],
    },
    {
      code: `
        class A {
          private readonly foo: string = 'bar';
          constructor(foo: string) {
            this.foo = foo;
          }
        }
      `,
      options: ['getters'],
    },
    {
      code: `
        class A {
          private readonly foo: string = 'bar';
          constructor(foo: string) {
            this['foo'] = foo;
          }
        }
      `,
      options: ['getters'],
    },
    {
      code: `
        class A {
          private readonly foo: string = 'bar';
          constructor(foo: string) {
            const bar = new (class {
              private readonly foo: string = 'baz';
              constructor() {
                this.foo = 'qux';
              }
            })();
            this['foo'] = foo;
          }
        }
      `,
      options: ['getters'],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3602
      // getter with override modifier should be ignored
      code: `
declare abstract class BaseClass {
  get cursor(): string;
}

class ChildClass extends BaseClass {
  override get cursor() {
    return 'overridden value';
  }
}
      `,
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3602
      // property with override modifier should be ignored
      code: `
declare abstract class BaseClass {
  protected readonly foo: string;
}

class ChildClass extends BaseClass {
  protected override readonly foo = 'bar';
}
      `,
      options: ['getters'],
    },
  ],
});

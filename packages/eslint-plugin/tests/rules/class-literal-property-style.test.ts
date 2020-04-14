import rule from '../../src/rules/class-literal-property-style';
import { RuleTester, noFormat } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('class-literal-property-style', rule, {
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
  public declare readonly foo = 1;
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
  ],
  invalid: [
    {
      code: `
class Mx {
  get p1() {
    return 'hello world';
  }
}
      `,
      output: `
class Mx {
  readonly p1 = 'hello world';
}
      `,
      errors: [
        {
          messageId: 'preferFieldStyle',
          column: 7,
          line: 3,
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
      output: `
class Mx {
  readonly p1 = \`hello world\`;
}
      `,
      errors: [
        {
          messageId: 'preferFieldStyle',
          column: 7,
          line: 3,
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
      output: `
class Mx {
  static readonly p1 = 'hello world';
}
      `,
      errors: [
        {
          messageId: 'preferFieldStyle',
          column: 14,
          line: 3,
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
      output: `
class Mx {
  public static readonly foo = 1;
}
      `,
      errors: [
        {
          messageId: 'preferFieldStyle',
          column: 21,
          line: 3,
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
      output: `
class Mx {
  public readonly [myValue] = 'a literal value';
}
      `,
      errors: [
        {
          messageId: 'preferFieldStyle',
          column: 15,
          line: 3,
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
      output: `
class Mx {
  public readonly [myValue] = 12345n;
}
      `,
      errors: [
        {
          messageId: 'preferFieldStyle',
          column: 15,
          line: 3,
        },
      ],
    },
    {
      code: `
class Mx {
  public readonly [myValue] = 'a literal value';
}
      `,
      output: noFormat`
class Mx {
  public get [myValue]() { return 'a literal value'; }
}
      `,
      errors: [
        {
          messageId: 'preferGetterStyle',
          column: 20,
          line: 3,
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
      output: noFormat`
class Mx {
  get p1() { return 'hello world'; }
}
      `,
      errors: [
        {
          messageId: 'preferGetterStyle',
          column: 12,
          line: 3,
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
      output: noFormat`
class Mx {
  get p1() { return \`hello world\`; }
}
      `,
      errors: [
        {
          messageId: 'preferGetterStyle',
          column: 12,
          line: 3,
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
      output: noFormat`
class Mx {
  static get p1() { return 'hello world'; }
}
      `,
      errors: [
        {
          messageId: 'preferGetterStyle',
          column: 19,
          line: 3,
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
      output: `
class Mx {
  protected readonly p1 = 'hello world';
}
      `,
      errors: [
        {
          messageId: 'preferFieldStyle',
          column: 17,
          line: 3,
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
      output: noFormat`
class Mx {
  protected get p1() { return 'hello world'; }
}
      `,
      errors: [
        {
          messageId: 'preferGetterStyle',
          column: 22,
          line: 3,
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
      output: `
class Mx {
  public static readonly p1 = 'hello world';
}
      `,
      errors: [
        {
          messageId: 'preferFieldStyle',
          column: 21,
          line: 3,
        },
      ],
    },
    {
      code: `
class Mx {
  public static readonly p1 = 'hello world';
}
      `,
      output: noFormat`
class Mx {
  public static get p1() { return 'hello world'; }
}
      `,
      errors: [
        {
          messageId: 'preferGetterStyle',
          column: 26,
          line: 3,
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
      output: noFormat`
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
          messageId: 'preferFieldStyle',
          column: 14,
          line: 3,
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
      output: noFormat`
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
      errors: [
        {
          messageId: 'preferGetterStyle',
          column: 19,
          line: 3,
        },
      ],
      options: ['getters'],
    },
  ],
});

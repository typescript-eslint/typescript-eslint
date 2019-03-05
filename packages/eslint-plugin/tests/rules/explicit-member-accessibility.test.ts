import rule from '../../src/rules/explicit-member-accessibility';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('explicit-member-accessibility', rule, {
  valid: [
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string
  private x: number
  public getX () {
    return this.x
  }
}
            `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string
  protected foo?: string
  public "foo-bar"?: string
}
            `,
    },
    {
      filename: 'test.js',
      code: `
class Test {
  getX () {
    return 1;
  }
}
            `,
    },
  ],
  invalid: [
    {
      filename: 'test.ts',
      code: `
class Test {
  x: number
  public getX () {
    return this.x
  }
}
            `,
      errors: [
        {
          messageId: 'missingAccessibility',
          data: {
            type: 'class property',
            name: 'x',
          },
          line: 3,
          column: 3,
        },
      ],
      output: `
class Test {
  public x: number
  public getX () {
    return this.x
  }
}
            `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number
  getX () {
    return this.x
  }
}
            `,
      errors: [
        {
          messageId: 'missingAccessibility',
          data: {
            type: 'method definition',
            name: 'getX',
          },
          line: 4,
          column: 3,
        },
      ],
      output: `
class Test {
  private x: number
  public getX () {
    return this.x
  }
}
            `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  x?: number
  getX? () {
    return this.x
  }
}
            `,
      errors: [
        {
          messageId: 'missingAccessibility',
          data: {
            type: 'class property',
            name: 'x',
          },
          line: 3,
          column: 3,
        },
        {
          messageId: 'missingAccessibility',
          data: {
            type: 'method definition',
            name: 'getX',
          },
          line: 4,
          column: 3,
        },
      ],
      output: `
class Test {
  public x?: number
  public getX? () {
    return this.x
  }
}
            `,
    },
  ],
});

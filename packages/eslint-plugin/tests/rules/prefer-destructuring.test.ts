import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/prefer-destructuring';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('prefer-destructuring', rule, {
  valid: [
    // type annotated
    `
      declare const object: { foo: string };
      var foo: string = object.foo;
    `,
    `
      declare const array: number[];
      const bar: number = array[0];
    `,
    // enforceForDeclarationWithTypeAnnotation: true
    {
      code: `
        declare const object: { foo: string };
        var { foo } = object;
      `,
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: `
        declare const object: { foo: string };
        var { foo }: { foo: number } = object;
      `,
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: `
        declare const array: number[];
        var [foo] = array;
      `,
      options: [
        { array: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: `
        declare const array: number[];
        var [foo]: [foo: number] = array;
      `,
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: `
        declare const object: { bar: string };
        var foo: unknown = object.bar;
      `,
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: `
        declare const object: { foo: string };
        var { foo: bar } = object;
      `,
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: `
        declare const object: { foo: boolean };
        var { foo: bar }: { foo: boolean } = object;
      `,
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: `
        declare class Foo {
          foo: string;
        }

        class Bar extends Foo {
          static foo() {
            var foo: any = super.foo;
          }
        }
      `,
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },

    // numeric property for iterable / non-iterable
    `
      let x: { 0: unknown };
      let y = x[0];
    `,
    `
      let x: { 0: unknown };
      y = x[0];
    `,
    `
      let x: unknown;
      let y = x[0];
    `,
    `
      let x: unknown;
      y = x[0];
    `,
    `
      let x: { 0: unknown } | unknown[];
      let y = x[0];
    `,
    `
      let x: { 0: unknown } | unknown[];
      y = x[0];
    `,
    `
      let x: { 0: unknown } & (() => void);
      let y = x[0];
    `,
    `
      let x: { 0: unknown } & (() => void);
      y = x[0];
    `,
    `
      let x: Record<number, unknown>;
      let y = x[0];
    `,
    `
      let x: Record<number, unknown>;
      y = x[0];
    `,
    {
      code: `
        let x: { 0: unknown };
        let { 0: y } = x;
      `,
      options: [
        { array: true, object: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        let x: { 0: unknown };
        ({ 0: y } = x);
      `,
      options: [
        { array: true, object: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        let x: { 0: unknown };
        let y = x[0];
      `,
      options: [{ array: true }, { enforceForRenamedProperties: true }],
    },
    {
      code: `
        let x: { 0: unknown };
        y = x[0];
      `,
      options: [{ array: true }, { enforceForRenamedProperties: true }],
    },
    {
      code: `
        let x: { 0: unknown };
        let y = x[0];
      `,
      options: [
        {
          VariableDeclarator: { array: true, object: false },
          AssignmentExpression: { array: true, object: true },
        },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        let x: { 0: unknown };
        y = x[0];
      `,
      options: [
        {
          VariableDeclarator: { array: true, object: true },
          AssignmentExpression: { array: true, object: false },
        },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        let x: Record<number, unknown>;
        let i: number = 0;
        y = x[i];
      `,
      options: [
        { object: false, array: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        let x: Record<number, unknown>;
        let i: 0 = 0;
        y = x[i];
      `,
      options: [
        { object: false, array: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        let x: Record<number, unknown>;
        let i: 0 | 1 | 2 = 0;
        y = x[i];
      `,
      options: [
        { object: false, array: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        let x: unknown[];
        let i: number = 0;
        y = x[i];
      `,
      options: [
        { object: false, array: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        let x: unknown[];
        let i: 0 = 0;
        y = x[i];
      `,
      options: [
        { object: false, array: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        let x: unknown[];
        let i: 0 | 1 | 2 = 0;
        y = x[i];
      `,
      options: [
        { object: false, array: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        let x: unknown[];
        let i: number = 0;
        y = x[i];
      `,
      options: [
        { object: true, array: true },
        { enforceForRenamedProperties: false },
      ],
    },
    {
      code: `
        let x: { 0: unknown };
        y += x[0];
      `,
      options: [
        { object: true, array: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        class Bar {
          public [0]: unknown;
        }
        class Foo extends Bar {
          static foo() {
            let y = super[0];
          }
        }
      `,
      options: [
        { object: true, array: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: `
        class Bar {
          public [0]: unknown;
        }
        class Foo extends Bar {
          static foo() {
            y = super[0];
          }
        }
      `,
      options: [
        { object: true, array: true },
        { enforceForRenamedProperties: true },
      ],
    },

    // already destructured
    `
      let xs: unknown[] = [1];
      let [x] = xs;
    `,
    `
      const obj: { x: unknown } = { x: 1 };
      const { x } = obj;
    `,
    `
      var obj: { x: unknown } = { x: 1 };
      var { x: y } = obj;
    `,
    `
      let obj: { x: unknown } = { x: 1 };
      let key: 'x' = 'x';
      let { [key]: foo } = obj;
    `,
    `
      const obj: { x: unknown } = { x: 1 };
      let x: unknown;
      ({ x } = obj);
    `,

    // valid unless enforceForRenamedProperties is true
    `
      let obj: { x: unknown } = { x: 1 };
      let y = obj.x;
    `,
    `
      var obj: { x: unknown } = { x: 1 };
      var y: unknown;
      y = obj.x;
    `,
    `
      const obj: { x: unknown } = { x: 1 };
      const y = obj['x'];
    `,
    `
      let obj: Record<string, unknown> = {};
      let key = 'abc';
      var y = obj[key];
    `,

    // shorthand operators shouldn't be reported;
    `
      let obj: { x: number } = { x: 1 };
      let x = 10;
      x += obj.x;
    `,
    `
      let obj: { x: boolean } = { x: false };
      let x = true;
      x ||= obj.x;
    `,
    `
      const xs: number[] = [1];
      let x = 3;
      x *= xs[0];
    `,

    // optional chaining shouldn't be reported
    `
      let xs: unknown[] | undefined;
      let x = xs?.[0];
    `,
    `
      let obj: Record<string, unknown> | undefined;
      let x = obj?.x;
    `,

    // private identifiers
    `
      class C {
        #foo: string;

        method() {
          const foo: unknown = this.#foo;
        }
      }
    `,
    `
      class C {
        #foo: string;

        method() {
          let foo: unknown;
          foo = this.#foo;
        }
      }
    `,
    {
      code: `
        class C {
          #foo: string;

          method() {
            const bar: unknown = this.#foo;
          }
        }
      `,
      options: [
        { object: true, array: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: `
        class C {
          #foo: string;

          method(another: C) {
            let bar: unknown;
            bar: unknown = another.#foo;
          }
        }
      `,
      options: [
        { object: true, array: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: `
        class C {
          #foo: string;

          method() {
            const foo: unknown = this.#foo;
          }
        }
      `,
      options: [
        { object: true, array: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
  ],
  invalid: [
    // enforceForDeclarationWithTypeAnnotation: true
    {
      code: 'var foo: string = object.foo;',
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
      output: null,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo: string = array[0];',
      options: [
        { array: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
      output: null,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo: unknown = object.bar;',
      options: [
        { object: true },
        {
          enforceForDeclarationWithTypeAnnotation: true,
          enforceForRenamedProperties: true,
        },
      ],
      output: null,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },

    // numeric property for iterable / non-iterable
    {
      code: `
        let x: { [Symbol.iterator]: unknown };
        let y = x[0];
      `,
      output: null,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        let x: { [Symbol.iterator]: unknown };
        y = x[0];
      `,
      output: null,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: [1, 2, 3];
        let y = x[0];
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        let x: [1, 2, 3];
        y = x[0];
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        function* it() {
          yield 1;
        }
        let y = it()[0];
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        function* it() {
          yield 1;
        }
        y = it()[0];
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: any;
        let y = x[0];
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        let x: any;
        y = x[0];
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: string[] | { [Symbol.iterator]: unknown };
        let y = x[0];
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        let x: string[] | { [Symbol.iterator]: unknown };
        y = x[0];
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: object & unknown[];
        let y = x[0];
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        let x: object & unknown[];
        y = x[0];
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: { 0: string };
        let y = x[0];
      `,
      options: [{ object: true }, { enforceForRenamedProperties: true }],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        let x: { 0: string };
        y = x[0];
      `,
      options: [{ object: true }, { enforceForRenamedProperties: true }],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: { 0: string };
        let y = x[0];
      `,
      options: [
        {
          VariableDeclarator: { object: true, array: false },
          AssignmentExpression: { object: false, array: false },
        },
        { enforceForRenamedProperties: true },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        let x: { 0: string };
        y = x[0];
      `,
      options: [
        {
          VariableDeclarator: { object: false, array: false },
          AssignmentExpression: { object: true, array: false },
        },
        { enforceForRenamedProperties: true },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: Record<number, unknown>;
        let i: number = 0;
        y = x[i];
      `,
      options: [
        { object: true, array: true },
        { enforceForRenamedProperties: true },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: Record<number, unknown>;
        let i: 0 = 0;
        y = x[i];
      `,
      options: [
        { object: true, array: true },
        { enforceForRenamedProperties: true },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: Record<number, unknown>;
        let i: 0 | 1 | 2 = 0;
        y = x[i];
      `,
      options: [
        { object: true, array: true },
        { enforceForRenamedProperties: true },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: unknown[];
        let i: number = 0;
        y = x[i];
      `,
      options: [
        { object: true, array: true },
        { enforceForRenamedProperties: true },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: unknown[];
        let i: 0 = 0;
        y = x[i];
      `,
      options: [
        { object: true, array: true },
        { enforceForRenamedProperties: true },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: unknown[];
        let i: 0 | 1 | 2 = 0;
        y = x[i];
      `,
      options: [
        { object: true, array: true },
        { enforceForRenamedProperties: true },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let x: { 0: unknown } | unknown[];
        let y = x[0];
      `,
      options: [{ object: true }, { enforceForRenamedProperties: true }],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        let x: { 0: unknown } | unknown[];
        y = x[0];
      `,
      options: [{ object: true }, { enforceForRenamedProperties: true }],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },

    // auto fixes
    {
      code: `
        let obj = { foo: 'bar' };
        const foo = obj.foo;
      `,
      output: `
        let obj = { foo: 'bar' };
        const {foo} = obj;
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        let obj = { foo: 'bar' };
        var x: null = null;
        const foo = (x, obj).foo;
      `,
      output: `
        let obj = { foo: 'bar' };
        var x: null = null;
        const {foo} = (x, obj);
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'const call = (() => null).call;',
      output: 'const {call} = () => null;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        const obj = { foo: 'bar' };
        let a: any;
        var foo = (a = obj).foo;
      `,
      output: `
        const obj = { foo: 'bar' };
        let a: any;
        var {foo} = a = obj;
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        const obj = { asdf: { qwer: null } };
        const qwer = obj.asdf.qwer;
      `,
      output: `
        const obj = { asdf: { qwer: null } };
        const {qwer} = obj.asdf;
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        const obj = { foo: 100 };
        const /* comment */ foo = obj.foo;
      `,
      output: `
        const obj = { foo: 100 };
        const /* comment */ {foo} = obj;
      `,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },

    // enforceForRenamedProperties: true
    {
      code: `
        let obj = { foo: 'bar' };
        const x = obj.foo;
      `,
      output: null,
      options: [{ object: true }, { enforceForRenamedProperties: true }],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        let obj = { foo: 'bar' };
        let x: unknown;
        x = obj.foo;
      `,
      output: null,
      options: [{ object: true }, { enforceForRenamedProperties: true }],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: `
        let obj: Record<string, unknown>;
        let key = 'abc';
        const x = obj[key];
      `,
      output: null,
      options: [{ object: true }, { enforceForRenamedProperties: true }],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: `
        let obj: Record<string, unknown>;
        let key = 'abc';
        let x: unknown;
        x = obj[key];
      `,
      output: null,
      options: [{ object: true }, { enforceForRenamedProperties: true }],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
  ],
});

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
    'var foo: string = object.foo;',
    'const bar: number = array[0];',
    // enforceForDeclarationWithTypeAnnotation: true
    {
      code: 'var { foo } = object;',
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: 'var { foo }: { foo: number } = object;',
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: 'var [foo] = array;',
      options: [
        { array: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: 'var [foo]: [foo: number] = array;',
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: 'var foo: unknown = object.bar;',
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: 'var { foo: bar } = object;',
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: 'var { foo: bar }: { foo: boolean } = object;',
      options: [
        { object: true },
        { enforceForDeclarationWithTypeAnnotation: true },
      ],
    },
    {
      code: `
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
  ],
});

/*
 * These test cases are based on code from the ESLint project (https://github.com/eslint/eslint).
 * ESLint is licensed under the MIT License.
 * Copyright (c) 2023 OpenJS Foundation and other contributors, <www.openjsf.org>.
 */
ruleTester.run('prefer-destructuring', rule, {
  /* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
  valid: [
    'var [foo] = array;',
    'var { foo } = object;',
    'var foo;',
    {
      // Ensure that the default behavior does not require destructuring when renaming
      code: 'var foo = object.bar;',
      options: [{ VariableDeclarator: { object: true } }, {}],
    },
    {
      // Ensure that the default behavior does not require destructuring when renaming
      code: 'var foo = object.bar;',
      options: [{ object: true }, {}],
    },
    {
      code: 'var foo = object.bar;',
      options: [
        { VariableDeclarator: { object: true } },
        { enforceForRenamedProperties: false },
      ],
    },
    {
      code: 'var foo = object.bar;',
      options: [{ object: true }, { enforceForRenamedProperties: false }],
    },
    {
      code: "var foo = object['bar'];",
      options: [
        { VariableDeclarator: { object: true } },
        { enforceForRenamedProperties: false },
      ],
    },
    {
      code: 'var foo = object[bar];',
      options: [{ object: true }, { enforceForRenamedProperties: false }],
    },
    {
      code: 'var { bar: foo } = object;',
      options: [
        { VariableDeclarator: { object: true } },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: 'var { bar: foo } = object;',
      options: [{ object: true }, { enforceForRenamedProperties: true }],
    },
    {
      code: 'var { [bar]: foo } = object;',
      options: [
        { VariableDeclarator: { object: true } },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: 'var { [bar]: foo } = object;',
      options: [{ object: true }, { enforceForRenamedProperties: true }],
    },
    {
      code: 'var foo = array[0];',
      options: [{ VariableDeclarator: { array: false } }],
    },
    {
      code: 'var foo = array[0];',
      options: [{ array: false }],
    },
    {
      code: 'var foo = object.foo;',
      options: [{ VariableDeclarator: { object: false } }],
    },
    {
      code: "var foo = object['foo'];",
      options: [{ VariableDeclarator: { object: false } }],
    },
    '({ foo } = object);',
    {
      // Fix #8654
      code: 'var foo = array[0];',
      options: [
        { VariableDeclarator: { array: false } },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      // Fix #8654
      code: 'var foo = array[0];',
      options: [{ array: false }, { enforceForRenamedProperties: true }],
    },
    '[foo] = array;',
    'foo += array[0]',
    {
      code: 'foo &&= array[0]',
      parserOptions: { ecmaVersion: 2021 },
    },
    'foo += bar.foo',
    {
      code: 'foo ||= bar.foo',
      parserOptions: { ecmaVersion: 2021 },
    },
    {
      code: "foo ??= bar['foo']",
      parserOptions: { ecmaVersion: 2021 },
    },
    {
      code: 'foo = object.foo;',
      options: [
        { AssignmentExpression: { object: false } },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: 'foo = object.foo;',
      options: [
        { AssignmentExpression: { object: false } },
        { enforceForRenamedProperties: false },
      ],
    },
    {
      code: 'foo = array[0];',
      options: [
        { AssignmentExpression: { array: false } },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: 'foo = array[0];',
      options: [
        { AssignmentExpression: { array: false } },
        { enforceForRenamedProperties: false },
      ],
    },
    {
      code: 'foo = array[0];',
      options: [
        {
          VariableDeclarator: { array: true },
          AssignmentExpression: { array: false },
        },
        { enforceForRenamedProperties: false },
      ],
    },
    {
      code: 'var foo = array[0];',
      options: [
        {
          VariableDeclarator: { array: false },
          AssignmentExpression: { array: true },
        },
        { enforceForRenamedProperties: false },
      ],
    },
    {
      code: 'foo = object.foo;',
      options: [
        {
          VariableDeclarator: { object: true },
          AssignmentExpression: { object: false },
        },
      ],
    },
    {
      code: 'var foo = object.foo;',
      options: [
        {
          VariableDeclarator: { object: false },
          AssignmentExpression: { object: true },
        },
      ],
    },
    'class Foo extends Bar { static foo() {var foo = super.foo} }',
    'foo = bar[foo];',
    'var foo = bar[foo];',
    {
      code: 'var {foo: {bar}} = object;',
      options: [{ object: true }],
    },
    {
      code: 'var {bar} = object.foo;',
      options: [{ object: true }],
    },

    // Optional chaining
    'var foo = array?.[0];', // because the fixed code can throw TypeError.
    'var foo = object?.foo;',

    // Private identifiers
    'class C { #x; foo() { const x = this.#x; } }',
    'class C { #x; foo() { x = this.#x; } }',
    'class C { #x; foo(a) { x = a.#x; } }',
    {
      code: 'class C { #x; foo() { const x = this.#x; } }',
      options: [
        { array: true, object: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: 'class C { #x; foo() { const y = this.#x; } }',
      options: [
        { array: true, object: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: 'class C { #x; foo() { x = this.#x; } }',
      options: [
        { array: true, object: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: 'class C { #x; foo() { y = this.#x; } }',
      options: [
        { array: true, object: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: 'class C { #x; foo(a) { x = a.#x; } }',
      options: [
        { array: true, object: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: 'class C { #x; foo(a) { y = a.#x; } }',
      options: [
        { array: true, object: true },
        { enforceForRenamedProperties: true },
      ],
    },
    {
      code: 'class C { #x; foo() { x = this.a.#x; } }',
      options: [
        { array: true, object: true },
        { enforceForRenamedProperties: true },
      ],
    },
  ],
  invalid: [
    {
      code: 'var foo = array[0];',
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
      code: 'foo = array[0];',
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
      code: 'var foo = object.foo;',
      output: 'var {foo} = object;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = (a, b).foo;',
      output: 'var {foo} = (a, b);',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var length = (() => {}).length;',
      output: 'var {length} = () => {};',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = (a = b).foo;',
      output: 'var {foo} = a = b;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = (a || b).foo;',
      output: 'var {foo} = a || b;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = (f()).foo;',
      output: 'var {foo} = f();',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = object.bar.foo;',
      output: 'var {foo} = object.bar;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foobar = object.bar;',
      output: null,
      options: [
        { VariableDeclarator: { object: true } },
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
      code: 'var foobar = object.bar;',
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
      code: 'var foo = object[bar];',
      output: null,
      options: [
        { VariableDeclarator: { object: true } },
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
      code: 'var foo = object[bar];',
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
      code: 'var foo = object[foo];',
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
      code: "var foo = object['foo'];",
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
      code: 'foo = object.foo;',
      output: null,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: "foo = object['foo'];",
      output: null,
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: 'var foo = array[0];',
      output: null,
      options: [
        { VariableDeclarator: { array: true } },
        { enforceForRenamedProperties: true },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'foo = array[0];',
      output: null,
      options: [{ AssignmentExpression: { array: true } }],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: 'var foo = array[0];',
      output: null,
      options: [
        {
          VariableDeclarator: { array: true },
          AssignmentExpression: { array: false },
        },
        { enforceForRenamedProperties: true },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = array[0];',
      output: null,
      options: [
        {
          VariableDeclarator: { array: true },
          AssignmentExpression: { array: false },
        },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'foo = array[0];',
      output: null,
      options: [
        {
          VariableDeclarator: { array: false },
          AssignmentExpression: { array: true },
        },
      ],
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'array' },
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: 'foo = object.foo;',
      output: null,
      options: [
        {
          VariableDeclarator: { array: true, object: false },
          AssignmentExpression: { object: true },
        },
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
      code: 'class Foo extends Bar { static foo() {var bar = super.foo.bar} }',
      output: 'class Foo extends Bar { static foo() {var {bar} = super.foo} }',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },

    // comments
    {
      code: 'var /* comment */ foo = object.foo;',
      output: 'var /* comment */ {foo} = object;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var a, /* comment */foo = object.foo;',
      output: 'var a, /* comment */{foo} = object;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo /* comment */ = object.foo;',
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
      code: 'var a, foo /* comment */ = object.foo;',
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
      code: 'var foo /* comment */ = object.foo, a;',
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
      code: 'var foo // comment\n = object.foo;',
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
      code: 'var foo = /* comment */ object.foo;',
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
      code: 'var foo = // comment\n object.foo;',
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
      code: 'var foo = (/* comment */ object).foo;',
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
      code: 'var foo = (object /* comment */).foo;',
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
      code: 'var foo = bar(/* comment */).foo;',
      output: 'var {foo} = bar(/* comment */);',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = bar/* comment */.baz.foo;',
      output: 'var {foo} = bar/* comment */.baz;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = bar[// comment\nbaz].foo;',
      output: 'var {foo} = bar[// comment\nbaz];',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo // comment\n = bar(/* comment */).foo;',
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
      code: 'var foo = bar/* comment */.baz/* comment */.foo;',
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
      code: 'var foo = object// comment\n.foo;',
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
      code: 'var foo = object./* comment */foo;',
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
      code: 'var foo = (/* comment */ object.foo);',
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
      code: 'var foo = (object.foo /* comment */);',
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
      code: 'var foo = object.foo/* comment */;',
      output: 'var {foo} = object/* comment */;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = object.foo// comment',
      output: 'var {foo} = object// comment',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = object.foo/* comment */, a;',
      output: 'var {foo} = object/* comment */, a;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = object.foo// comment\n, a;',
      output: 'var {foo} = object// comment\n, a;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
    {
      code: 'var foo = object.foo, /* comment */ a;',
      output: 'var {foo} = object, /* comment */ a;',
      errors: [
        {
          messageId: 'preferDestructuring',
          data: { type: 'object' },
          type: AST_NODE_TYPES.VariableDeclarator,
        },
      ],
    },
  ],
  /* eslint-enable @typescript-eslint/internal/plugin-test-formatting */
});

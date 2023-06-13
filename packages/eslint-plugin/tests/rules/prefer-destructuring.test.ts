import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/prefer-destructuring';
import type { RunTests } from '../RuleTester';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

const baseTests: RunTests<'preferDestructuring', unknown[]> = {
  /*
   * This test code is based on code from the ESLint project (https://github.com/eslint/eslint).
   * ESLint is licensed under the MIT License.
   * Copyright (c) 2023 OpenJS Foundation and other contributors, <www.openjsf.org>.
   */
  /* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
  valid: [
    'var [foo] = array;',
    'var { foo } = object;',
    'var foo;',
    {
      // Ensure that the default behavior does not require destructuring when renaming
      code: 'var foo = object.bar;',
      options: [{ VariableDeclarator: { object: true } }],
    },
    {
      // Ensure that the default behavior does not require destructuring when renaming
      code: 'var foo = object.bar;',
      options: [{ object: true }],
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
};

ruleTester.run('prefer-desctructuring', rule, {
  valid: [
    ...baseTests.valid,
    // type annotated
    'var foo: string = object.foo;',
    'const bar: number = array[0];',
    // enforceForTypeAnnotatedProperties: true
    {
      code: 'var { foo } = object;',
      options: [{ object: true }, { enforceForTypeAnnotatedProperties: true }],
    },
    {
      code: 'var { foo }: { foo: number } = object;',
      options: [{ object: true }, { enforceForTypeAnnotatedProperties: true }],
    },
    {
      code: 'var [foo] = array;',
      options: [{ array: true }, { enforceForTypeAnnotatedProperties: true }],
    },
    {
      code: 'var [foo]: [foo: number] = array;',
      options: [{ object: true }, { enforceForTypeAnnotatedProperties: true }],
    },
    {
      code: 'var foo: unknown = object.bar;',
      options: [{ object: true }, { enforceForTypeAnnotatedProperties: true }],
    },
    {
      code: 'var { foo: bar } = object;',
      options: [{ object: true }, { enforceForTypeAnnotatedProperties: true }],
    },
    {
      code: 'var { foo: bar }: { foo: boolean } = object;',
      options: [{ object: true }, { enforceForTypeAnnotatedProperties: true }],
    },
  ],
  invalid: [
    ...baseTests.invalid,
    // enforceForTypeAnnotatedProperties: true
    {
      code: 'var foo: string = object.foo;',
      options: [{ object: true }, { enforceForTypeAnnotatedProperties: true }],
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
      options: [{ array: true }, { enforceForTypeAnnotatedProperties: true }],
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
          enforceForTypeAnnotatedProperties: true,
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
  ],
});

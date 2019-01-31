'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-useless-constructor'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  parser: '@typescript-eslint/parser'
});

const error = { message: 'Useless constructor.', type: 'MethodDefinition' };

ruleTester.run('no-useless-constructor', rule, {
  valid: [
    'class A { }',
    'class A { constructor(){ doSomething(); } }',
    'class A extends B { constructor(){} }',
    "class A extends B { constructor(){ super('foo'); } }",
    'class A extends B { constructor(foo, bar){ super(foo, bar, 1); } }',
    'class A extends B { constructor(){ super(); doSomething(); } }',
    'class A extends B { constructor(...args){ super(...args); doSomething(); } }',
    'class A { dummyMethod(){ doSomething(); } }',
    'class A extends B.C { constructor() { super(foo); } }',
    'class A extends B.C { constructor([a, b, c]) { super(...arguments); } }',
    'class A extends B.C { constructor(a = f()) { super(...arguments); } }',
    'class A extends B { constructor(a, b, c) { super(a, b); } }',
    'class A extends B { constructor(foo, bar){ super(foo); } }',
    'class A extends B { constructor(test) { super(); } }',
    'class A extends B { constructor() { foo; } }',
    'class A extends B { constructor(foo, bar) { super(bar); } }',
    // https://github.com/typescript-eslint/typescript-eslint/issues/15
    'declare class Foo { constructor(); }',
    'class Foo { constructor(); }',
    'abstract class Foo { constructor(); }',
    'abstract class Foo { abstract constructor(); }',
    // https://github.com/typescript-eslint/typescript-eslint/issues/48
    'class Foo { constructor(private name: string) {} }',
    'class Foo { constructor(public name: string) {} }',
    'class Foo { constructor(protected name: string) {} }',
    // https://github.com/typescript-eslint/typescript-eslint/pull/167#discussion_r252638401
    'class Foo { public constructor() {} }',
    'class Foo { private constructor() {} }',
    'class Foo { protected constructor() {} }',
    'class A extends B { public constructor() {} }',
    'class A extends B { protected constructor(foo, bar) { super(bar); } }',
    'class A extends B { private constructor(foo, bar) { super(bar); } }',
    'class A extends B { public constructor(foo){ super(foo); }'
  ],
  invalid: [
    {
      code: 'class A { constructor(){} }',
      errors: [error]
    },
    {
      code: "class A { 'constructor'(){} }",
      errors: [error]
    },
    {
      code: 'class A extends B { constructor() { super(); } }',
      errors: [error]
    },
    {
      code: 'class A extends B { constructor(foo){ super(foo); } }',
      errors: [error]
    },
    {
      code: 'class A extends B { constructor(foo, bar){ super(foo, bar); } }',
      errors: [error]
    },
    {
      code: 'class A extends B { constructor(...args){ super(...args); } }',
      errors: [error]
    },
    {
      code: 'class A extends B.C { constructor() { super(...arguments); } }',
      errors: [error]
    },
    {
      code:
        'class A extends B { constructor(a, b, ...c) { super(...arguments); } }',
      errors: [error]
    },
    {
      code:
        'class A extends B { constructor(a, b, ...c) { super(a, b, ...c); } }',
      errors: [error]
    }
  ]
});

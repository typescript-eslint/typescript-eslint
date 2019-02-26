import rule from '../../src/rules/generic-type-naming';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('generic-type-naming', rule, {
  valid: [
    { code: 'class<T1,T2,T3> { }', options: [] },
    { code: 'type ReadOnly<T extends object> = {}', options: [] },
    { code: 'interface SimpleMap<TFoo> { }', options: [] },
    { code: 'function get<T>() {}', options: [] },
    { code: 'interface GenericIdentityFn { <T>(arg: T): T }', options: [] },
    { code: 'class<x> { }', options: ['^x+$'] },
    { code: 'class<A> { }', options: ['^[A-Z]$'] },
    {
      code: 'class<A> extends B<Test> implements Foo<Test> { }',
      options: ['^[A-Z]$'],
    },
    {
      code: `
class<A> extends B<Test> implements Foo<Test> {
    test<Z> () {
        type Foo = Bar<Test>
    }
}
            `,
      options: ['^[A-Z]$'],
    },
    {
      code: 'class CounterContainer extends Container<Counter> { }',
      options: ['^T$'],
    },
  ],
  invalid: [
    {
      code: 'class<T,U,V> { }',
      options: [],
      errors: [
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'U', rule: '^T([A-Z0-9][a-zA-Z0-9]*){0,1}$' },
        },
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'V', rule: '^T([A-Z0-9][a-zA-Z0-9]*){0,1}$' },
        },
      ],
    },
    {
      code: 'class<x> { }',
      options: ['^[A-Z]+$'],
      errors: [
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'x', rule: '^[A-Z]+$' },
          line: 1,
          column: 7,
        },
      ],
    },
    {
      code: 'interface SimpleMap<x> { }',
      options: ['^[A-Z]+$'],
      errors: [
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'x', rule: '^[A-Z]+$' },
          line: 1,
          column: 21,
        },
      ],
    },
    {
      code: 'type R<x> = {}',
      options: ['^[A-Z]+$'],
      errors: [
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'x', rule: '^[A-Z]+$' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'function get<x>() {}',
      options: ['^[A-Z]+$'],
      errors: [
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'x', rule: '^[A-Z]+$' },
          line: 1,
          column: 14,
        },
      ],
    },
    {
      code: 'interface GenericIdentityFn { <x>(arg: x): x }',
      options: ['^[A-Z]+$'],
      errors: [
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'x', rule: '^[A-Z]+$' },
          line: 1,
          column: 32,
        },
      ],
    },
    {
      code: `
class<A> extends B<Test> implements Foo<Test> {
    test<Z> () {
        type Foo<T> = Bar<Test>
    }
}
            `,
      options: ['^[A-Z][0-9]$'],
      errors: [
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'A', rule: '^[A-Z][0-9]$' },
          line: 2,
          column: 7,
        },
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'Z', rule: '^[A-Z][0-9]$' },
          line: 3,
          column: 10,
        },
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'T', rule: '^[A-Z][0-9]$' },
          line: 4,
          column: 18,
        },
      ],
    },
    {
      code: `
abstract class<A, B> extends B<Test> implements Foo<Test> {
    test<Z> () {
        type Foo<T> = Bar<Test>
    }
}
            `,
      options: ['^[A-Z][0-9]$'],
      errors: [
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'A', rule: '^[A-Z][0-9]$' },
          line: 2,
          column: 16,
        },
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'B', rule: '^[A-Z][0-9]$' },
          line: 2,
          column: 19,
        },
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'Z', rule: '^[A-Z][0-9]$' },
          line: 3,
          column: 10,
        },
        {
          messageId: 'paramNotMatchRule',
          data: { name: 'T', rule: '^[A-Z][0-9]$' },
          line: 4,
          column: 18,
        },
      ],
    },
  ],
});

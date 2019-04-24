import rule, { MessageIds, Options } from '../../src/rules/semi';
import { InvalidTestCase, RuleTester, ValidTestCase } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('semi', rule, {
  valid: [
    `
class Class {
    prop: string;
}
    `,
    `
abstract class AbsClass {
    abstract prop: string;
    abstract meth(): string;
}
    `,
    `declare function declareFn(): string;`,
    `export default interface Foo {}`,
    'export = Foo;',
    'import f = require("f");',
    'type Foo = {};',
  ].reduce<ValidTestCase<Options>[]>((acc, code) => {
    acc.push({
      code,
      options: ['always'],
    });
    acc.push({
      code: code.replace(/;/g, ''),
      options: ['never'],
    });

    return acc;
  }, []),
  invalid: [
    {
      code: `
class Class {
    prop: string;
}
      `,
      errors: [
        {
          line: 3,
        },
      ],
    },
    {
      code: `
abstract class AbsClass {
    abstract prop: string;
    abstract meth(): string;
}
      `,
      errors: [
        {
          line: 3,
        },
        {
          line: 4,
        },
      ],
    },
    {
      code: `declare function declareFn(): string;`,
      errors: [
        {
          line: 1,
        },
      ],
    },
    {
      code: 'export = Foo;',
      errors: [
        {
          line: 1,
        },
      ],
    },
    {
      code: 'import f = require("f");',
      errors: [
        {
          line: 1,
        },
      ],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          line: 1,
        },
      ],
    },
  ].reduce<InvalidTestCase<MessageIds, Options>[]>((acc, test) => {
    acc.push({
      code: test.code.replace(/;/g, ''),
      options: ['always'],
      errors: test.errors.map(e => ({
        ...e,
        message: 'Missing semicolon.',
      })) as any,
    });
    acc.push({
      code: test.code,
      options: ['never'],
      errors: test.errors.map(e => ({
        ...e,
        message: 'Extra semicolon.',
      })) as any,
    });

    return acc;
  }, []),
});

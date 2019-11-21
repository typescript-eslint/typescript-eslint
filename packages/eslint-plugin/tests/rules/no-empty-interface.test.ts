import { TSESLint } from '@typescript-eslint/experimental-utils';
import * as parser from '@typescript-eslint/parser';
import rule from '../../src/rules/no-empty-interface';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-empty-interface', rule, {
  valid: [
    `
interface Foo {
    name: string;
}
        `,
    `
interface Foo {
    name: string;
}

interface Bar {
    age: number;
}

// valid because extending multiple interfaces can be used instead of a union type
interface Baz extends Foo, Bar {}
        `,
    {
      code: `
interface Foo {
    name: string;
}

interface Bar extends Foo {}
        `,
      options: [{ allowSingleExtends: true }],
    },
  ],
  invalid: [
    {
      code: 'interface Foo {}',
      errors: [
        {
          messageId: 'noEmpty',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'interface Foo extends {}',
      errors: [
        {
          messageId: 'noEmpty',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `
interface Foo {
    name: string;
}

interface Bar extends Foo {}
            `,
      options: [{ allowSingleExtends: false }],
      errors: [
        {
          messageId: 'noEmptyWithSuper',
          line: 6,
          column: 11,
        },
      ],
    },
  ],
});

describe('no-empty-interface | "noEmptyWithSuper" fixer', () => {
  const linter = new TSESLint.Linter();
  linter.defineRule('no-empty-interface', rule);
  linter.defineParser('@typescript-eslint/parser', parser);

  function testOutput(
    code: string,
    output: string,
    allowSingleExtends = false,
  ) {
    it(code, () => {
      const result = linter.verifyAndFix(
        code,
        {
          rules: { 'no-empty-interface': [2, { allowSingleExtends }] },
          parser: '@typescript-eslint/parser',
        },
        { fix: true },
      );

      expect(result.messages).toHaveLength(0);
      expect(result.output).toBe(output);
    });
  }

  testOutput(
    'interface Foo extends Array<number> {}',
    'type Foo = Array<number>',
  );

  testOutput(
    'interface Foo extends Array<number | {}> { }',
    'type Foo = Array<number | {}>',
  );

  testOutput(
    `
interface Bar {
  bar: string;
}
interface Foo extends Array<Bar> {}
`,
    `
interface Bar {
  bar: string;
}
type Foo = Array<Bar>
`,
  );

  testOutput(
    `
type R = Record<string, unknown>;
interface Foo extends R {   };`,
    `
type R = Record<string, unknown>;
type Foo = R;`,
  );
});

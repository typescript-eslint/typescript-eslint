import rule from '../../src/rules/prefer-at';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-at', rule, {
  valid: [
    'const a = arr.at(-1);',
    'const a = this.arr.at(-1);',
    'const a = this.#arr.at(-1);',
    'const a = this.#prop.arr.at(-1);',
    'const a = arr[arr.length + 1];',
    'const a = (arr ? b : c)[arr.length - 1];',
  ],
  invalid: [
    {
      code: 'const a = arr[arr.length - 1];',
      errors: [
        {
          messageId: 'preferAt',
          data: {
            name: 'arr',
          },
        },
      ],
      output: 'const a = arr.at(-1);',
    },
    {
      code: 'const a = this.arr[this.arr.length - 1];',
      errors: [
        {
          messageId: 'preferAt',
          data: {
            name: 'this.arr',
          },
        },
      ],
      output: 'const a = this.arr.at(-1);',
    },
    {
      code: 'const a = this.#arr[this.#arr.length - 1];',
      errors: [
        {
          messageId: 'preferAt',
          data: {
            name: 'this.#arr',
          },
        },
      ],
      output: 'const a = this.#arr.at(-1);',
    },
    {
      code: 'const a = this.#prop.arr[this.#prop.arr.length - 1];',
      errors: [
        {
          messageId: 'preferAt',
          data: {
            name: 'this.#prop.arr',
          },
        },
      ],
      output: 'const a = this.#prop.arr.at(-1);',
    },
  ],
});

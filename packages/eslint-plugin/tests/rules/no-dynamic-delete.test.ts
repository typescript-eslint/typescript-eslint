import rule from '../../src/rules/no-dynamic-delete';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId = 'noDynamicDelete';

ruleTester.run('no-dynamic-delete', rule, {
  valid: [
    {
      code: 'delete container.a;',
    },
    {
      code: 'delete container.b;',
    },
  ],
  invalid: [
    {
      code: 'delete container["a" + "b"];',
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: 'delete container["c"]',
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: 'delete container[7]',
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: 'delete container[+7]',
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: 'delete container[-7]',
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: 'delete container[NaN]',
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: 'delete container[getComputedName()]',
      errors: [
        {
          messageId,
        },
      ],
    },
  ],
});

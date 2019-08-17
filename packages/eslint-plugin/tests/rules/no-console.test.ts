import rule from '../../src/rules/no-console';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-console', rule, {
  valid: [
    `const console = 'Not a valid console this rule cares'`,
    `console.error = function (message) {
      throw new Error(message + 'Not a valid console this rule cares');
    };`,
    {
      code: `console.log('Valid console since it is allowed(Dot notation)')`,
      options: [
        {
          allow: ['log'],
        },
      ],
    },
    {
      code: `console['warn']('Valid console since it is allowed(Bracket notation)')`,
      options: [
        {
          allow: ['warn'],
        },
      ],
    },
    {
      code: `console['CustomMethod']('Valid console since it is allowed(User made method)')`,
      options: [
        {
          allow: ['CustomMethod'],
        },
      ],
    },
  ],
  invalid: [
    {
      code: `console.log('Valid console but no allow option specified')`,
      errors: [
        {
          messageId: 'noConsole',
          data: {
            methodName: 'console.log',
          },
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `console.dir('Valid console but not allowed method')`,
      options: [
        {
          allow: ['warn'],
        },
      ],
      errors: [
        {
          messageId: 'noConsole',
          data: {
            methodName: 'console.dir',
          },
          line: 1,
          column: 1,
        },
      ],
    },
  ],
});

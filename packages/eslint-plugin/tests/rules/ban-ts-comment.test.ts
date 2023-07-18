import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/ban-ts-comment';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('ts-expect-error', rule, {
  valid: [
    '// just a comment containing @ts-expect-error somewhere',
    `
/*
 @ts-expect-error running with long description in a block
*/
    `,
    {
      code: '// @ts-expect-error',
      options: [{ 'ts-expect-error': false }],
    },
    {
      code: '// @ts-expect-error here is why the error is expected',
      options: [
        {
          'ts-expect-error': 'allow-with-description',
        },
      ],
    },
    {
      code: '// @ts-expect-error exactly 21 characters',
      options: [
        {
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 21,
        },
      ],
    },
    {
      code: '// @ts-expect-error: TS1234 because xyz',
      options: [
        {
          'ts-expect-error': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
          minimumDescriptionLength: 10,
        },
      ],
    },
    {
      code: noFormat`// @ts-expect-error 👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦`,
      options: [
        {
          'ts-expect-error': 'allow-with-description',
        },
      ],
    },
  ],
  invalid: [
    {
      code: '// @ts-expect-error',
      options: [{ 'ts-expect-error': true }],
      errors: [
        {
          data: { directive: 'expect-error' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/* @ts-expect-error */',
      options: [{ 'ts-expect-error': true }],
      errors: [
        {
          data: { directive: 'expect-error' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
/*
@ts-expect-error
*/
      `,
      options: [{ 'ts-expect-error': true }],
      errors: [
        {
          data: { directive: 'expect-error' },
          messageId: 'tsDirectiveComment',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: '/** @ts-expect-error */',
      options: [{ 'ts-expect-error': true }],
      errors: [
        {
          data: { directive: 'expect-error' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-expect-error: Suppress next line',
      options: [{ 'ts-expect-error': true }],
      errors: [
        {
          data: { directive: 'expect-error' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/////@ts-expect-error: Suppress next line',
      options: [{ 'ts-expect-error': true }],
      errors: [
        {
          data: { directive: 'expect-error' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
if (false) {
  // @ts-expect-error: Unreachable code error
  console.log('hello');
}
      `,
      options: [{ 'ts-expect-error': true }],
      errors: [
        {
          data: { directive: 'expect-error' },
          messageId: 'tsDirectiveComment',
          line: 3,
          column: 3,
        },
      ],
    },
    {
      code: '// @ts-expect-error',
      options: [
        {
          'ts-expect-error': 'allow-with-description',
        },
      ],
      errors: [
        {
          data: { directive: 'expect-error', minimumDescriptionLength: 3 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-expect-error: TODO',
      options: [
        {
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 10,
        },
      ],
      errors: [
        {
          data: { directive: 'expect-error', minimumDescriptionLength: 10 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-expect-error: TS1234 because xyz',
      options: [
        {
          'ts-expect-error': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
          minimumDescriptionLength: 25,
        },
      ],
      errors: [
        {
          data: { directive: 'expect-error', minimumDescriptionLength: 25 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-expect-error: TS1234',
      options: [
        {
          'ts-expect-error': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
        },
      ],
      errors: [
        {
          data: { directive: 'expect-error', format: '^: TS\\d+ because .+$' },
          messageId: 'tsDirectiveCommentDescriptionNotMatchPattern',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: noFormat`// @ts-expect-error    : TS1234 because xyz`,
      options: [
        {
          'ts-expect-error': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
        },
      ],
      errors: [
        {
          data: { directive: 'expect-error', format: '^: TS\\d+ because .+$' },
          messageId: 'tsDirectiveCommentDescriptionNotMatchPattern',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: noFormat`// @ts-expect-error 👨‍👩‍👧‍👦`,
      options: [
        {
          'ts-expect-error': 'allow-with-description',
        },
      ],
      errors: [
        {
          data: { directive: 'expect-error', minimumDescriptionLength: 3 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
});

ruleTester.run('ts-ignore', rule, {
  valid: [
    '// just a comment containing @ts-ignore somewhere',
    {
      code: '// @ts-ignore',
      options: [{ 'ts-ignore': false }],
    },
    {
      code: '// @ts-ignore I think that I am exempted from any need to follow the rules!',
      options: [{ 'ts-ignore': 'allow-with-description' }],
    },
    {
      code: `
/*
 @ts-ignore running with long description in a block
*/
      `,
      options: [
        {
          'ts-ignore': 'allow-with-description',
          minimumDescriptionLength: 21,
        },
      ],
    },
    {
      code: '// @ts-ignore: TS1234 because xyz',
      options: [
        {
          'ts-ignore': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
          minimumDescriptionLength: 10,
        },
      ],
    },
    {
      code: noFormat`// @ts-ignore 👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦`,
      options: [
        {
          'ts-ignore': 'allow-with-description',
        },
      ],
    },
  ],
  invalid: [
    {
      code: '// @ts-ignore',
      options: [{ 'ts-ignore': true }],
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-ignore',
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/* @ts-ignore */',
      options: [{ 'ts-ignore': true }],
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
/*
 @ts-ignore
*/
      `,
      options: [{ 'ts-ignore': true }],
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: '/** @ts-ignore */',
      options: [{ 'ts-ignore': true }],
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-ignore: Suppress next line',
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/////@ts-ignore: Suppress next line',
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
if (false) {
  // @ts-ignore: Unreachable code error
  console.log('hello');
}
      `,
      errors: [
        {
          data: { directive: 'ignore' },
          messageId: 'tsDirectiveComment',
          line: 3,
          column: 3,
        },
      ],
    },
    {
      code: '// @ts-ignore',
      options: [{ 'ts-ignore': 'allow-with-description' }],
      errors: [
        {
          data: { directive: 'ignore', minimumDescriptionLength: 3 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: noFormat`// @ts-ignore         `,
      options: [{ 'ts-ignore': 'allow-with-description' }],
      errors: [
        {
          data: { directive: 'ignore', minimumDescriptionLength: 3 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-ignore    .',
      options: [{ 'ts-ignore': 'allow-with-description' }],
      errors: [
        {
          data: { directive: 'ignore', minimumDescriptionLength: 3 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-ignore: TS1234 because xyz',
      options: [
        {
          'ts-ignore': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
          minimumDescriptionLength: 25,
        },
      ],
      errors: [
        {
          data: { directive: 'ignore', minimumDescriptionLength: 25 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-ignore: TS1234',
      options: [
        {
          'ts-ignore': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
        },
      ],
      errors: [
        {
          data: { directive: 'ignore', format: '^: TS\\d+ because .+$' },
          messageId: 'tsDirectiveCommentDescriptionNotMatchPattern',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: noFormat`// @ts-ignore    : TS1234 because xyz`,
      options: [
        {
          'ts-ignore': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
        },
      ],
      errors: [
        {
          data: { directive: 'ignore', format: '^: TS\\d+ because .+$' },
          messageId: 'tsDirectiveCommentDescriptionNotMatchPattern',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: noFormat`// @ts-ignore 👨‍👩‍👧‍👦`,
      options: [
        {
          'ts-ignore': 'allow-with-description',
        },
      ],
      errors: [
        {
          data: { directive: 'ignore', minimumDescriptionLength: 3 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
});

ruleTester.run('ts-nocheck', rule, {
  valid: [
    '// just a comment containing @ts-nocheck somewhere',
    {
      code: '// @ts-nocheck',
      options: [{ 'ts-nocheck': false }],
    },
    {
      code: '// @ts-nocheck no doubt, people will put nonsense here from time to time just to get the rule to stop reporting, perhaps even long messages with other nonsense in them like other // @ts-nocheck or // @ts-ignore things',
      options: [{ 'ts-nocheck': 'allow-with-description' }],
    },
    {
      code: `
/*
 @ts-nocheck running with long description in a block
*/
      `,
      options: [
        {
          'ts-nocheck': 'allow-with-description',
          minimumDescriptionLength: 21,
        },
      ],
    },
    {
      code: '// @ts-nocheck: TS1234 because xyz',
      options: [
        {
          'ts-nocheck': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
          minimumDescriptionLength: 10,
        },
      ],
    },
    {
      code: noFormat`// @ts-nocheck 👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦`,
      options: [
        {
          'ts-nocheck': 'allow-with-description',
        },
      ],
    },
  ],
  invalid: [
    {
      code: '// @ts-nocheck',
      options: [{ 'ts-nocheck': true }],
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-nocheck',
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/* @ts-nocheck */',
      options: [{ 'ts-nocheck': true }],
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
/*
 @ts-nocheck
*/
      `,
      options: [{ 'ts-nocheck': true }],
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: '/** @ts-nocheck */',
      options: [{ 'ts-nocheck': true }],
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-nocheck: Suppress next line',
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/////@ts-nocheck: Suppress next line',
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
if (false) {
  // @ts-nocheck: Unreachable code error
  console.log('hello');
}
      `,
      errors: [
        {
          data: { directive: 'nocheck' },
          messageId: 'tsDirectiveComment',
          line: 3,
          column: 3,
        },
      ],
    },
    {
      code: '// @ts-nocheck',
      options: [{ 'ts-nocheck': 'allow-with-description' }],
      errors: [
        {
          data: { directive: 'nocheck', minimumDescriptionLength: 3 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-nocheck: TS1234 because xyz',
      options: [
        {
          'ts-nocheck': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
          minimumDescriptionLength: 25,
        },
      ],
      errors: [
        {
          data: { directive: 'nocheck', minimumDescriptionLength: 25 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-nocheck: TS1234',
      options: [
        {
          'ts-nocheck': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
        },
      ],
      errors: [
        {
          data: { directive: 'nocheck', format: '^: TS\\d+ because .+$' },
          messageId: 'tsDirectiveCommentDescriptionNotMatchPattern',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: noFormat`// @ts-nocheck    : TS1234 because xyz`,
      options: [
        {
          'ts-nocheck': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
        },
      ],
      errors: [
        {
          data: { directive: 'nocheck', format: '^: TS\\d+ because .+$' },
          messageId: 'tsDirectiveCommentDescriptionNotMatchPattern',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: noFormat`// @ts-nocheck 👨‍👩‍👧‍👦`,
      options: [
        {
          'ts-nocheck': 'allow-with-description',
        },
      ],
      errors: [
        {
          data: { directive: 'nocheck', minimumDescriptionLength: 3 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
});

ruleTester.run('ts-check', rule, {
  valid: [
    '// just a comment containing @ts-check somewhere',
    `
/*
 @ts-check running with long description in a block
*/
    `,
    {
      code: '// @ts-check',
      options: [{ 'ts-check': false }],
    },
    {
      code: '// @ts-check with a description and also with a no-op // @ts-ignore',
      options: [
        { 'ts-check': 'allow-with-description', minimumDescriptionLength: 3 },
      ],
    },
    {
      code: '// @ts-check: TS1234 because xyz',
      options: [
        {
          'ts-check': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
          minimumDescriptionLength: 10,
        },
      ],
    },
    {
      code: noFormat`// @ts-check 👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦`,
      options: [
        {
          'ts-check': 'allow-with-description',
        },
      ],
    },
  ],
  invalid: [
    {
      code: '// @ts-check',
      options: [{ 'ts-check': true }],
      errors: [
        {
          data: { directive: 'check' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/* @ts-check */',
      options: [{ 'ts-check': true }],
      errors: [
        {
          data: { directive: 'check' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
/*
 @ts-check
*/
      `,
      options: [{ 'ts-check': true }],
      errors: [
        {
          data: { directive: 'check' },
          messageId: 'tsDirectiveComment',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: '/** @ts-check */',
      options: [{ 'ts-check': true }],
      errors: [
        {
          data: { directive: 'check' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-check: Suppress next line',
      options: [{ 'ts-check': true }],
      errors: [
        {
          data: { directive: 'check' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '/////@ts-check: Suppress next line',
      options: [{ 'ts-check': true }],

      errors: [
        {
          data: { directive: 'check' },
          messageId: 'tsDirectiveComment',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
if (false) {
  // @ts-check: Unreachable code error
  console.log('hello');
}
      `,
      options: [{ 'ts-check': true }],
      errors: [
        {
          data: { directive: 'check' },
          messageId: 'tsDirectiveComment',
          line: 3,
          column: 3,
        },
      ],
    },
    {
      code: '// @ts-check',
      options: [{ 'ts-check': 'allow-with-description' }],
      errors: [
        {
          data: { directive: 'check', minimumDescriptionLength: 3 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-check: TS1234 because xyz',
      options: [
        {
          'ts-check': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
          minimumDescriptionLength: 25,
        },
      ],
      errors: [
        {
          data: { directive: 'check', minimumDescriptionLength: 25 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '// @ts-check: TS1234',
      options: [
        {
          'ts-check': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
        },
      ],
      errors: [
        {
          data: { directive: 'check', format: '^: TS\\d+ because .+$' },
          messageId: 'tsDirectiveCommentDescriptionNotMatchPattern',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: noFormat`// @ts-check    : TS1234 because xyz`,
      options: [
        {
          'ts-check': {
            descriptionFormat: '^: TS\\d+ because .+$',
          },
        },
      ],
      errors: [
        {
          data: { directive: 'check', format: '^: TS\\d+ because .+$' },
          messageId: 'tsDirectiveCommentDescriptionNotMatchPattern',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: noFormat`// @ts-check 👨‍👩‍👧‍👦`,
      options: [
        {
          'ts-check': 'allow-with-description',
        },
      ],
      errors: [
        {
          data: { directive: 'check', minimumDescriptionLength: 3 },
          messageId: 'tsDirectiveCommentRequiresDescription',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
});

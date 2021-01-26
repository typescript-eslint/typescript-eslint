import rule from '../../src/rules/no-unsafe-access';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-non-null-asccess', rule, {
  valid: [
    'x?.y;',
    'x?.y?.z;',
    'x?.[a];',
    'a?.b();',
    'a?.[x]?.b();',
    'Promise.resolve;',
    'Array.form;',
    'ArrayBuffer.length;',
    'Math.abs;',
    'Map.apply;',
    'Map.name;',
    'Object.prototype;',
    'Object.defineProperties;',
  ],
  invalid: [
    {
      code: 'a.b;',
      errors: [
        {
          messageId: 'noSafeAccess',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'noSafeAccess',
              output: 'a?.b;',
            },
          ],
        },
      ],
    },
    {
      code: 'a.b.c;',
      errors: [
        {
          messageId: 'noSafeAccess',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'noSafeAccess',
              output: 'a.b?.c;',
            },
          ],
        },
        {
          messageId: 'noSafeAccess',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'noSafeAccess',
              output: 'a?.b.c;',
            },
          ],
        },
      ],
    },
    {
      code: 'a[b].c;',
      errors: [
        {
          messageId: 'noSafeAccess',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'noSafeAccess',
              output: 'a[b]?.c;',
            },
          ],
        },
        {
          messageId: 'noSafeAccess',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'noSafeAccess',
              output: 'a?.[b].c;',
            },
          ],
        },
      ],
    },
    {
      code: 'a?.[b].c;',
      errors: [
        {
          messageId: 'noSafeAccess',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'noSafeAccess',
              output: 'a?.[b]?.c;',
            },
          ],
        },
      ],
    },
    {
      code: 'a.c();',
      errors: [
        {
          messageId: 'noSafeAccess',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'noSafeAccess',
              output: 'a?.c();',
            },
          ],
        },
      ],
    },
    {
      code: 'a.b().c;',
      errors: [
        {
          messageId: 'noSafeAccess',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'noSafeAccess',
              output: 'a.b()?.c;',
            },
          ],
        },
        {
          messageId: 'noSafeAccess',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'noSafeAccess',
              output: 'a?.b().c;',
            },
          ],
        },
      ],
    },
    {
      code: 'a[b]().c;',
      errors: [
        {
          messageId: 'noSafeAccess',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'noSafeAccess',
              output: 'a[b]()?.c;',
            },
          ],
        },
        {
          messageId: 'noSafeAccess',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'noSafeAccess',
              output: 'a?.[b]().c;',
            },
          ],
        },
      ],
    },
  ],
});

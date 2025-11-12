import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/require-explicit-array-types';

const ruleTester = new RuleTester();

ruleTester.run('require-explicit-array-types', rule, {
  valid: [
    // With type annotations
    'const arr: string[] = [];',
    'const arr: number[] = [];',
    'const arr: boolean[] = [];',
    'const arr: any[] = [];',
    'const arr: unknown[] = [];',
    'const arr: Array<string> = [];',
    'const arr: Array<number> = [];',
    'const arr: (string | number)[] = [];',
    'let arr: string[] = [];',
    'var arr: string[] = [];',

    // Non-empty arrays (should not trigger)
    'const arr = [1, 2, 3];',
    'const arr = ["a", "b"];',

    // Arrays with type annotation and elements
    'const arr: number[] = [1, 2, 3];',
    'const arr: string[] = ["a", "b"];',

    // Non-array assignments
    'const x = 5;',
    'const y = "hello";',
    'const z = null;',
    'const w = undefined;',

    // Array with type assertion
    'const arr = [] as string[];',
    'const arr = [] as number[];',

    // Explicit never[] type (intentional placeholder)
    'const placeholder: never[] = [];',
  ],
  invalid: [
    {
      code: 'const arr = [];',
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          data: {
            name: 'arr',
            kind: 'const',
          },
        },
      ],
    },
    {
      code: 'let arr = [];',
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          data: {
            name: 'arr',
            kind: 'let',
          },
        },
      ],
    },
    {
      code: 'var arr = [];',
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          data: {
            name: 'arr',
            kind: 'var',
          },
        },
      ],
    },
    {
      code: `
        const items = [];
        const data = [];
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          data: {
            name: 'items',
            kind: 'const',
          },
        },
        {
          messageId: 'missingTypeAnnotation',
          data: {
            name: 'data',
            kind: 'const',
          },
        },
      ],
    },
    {
      code: `
        const arr = [];
        arr.push(1);
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          data: {
            name: 'arr',
            kind: 'const',
          },
        },
      ],
    },
    {
      code: `
        function test() {
          const local = [];
        }
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          data: {
            name: 'local',
            kind: 'const',
          },
        },
      ],
    },
    {
      code: `
        if (true) {
          const arr = [];
        }
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          data: {
            name: 'arr',
            kind: 'const',
          },
        },
      ],
    },
    {
      code: `
        for (let i = 0; i < 10; i++) {
          const items = [];
        }
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          data: {
            name: 'items',
            kind: 'const',
          },
        },
      ],
    },
    {
      code: `
        const a = [];
        const b: number[] = [];
        const c = [];
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          data: {
            name: 'a',
            kind: 'const',
          },
        },
        {
          messageId: 'missingTypeAnnotation',
          data: {
            name: 'c',
            kind: 'const',
          },
        },
      ],
    },
  ],
});

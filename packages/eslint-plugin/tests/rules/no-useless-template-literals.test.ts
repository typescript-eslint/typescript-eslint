import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-useless-template-literals';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-useless-template-literals', rule, {
  valid: [
    "const string = 'a';",

    `
      const string = 'a';
      const concatenated = \`\${string}b\`;
    `,

    `
      const number = 1;
      const concatenated = \`\${number}b\`;
    `,

    `
      const boolean = true;
      const concatenated = \`\${boolean}b\`;
    `,

    `
      const nullish = null;
      const concatenated = \`\${nullish}-undefined\`;
    `,

    `
      const left = 'a';
      const right = 'b';
      const concatenated = \`\${left}\${right}\`;
    `,

    `
      const left = 'a';
      const right = 'c';
      const concatenated = \`\${left}b\${right}\`;
    `,

    `
      const left = 'a';
      const center = 'b';
      const right = 'c';
      const concatenated = \`\${left}\${center}\${right}\`;
    `,

    `
      const concatenated = \`1 + 1 = \${1 + 1}\`;
    `,

    `
      const concatenated = \`true && false = \${true && false}\`;
    `,

    `
      tag\`\${'a'}\${'b'}\`;
    `,

    `
      const number = 1;
      const wrapped = \`\${number}\`;
    `,

    `
      const boolean = true;
      const wrapped = \`\${boolean}\`;
    `,

    `
      const nullish = null;
      const wrapped = \`\${nullish}\`;
    `,

    `
      declare const union: string | number;
      const wrapped = \`\${union}\`;
    `,

    `
      declare const unknown: unknown;
      const wrapped = \`\${unknown}\`;
    `,

    `
      declare const never: never;
      const wrapped = \`\${never}\`;
    `,

    `
      declare const any: any;
      const wrapped = \`\${any}\`;
    `,

    `
      function func<T extends number>(arg: T) {
        const wrapped = \`\${arg}\`;
      }
    `,
  ],

  invalid: [
    {
      code: `
        const concatenated = \`\${'a'}\${'b'}\`;
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 2,
          column: 30,
        },
      ],
    },

    {
      code: `
        const concatenated = \`a\${'b'}\`;
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 2,
          column: 30,
        },
      ],
    },

    {
      code: `
        const concatenated = \`\${'1 + 1 = '}\${2}\`;
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 2,
          column: 30,
        },
      ],
    },

    {
      code: `
        const concatenated = \`1 + 1 = \${2}\`;
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 2,
          column: 30,
        },
      ],
    },

    {
      code: `
        const concatenated = \`\${'a'}\${true}\`;
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 2,
          column: 30,
        },
      ],
    },

    {
      code: `
        const string = 'a';
        const wrapped = \`\${string}\`;
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 3,
          column: 25,
        },
      ],
    },

    {
      code: `
        declare const intersection: string & { _brand: 'test-brand' };
        const wrapped = \`\${intersection}\`;
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 3,
          column: 25,
        },
      ],
    },

    {
      code: `
        function func<T extends string>(arg: T) {
          const wrapped = \`\${arg}\`;
        }
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 3,
          column: 27,
        },
      ],
    },
  ],
});

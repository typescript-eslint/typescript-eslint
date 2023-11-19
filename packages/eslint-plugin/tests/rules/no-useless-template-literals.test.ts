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

    // allow variables & literals concatenation
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
      const nullish = nullish;
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

    // allow expressions
    `
      const concatenated = \`1 + 1 = \${1 + 1}\`;
    `,

    `
      const concatenated = \`true && false = \${true && false}\`;
    `,

    // allow tagged template literals
    `
      tag\`\${'a'}\${'b'}\`;
    `,

    // allow wrapping numbers and booleans since it converts them to strings
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

    // allow union types that include string
    `
      declare const union: string | number;
      const wrapped = \`\${union}\`;
    `,
  ],

  invalid: [
    // don't allow concatenating only literals in a template literal
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

    // don't allow a single string variable in a template literal
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

    // don't allow intersection types that include string
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
  ],
});

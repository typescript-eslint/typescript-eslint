import rule from '../../src/rules/restrict-template-expressions';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('restrict-template-expressions', rule, {
  valid: [
    // Base case
    `
      const msg = \`arg = \${'foo'}\`;
    `,
    `
      const arg = 'foo';
      const msg = \`arg = \${arg}\`;
    `,
    `
      const arg = 'foo';
      const msg = \`arg = \${arg || 'default'}\`;
    `,
    `
      function test<T extends string>(arg: T) {
        return \`arg = \${arg}\`;
      }
    `,
    // Base case - don't check tagged templates
    `
      tag\`arg = \${null}\`;
    `,
    `
      const arg = {};
      tag\`arg = \${arg}\`;
    `,
    // allowNumber
    {
      options: [{ allowNumber: true }],
      code: `
        const arg = 123;
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowNumber: true }],
      code: `
        const arg = 123;
        const msg = \`arg = \${arg || 'default'}\`;
      `,
    },
    {
      options: [{ allowNumber: true }],
      code: `
        const arg = 123n;
        const msg = \`arg = \${arg || 'default'}\`;
      `,
    },
    {
      options: [{ allowNumber: true }],
      code: `
        function test<T extends number>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    {
      options: [{ allowNumber: true }],
      code: `
        function test<T extends bigint>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    {
      options: [{ allowNumber: true }],
      code: `
        function test<T extends string | number>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    // allowBoolean
    {
      options: [{ allowBoolean: true }],
      code: `
        const arg = true;
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowBoolean: true }],
      code: `
        const arg = true;
        const msg = \`arg = \${arg || 'default'}\`;
      `,
    },
    {
      options: [{ allowBoolean: true }],
      code: `
        function test<T extends boolean>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    {
      options: [{ allowBoolean: true }],
      code: `
        function test<T extends string | boolean>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    // allowNullable
    {
      options: [{ allowNullable: true }],
      code: `
        const arg = null;
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowNullable: true }],
      code: `
        declare const arg: string | null | undefined;
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowNullable: true }],
      code: `
        function test<T extends null | undefined>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    {
      options: [{ allowNullable: true }],
      code: `
        function test<T extends string | null>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    // allow ALL
    {
      options: [{ allowNumber: true, allowBoolean: true, allowNullable: true }],
      code: `
        type All = string | number | boolean | null | undefined;
        function test<T extends All>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
  ],

  invalid: [
    {
      code: `
        const msg = \`arg = \${123}\`;
      `,
      errors: [{ messageId: 'invalidType', line: 2, column: 30 }],
    },
    {
      code: `
        const msg = \`arg = \${false}\`;
      `,
      errors: [{ messageId: 'invalidType', line: 2, column: 30 }],
    },
    {
      code: `
        const msg = \`arg = \${null}\`;
      `,
      errors: [{ messageId: 'invalidType', line: 2, column: 30 }],
    },
    {
      code: `
        declare const arg: number;
        const msg = \`arg = \${arg}\`;
      `,
      errors: [{ messageId: 'invalidType', line: 3, column: 30 }],
    },
    {
      code: `
        declare const arg: boolean;
        const msg = \`arg = \${arg}\`;
      `,
      errors: [{ messageId: 'invalidType', line: 3, column: 30 }],
    },
    {
      options: [{ allowNumber: true, allowBoolean: true, allowNullable: true }],
      code: `
        const arg = {};
        const msg = \`arg = \${arg}\`;
      `,
      errors: [{ messageId: 'invalidType', line: 3, column: 30 }],
    },
    {
      options: [{ allowNumber: true, allowBoolean: true, allowNullable: true }],
      code: `
        function test<T extends {}>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      errors: [{ messageId: 'invalidType', line: 3, column: 27 }],
    },
  ],
});

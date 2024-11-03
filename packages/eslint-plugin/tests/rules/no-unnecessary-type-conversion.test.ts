import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/no-unnecessary-type-conversion';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: rootDir,
      project: './tsconfig.json',
    },
  },
});

const messageId = 'unnecessaryTypeConversion';

ruleTester.run('no-unnecessary-type-conversion', rule, {
  valid: [
    `
String(1);
    `,
    `
(1).toString();
    `,
    `
\`\${1}\`;
    `,
    `
'' + 1;
    `,
    `
1 + '';
    `,
    `
let str = 1;
str += '';
    `,
    `
Number('2');
    `,
    `
+'2';
    `,
    `
~~'2';
    `,
    `
Boolean(0);
    `,
    `
!!0;
    `,
    `
BigInt(3);
    `,
    `
new String('asdf');
    `,
    `
!false;
    `,
    `
~256;
    `,
  ],

  invalid: [
    {
      code: `
String('asdf');
      `,
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
      output: `
'asdf';
      `,
    },
    {
      code: `
'asdf'.toString();
      `,
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.Identifier,
        },
      ],
      output: `
'asdf';
      `,
    },
    {
      code: `
'' + 'asdf';
      `,
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
      output: `
'asdf';
      `,
    },
    {
      code: `
'asdf' + '';
      `,
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
      output: `
'asdf';
      `,
    },
    {
      code: `
Number(123);
      `,
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
      output: `
123;
      `,
    },
    {
      code: `
+123;
      `,
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.UnaryExpression,
        },
      ],
      output: `
123;
      `,
    },
    {
      code: `
~~123;
      `,
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.UnaryExpression,
        },
      ],
      output: `
123;
      `,
    },
    {
      code: `
Boolean(true);
      `,
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
      output: `
true;
      `,
    },
    {
      code: `
!!true;
      `,
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.UnaryExpression,
        },
      ],
      output: `
true;
      `,
    },
    {
      code: `
BigInt(BigInt(1));
      `,
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
      output: `
BigInt(1);
      `,
    },
  ],
});

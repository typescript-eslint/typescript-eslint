import rule from '../../src/rules/no-extra-parens';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-extra-parens', rule, {
  valid: [
    {
      code: `
        (0).toString();
        (function(){}) ? a() : b();        
        (/^a$/).test(x);       
        for (a of (b, c));        
        for (a of b);     
        for (a in b, c);  
        for (a in b);
      `,
    },
    {
      code: `t.true((me.get as SinonStub).calledWithExactly('/foo', other));`,
    },
    {
      code: `while ((foo = bar())) {}`,
      options: ['all', { conditionalAssign: false }],
    },
    {
      code: `if ((foo = bar())) {}`,
      options: ['all', { conditionalAssign: false }],
    },
    {
      code: `do; while ((foo = bar()))`,
      options: ['all', { conditionalAssign: false }],
    },
    {
      code: `for (;(a = b););`,
      options: ['all', { conditionalAssign: false }],
    },
    {
      code: `
        function a(b) {
          return (b = 1);
        }
      `,
      options: ['all', { returnAssign: false }],
    },
    {
      code: `
        function a(b) {
          return b ? (c = d) : (c = e);
        }
      `,
      options: ['all', { returnAssign: false }],
    },
    {
      code: `b => (b = 1);`,
      options: ['all', { returnAssign: false }],
    },
    {
      code: `b => b ? (c = d) : (c = e);`,
      options: ['all', { returnAssign: false }],
    },
    {
      code: `x = a || (b && c);`,
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: `x = a + (b * c);`,
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: `x = (a * b) / c;`,
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: `
        const Component = (<div />)
        const Component = (
            <div
                prop={true}
            />
        )
      `,
      options: ['all', { ignoreJSX: 'all' }],
    },
    {
      code: `
        const Component = (
            <div>
                <p />
            </div>
        )
        const Component = (
            <div
                prop={true}
            />
        )
      `,
      options: ['all', { ignoreJSX: 'multi-line' }],
    },
    {
      code: `
        const Component = (<div />)
        const Component = (<div><p /></div>)
      `,
      options: ['all', { ignoreJSX: 'single-line' }],
    },
    {
      code: `
        const b = a => 1 ? 2 : 3;
        const d = c => (1 ? 2 : 3);
      `,
      options: ['all', { enforceForArrowConditionals: false }],
    },
    {
      code: `
        (0).toString();
        (Object.prototype.toString.call());
        ({}.toString.call());
        (function(){} ? a() : b());
        (/^a$/).test(x);
        a = (b * c);
        (a * b) + c;
        typeof (a);
      `,
      options: ['functions'],
    },
  ],

  invalid: [
    {
      code: `a = (b * c);`,
      errors: [
        {
          messageId: 'unexpected',
          line: 1,
          column: 5,
        },
      ],
    },
    {
      code: `(a * b) + c;`,
      errors: [
        {
          messageId: 'unexpected',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `for (a in (b, c));`,
      errors: [
        {
          messageId: 'unexpected',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `for (a in (b));`,
      errors: [
        {
          messageId: 'unexpected',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `for (a of (b));`,
      errors: [
        {
          messageId: 'unexpected',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `typeof (a);`,
      errors: [
        {
          messageId: 'unexpected',
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: `
        const Component = (<div />)
        const Component = (<div><p /></div>)
      `,
      options: ['all', { ignoreJSX: 'multi-line' }],
      errors: [
        {
          messageId: 'unexpected',
          line: 2,
          column: 27,
        },
        {
          messageId: 'unexpected',
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: `
        const Component = (
            <div>
                <p />
            </div>
        )
        const Component = (
            <div
                prop={true}
            />
        )
      `,
      options: ['all', { ignoreJSX: 'single-line' }],
      errors: [
        {
          messageId: 'unexpected',
          line: 2,
          column: 27,
        },
        {
          messageId: 'unexpected',
          line: 7,
          column: 27,
        },
      ],
    },
    {
      code: `((function foo() {}))();`,
      options: ['functions'],
      errors: [
        {
          messageId: 'unexpected',
          line: 1,
          column: 2,
        },
      ],
    },
    {
      code: `var y = (function () {return 1;});`,
      options: ['functions'],
      errors: [
        {
          messageId: 'unexpected',
          line: 1,
          column: 9,
        },
      ],
    },
  ],
});

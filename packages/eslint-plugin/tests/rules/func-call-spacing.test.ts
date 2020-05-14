/* eslint-disable eslint-comments/no-use */
// this rule tests the spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule, { MessageIds, Options } from '../../src/rules/func-call-spacing';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('func-call-spacing', rule, {
  valid: [
    ...[
      'f();',
      'f(a, b);',
      'f.b();',
      'f.b().c();',
      'f()()',
      '(function() {}())',
      'var f = new Foo()',
      'var f = new Foo',
      'f( (0) )',
      '(function(){ if (foo) { bar(); } }());',
      'f(0, (1))',
      "describe/**/('foo', function () {});",
      'new (foo())',
      '( f )( 0 )',
      '( (f) )( (0) )',
      '( f()() )(0)',
      'f<a>()',
      'f<a>(b, b)',
      'f.b<a>(b, b)',
      '(function<T>() {}<a>())',
      '((function<T>() {})<a>())',
      '( f )<a>( 0 )',
      '( (f) )<a>( (0) )',
      '( f()() )<a>(0)',

      // optional call
      'f?.();',
      'f?.(a, b);',
      'f?.b();',
      'f?.b()?.c();',
      'f.b?.();',
      'f.b?.().c();',
      'f()?.()',
      '(function() {}?.())',
      'f?.( (0) )',
      '(function(){ if (foo) { bar(); } }?.());',
      'f?.(0, (1))',
      "describe/**/?.('foo', function () {});",
      "describe?./**/('foo', function () {});",
      '( f )?.( 0 )',
      '( (f) )?.( (0) )',
      '( f?.()() )(0)',
      '( f()?.() )(0)',
      '( f?.()?.() )(0)',
      '( f?.()() )?.(0)',
      '( f()?.() )?.(0)',
      '( f?.()?.() )?.(0)',
      'f?.<a>()',
      'f?.<a>(b, b)',
      'f.b?.<a>(b, b)',
      'f?.b<a>(b, b)',
      'f?.b?.<a>(b, b)',
      '(function<T>() {}?.<a>())',
      '((function<T>() {})<a>())',
      '( f )?.<a>( 0 )',
      '( (f) )?.<a>( (0) )',
      '( f()() )?.<a>(0)',
    ].map<TSESLint.ValidTestCase<Options>>(code => ({
      code,
      options: ['never'],
    })),

    ...[
      'f ();',
      'f (a, b);',
      'f.b ();',
      'f.b ().c ();',
      'f () ()',
      '(function() {} ())',
      'var f = new Foo ()',
      'var f = new Foo',
      'f ( (0) )',
      'f (0) (1)',
      'f ();\n t   ();',
      '( f ) ( 0 )',
      '( (f) ) ( (0) )',
      'f<a> ()',
      'f<a> (b, b)',
      'f.b<a> (b, b)',
      '(function<T>() {}<a> ())',
      '((function<T>() {})<a> ())',
      '( f )<a> ( 0 )',
      '( (f) )<a> ( (0) )',
      '( f () )<a> (0)',

      // optional call
      'f?.b ();',
      'f?.b ()?.c ();',
      'f?.b<a> (b, b)',
    ].map<TSESLint.ValidTestCase<Options>>(code => ({
      code,
      options: ['always'],
    })),
    ...[
      'f\n();',
      'f.b \n ();',
      'f\n() ().b \n()\n ()',
      'var f = new Foo\n();',
      'f// comment\n()',
      'f // comment\n ()',
      'f\n/*\n*/\n()',
      'f\r();',
      'f\u2028();',
      'f\u2029();',
      'f\r\n();',

      // optional call
      'f?.b \n ();',
      'f\n() ()?.b \n()\n ()',
    ].map<TSESLint.ValidTestCase<Options>>(code => ({
      code,
      options: ['always', { allowNewlines: true }],
    })),
  ],
  invalid: [
    // "never"
    ...[
      {
        code: 'f ();',
        output: 'f();',
      },
      {
        code: 'f (a, b);',
        output: 'f(a, b);',
      },
      {
        code: 'f.b ();',
        output: 'f.b();',
        errors: [
          {
            messageId: 'unexpectedWhitespace' as const,
            column: 3,
          },
        ],
      },
      {
        code: 'f.b().c ();',
        output: 'f.b().c();',
        errors: [
          {
            messageId: 'unexpectedWhitespace' as const,
            column: 7,
          },
        ],
      },
      {
        code: 'f() ()',
        output: 'f()()',
      },
      {
        code: '(function() {} ())',
        output: '(function() {}())',
      },
      {
        code: 'var f = new Foo ()',
        output: 'var f = new Foo()',
      },
      {
        code: 'f ( (0) )',
        output: 'f( (0) )',
      },
      {
        code: 'f(0) (1)',
        output: 'f(0)(1)',
      },
      {
        code: 'f ();\n t   ();',
        output: 'f();\n t();',
        errors: [
          {
            messageId: 'unexpectedWhitespace' as const,
          },
          {
            messageId: 'unexpectedWhitespace' as const,
          },
        ],
      },

      // https://github.com/eslint/eslint/issues/7787
      {
        code: 'f\n();',
        output: null, // no change
      },
      {
        code: `
this.cancelled.add(request)
this.decrement(request)
(request.reject(new api.Cancel()))
        `,
        output: null, // no change
        errors: [
          {
            messageId: 'unexpectedWhitespace' as const,
            line: 3,
            column: 23,
          },
        ],
      },
      {
        code: `
var a = foo
(function(global) {}(this));
      `,
        output: null, // no change
        errors: [
          {
            messageId: 'unexpectedWhitespace' as const,
            line: 2,
            column: 9,
          },
        ],
      },
      {
        code: `
var a = foo
(baz())
        `,
        output: null, // no change
        errors: [
          {
            messageId: 'unexpectedWhitespace' as const,
            line: 2,
            column: 9,
          },
        ],
      },
      {
        code: 'f\r();',
        output: null, // no change
      },
      {
        code: 'f\u2028();',
        output: null, // no change
      },
      {
        code: 'f\u2029();',
        output: null, // no change
      },
      {
        code: 'f\r\n();',
        output: null, // no change
      },
    ].map<TSESLint.InvalidTestCase<MessageIds, Options>>(code => ({
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedWhitespace',
        },
      ],
      ...code,
    })),

    // "always"
    ...[
      {
        code: 'f();',
        output: 'f ();',
      },
      {
        code: 'f(a, b);',
        output: 'f (a, b);',
      },
      {
        code: 'f() ()',
        output: 'f () ()',
      },
      {
        code: 'var f = new Foo()',
        output: 'var f = new Foo ()',
      },
      {
        code: 'f( (0) )',
        output: 'f ( (0) )',
      },
      {
        code: 'f(0) (1)',
        output: 'f (0) (1)',
      },
    ].map<TSESLint.InvalidTestCase<MessageIds, Options>>(code => ({
      options: ['always'],
      errors: [
        {
          messageId: 'missing',
        },
      ],
      ...code,
    })),
    ...[
      {
        code: 'f\n();',
        output: 'f ();',
      },
      {
        code: 'f\n(a, b);',
        output: 'f (a, b);',
      },
      {
        code: 'f.b();',
        output: 'f.b ();',
        errors: [
          {
            messageId: 'missing' as const,
            column: 3,
          },
        ],
      },
      {
        code: 'f.b\n();',
        output: 'f.b ();',
      },
      {
        code: 'f.b().c ();',
        output: 'f.b ().c ();',
        errors: [
          {
            messageId: 'missing' as const,
            column: 3,
          },
        ],
      },
      {
        code: 'f.b\n().c ();',
        output: 'f.b ().c ();',
      },
      {
        code: 'f\n() ()',
        output: 'f () ()',
      },
      {
        code: 'f\n()()',
        output: 'f () ()',
        errors: [
          {
            messageId: 'unexpectedNewline' as const,
          },
          {
            messageId: 'missing' as const,
          },
        ],
      },
      {
        code: '(function() {}())',
        output: '(function() {} ())',
        errors: [
          {
            messageId: 'missing' as const,
          },
        ],
      },
      {
        code: 'f();\n t();',
        output: 'f ();\n t ();',
        errors: [
          {
            messageId: 'missing' as const,
          },
          {
            messageId: 'missing' as const,
          },
        ],
      },
      {
        code: 'f\r();',
        output: 'f ();',
      },
      {
        code: 'f\u2028();',
        output: 'f ();',
        errors: [
          {
            messageId: 'unexpectedNewline' as const,
          },
        ],
      },
      {
        code: 'f\u2029();',
        output: 'f ();',
        errors: [
          {
            messageId: 'unexpectedNewline' as const,
          },
        ],
      },
      {
        code: 'f\r\n();',
        output: 'f ();',
      },
    ].map<TSESLint.InvalidTestCase<MessageIds, Options>>(code => ({
      options: ['always'],
      errors: [
        {
          messageId:
            code.code.includes('\n') || code.code.includes('\r')
              ? 'unexpectedNewline'
              : 'unexpectedWhitespace',
        },
      ],
      ...code,
    })),

    // "always", "allowNewlines": true
    ...[
      {
        code: 'f();',
        output: 'f ();',
      },
      {
        code: 'f(a, b);',
        output: 'f (a, b);',
      },
      {
        code: 'f.b();',
        output: 'f.b ();',
        errors: [
          {
            messageId: 'missing' as const,
            column: 3,
          },
        ],
      },
      {
        code: 'f.b().c ();',
        output: 'f.b ().c ();',
      },
      {
        code: 'f() ()',
        output: 'f () ()',
      },
      {
        code: '(function() {}())',
        output: '(function() {} ())',
      },
      {
        code: 'var f = new Foo()',
        output: 'var f = new Foo ()',
      },
      {
        code: 'f( (0) )',
        output: 'f ( (0) )',
      },
      {
        code: 'f(0) (1)',
        output: 'f (0) (1)',
      },
      {
        code: 'f();\n t();',
        output: 'f ();\n t ();',
        errors: [
          {
            messageId: 'missing' as const,
          },
          {
            messageId: 'missing' as const,
          },
        ],
      },
    ].map<TSESLint.InvalidTestCase<MessageIds, Options>>(code => ({
      options: ['always', { allowNewlines: true }],
      errors: [
        {
          messageId: 'missing',
        },
      ],
      ...code,
    })),

    // optional chain
    ...[
      'f ?.();',
      'f?. ();',
      'f ?. ();',
      'f\n?.();',
      'f?.\n();',
      'f\n?.\n();',
    ].reduce<TSESLint.InvalidTestCase<MessageIds, Options>[]>((acc, code) => {
      acc.push(
        {
          options: ['always', { allowNewlines: true }],
          errors: [
            {
              messageId: 'unexpectedWhitespace',
            },
          ],
          code,
          // apply no fixers to it
          output: null,
        },
        {
          options: ['always'],
          errors: [
            {
              messageId: 'unexpectedWhitespace',
            },
          ],
          code,
          // apply no fixers to it
          output: null,
        },
        {
          options: ['never'],
          errors: [
            {
              messageId: 'unexpectedWhitespace',
            },
          ],
          code,
          // apply no fixers to it
          output: null,
        },
      );

      return acc;
    }, []),
  ],
});

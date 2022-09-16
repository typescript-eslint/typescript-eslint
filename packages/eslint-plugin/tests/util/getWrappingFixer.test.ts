import type { TSESTree } from '@typescript-eslint/utils';
import { getFixturesRootDir, RuleTester } from '../RuleTester';
import { createRule, getWrappingFixer } from '../../src/util';

const rule = createRule({
  name: 'void-everything',
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Add void operator in random places for test purposes.',
      recommended: false,
    },
    messages: {
      addVoid: 'Please void this',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    const report = (node: TSESTree.Node): void => {
      context.report({
        node,
        messageId: 'addVoid',
        fix: getWrappingFixer({
          sourceCode,
          node,
          wrap: code => `void ${code}`,
        }),
      });
    };

    return {
      'Identifier[name="wrapMe"]': report,
      'Literal[value="wrapMe"]': report,
      'ArrayExpression[elements.0.value="wrapArray"]': report,
      'ObjectExpression[properties.0.value.value="wrapObject"]': report,
      'FunctionExpression[id.name="wrapFunction"]': report,
      'ClassExpression[id.name="wrapClass"]': report,
    };
  },
});

const rootPath = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('getWrappingFixer', rule, {
  valid: [],
  invalid: [
    // should add parens when inner expression might need them
    {
      code: '(function wrapFunction() {})',
      errors: [{ messageId: 'addVoid' }],
      output: '(void (function wrapFunction() {}))',
    },
    {
      code: '(class wrapClass {})',
      errors: [{ messageId: 'addVoid' }],
      output: '(void (class wrapClass {}))',
    },

    // shouldn't add inner parens when not necessary
    {
      code: 'wrapMe',
      errors: [{ messageId: 'addVoid' }],
      output: 'void wrapMe',
    },
    {
      code: '"wrapMe"',
      errors: [{ messageId: 'addVoid' }],
      output: 'void "wrapMe"',
    },
    {
      code: '["wrapArray"]',
      errors: [{ messageId: 'addVoid' }],
      output: 'void ["wrapArray"]',
    },
    {
      code: '({ x: "wrapObject" })',
      errors: [{ messageId: 'addVoid' }],
      output: '(void { x: "wrapObject" })',
    },

    // should add parens when the outer expression might need them
    {
      code: '!wrapMe',
      errors: [{ messageId: 'addVoid' }],
      output: '!(void wrapMe)',
    },
    {
      code: 'wrapMe++',
      errors: [{ messageId: 'addVoid' }],
      output: '(void wrapMe)++',
    },
    {
      code: '"wrapMe" + "dontWrap"',
      errors: [{ messageId: 'addVoid' }],
      output: '(void "wrapMe") + "dontWrap"',
    },
    {
      code: 'async () => await wrapMe',
      errors: [{ messageId: 'addVoid' }],
      output: 'async () => await (void wrapMe)',
    },
    {
      code: 'wrapMe(arg)',
      errors: [{ messageId: 'addVoid' }],
      output: '(void wrapMe)(arg)',
    },
    {
      code: 'new wrapMe(arg)',
      errors: [{ messageId: 'addVoid' }],
      output: 'new (void wrapMe)(arg)',
    },
    {
      code: 'wrapMe`arg`',
      errors: [{ messageId: 'addVoid' }],
      output: '(void wrapMe)`arg`',
    },
    {
      code: 'wrapMe.prop',
      errors: [{ messageId: 'addVoid' }],
      output: '(void wrapMe).prop',
    },

    // shouldn't add outer parens when not necessary
    {
      code: 'obj["wrapMe"]',
      errors: [{ messageId: 'addVoid' }],
      output: 'obj[void "wrapMe"]',
    },
    {
      code: 'fn(wrapMe)',
      errors: [{ messageId: 'addVoid' }],
      output: 'fn(void wrapMe)',
    },
    {
      code: 'new Cls(wrapMe)',
      errors: [{ messageId: 'addVoid' }],
      output: 'new Cls(void wrapMe)',
    },
    {
      code: '[wrapMe, ...wrapMe]',
      errors: [{ messageId: 'addVoid' }, { messageId: 'addVoid' }],
      output: '[void wrapMe, ...void wrapMe]',
    },
    {
      code: '`${wrapMe}`',
      errors: [{ messageId: 'addVoid' }],
      output: '`${void wrapMe}`',
    },
    {
      code: 'tpl`${wrapMe}`',
      errors: [{ messageId: 'addVoid' }],
      output: 'tpl`${void wrapMe}`',
    },
    {
      code: '({ ["wrapMe"]: wrapMe, ...wrapMe })',
      errors: [
        { messageId: 'addVoid' },
        { messageId: 'addVoid' },
        { messageId: 'addVoid' },
      ],
      output: '({ [void "wrapMe"]: void wrapMe, ...void wrapMe })',
    },
    {
      code: 'function fn() { return wrapMe }',
      errors: [{ messageId: 'addVoid' }],
      output: 'function fn() { return void wrapMe }',
    },
    {
      code: 'function* fn() { yield wrapMe }',
      errors: [{ messageId: 'addVoid' }],
      output: 'function* fn() { yield void wrapMe }',
    },
    {
      code: '() => wrapMe',
      errors: [{ messageId: 'addVoid' }],
      output: '() => void wrapMe',
    },
    {
      code: 'if (wrapMe) {}',
      errors: [{ messageId: 'addVoid' }],
      output: 'if (void wrapMe) {}',
    },

    // should detect parens at the beginning of a line and add a semi
    {
      code: `
        "dontWrap"
        "wrapMe" + "!"
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        "dontWrap"
        ;(void "wrapMe") + "!"
      `,
    },
    {
      code: `
        dontWrap
        wrapMe++
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        dontWrap
        ;(void wrapMe)++
      `,
    },
    {
      code: `
        dontWrap()
        wrapMe()
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        dontWrap()
        ;(void wrapMe)()
      `,
    },
    {
      code: `
        dontWrap()
        wrapMe\`\`
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        dontWrap()
        ;(void wrapMe)\`\`
      `,
    },

    // shouldn't add a semi when not necessary
    {
      code: `
        "dontWrap"
        test() ? "wrapMe" : "dontWrap"
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        "dontWrap"
        test() ? (void "wrapMe") : "dontWrap"
      `,
    },
    {
      code: `
        "dontWrap";
        wrapMe && f()
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        "dontWrap";
        (void wrapMe) && f()
      `,
    },
    {
      code: `
        new dontWrap
        new wrapMe
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        new dontWrap
        new (void wrapMe)
      `,
    },
    {
      code: `
        wrapMe || f()
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        (void wrapMe) || f()
      `,
    },
    {
      code: `
        if (true) wrapMe && f()
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        if (true) (void wrapMe) && f()
      `,
    },
    {
      code: `
        dontWrap
        if (true) {
          wrapMe ?? f()
        }
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        dontWrap
        if (true) {
          (void wrapMe) ?? f()
        }
      `,
    },
  ],
});

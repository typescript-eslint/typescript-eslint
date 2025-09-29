import type { TSESTree } from '@typescript-eslint/utils';

import { RuleTester } from '@typescript-eslint/rule-tester';

import { createRule, getWrappingFixer } from '../../src/util';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

const voidEverythingRule = createRule({
  create(context) {
    const report = (node: TSESTree.Node): void => {
      context.report({
        fix: getWrappingFixer({
          node,
          sourceCode: context.sourceCode,
          wrap: code => `void ${code.replaceAll('wrap', 'wrapped')}`,
        }),
        messageId: 'addVoid',
        node,
      });
    };

    return {
      'ArrayExpression[elements.0.value="wrapArray"]': report,
      'ClassExpression[id.name="wrapClass"]': report,
      'FunctionExpression[id.name="wrapFunction"]': report,
      'Identifier[name="wrapMe"]': report,
      'Literal[value="wrapMe"]': report,
      'ObjectExpression[properties.0.value.value="wrapObject"]': report,
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Add void operator in random places for test purposes.',
    },
    fixable: 'code',
    messages: {
      addVoid: 'Please void this',
    },
    schema: [],
    type: 'suggestion',
  },

  name: 'void-everything',
});

ruleTester.run('getWrappingFixer - voidEverythingRule', voidEverythingRule, {
  invalid: [
    // should add parens when inner expression might need them
    {
      code: '(function wrapFunction() {})',
      errors: [{ messageId: 'addVoid' }],
      output: '(void (function wrappedFunction() {}))',
    },
    {
      code: '(class wrapClass {})',
      errors: [{ messageId: 'addVoid' }],
      output: '(void (class wrappedClass {}))',
    },

    // shouldn't add inner parens when not necessary
    {
      code: 'wrapMe',
      errors: [{ messageId: 'addVoid' }],
      output: 'void wrappedMe',
    },
    {
      code: '"wrapMe"',
      errors: [{ messageId: 'addVoid' }],
      output: 'void "wrappedMe"',
    },
    {
      code: '["wrapArray"]',
      errors: [{ messageId: 'addVoid' }],
      output: 'void ["wrappedArray"]',
    },
    {
      code: '({ x: "wrapObject" })',
      errors: [{ messageId: 'addVoid' }],
      output: '(void { x: "wrappedObject" })',
    },

    // should add parens when the outer expression might need them
    {
      code: '!wrapMe',
      errors: [{ messageId: 'addVoid' }],
      output: '!(void wrappedMe)',
    },
    {
      code: '"wrapMe" + "dontWrap"',
      errors: [{ messageId: 'addVoid' }],
      output: '(void "wrappedMe") + "dontWrap"',
    },
    {
      code: 'async () => await wrapMe',
      errors: [{ messageId: 'addVoid' }],
      output: 'async () => await (void wrappedMe)',
    },
    {
      code: 'wrapMe(arg)',
      errors: [{ messageId: 'addVoid' }],
      output: '(void wrappedMe)(arg)',
    },
    {
      code: 'new wrapMe(arg)',
      errors: [{ messageId: 'addVoid' }],
      output: 'new (void wrappedMe)(arg)',
    },
    {
      code: 'wrapMe`arg`',
      errors: [{ messageId: 'addVoid' }],
      output: '(void wrappedMe)`arg`',
    },
    {
      code: 'wrapMe.prop',
      errors: [{ messageId: 'addVoid' }],
      output: '(void wrappedMe).prop',
    },

    // shouldn't add outer parens when not necessary
    {
      code: 'obj["wrapMe"]',
      errors: [{ messageId: 'addVoid' }],
      output: 'obj[void "wrappedMe"]',
    },
    {
      code: 'fn(wrapMe)',
      errors: [{ messageId: 'addVoid' }],
      output: 'fn(void wrappedMe)',
    },
    {
      code: 'new Cls(wrapMe)',
      errors: [{ messageId: 'addVoid' }],
      output: 'new Cls(void wrappedMe)',
    },
    {
      code: '[wrapMe, ...wrapMe]',
      errors: [{ messageId: 'addVoid' }, { messageId: 'addVoid' }],
      output: '[void wrappedMe, ...void wrappedMe]',
    },
    {
      code: '`${wrapMe}`',
      errors: [{ messageId: 'addVoid' }],
      output: '`${void wrappedMe}`',
    },
    {
      code: 'tpl`${wrapMe}`',
      errors: [{ messageId: 'addVoid' }],
      output: 'tpl`${void wrappedMe}`',
    },
    {
      code: '({ ["wrapMe"]: wrapMe, ...wrapMe })',
      errors: [
        { messageId: 'addVoid' },
        { messageId: 'addVoid' },
        { messageId: 'addVoid' },
      ],
      output: '({ [void "wrappedMe"]: void wrappedMe, ...void wrappedMe })',
    },
    {
      code: 'function fn() { return wrapMe }',
      errors: [{ messageId: 'addVoid' }],
      output: 'function fn() { return void wrappedMe }',
    },
    {
      code: 'function* fn() { yield wrapMe }',
      errors: [{ messageId: 'addVoid' }],
      output: 'function* fn() { yield void wrappedMe }',
    },
    {
      code: 'if (wrapMe) {}',
      errors: [{ messageId: 'addVoid' }],
      output: 'if (void wrappedMe) {}',
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
        ;(void "wrappedMe") + "!"
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
        ;(void wrappedMe)()
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
        ;(void wrappedMe)\`\`
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
        test() ? (void "wrappedMe") : "dontWrap"
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
        (void wrappedMe) && f()
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
        new (void wrappedMe)
      `,
    },
    {
      code: `
        wrapMe || f()
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        (void wrappedMe) || f()
      `,
    },
    {
      code: `
        if (true) wrapMe && f()
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        if (true) (void wrappedMe) && f()
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
          (void wrappedMe) ?? f()
        }
      `,
    },
  ],
  valid: [],
});

const removeFunctionRule = createRule({
  create(context) {
    const report = (node: TSESTree.CallExpression): void => {
      context.report({
        fix: getWrappingFixer({
          innerNode: [node.arguments[0]],
          node,
          sourceCode: context.sourceCode,
          wrap: code => code,
        }),
        messageId: 'removeFunction',
        node,
      });
    };

    return {
      'CallExpression[callee.name="fn"]': report,
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'Remove function with first arg remaining in random places for test purposes.',
    },
    fixable: 'code',
    messages: {
      removeFunction: 'Please remove this function',
    },
    schema: [],
    type: 'suggestion',
  },

  name: 'remove-function',
});

ruleTester.run('getWrappingFixer - removeFunctionRule', removeFunctionRule, {
  invalid: [
    // should add parens when a inner node is a part of return body of node's parent
    {
      code: '() => fn({ x: "wrapObject" })',
      errors: [{ messageId: 'removeFunction' }],
      output: '() => ({ x: "wrapObject" })',
    },

    // shouldn't add parens when not necessary
    {
      code: 'const a = fn({ x: "wrapObject" })',
      errors: [{ messageId: 'removeFunction' }],
      output: 'const a = { x: "wrapObject" }',
    },
    {
      code: '() => fn("string")',
      errors: [{ messageId: 'removeFunction' }],
      output: '() => "string"',
    },
  ],
  valid: [],
});

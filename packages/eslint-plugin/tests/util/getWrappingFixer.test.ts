import type { TSESTree } from '@typescript-eslint/utils';

import { createRule, getMovedNodeCode, getWrappingFixer } from '../../src/util';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

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
    {
      code: 'wrapMe!',
      errors: [{ messageId: 'addVoid' }],
      output: '(void wrappedMe)!',
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
    {
      code: `
        dontWrap
        wrapMe.prop
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        dontWrap
        ;(void wrappedMe).prop
      `,
    },
    {
      code: `
        dontWrap
        wrapMe?.prop
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        dontWrap
        ;(void wrappedMe)?.prop
      `,
    },
    {
      code: `
        dontWrap
        wrapMe!.prop
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        dontWrap
        ;(void wrappedMe)!.prop
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
        if (true)
          wrapMe && f()
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        if (true)
          (void wrappedMe) && f()
      `,
    },
    {
      code: `
        dontWrap
        f(wrapMe.prop)
      `,
      errors: [{ messageId: 'addVoid' }],
      output: `
        dontWrap
        f((void wrappedMe).prop)
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

    // should add parens when the code would start a block, a declaration or a directive
    {
      code: 'fn({ a: 1 }.a);',
      errors: [{ messageId: 'removeFunction' }],
      output: '({ a: 1 }.a);',
    },
    {
      code: 'fn(function () {}.name);',
      errors: [{ messageId: 'removeFunction' }],
      output: '(function () {}.name);',
    },
    {
      code: '() => fn({ a: 1 }.a);',
      errors: [{ messageId: 'removeFunction' }],
      output: '() => ({ a: 1 }.a);',
    },
    {
      code: 'export default fn(class {}.name);',
      errors: [{ messageId: 'removeFunction' }],
      output: 'export default (class {}.name);',
    },
    {
      code: 'function f(a = 1) { fn("use strict"); }',
      errors: [{ messageId: 'removeFunction' }],
      output: 'function f(a = 1) { ("use strict"); }',
    },

    // shouldn't add parens when the code stays an expression
    {
      code: 'export default fn({ a: 1 }.a);',
      errors: [{ messageId: 'removeFunction' }],
      output: 'export default { a: 1 }.a;',
    },
    {
      code: '() => fn(function () {}.name);',
      errors: [{ messageId: 'removeFunction' }],
      output: '() => function () {}.name;',
    },
    {
      code: 'f(); fn("use strict");',
      errors: [{ messageId: 'removeFunction' }],
      output: 'f(); "use strict";',
    },
  ],
  valid: [],
});

const unwrapFunctionRule = createRule({
  create(context) {
    const report = (node: TSESTree.CallExpression): void => {
      context.report({
        fix: getWrappingFixer({
          innerNode: [node.arguments[0]],
          node,
          sourceCode: context.sourceCode,
        }),
        messageId: 'unwrapFunction',
        node,
      });
    };

    return {
      'CallExpression[callee.name="unwrap"]': report,
    };
  },
  meta: {
    docs: {
      description:
        'Replace a call with its first argument, without a wrap, for test purposes.',
    },
    fixable: 'code',
    messages: {
      unwrapFunction: 'Please unwrap this function',
    },
    schema: [],
    type: 'suggestion',
  },

  name: 'unwrap-function',
});

ruleTester.run('getWrappingFixer - unwrapFunctionRule', unwrapFunctionRule, {
  invalid: [
    // should add a semi when the code could continue the previous line
    {
      code: `
        dontWrap
        unwrap(-a)
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        dontWrap
        ;(-a)
      `,
    },
    {
      code: `
        dontWrap
        unwrap([a])[0]
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        dontWrap
        ;[a][0]
      `,
    },
    {
      code: `
        dontWrap
        unwrap(/a/).source
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        dontWrap
        ;/a/.source
      `,
    },
    {
      code: `
        dontWrap
        unwrap(\`a\`)
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        dontWrap
        ;(\`a\`)
      `,
    },
    {
      code: `
        dontWrap++
        unwrap(/a/).source
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        dontWrap++
        ;/a/.source
      `,
    },

    // shouldn't add a semi when not necessary
    {
      code: `
        dontWrap;
        unwrap(-a)
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        dontWrap;
        (-a)
      `,
    },
    {
      code: `
        dontWrap++
        unwrap(-a)
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        dontWrap++
        (-a)
      `,
    },
    {
      code: `
        unwrap(-a)
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        (-a)
      `,
    },
    {
      code: `
        function dontWrap() {}
        unwrap(-a)
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        function dontWrap() {}
        (-a)
      `,
    },
    {
      code: `
        dontWrap
        const b = unwrap(-a)
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        dontWrap
        const b = (-a)
      `,
    },
    {
      code: `
        dontWrap
        ;(unwrap([a]))
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        dontWrap
        ;([a])
      `,
    },
    {
      code: `
        dontWrap
        unwrap(a)
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        dontWrap
        a
      `,
    },

    // should add parens when the code would start a block or a declaration
    {
      code: 'unwrap({ a: 1 }.a);',
      errors: [{ messageId: 'unwrapFunction' }],
      output: '({ a: 1 }.a);',
    },
    {
      code: 'unwrap({ a: 1 }.a).b;',
      errors: [{ messageId: 'unwrapFunction' }],
      output: '({ a: 1 }.a).b;',
    },
    {
      code: 'unwrap(function () {}.name);',
      errors: [{ messageId: 'unwrapFunction' }],
      output: '(function () {}.name);',
    },
    {
      code: 'unwrap(class {}.name);',
      errors: [{ messageId: 'unwrapFunction' }],
      output: '(class {}.name);',
    },
    {
      code: 'unwrap(async function () {}.name);',
      errors: [{ messageId: 'unwrapFunction' }],
      output: '(async function () {}.name);',
    },
    {
      code: `
        dontWrap
        unwrap({ a: 1 }.a)
      `,
      errors: [{ messageId: 'unwrapFunction' }],
      output: `
        dontWrap
        ;({ a: 1 }.a)
      `,
    },
    {
      code: 'const f = () => unwrap({ a: 1 }.a);',
      errors: [{ messageId: 'unwrapFunction' }],
      output: 'const f = () => ({ a: 1 }.a);',
    },
    {
      code: 'export default unwrap(function () {}.name);',
      errors: [{ messageId: 'unwrapFunction' }],
      output: 'export default (function () {}.name);',
    },
    {
      code: 'export default unwrap(async function () {}.name);',
      errors: [{ messageId: 'unwrapFunction' }],
      output: 'export default (async function () {}.name);',
    },

    // should add parens when a string would become a directive
    {
      code: "unwrap('use strict');",
      errors: [{ messageId: 'unwrapFunction' }],
      output: "('use strict');",
    },
    {
      code: "function f(a = 1) { unwrap('use strict'); }",
      errors: [{ messageId: 'unwrapFunction' }],
      output: "function f(a = 1) { ('use strict'); }",
    },
    {
      code: "function f() { 'use asm'; unwrap('use strict'); }",
      errors: [{ messageId: 'unwrapFunction' }],
      output: "function f() { 'use asm'; ('use strict'); }",
    },
    {
      code: "const f = () => { unwrap(('use strict')); };",
      errors: [{ messageId: 'unwrapFunction' }],
      output: "const f = () => { ('use strict'); };",
    },
    {
      code: "class C { static { unwrap('use strict'); } }",
      errors: [{ messageId: 'unwrapFunction' }],
      output: "class C { static { ('use strict'); } }",
    },

    // shouldn't add parens when the code stays an expression
    {
      code: '(unwrap({ a: 1 }.a));',
      errors: [{ messageId: 'unwrapFunction' }],
      output: '({ a: 1 }.a);',
    },
    {
      code: 'x = unwrap({ a: 1 }.a);',
      errors: [{ messageId: 'unwrapFunction' }],
      output: 'x = { a: 1 }.a;',
    },
    {
      code: 'const f = () => unwrap(function () {}.name);',
      errors: [{ messageId: 'unwrapFunction' }],
      output: 'const f = () => function () {}.name;',
    },
    {
      code: "f(); unwrap('use strict');",
      errors: [{ messageId: 'unwrapFunction' }],
      output: "f(); 'use strict';",
    },
    {
      code: "function f() { unwrap('use strict').length; }",
      errors: [{ messageId: 'unwrapFunction' }],
      output: "function f() { 'use strict'.length; }",
    },
    {
      code: "function f() { if (a) { unwrap('use strict'); } }",
      errors: [{ messageId: 'unwrapFunction' }],
      output: "function f() { if (a) { 'use strict'; } }",
    },
  ],
  valid: [],
});

const negateRule = createRule({
  create(context) {
    const report = (node: TSESTree.CallExpression): void => {
      context.report({
        fix: getWrappingFixer({
          innerNode: [node.arguments[0]],
          node,
          sourceCode: context.sourceCode,
          wrap: code => `-${code}`,
        }),
        messageId: 'negate',
        node,
      });
    };

    return {
      'CallExpression[callee.name="negate"]': report,
    };
  },
  meta: {
    docs: {
      description: 'Replace a call with a negation, for test purposes.',
    },
    fixable: 'code',
    messages: {
      negate: 'Please negate this instead',
    },
    schema: [],
    type: 'suggestion',
  },

  name: 'negate',
});

ruleTester.run('getWrappingFixer - negateRule', negateRule, {
  invalid: [
    // should add a semi before a binary operator that would continue the previous line
    {
      code: `
        dontWrap
        negate(a)
      `,
      errors: [{ messageId: 'negate' }],
      output: `
        dontWrap
        ;-a
      `,
    },
    {
      code: `
        dontWrap++
        negate(a)
      `,
      errors: [{ messageId: 'negate' }],
      output: `
        dontWrap++
        ;-a
      `,
    },

    // shouldn't add a semi when not necessary
    {
      code: `
        dontWrap;
        negate(a)
      `,
      errors: [{ messageId: 'negate' }],
      output: `
        dontWrap;
        -a
      `,
    },
  ],
  valid: [],
});

const execRule = createRule({
  create(context) {
    const report = (node: TSESTree.CallExpression): void => {
      context.report({
        fix: getWrappingFixer({
          innerNode: [node.arguments[0]],
          node,
          sourceCode: context.sourceCode,
          wrap: code => `/a/.exec(${code})`,
        }),
        messageId: 'useExec',
        node,
      });
    };

    return {
      'CallExpression[callee.name="exec"]': report,
    };
  },
  meta: {
    docs: {
      description: 'Replace a call with a regex call, for test purposes.',
    },
    fixable: 'code',
    messages: {
      useExec: 'Please use exec instead',
    },
    schema: [],
    type: 'suggestion',
  },

  name: 'exec',
});

ruleTester.run('getWrappingFixer - execRule', execRule, {
  invalid: [
    // shouldn't add outer parens before a non-null assertion when the code is a call
    {
      code: 'exec(a)!;',
      errors: [{ messageId: 'useExec' }],
      output: '/a/.exec(a)!;',
    },
    {
      code: 'const b = exec(a)![0];',
      errors: [{ messageId: 'useExec' }],
      output: 'const b = /a/.exec(a)![0];',
    },
    {
      code: `
        dontWrap
        exec(a)!.length
      `,
      errors: [{ messageId: 'useExec' }],
      output: `
        dontWrap
        ;/a/.exec(a)!.length
      `,
    },
    {
      code: 'exec(a + b)!;',
      errors: [{ messageId: 'useExec' }],
      output: '/a/.exec((a + b))!;',
    },

    // should still add outer parens where the parent isn't a non-null assertion
    {
      code: 'exec(a).length;',
      errors: [{ messageId: 'useExec' }],
      output: '(/a/.exec(a)).length;',
    },
    {
      code: 'new (exec(a))();',
      errors: [{ messageId: 'useExec' }],
      output: 'new (/a/.exec(a))();',
    },
  ],
  valid: [],
});

const satisfiesRule = createRule({
  create(context) {
    const report = (node: TSESTree.CallExpression): void => {
      context.report({
        fix: getWrappingFixer({
          innerNode: [node.arguments[0]],
          node,
          sourceCode: context.sourceCode,
          wrap: code => `${code} satisfies string`,
        }),
        messageId: 'useSatisfies',
        node,
      });
    };

    return {
      'CallExpression[callee.name="check"]': report,
    };
  },
  meta: {
    docs: {
      description:
        'Replace a call with a satisfies expression, for test purposes.',
    },
    fixable: 'code',
    messages: {
      useSatisfies: 'Please use satisfies instead',
    },
    schema: [],
    type: 'suggestion',
  },

  name: 'satisfies',
});

ruleTester.run('getWrappingFixer - satisfiesRule', satisfiesRule, {
  invalid: [
    // should add outer parens before a non-null assertion when the code is looser than a call
    {
      code: 'check(a)!;',
      // Fix output uses `satisfies`, which requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
      errors: [{ messageId: 'useSatisfies' }],
      output: '(a satisfies string)!;',
    },

    // should add parens when the code would start a block or a declaration
    {
      code: 'check({ a: 1 }.a);',
      // Fix output uses `satisfies`, which requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
      errors: [{ messageId: 'useSatisfies' }],
      output: '({ a: 1 }.a satisfies string);',
    },
    {
      code: 'check(function () {}.name);',
      // Fix output uses `satisfies`, which requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
      errors: [{ messageId: 'useSatisfies' }],
      output: '(function () {}.name satisfies string);',
    },
    {
      code: 'const f = () => check({ a: 1 }.a);',
      // Fix output uses `satisfies`, which requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
      errors: [{ messageId: 'useSatisfies' }],
      output: 'const f = () => ({ a: 1 }.a satisfies string);',
    },

    // shouldn't add parens when the string isn't alone, so it isn't a directive
    {
      code: "function f(a = 1) { check('use strict'); }",
      // Fix output uses `satisfies`, which requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
      errors: [{ messageId: 'useSatisfies' }],
      output: "function f(a = 1) { 'use strict' satisfies string; }",
    },
  ],
  valid: [],
});

const moveRule = createRule({
  create(context) {
    const report = (node: TSESTree.CallExpression): void => {
      context.report({
        fix: fixer =>
          fixer.replaceText(
            node,
            getMovedNodeCode({
              destinationNode: node,
              nodeToMove: node.arguments[0],
              sourceCode: context.sourceCode,
            }),
          ),
        messageId: 'move',
        node,
      });
    };

    return {
      'CallExpression[callee.name="move"]': report,
    };
  },
  meta: {
    docs: {
      description: 'Replace a call with its first argument, for test purposes.',
    },
    fixable: 'code',
    messages: {
      move: 'Please move the argument out',
    },
    schema: [],
    type: 'suggestion',
  },

  name: 'move',
});

ruleTester.run('getWrappingFixer - getMovedNodeCode', moveRule, {
  invalid: [
    // should add parens when the parent binds more tightly
    {
      code: 'move(a + b)!;',
      errors: [{ messageId: 'move' }],
      output: '(a + b)!;',
    },
    {
      code: 'move(a + b).c;',
      errors: [{ messageId: 'move' }],
      output: '(a + b).c;',
    },
    {
      code: 'move(a + b)();',
      errors: [{ messageId: 'move' }],
      output: '(a + b)();',
    },
    {
      code: 'move(a + b)``;',
      errors: [{ messageId: 'move' }],
      output: '(a + b)``;',
    },

    // shouldn't add parens when the destination is already parenthesized
    {
      code: '(move(a + b))!;',
      errors: [{ messageId: 'move' }],
      output: '(a + b)!;',
    },
    {
      code: '(move(a + b)).c;',
      errors: [{ messageId: 'move' }],
      output: '(a + b).c;',
    },
    {
      code: '(move(a + b))();',
      errors: [{ messageId: 'move' }],
      output: '(a + b)();',
    },
    {
      code: '(move(a + b))``;',
      errors: [{ messageId: 'move' }],
      output: '(a + b)``;',
    },
  ],
  valid: [],
});

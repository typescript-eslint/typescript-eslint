import { RuleTester } from '@typescript-eslint/rule-tester';
import type { TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getOperatorPrecedence,
  getParserServices,
} from '../../src/util';
import { getWrappedCode } from '../../src/util/getWrappedCode';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

const removeFunctionRule = createRule({
  name: 'remove-function',
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Remove function with first arg remaining in random places for test purposes.',
    },
    messages: {
      removeFunction: 'Please remove this function',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const parserServices = getParserServices(context, true);

    const report = (node: TSESTree.CallExpression): void => {
      context.report({
        node,
        messageId: 'removeFunction',
        fix: fixer => {
          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
          const tsArgumentNode = tsNode.arguments[0];

          const nodePrecedence = getOperatorPrecedence(
            tsArgumentNode.kind,
            ts.isBinaryExpression(tsArgumentNode)
              ? tsArgumentNode.operatorToken.kind
              : ts.SyntaxKind.Unknown,
          );
          const parentPrecedence = getOperatorPrecedence(
            tsNode.parent.kind,
            ts.isBinaryExpression(tsNode.parent)
              ? tsNode.parent.operatorToken.kind
              : ts.SyntaxKind.Unknown,
          );

          const text = sourceCode.getText(node.arguments[0]);
          return fixer.replaceText(
            node,
            getWrappedCode(text, nodePrecedence, parentPrecedence),
          );
        },
      });
    };

    return {
      'CallExpression[callee.name="fn"]': report,
    };
  },
});

ruleTester.run('getWrappedCode - removeFunctionRule', removeFunctionRule, {
  valid: [],
  invalid: [
    // should add parens when the first argument node has lower precedence than the parent node of the CallExpression
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
  ],
});

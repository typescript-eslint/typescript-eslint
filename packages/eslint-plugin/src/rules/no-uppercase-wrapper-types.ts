import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

const classNames = new Set([
  'BigInt',
  // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
  'Boolean',
  'Function',
  'Number',
  'Object',
  // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
  'String',
  'Symbol',
]);

export default createRule({
  name: 'no-uppercase-wrapper-types',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow using confusing built-in primitive class wrappers',
      recommended: 'recommended',
    },
    fixable: 'code',
    messages: {
      bannedClassType:
        'Prefer using the primitive `{{preferred}}` as a type name, rather than the class wrapper `{{typeName}}`.',
      bannedFunctionType: [
        'The `Function` type accepts any function-like value.',
        'It provides no type safety when calling the function, which can be a common source of bugs.',
        'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
        'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.',
      ].join('\n'),
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function checkBannedTypes(
      node: TSESTree.EntityName | TSESTree.Expression,
      includeFix: boolean,
    ): void {
      const typeName = node.type === AST_NODE_TYPES.Identifier && node.name;
      if (!typeName || !classNames.has(typeName)) {
        return;
      }

      if (typeName === 'Function') {
        context.report({
          node,
          messageId: 'bannedFunctionType',
        });
        return;
      }

      const preferred = typeName.toLowerCase();

      context.report({
        data: { typeName, preferred },
        fix: includeFix
          ? (fixer): TSESLint.RuleFix => fixer.replaceText(node, preferred)
          : undefined,
        messageId: 'bannedClassType',
        node,
      });
    }

    return {
      TSClassImplements(node): void {
        checkBannedTypes(node.expression, false);
      },
      TSInterfaceHeritage(node): void {
        checkBannedTypes(node.expression, false);
      },
      TSTypeReference(node): void {
        checkBannedTypes(node.typeName, true);
      },
    };
  },
});

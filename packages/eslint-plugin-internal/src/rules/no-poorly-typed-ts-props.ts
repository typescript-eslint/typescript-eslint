import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

import { createRule } from '../util';

/*
TypeScript declares some bad types for certain properties.
See: https://github.com/microsoft/TypeScript/issues/24706

This rule simply warns against using them, as using them will likely introduce type safety holes.
*/

const BANNED_PROPERTIES = [
  // {
  //   type: 'Node',
  //   property: 'parent',
  //   fixWith: null,
  // },
  {
    type: 'Symbol',
    property: 'declarations',
    fixWith: 'getDeclarations()',
  },
  {
    // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
    type: 'Type',
    property: 'symbol',
    fixWith: 'getSymbol()',
  },
];

export default createRule({
  name: 'no-poorly-typed-ts-props',
  meta: {
    type: 'problem',
    docs: {
      description:
        "Enforce that rules don't use TS API properties with known bad type definitions",
      recommended: 'error',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      doNotUse: 'Do not use {{type}}.{{property}} because it is poorly typed.',
      doNotUseWithFixer:
        'Do not use {{type}}.{{property}} because it is poorly typed. Use {{type}}.{{fixWith}} instead.',
      suggestedFix: 'Use {{type}}.{{fixWith}} instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    const { program, esTreeNodeToTSNodeMap } =
      ESLintUtils.getParserServices(context);
    const checker = program.getTypeChecker();

    return {
      'MemberExpression[computed = false]'(
        node: TSESTree.MemberExpressionNonComputedName,
      ): void {
        for (const banned of BANNED_PROPERTIES) {
          if (node.property.name !== banned.property) {
            continue;
          }

          // make sure the type name matches
          const tsObjectNode = esTreeNodeToTSNodeMap.get(node.object);
          const objectType = checker.getTypeAtLocation(tsObjectNode);
          const objectSymbol = objectType.getSymbol();
          if (objectSymbol?.getName() !== banned.type) {
            continue;
          }

          const tsNode = esTreeNodeToTSNodeMap.get(node.property);
          const symbol = checker.getSymbolAtLocation(tsNode);
          const decls = symbol?.getDeclarations();
          const isFromTs = decls?.some(decl =>
            decl.getSourceFile().fileName.includes('/node_modules/typescript/'),
          );
          if (isFromTs !== true) {
            continue;
          }

          return context.report({
            node,
            messageId: banned.fixWith ? 'doNotUseWithFixer' : 'doNotUse',
            data: banned,
            suggest: [
              {
                messageId: 'suggestedFix',
                data: banned,
                fix(fixer): TSESLint.RuleFix | null {
                  if (banned.fixWith == null) {
                    return null;
                  }

                  return fixer.replaceText(node.property, banned.fixWith);
                },
              },
            ],
          });
        }
      },
    };
  },
});

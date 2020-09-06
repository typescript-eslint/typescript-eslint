import {
  TSESTree,
  ESLintUtils,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
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
        "Enforces rules don't use TS API properties with known bad type definitions",
      category: 'Possible Errors',
      recommended: 'error',
      suggestion: true,
      requiresTypeChecking: true,
    },
    fixable: 'code',
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
    const { program, esTreeNodeToTSNodeMap } = ESLintUtils.getParserServices(
      context,
    );
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

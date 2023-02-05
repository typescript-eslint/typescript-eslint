import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

type AllowedType = ts.TypeFlags.Number | ts.TypeFlags.String;

export default util.createRule({
  name: 'no-mixed-enums',
  meta: {
    docs: {
      description: 'Disallow enums from having both number and string members',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      mixed: `Mixing number and string enums can be confusing.`,
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    function getAllowedType(node: ts.Node): AllowedType {
      return tsutils.isTypeFlagSet(
        typeChecker.getTypeAtLocation(node),
        ts.TypeFlags.StringLike,
      )
        ? ts.TypeFlags.String
        : ts.TypeFlags.Number;
    }

    function getAllowedTypeOfEnum(
      node: TSESTree.TSEnumDeclaration,
    ): AllowedType | undefined {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.id);
      const declarations = typeChecker
        .getSymbolAtLocation(tsNode)!
        .getDeclarations()!;

      for (const declaration of declarations) {
        for (const member of (declaration as ts.EnumDeclaration).members) {
          return member.initializer
            ? getAllowedType(member.initializer)
            : ts.TypeFlags.Number;
        }
      }

      return undefined;
    }

    function getAllowedTypeOfInitializer(
      initializer: TSESTree.Expression | undefined,
    ): ts.TypeFlags.Number | ts.TypeFlags.String {
      return initializer
        ? getAllowedType(parserServices.esTreeNodeToTSNodeMap.get(initializer))
        : ts.TypeFlags.Number;
    }

    return {
      TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
        const allowedType = getAllowedTypeOfEnum(node);
        if (allowedType === undefined) {
          return;
        }

        for (const member of node.members) {
          if (getAllowedTypeOfInitializer(member.initializer) !== allowedType) {
            context.report({
              messageId: 'mixed',
              node: member.initializer ?? member,
            });
            return;
          }
        }
      },
    };
  },
});

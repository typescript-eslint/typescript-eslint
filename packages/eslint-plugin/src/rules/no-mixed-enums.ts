import type { Scope } from '@typescript-eslint/scope-manager';
import { DefinitionType } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

enum AllowedType {
  Number,
  String,
  Unknown,
}

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

    interface CollectedDefinitions {
      imports: TSESTree.Node[];
      previousSibling: TSESTree.TSEnumDeclaration | undefined;
    }

    function collectNodeDefinitions(
      node: TSESTree.TSEnumDeclaration,
    ): CollectedDefinitions {
      const { name } = node.id;
      const found: CollectedDefinitions = {
        imports: [],
        previousSibling: undefined,
      };
      let scope: Scope | null = context.getScope();

      for (const definition of scope.upper?.set.get(name)?.defs ?? []) {
        if (
          definition.node.type === AST_NODE_TYPES.TSEnumDeclaration &&
          definition.node.range[0] < node.range[0] &&
          definition.node.members.length > 0
        ) {
          found.previousSibling = definition.node;
          break;
        }
      }

      while (scope) {
        scope.set.get(name)?.defs?.forEach(definition => {
          if (definition.type === DefinitionType.ImportBinding) {
            found.imports.push(definition.node);
          }
        });

        scope = scope.upper;
      }

      return found;
    }

    function getAllowedTypeForNode(node: ts.Node): AllowedType {
      return tsutils.isTypeFlagSet(
        typeChecker.getTypeAtLocation(node),
        ts.TypeFlags.StringLike,
      )
        ? AllowedType.String
        : AllowedType.Number;
    }

    function getTypeFromImported(
      imported: TSESTree.Node,
    ): AllowedType | undefined {
      const type = typeChecker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(imported),
      );

      const valueDeclaration = type.getSymbol()?.valueDeclaration;
      if (
        !valueDeclaration ||
        !ts.isEnumDeclaration(valueDeclaration) ||
        valueDeclaration.members.length === 0
      ) {
        return undefined;
      }

      return getAllowedTypeForNode(valueDeclaration.members[0]);
    }

    function getMemberType(
      member: TSESTree.TSEnumMember,
    ): AllowedType | ts.TypeFlags.Unknown | undefined {
      if (!member.initializer) {
        return undefined;
      }

      switch (member.initializer.type) {
        case AST_NODE_TYPES.Literal:
          switch (typeof member.initializer.value) {
            case 'number':
              return AllowedType.Number;
            case 'string':
              return AllowedType.String;
            default:
              return AllowedType.Unknown;
          }

        case AST_NODE_TYPES.TemplateLiteral:
          return AllowedType.String;

        default:
          return getAllowedTypeForNode(
            parserServices.esTreeNodeToTSNodeMap.get(member.initializer),
          );
      }
    }

    function getDesiredTypeForDefinition(
      node: TSESTree.TSEnumDeclaration,
    ): AllowedType | ts.TypeFlags.Unknown | undefined {
      const { imports, previousSibling } = collectNodeDefinitions(node);

      // Case: Merged ambiently via module augmentation
      // import { MyEnum } from 'other-module';
      // declare module 'other-module' {
      //   enum MyEnum { A }
      // }
      for (const imported of imports) {
        const typeFromImported = getTypeFromImported(imported);
        if (typeFromImported !== undefined) {
          return typeFromImported;
        }
      }

      // Case: Multiple enum declarations in the same file
      // enum MyEnum { A }
      // enum MyEnum { B }
      if (previousSibling) {
        return getMemberType(previousSibling.members[0]);
      }

      // Case: Namespace declaration merging
      // namespace MyNamespace {
      //   export enum MyEnum { A }
      // }
      // namespace MyNamespace {
      //   export enum MyEnum { B }
      // }
      if (
        node.parent!.type === AST_NODE_TYPES.ExportNamedDeclaration &&
        node.parent!.parent!.type === AST_NODE_TYPES.TSModuleBlock
      ) {
        // TODO: We don't need to dip into the TypeScript type checker here!
        // Merged namespaces must all exist in the same file.
        // We could instead compare this file's nodes to find the merges.
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.id);
        const declarations = typeChecker
          .getSymbolAtLocation(tsNode)!
          .getDeclarations()!;

        for (const declaration of declarations) {
          for (const member of (declaration as ts.EnumDeclaration).members) {
            return member.initializer
              ? tsutils.isTypeFlagSet(
                  typeChecker.getTypeAtLocation(member.initializer),
                  ts.TypeFlags.StringLike,
                )
                ? AllowedType.String
                : AllowedType.Number
              : AllowedType.Number;
          }
        }
      }

      // Finally, we default to the type of the first enum member
      return getMemberType(node.members[0]);
    }

    return {
      TSEnumDeclaration(node): void {
        if (!node.members.length) {
          return;
        }

        let desiredType = getDesiredTypeForDefinition(node);
        if (desiredType === ts.TypeFlags.Unknown) {
          return;
        }

        for (const member of node.members) {
          const currentType = getMemberType(member);
          if (currentType === ts.TypeFlags.Unknown) {
            return;
          }

          if (currentType === AllowedType.Number) {
            desiredType ??= currentType;
          }

          if (
            currentType !== desiredType &&
            (currentType !== undefined || desiredType === AllowedType.String)
          ) {
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

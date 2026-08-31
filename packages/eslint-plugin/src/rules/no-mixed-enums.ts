import type { Scope } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';

import { DefinitionType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  nullThrows,
  NullThrowsReasons,
} from '../util';

enum AllowedType {
  Number,
  String,
  Unknown,
}

export default createRule({
  name: 'no-mixed-enums',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow enums from having both number and string members',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      mixed: `Mixing number and string enums can be confusing.`,
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    interface CollectedDefinitions {
      imports: TSESTree.Node[];
      previousSibling: TSESTree.TSEnumDeclaration | undefined;
    }

    function getModuleName(id: TSESTree.TSModuleDeclaration['id']): string {
      if (id.type === AST_NODE_TYPES.Literal) {
        return JSON.stringify(id.value);
      }

      let qualifiers = '';
      let current: TSESTree.EntityName = id;
      while (current.type === AST_NODE_TYPES.TSQualifiedName) {
        qualifiers = `.${current.right.name}${qualifiers}`;
        current = current.left as TSESTree.EntityName;
      }

      return context.sourceCode.getText(current) + qualifiers;
    }

    function getMergedScopes(scope: Scope): Scope[] {
      const { block } = scope;
      if (block.type !== AST_NODE_TYPES.TSModuleDeclaration) {
        return [scope];
      }

      const name = getModuleName(block.id);
      return getEnclosingScopes(block).flatMap(enclosing =>
        enclosing.childScopes.filter(
          childScope =>
            childScope.block.type === AST_NODE_TYPES.TSModuleDeclaration &&
            getModuleName(childScope.block.id) === name,
        ),
      );
    }

    function getEnclosingScopes(
      node: TSESTree.TSEnumDeclaration | TSESTree.TSModuleDeclaration,
    ): Scope[] {
      const enclosing = nullThrows(
        context.sourceCode.getScope(node).upper,
        NullThrowsReasons.MissingParent,
      );

      return node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration
        ? getMergedScopes(enclosing)
        : [enclosing];
    }

    function collectNodeDefinitions(
      node: TSESTree.TSEnumDeclaration,
    ): CollectedDefinitions {
      const { name } = node.id;
      const found: CollectedDefinitions = {
        imports: [],
        previousSibling: undefined,
      };

      for (const definition of getEnclosingScopes(node).flatMap(
        enclosing => enclosing.set.get(name)?.defs ?? [],
      )) {
        if (
          definition.node.type === AST_NODE_TYPES.TSEnumDeclaration &&
          definition.node.range[0] < node.range[0] &&
          definition.node.body.members.length > 0
        ) {
          found.previousSibling = definition.node;
          break;
        }
      }

      let scope: Scope | null = context.sourceCode.getScope(node);
      while (scope) {
        scope.set.get(name)?.defs.forEach(definition => {
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

    function getMemberType(member: TSESTree.TSEnumMember): AllowedType {
      if (!member.initializer) {
        return AllowedType.Number;
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
        if (typeFromImported != null) {
          return typeFromImported;
        }
      }

      // Case: Multiple enum declarations in the same file
      // enum MyEnum { A }
      // enum MyEnum { B }
      //
      // ...including ones merged across namespace declarations
      // namespace MyNamespace {
      //   export enum MyEnum { A }
      // }
      // namespace MyNamespace {
      //   export enum MyEnum { B }
      // }
      if (previousSibling) {
        return getMemberType(previousSibling.body.members[0]);
      }

      // Finally, we default to the type of the first enum member
      return getMemberType(node.body.members[0]);
    }

    return {
      TSEnumDeclaration(node): void {
        if (!node.body.members.length) {
          return;
        }

        let desiredType = getDesiredTypeForDefinition(node);
        if (desiredType === ts.TypeFlags.Unknown) {
          return;
        }

        for (const member of node.body.members) {
          const currentType = getMemberType(member);
          if (currentType === AllowedType.Unknown) {
            return;
          }

          if (currentType === AllowedType.Number) {
            desiredType ??= currentType;
          }

          if (currentType !== desiredType) {
            context.report({
              node: member.initializer ?? member,
              messageId: 'mixed',
            });
            return;
          }
        }
      },
    };
  },
});

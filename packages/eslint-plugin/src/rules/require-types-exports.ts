import { DefinitionType } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

type MessageIds = 'requireTypeExport';

type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.TSDeclareFunction
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

export default createRule<[], MessageIds>({
  name: 'require-types-exports',
  meta: {
    type: 'suggestion',
    docs: {
      recommended: 'strict',
      requiresTypeChecking: true,
      description:
        'Require exporting types that are used in exported functions declarations',
    },
    messages: {
      requireTypeExport: 'Expected type "{{ name }}" to be exported',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const externalizedTypes = new Set<string>();
    const reportedTypes = new Set<string>();

    function collectImportedTypes(node: TSESTree.ImportSpecifier): void {
      externalizedTypes.add(node.local.name);
    }

    function collectExportedTypes(
      node: TSESTree.TSTypeAliasDeclaration | TSESTree.TSInterfaceDeclaration,
    ): void {
      externalizedTypes.add(node.id.name);
    }

    function visitExportedFunctionDeclaration(
      node: (
        | TSESTree.ExportNamedDeclaration
        | TSESTree.DefaultExportDeclarations
      ) & {
        declaration: TSESTree.FunctionDeclaration | TSESTree.TSDeclareFunction;
      },
    ): void {
      checkFunctionParamsTypes(node.declaration);
      checkFunctionReturnType(node.declaration);
    }

    function visitExportedVariableDeclaration(
      node: TSESTree.ExportNamedDeclaration & {
        declaration: TSESTree.VariableDeclaration;
      },
    ): void {
      node.declaration.declarations.forEach(declaration => {
        if (declaration.init?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
          checkFunctionParamsTypes(declaration.init);
          checkFunctionReturnType(declaration.init);
        }
      });
    }

    function visitDefaultExportedArrowFunction(
      node: TSESTree.ExportDefaultDeclaration & {
        declaration: TSESTree.ArrowFunctionExpression;
      },
    ): void {
      checkFunctionParamsTypes(node.declaration);
      checkFunctionReturnType(node.declaration);
    }

    function visitDefaultExportedIdentifier(
      node: TSESTree.DefaultExportDeclarations & {
        declaration: TSESTree.Identifier;
      },
    ): void {
      const scope = context.sourceCode.getScope(node);
      const variable = scope.set.get(node.declaration.name);

      if (!variable) {
        return;
      }

      for (const definition of variable.defs) {
        if (
          definition.type === DefinitionType.Variable &&
          (definition.node.init?.type ===
            AST_NODE_TYPES.ArrowFunctionExpression ||
            definition.node.init?.type === AST_NODE_TYPES.FunctionExpression)
        ) {
          checkFunctionParamsTypes(definition.node.init);
          checkFunctionReturnType(definition.node.init);
        }
      }
    }

    function checkFunctionParamsTypes(node: FunctionNode): void {
      for (const param of node.params) {
        const typeNodes = getParamTypesNodes(param).flatMap(typeNode => {
          return convertGenericTypeToTypeReferences(node, typeNode);
        });

        for (const typeNode of typeNodes) {
          const name = getTypeName(typeNode);

          if (!name) {
            // TODO: Report the whole function? Is this case even possible?
            return;
          }

          const isExternalized = externalizedTypes.has(name);
          const isReported = reportedTypes.has(name);

          if (isExternalized || isReported) {
            return;
          }

          context.report({
            node: typeNode,
            messageId: 'requireTypeExport',
            data: {
              name,
            },
          });

          reportedTypes.add(name);
        }
      }
    }

    function checkFunctionReturnType(node: FunctionNode): void {
      const { returnType } = node;

      if (!returnType) {
        return;
      }

      const typeNodes = getReturnTypeTypesNodes(returnType).flatMap(
        typeNode => {
          return convertGenericTypeToTypeReferences(node, typeNode);
        },
      );

      for (const typeNode of typeNodes) {
        const name = getTypeName(typeNode);

        if (!name) {
          // TODO: Report the whole function? Is this case even possible?
          return;
        }

        const isExternalized = externalizedTypes.has(name);
        const isReported = reportedTypes.has(name);

        if (isExternalized || isReported) {
          return;
        }

        context.report({
          node: typeNode,
          messageId: 'requireTypeExport',
          data: {
            name,
          },
        });

        reportedTypes.add(name);
      }
    }

    function getParamTypesNodes(
      param: TSESTree.Parameter,
    ): TSESTree.TSTypeReference[] {
      // Single type
      if (
        param.type === AST_NODE_TYPES.Identifier &&
        param.typeAnnotation?.typeAnnotation.type ===
          AST_NODE_TYPES.TSTypeReference
      ) {
        return [param.typeAnnotation.typeAnnotation];
      }

      // Union or intersection
      if (
        param.type === AST_NODE_TYPES.Identifier &&
        (param.typeAnnotation?.typeAnnotation.type ===
          AST_NODE_TYPES.TSUnionType ||
          param.typeAnnotation?.typeAnnotation.type ===
            AST_NODE_TYPES.TSIntersectionType)
      ) {
        return param.typeAnnotation.typeAnnotation.types.filter(
          type => type.type === AST_NODE_TYPES.TSTypeReference,
        ) as TSESTree.TSTypeReference[];
      }

      // Tuple
      if (
        param.type === AST_NODE_TYPES.ArrayPattern &&
        param.typeAnnotation?.typeAnnotation.type === AST_NODE_TYPES.TSTupleType
      ) {
        return param.typeAnnotation.typeAnnotation.elementTypes.filter(
          type => type.type === AST_NODE_TYPES.TSTypeReference,
        ) as TSESTree.TSTypeReference[];
      }

      // Inline object
      if (
        param.type === AST_NODE_TYPES.ObjectPattern &&
        param.typeAnnotation?.typeAnnotation.type ===
          AST_NODE_TYPES.TSTypeLiteral
      ) {
        return param.typeAnnotation.typeAnnotation.members.reduce<
          TSESTree.TSTypeReference[]
        >((acc, member) => {
          if (
            member.type === AST_NODE_TYPES.TSPropertySignature &&
            member.typeAnnotation?.typeAnnotation.type ===
              AST_NODE_TYPES.TSTypeReference
          ) {
            acc.push(member.typeAnnotation.typeAnnotation);
          }

          return acc;
        }, []);
      }

      // Rest params
      if (
        param.type === AST_NODE_TYPES.RestElement &&
        param.typeAnnotation?.typeAnnotation.type ===
          AST_NODE_TYPES.TSArrayType &&
        param.typeAnnotation.typeAnnotation.elementType.type ===
          AST_NODE_TYPES.TSTypeReference
      ) {
        return [param.typeAnnotation.typeAnnotation.elementType];
      }

      // Default value assignment
      if (
        param.type === AST_NODE_TYPES.AssignmentPattern &&
        param.left.typeAnnotation?.typeAnnotation.type ===
          AST_NODE_TYPES.TSTypeReference
      ) {
        return [param.left.typeAnnotation.typeAnnotation];
      }

      return [];
    }

    function getReturnTypeTypesNodes(
      typeAnnotation: TSESTree.TSTypeAnnotation,
    ): TSESTree.TSTypeReference[] {
      // Single type
      if (
        typeAnnotation.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference
      ) {
        return [typeAnnotation.typeAnnotation];
      }

      // Union or intersection
      if (
        typeAnnotation.typeAnnotation.type === AST_NODE_TYPES.TSUnionType ||
        typeAnnotation.typeAnnotation.type === AST_NODE_TYPES.TSIntersectionType
      ) {
        return typeAnnotation.typeAnnotation.types.filter(
          type => type.type === AST_NODE_TYPES.TSTypeReference,
        ) as TSESTree.TSTypeReference[];
      }

      // Tuple
      if (typeAnnotation.typeAnnotation.type === AST_NODE_TYPES.TSTupleType) {
        return typeAnnotation.typeAnnotation.elementTypes.filter(
          type => type.type === AST_NODE_TYPES.TSTypeReference,
        ) as TSESTree.TSTypeReference[];
      }

      // Inline object
      if (typeAnnotation.typeAnnotation.type === AST_NODE_TYPES.TSTypeLiteral) {
        return typeAnnotation.typeAnnotation.members.reduce<
          TSESTree.TSTypeReference[]
        >((acc, member) => {
          if (
            member.type === AST_NODE_TYPES.TSPropertySignature &&
            member.typeAnnotation?.typeAnnotation.type ===
              AST_NODE_TYPES.TSTypeReference
          ) {
            acc.push(member.typeAnnotation.typeAnnotation);
          }

          return acc;
        }, []);
      }

      return [];
    }

    function convertGenericTypeToTypeReferences(
      functionNode: FunctionNode,
      typeNode: TSESTree.TSTypeReference,
    ): TSESTree.TSTypeReference | TSESTree.TSTypeReference[] {
      const typeName = getTypeName(typeNode);

      if (!typeName) {
        return typeNode;
      }

      const scope = context.sourceCode.getScope(functionNode);
      const variable = scope.set.get(typeName);

      if (!variable?.isTypeVariable) {
        return typeNode;
      }

      for (const definition of variable.defs) {
        if (
          definition.type === DefinitionType.Type &&
          definition.node.type === AST_NODE_TYPES.TSTypeParameter &&
          definition.node.constraint
        ) {
          switch (definition.node.constraint.type) {
            // T extends SomeType
            case AST_NODE_TYPES.TSTypeReference:
              return definition.node.constraint;

            // T extends SomeType | AnotherType
            // T extends SomeType & AnotherType
            case AST_NODE_TYPES.TSUnionType:
            case AST_NODE_TYPES.TSIntersectionType:
              return definition.node.constraint.types.filter(
                type => type.type === AST_NODE_TYPES.TSTypeReference,
              ) as TSESTree.TSTypeReference[];

            // T extends [SomeType, AnotherType]
            case AST_NODE_TYPES.TSTupleType:
              return definition.node.constraint.elementTypes.filter(
                type => type.type === AST_NODE_TYPES.TSTypeReference,
              ) as TSESTree.TSTypeReference[];

            // T extends { some: SomeType, another: AnotherType }
            case AST_NODE_TYPES.TSTypeLiteral:
              return definition.node.constraint.members.reduce<
                TSESTree.TSTypeReference[]
              >((acc, member) => {
                if (
                  member.type === AST_NODE_TYPES.TSPropertySignature &&
                  member.typeAnnotation?.typeAnnotation.type ===
                    AST_NODE_TYPES.TSTypeReference
                ) {
                  acc.push(member.typeAnnotation.typeAnnotation);
                }

                return acc;
              }, []);

            default:
              continue;
          }
        }
      }

      return typeNode;
    }

    function getTypeName(typeReference: TSESTree.TSTypeReference): string {
      if (typeReference.typeName.type === AST_NODE_TYPES.Identifier) {
        return typeReference.typeName.name;
      }

      return '';
    }

    return {
      'ImportDeclaration[importKind="type"] ImportSpecifier, ImportSpecifier[importKind="type"]':
        collectImportedTypes,

      'ExportNamedDeclaration TSTypeAliasDeclaration, ExportNamedDeclaration TSInterfaceDeclaration':
        collectExportedTypes,

      'ExportNamedDeclaration[declaration.type="FunctionDeclaration"]':
        visitExportedFunctionDeclaration,

      'ExportNamedDeclaration[declaration.type="TSDeclareFunction"]':
        visitExportedFunctionDeclaration,

      'ExportNamedDeclaration[declaration.type="VariableDeclaration"]':
        visitExportedVariableDeclaration,

      'ExportDefaultDeclaration[declaration.type="FunctionDeclaration"]':
        visitExportedFunctionDeclaration,

      'ExportDefaultDeclaration[declaration.type="ArrowFunctionExpression"]':
        visitDefaultExportedArrowFunction,

      'ExportDefaultDeclaration[declaration.type="Identifier"]':
        visitDefaultExportedIdentifier,
    };
  },
});

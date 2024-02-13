import { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, getParserServices } from '../util';
import { DefinitionType } from '@typescript-eslint/scope-manager';

type MessageIds = 'requireTypeExport';

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
    const exportedTypes = new Set<string>();
    const reported = new Set<string>();

    function collectExportedTypes(program: TSESTree.Program): void {
      program.body.forEach(statement => {
        if (statement.type !== AST_NODE_TYPES.ExportNamedDeclaration) {
          return;
        }

        const { declaration } = statement;

        if (
          declaration?.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
          declaration?.type === AST_NODE_TYPES.TSInterfaceDeclaration
        ) {
          exportedTypes.add(declaration.id.name);

          return;
        }
      });
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
    ) {
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

    function checkFunctionParamsTypes(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.TSDeclareFunction
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionExpression,
    ): void {
      node.params.forEach(param => {
        getParamTypesNodes(param).forEach(paramTypeNode => {
          const name = getTypeName(paramTypeNode);

          if (!name) {
            // TODO: Report on the whole function? Is this case even possible?
            return;
          }

          const isExported = exportedTypes.has(name);
          const isReported = reported.has(name);

          if (isExported || isReported) {
            return;
          }

          context.report({
            node: paramTypeNode,
            messageId: 'requireTypeExport',
            data: {
              name,
            },
          });

          reported.add(name);
        });
      });
    }

    function checkFunctionReturnType(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.TSDeclareFunction
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionExpression,
    ): void {
      const returnTypeNode = node.returnType;

      if (!returnTypeNode) {
        return;
      }

      getReturnTypeTypesNodes(returnTypeNode).forEach(returnTypeNode => {
        const name = getTypeName(returnTypeNode);

        if (!name) {
          // TODO: Report on the whole function? Is this case even possible?
          return;
        }

        const isExported = exportedTypes.has(name);
        const isReported = reported.has(name);

        if (isExported || isReported) {
          return;
        }

        context.report({
          node: returnTypeNode,
          messageId: 'requireTypeExport',
          data: {
            name,
          },
        });

        reported.add(name);
      });
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

    function getTypeName(typeReference: TSESTree.TSTypeReference): string {
      if (typeReference.typeName.type === AST_NODE_TYPES.Identifier) {
        return typeReference.typeName.name;
      }

      return '';
    }

    return {
      Program: collectExportedTypes,

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

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import {
  ImplicitLibVariable,
  ScopeType,
} from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, findVariable, isNodeInside } from '../util';

export default createRule({
  name: 'require-types-exports',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require exporting types that are used in exported entities',
      recommended: 'strict',
    },
    messages: {
      requireTypeExport:
        '"{{ name }}" is used in other exports from this file, so it should also be exported.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const externalizedTypes = new Set<string>();
    const reportedTypes = new Set<string>();

    function collectImportedTypes(
      node:
        | TSESTree.ImportDefaultSpecifier
        | TSESTree.ImportNamespaceSpecifier
        | TSESTree.ImportSpecifier,
    ) {
      externalizedTypes.add(node.local.name);
    }

    function collectExportedTypes(node: TSESTree.Program) {
      node.body.forEach(statement => {
        if (
          statement.type === AST_NODE_TYPES.ExportNamedDeclaration &&
          statement.declaration &&
          isCollectableType(statement.declaration) &&
          statement.declaration.id.type === AST_NODE_TYPES.Identifier
        ) {
          externalizedTypes.add(statement.declaration.id.name);
        }
      });
    }

    function visitExportedFunctionDeclaration(
      node: (
        | TSESTree.ArrowFunctionExpression
        | TSESTree.DefaultExportDeclarations
        | TSESTree.ExportNamedDeclaration
      ) & {
        declaration: TSESTree.FunctionDeclaration | TSESTree.TSDeclareFunction;
      },
    ) {
      checkNodeTypes(node.declaration);
    }

    function visitExportedVariableDeclaration(
      node: TSESTree.ExportNamedDeclaration & {
        declaration: TSESTree.VariableDeclaration;
      },
    ) {
      for (const declaration of node.declaration.declarations) {
        checkNodeTypes(declaration);
      }
    }

    function visitExportedTypeDeclaration(
      node: TSESTree.ExportNamedDeclaration & {
        declaration:
          | TSESTree.TSInterfaceDeclaration
          | TSESTree.TSTypeAliasDeclaration;
      },
    ) {
      checkNodeTypes(node.declaration);
    }

    function visitExportDefaultDeclaration(
      node: TSESTree.ExportDefaultDeclaration,
    ) {
      checkNodeTypes(node.declaration);
    }

    function checkNodeTypes(node: TSESTree.Node) {
      const { typeQueries, typeReferences } = getVisibleTypesRecursively(
        node,
        context.sourceCode,
      );

      typeReferences.forEach(checkTypeReference);
      typeQueries.forEach(checkTypeQuery);
    }

    function checkTypeReference(node: TSESTree.TSTypeReference) {
      const name = getTypeName(node.typeName);
      if (externalizedTypes.has(name) || reportedTypes.has(name)) {
        return;
      }

      const declaration = findVariable(context.sourceCode.getScope(node), name);
      if (!declaration) {
        return;
      }

      context.report({
        node,
        messageId: 'requireTypeExport',
        data: { name },
      });

      reportedTypes.add(name);
    }

    function checkTypeQuery(node: TSESTree.TSTypeQuery) {
      if (node.exprName.type === AST_NODE_TYPES.TSImportType) {
        return;
      }

      const queriedName = getTypeName(node.exprName);
      const name = `typeof ${queriedName}`;

      const isReported = reportedTypes.has(name);
      if (isReported) {
        return;
      }

      const declaration = findVariable(
        context.sourceCode.getScope(node),
        queriedName,
      );
      if (!declaration) {
        return;
      }

      context.report({
        node,
        // messageId: 'requireTypeQueryExport',
        messageId: 'requireTypeExport',
        data: { name },
      });

      reportedTypes.add(name);
    }

    return {
      ExportDefaultDeclaration: visitExportDefaultDeclaration,
      'ExportDefaultDeclaration[declaration.type="ArrowFunctionExpression"]':
        visitExportedFunctionDeclaration,
      'ExportDefaultDeclaration[declaration.type="FunctionDeclaration"]':
        visitExportedFunctionDeclaration,
      'ExportNamedDeclaration[declaration.type="FunctionDeclaration"]':
        visitExportedFunctionDeclaration,
      'ExportNamedDeclaration[declaration.type="TSDeclareFunction"]':
        visitExportedFunctionDeclaration,
      'ExportNamedDeclaration[declaration.type="TSInterfaceDeclaration"]':
        visitExportedTypeDeclaration,
      'ExportNamedDeclaration[declaration.type="TSModuleDeclaration"] > ExportNamedDeclaration[declaration.type="TSInterfaceDeclaration"]':
        visitExportedTypeDeclaration,
      'ExportNamedDeclaration[declaration.type="TSTypeAliasDeclaration"]':
        visitExportedTypeDeclaration,
      'ExportNamedDeclaration[declaration.type="TSTypeAliasDeclaration"] > ExportNamedDeclaration[declaration.type="TSInterfaceDeclaration"]':
        visitExportedTypeDeclaration,
      'ExportNamedDeclaration[declaration.type="VariableDeclaration"]':
        visitExportedVariableDeclaration,
      'ImportDeclaration ImportDefaultSpecifier': collectImportedTypes,
      'ImportDeclaration ImportNamespaceSpecifier': collectImportedTypes,
      'ImportDeclaration ImportSpecifier': collectImportedTypes,
      Program: collectExportedTypes,
    };
  },
});

function getLeftmostIdentifier(
  node: TSESTree.EntityName | TSESTree.TSImportType | TSESTree.TSTypeReference,
) {
  switch (node.type) {
    case AST_NODE_TYPES.Identifier:
      return node.name;

    case AST_NODE_TYPES.TSQualifiedName:
      return getLeftmostIdentifier(node.left);

    default:
      return undefined;
  }
}

function getTypeName(node: TSESTree.EntityName): string {
  switch (node.type) {
    case AST_NODE_TYPES.Identifier:
      return node.name;

    // case AST_NODE_TYPES.TSImportType:
    //   return `import(${getTypeName(node.argument)})`;

    case AST_NODE_TYPES.TSQualifiedName:
      // Namespaced types such as enums are not exported directly,
      // so we check the leftmost part of the name.
      return getTypeName(node.left);

    case AST_NODE_TYPES.ThisExpression:
      return 'this';
  }
}

interface VisibleTypes {
  typeReferences: Set<TSESTree.TSTypeReference>;
  typeQueries: Set<TSESTree.TSTypeQuery>;
}

function getVisibleTypesRecursively(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): VisibleTypes {
  const typeReferences = new Set<TSESTree.TSTypeReference>();
  const typeQueries = new Set<TSESTree.TSTypeQuery>();
  const visited = new Set<TSESTree.Node>();

  collect(node);

  function collect(child: TSESTree.Node | null | undefined) {
    if (!child || visited.has(child)) {
      return;
    }

    visited.add(child);

    switch (child.type) {
      case AST_NODE_TYPES.VariableDeclarator:
        collect(child.id);
        collect(child.init);
        break;

      case AST_NODE_TYPES.Identifier: {
        collect(child.typeAnnotation?.typeAnnotation);

        // Resolve the variable to its declaration (in cases where the variable is referenced)
        const scope = sourceCode.getScope(child);
        const variableNode = findVariable(scope, child.name);

        variableNode?.defs.forEach(def => {
          collect(def.name);
          collect(def.node);
        });
        break;
      }

      case AST_NODE_TYPES.ObjectExpression:
        child.properties.forEach(property => {
          const nodeToCheck =
            property.type === AST_NODE_TYPES.Property
              ? property.value
              : property.argument;

          collect(nodeToCheck);
        });
        break;

      case AST_NODE_TYPES.ArrayExpression:
        child.elements.forEach(element => {
          const nodeToCheck =
            element?.type === AST_NODE_TYPES.SpreadElement
              ? element.argument
              : element;

          collect(nodeToCheck);
        });
        break;

      case AST_NODE_TYPES.NewExpression:
      case AST_NODE_TYPES.CallExpression:
        collect(child.callee);
        child.typeArguments?.params.forEach(collect);
        break;

      case AST_NODE_TYPES.BinaryExpression:
      case AST_NODE_TYPES.LogicalExpression:
        collect(child.left);
        collect(child.right);
        break;

      case AST_NODE_TYPES.ConditionalExpression:
        collect(child.consequent);
        collect(child.alternate);
        break;

      case AST_NODE_TYPES.ArrowFunctionExpression:
      case AST_NODE_TYPES.FunctionDeclaration:
      case AST_NODE_TYPES.FunctionExpression:
      case AST_NODE_TYPES.TSDeclareFunction:
        child.typeParameters?.params.forEach(param =>
          collect(param.constraint),
        );
        child.params.forEach(collect);
        collect(child.returnType?.typeAnnotation);

        if (child.body) {
          collectFunctionReturnStatements(child).forEach(collect);
        }
        break;

      case AST_NODE_TYPES.AssignmentPattern:
        collect(child.left);
        break;

      case AST_NODE_TYPES.RestElement:
        collect(child.argument);
        collect(child.typeAnnotation?.typeAnnotation);
        break;

      case AST_NODE_TYPES.ObjectPattern:
        child.properties.forEach(collect);
        collect(child.typeAnnotation?.typeAnnotation);
        break;

      case AST_NODE_TYPES.ArrayPattern:
        child.elements.forEach(collect);
        collect(child.typeAnnotation?.typeAnnotation);

        break;

      case AST_NODE_TYPES.ReturnStatement:
        collect(child.argument);
        break;

      case AST_NODE_TYPES.TSTypeReference: {
        const scope = sourceCode.getScope(child);
        const variable = findVariable(scope, getTypeName(child.typeName));

        const isBuiltinType = variable instanceof ImplicitLibVariable;

        const isGenericTypeArg =
          (variable?.scope.type === ScopeType.function ||
            variable?.scope.type === ScopeType.type) &&
          variable.identifiers.every(
            id => id.parent.type === AST_NODE_TYPES.TSTypeParameter,
          );

        if (!isBuiltinType && !isGenericTypeArg) {
          typeReferences.add(child);
        }

        child.typeArguments?.params.forEach(collect);
        break;
      }

      case AST_NODE_TYPES.TSTypeOperator:
        collect(child.typeAnnotation);
        break;

      case AST_NODE_TYPES.TSTypeQuery:
        if (
          isInsideFunctionDeclaration(child) &&
          !isReferencedNameInside(child.exprName, node, sourceCode)
        ) {
          typeQueries.add(child);
        }

        break;

      case AST_NODE_TYPES.TSArrayType:
        collect(child.elementType);
        break;

      case AST_NODE_TYPES.TSTupleType:
        child.elementTypes.forEach(collect);
        break;

      case AST_NODE_TYPES.TSUnionType:
      case AST_NODE_TYPES.TSIntersectionType:
        child.types.forEach(collect);
        break;

      case AST_NODE_TYPES.TSTypeLiteral:
        child.members.forEach(collect);
        break;

      case AST_NODE_TYPES.TSTemplateLiteralType:
        child.types.forEach(collect);
        break;

      case AST_NODE_TYPES.TSTypeAliasDeclaration:
        collect(child.typeAnnotation);
        break;

      case AST_NODE_TYPES.TSInterfaceDeclaration:
        child.body.body.forEach(collect);
        break;

      case AST_NODE_TYPES.TSPropertySignature:
        collect(child.typeAnnotation?.typeAnnotation);
        break;

      case AST_NODE_TYPES.TSQualifiedName:
        collect(child.parent);
        break;

      case AST_NODE_TYPES.TSAsExpression:
        collect(child.expression);
        collect(child.typeAnnotation);
        break;

      case AST_NODE_TYPES.TSIndexedAccessType:
        collect(child.objectType);
        collect(child.indexType);
        break;
    }
  }

  return {
    typeQueries,
    typeReferences,
  };
}

const collectibleNodeTypes = new Set([
  AST_NODE_TYPES.TSTypeAliasDeclaration,
  AST_NODE_TYPES.TSInterfaceDeclaration,
  AST_NODE_TYPES.TSEnumDeclaration,
  AST_NODE_TYPES.TSModuleDeclaration,
]);

function isCollectableType(
  node: TSESTree.Node,
): node is
  | TSESTree.TSEnumDeclaration
  | TSESTree.TSInterfaceDeclaration
  | TSESTree.TSModuleDeclaration
  | TSESTree.TSTypeAliasDeclaration {
  return collectibleNodeTypes.has(node.type);
}

const functionNodeTypes = new Set([
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.TSDeclareFunction,
]);

function isInsideFunctionDeclaration(node: TSESTree.Node): boolean {
  if (!node.parent) {
    return false;
  }

  if (functionNodeTypes.has(node.parent.type)) {
    return true;
  }

  return isInsideFunctionDeclaration(node.parent);
}

function getDeclarationForName(
  node: TSESTree.Node,
  name: string,
  sourceCode: TSESLint.SourceCode,
) {
  return sourceCode.getScope(node).set.get(name)?.identifiers.at(0);
}

function isReferencedNameInside(
  child: TSESTree.EntityName | TSESTree.TSImportType,
  parent: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
) {
  const localName = getLeftmostIdentifier(child);
  if (!localName) {
    return false;
  }

  const declaration = getDeclarationForName(child, localName, sourceCode);

  return !!declaration && isNodeInside(declaration, parent);
}

function collectFunctionReturnStatements(
  functionNode:
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression,
): Set<TSESTree.Node> {
  const isArrowFunctionReturn =
    functionNode.type === AST_NODE_TYPES.ArrowFunctionExpression &&
    functionNode.body.type !== AST_NODE_TYPES.BlockStatement;

  if (isArrowFunctionReturn) {
    return new Set([functionNode.body]);
  }

  const returnStatements = new Set<TSESTree.Node>();

  forEachReturnStatement(functionNode, returnNode =>
    returnStatements.add(returnNode),
  );

  return returnStatements;
}

// Heavily inspired by:
// https://github.com/typescript-eslint/typescript-eslint/blob/103de6eed/packages/eslint-plugin/src/util/astUtils.ts#L47-L80
function forEachReturnStatement(
  functionNode:
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression,
  visitor: (returnNode: TSESTree.ReturnStatement) => void,
): void {
  return traverse(functionNode.body);

  function traverse(node: TSESTree.Node | null): void {
    switch (node?.type) {
      case AST_NODE_TYPES.ReturnStatement:
        return visitor(node);

      case AST_NODE_TYPES.SwitchStatement:
        return node.cases.forEach(traverse);

      case AST_NODE_TYPES.SwitchCase:
        return node.consequent.forEach(traverse);

      case AST_NODE_TYPES.BlockStatement:
        return node.body.forEach(traverse);

      case AST_NODE_TYPES.DoWhileStatement:
      case AST_NODE_TYPES.ForInStatement:
      case AST_NODE_TYPES.ForOfStatement:
      case AST_NODE_TYPES.WhileStatement:
      case AST_NODE_TYPES.ForStatement:
      case AST_NODE_TYPES.WithStatement:
      case AST_NODE_TYPES.CatchClause:
      case AST_NODE_TYPES.LabeledStatement:
        return traverse(node.body);

      case AST_NODE_TYPES.IfStatement:
        traverse(node.consequent);
        traverse(node.alternate);
        return;

      case AST_NODE_TYPES.TryStatement:
        traverse(node.block);
        traverse(node.handler);
        traverse(node.finalizer);
        return;
    }
  }
}

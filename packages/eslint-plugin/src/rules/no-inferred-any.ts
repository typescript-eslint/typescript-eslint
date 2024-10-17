import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as typescript from 'typescript';

import { createRule, getParserServices, isTypeAnyType } from '../util';

const fixMessage = 'To fix, add explicit type declaration.';
const messages = {
  exportedAny: `Exported variable type inferred as \`any\`. ${fixMessage}`,
  exportedAnyFunc: `Exported function return type inferred as \`any\`. ${fixMessage}`,
  returnedAny: `Function return type inferred as \`any\`. ${fixMessage}`,
  variableAny: `Variable type inferred as \`any\`. ${fixMessage}`,
};

export type MessageIds = keyof typeof messages;

export interface OptionsObjectType {
  checkExports?: boolean;
  checkReturnTypes?: boolean;
  checkVariables?: boolean;
}

export default createRule<[OptionsObjectType], MessageIds>({
  name: 'no-inferred-any',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow implicitly inferred `any` type',
      requiresTypeChecking: true,
    },
    messages,
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          checkExports: {
            type: 'boolean',
          },
          checkReturnTypes: {
            type: 'boolean',
          },
          checkVariables: {
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      checkExports: true,
      checkReturnTypes: true,
      checkVariables: true,
    },
  ],
  create(context, options) {
    const service = getParserServices(context);
    const typeChecker = service.program.getTypeChecker();

    const [
      {
        checkExports = true,
        checkReturnTypes = true,
        checkVariables = true,
      } = {},
    ] = options;

    const isExpressionAnyType = (node: TSESTree.Node): boolean => {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);

      let symbol = typeChecker.getSymbolAtLocation(tsNode);

      // Get original symbol if this is an alias (e.g. an imported variable)
      if (symbol && symbol.getFlags() & typescript.SymbolFlags.Alias) {
        symbol = typeChecker.getAliasedSymbol(symbol);
      }

      const type =
        // getTypeAtLocation returns a bogus error type if called on a non-value
        // symbol (such as a symbol that references a type alias). To avoid
        // this, use `getDeclaredTypeOfSymbol` to get the type if the node is a
        // symbol.
        symbol && !(symbol.getFlags() & typescript.SymbolFlags.Value)
          ? typeChecker.getDeclaredTypeOfSymbol(symbol)
          : typeChecker.getTypeAtLocation(tsNode);

      // TODO: Also warn about any[] (behind configurable flag)
      // TODO: Maybe also warn about Promise<any> (behind configurable flag)
      return isTypeAnyType(type);
    };

    type FunctionNode =
      | TSESTree.ArrowFunctionExpression
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression;

    const findParentFunction = (node: TSESTree.Node): FunctionNode => {
      if (!node.parent) {
        throw new Error('Could not find parent function');
      } else if (
        node.parent.type === AST_NODE_TYPES.FunctionExpression ||
        node.parent.type === AST_NODE_TYPES.FunctionDeclaration ||
        node.parent.type === AST_NODE_TYPES.ArrowFunctionExpression
      ) {
        return node.parent;
      } else {
        return findParentFunction(node.parent);
      }
    };

    /**
     * This helper is for finding the top-most function for a curried function,
     * such as `() => () => (0 as any)`
     */
    const findTopParentFunction = (node: TSESTree.Node): FunctionNode => {
      const parentFunction = findParentFunction(node);

      if (
        // Function is returned from a return statement
        parentFunction.parent.type === AST_NODE_TYPES.ReturnStatement ||
        // Function is returned as expression from arrow function
        (parentFunction.parent.type ===
          AST_NODE_TYPES.ArrowFunctionExpression &&
          parentFunction.parent.expression &&
          parentFunction.parent.body === parentFunction)
      ) {
        return findTopParentFunction(parentFunction);
      }

      return parentFunction;
    };

    const returnStatementHasExplicitType = (
      node: TSESTree.ReturnStatement,
    ): boolean => {
      const parentFunction = findParentFunction(node);

      return functionHasExplicitReturnType(parentFunction);
    };

    const functionHasExplicitReturnType = (node: FunctionNode): boolean => {
      // Function has direct return type, such as `(): unknown => (0 as any)`
      if (node.returnType !== undefined) {
        return true;
      }

      // Function is assigned to a variable which has an explicit type, such as
      // `const f: () => unknown = () => (0 as any)`
      if (
        node.parent.type === AST_NODE_TYPES.VariableDeclarator &&
        node.parent.id.typeAnnotation !== undefined
      ) {
        return true;
      }

      // Function is returned from an arrow function as an expression, such as
      // `() => () => (0 as any)`
      if (node.parent.type === AST_NODE_TYPES.ArrowFunctionExpression) {
        if (!node.parent.expression) {
          // This should not be possible.
          return false;
        }

        return functionHasExplicitReturnType(node.parent);
      }

      // Function is returned from a return statement, such as
      // `return () => (0 as any)`
      if (node.parent.type === AST_NODE_TYPES.ReturnStatement) {
        return returnStatementHasExplicitType(node.parent);
      }

      return false;
    };

    const variableHasExplicitType = (
      node: TSESTree.VariableDeclarator,
    ): boolean => node.id.typeAnnotation !== undefined;

    const valueIsExported = (node: TSESTree.Node): boolean =>
      // export function f() {}
      (node.type === AST_NODE_TYPES.FunctionDeclaration &&
        node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration) ||
      // export const f = () => {}
      // export const x = 1;
      (node.parent?.type === AST_NODE_TYPES.VariableDeclarator &&
        node.parent.parent.parent.type ===
          AST_NODE_TYPES.ExportNamedDeclaration);

    return {
      ArrowFunctionExpression(node): void {
        if (!node.expression) {
          return;
        }
        const shouldCheckExport =
          checkExports && valueIsExported(findTopParentFunction(node.body));
        if (!checkReturnTypes && !shouldCheckExport) {
          return;
        }
        if (functionHasExplicitReturnType(node)) {
          return;
        }
        // isExpressionAnyType looks at the type information so it is the most
        // expensive check and should always come last.
        if (!isExpressionAnyType(node.body)) {
          return;
        }

        if (shouldCheckExport) {
          context.report({
            node: node.body,
            messageId: 'exportedAnyFunc',
          });
        }

        if (checkReturnTypes) {
          context.report({
            node: node.body,
            messageId: 'returnedAny',
          });
        }
      },

      ExportSpecifier(node): void {
        if (checkExports && isExpressionAnyType(node.local)) {
          // For example:
          //
          // ```
          // const x: any = 0;
          //
          // export { x };
          // ```
          context.report({
            node: node.local,
            messageId: 'exportedAny',
          });
        }
      },

      ReturnStatement(node): void {
        if (!node.argument) {
          return;
        }
        const shouldCheckExport =
          checkExports && valueIsExported(findTopParentFunction(node));
        if (!checkReturnTypes && !shouldCheckExport) {
          return;
        }
        if (returnStatementHasExplicitType(node)) {
          return;
        }
        // isExpressionAnyType looks at the type information so it is the most
        // expensive check and should always come last.
        if (!isExpressionAnyType(node.argument)) {
          return;
        }

        if (shouldCheckExport) {
          context.report({
            node: node.argument,
            messageId: 'exportedAnyFunc',
          });
        }

        if (checkReturnTypes) {
          context.report({
            node: node.argument,
            messageId: 'returnedAny',
          });
        }
      },

      VariableDeclarator(node): void {
        if (!node.init) {
          return;
        }
        const shouldCheckExport = checkExports && valueIsExported(node.init);
        if (!checkVariables && !shouldCheckExport) {
          return;
        }
        if (variableHasExplicitType(node)) {
          return;
        }
        // isExpressionAnyType looks at the type information so it is the most
        // expensive check and should always come last.
        if (!isExpressionAnyType(node.init)) {
          return;
        }

        if (shouldCheckExport) {
          context.report({
            node: node.init,
            messageId: 'exportedAny',
          });
        }

        if (checkVariables) {
          context.report({
            node: node.init,
            messageId: 'variableAny',
          });
        }
      },
    };
  },
});

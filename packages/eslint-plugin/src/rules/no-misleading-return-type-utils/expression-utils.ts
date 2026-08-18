import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { AnalysisState } from './analysis-state';

export interface ExpressionUtilities {
  unwrapImmutableAlias: (
    expression: ts.Expression,
    preserveFlowType?: boolean,
  ) => ts.Expression;
  unwrapTransparentExpression: (expression: ts.Expression) => ts.Expression;
}

export function createExpressionUtilities(
  state: AnalysisState,
): ExpressionUtilities {
  const { checker, isTypeAssignableTo } = state;

  /**
   * Skips wrappers that do not change the runtime value: parentheses,
   * `satisfies`, and const assertions.
   */
  function unwrapTransparentExpression(
    expression: ts.Expression,
  ): ts.Expression {
    for (;;) {
      if (ts.isParenthesizedExpression(expression)) {
        expression = expression.expression;
        continue;
      }
      // Comparing the syntax kind directly stays inert on TypeScript
      // versions whose parser predates `satisfies`.
      if (expression.kind === ts.SyntaxKind.SatisfiesExpression) {
        expression = (expression as ts.SatisfiesExpression).expression;
        continue;
      }
      if (
        (ts.isAsExpression(expression) ||
          ts.isTypeAssertionExpression(expression)) &&
        tsutils.isConstAssertionExpression(expression)
      ) {
        expression = expression.expression;
        continue;
      }
      return expression;
    }
  }

  /**
   * Follows `const` initializers transparently; `preserveFlowType` keeps
   * the identifier when a type guard narrowed it after initialization.
   */
  function unwrapImmutableAlias(
    expression: ts.Expression,
    preserveFlowType = false,
  ): ts.Expression {
    const seen = new Set<ts.Symbol>();
    for (;;) {
      expression = unwrapTransparentExpression(expression);
      if (!ts.isIdentifier(expression)) {
        return expression;
      }

      const symbol = checker.getSymbolAtLocation(expression);
      const declaration = symbol?.valueDeclaration;
      if (
        symbol == null ||
        seen.has(symbol) ||
        declaration == null ||
        !ts.isVariableDeclaration(declaration) ||
        !ts.isIdentifier(declaration.name) ||
        declaration.initializer == null ||
        !ts.isVariableDeclarationList(declaration.parent) ||
        !tsutils.isNodeFlagSet(declaration.parent, ts.NodeFlags.Const)
      ) {
        return expression;
      }

      if (preserveFlowType) {
        const expressionType = checker.getTypeAtLocation(expression);
        const initializerType = checker.getTypeAtLocation(
          declaration.initializer,
        );
        if (
          expressionType !== initializerType &&
          (!isTypeAssignableTo(expressionType, initializerType) ||
            !isTypeAssignableTo(initializerType, expressionType))
        ) {
          // A type guard may narrow a const identifier after its
          // initialization. Replacing that identifier with the initializer
          // would discard the narrower flow type at the return site.
          return expression;
        }
      }

      seen.add(symbol);
      expression = declaration.initializer;
    }
  }

  return { unwrapImmutableAlias, unwrapTransparentExpression };
}

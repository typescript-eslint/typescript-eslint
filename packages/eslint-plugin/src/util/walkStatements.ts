import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

/**
 * Yields all statement nodes in a block, including nested blocks.
 *
 * You can use it to find all return statements in a function body.
 */
export function* walkStatements(
  body: readonly TSESTree.Statement[],
): Generator<TSESTree.Statement> {
  for (const statement of body) {
    switch (statement.type) {
      case AST_NODE_TYPES.BlockStatement: {
        yield* walkStatements(statement.body);
        continue;
      }
      case AST_NODE_TYPES.SwitchStatement: {
        for (const switchCase of statement.cases) {
          yield* walkStatements(switchCase.consequent);
        }
        continue;
      }
      case AST_NODE_TYPES.IfStatement: {
        yield* walkStatements([statement.consequent]);
        if (statement.alternate) {
          yield* walkStatements([statement.alternate]);
        }
        continue;
      }
      case AST_NODE_TYPES.WhileStatement:
      case AST_NODE_TYPES.DoWhileStatement:
      case AST_NODE_TYPES.ForStatement:
      case AST_NODE_TYPES.ForInStatement:
      case AST_NODE_TYPES.ForOfStatement:
      case AST_NODE_TYPES.WithStatement:
      case AST_NODE_TYPES.LabeledStatement: {
        yield* walkStatements([statement.body]);
        continue;
      }
      case AST_NODE_TYPES.TryStatement: {
        yield* walkStatements([statement.block]);
        if (statement.handler) {
          yield* walkStatements([statement.handler.body]);
        }
        if (statement.finalizer) {
          yield* walkStatements([statement.finalizer]);
        }
        continue;
      }
      default: {
        yield statement;
        continue;
      }
    }
  }
}

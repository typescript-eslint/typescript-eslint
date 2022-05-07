import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../util';

type MessageIds = 'preferLHS' | 'preferRHS';
type Options = ['lhs' | 'rhs'];

export default createRule<Options, MessageIds>({
  name: 'consistent-generic-constructors',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce specifying generic type arguments on LHS or RHS of constructor call',
      recommended: false,
    },
    messages: {
      preferLHS:
        'The generic type arguments should be specified on the left-hand side of the constructor call.',
      preferRHS:
        'The generic type arguments should be specified on the right-hand side of the constructor call.',
    },
    fixable: 'code',
    schema: [
      {
        enum: ['lhs', 'rhs'],
      },
    ],
  },
  defaultOptions: ['rhs'],
  create(context, [mode]) {
    return {
      VariableDeclarator(node: TSESTree.VariableDeclarator): void {
        const sourceCode = context.getSourceCode();
        const lhs = node.id.typeAnnotation?.typeAnnotation;
        const rhs = node.init;
        if (
          !rhs ||
          rhs.type !== AST_NODE_TYPES.NewExpression ||
          rhs.callee.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }
        if (
          lhs &&
          (lhs.type !== AST_NODE_TYPES.TSTypeReference ||
            lhs.typeName.type !== AST_NODE_TYPES.Identifier)
        ) {
          return;
        }
        if (mode === 'lhs' && !lhs && rhs.typeParameters) {
          context.report({
            node,
            messageId: 'preferLHS',
            fix(fixer) {
              const { typeParameters, callee } = rhs;
              const typeAnnotation =
                sourceCode.getText(callee) + sourceCode.getText(typeParameters);
              return [
                fixer.remove(typeParameters!),
                fixer.insertTextAfter(node.id, ': ' + typeAnnotation),
              ];
            },
          });
        } else if (
          mode === 'rhs' &&
          lhs?.typeParameters &&
          !rhs.typeParameters &&
          (lhs.typeName as TSESTree.Identifier).name === rhs.callee.name
        ) {
          context.report({
            node,
            messageId: 'preferRHS',
            fix(fixer) {
              return [
                fixer.remove(lhs.parent!),
                fixer.insertTextAfter(
                  rhs.callee,
                  sourceCode.getText(lhs.typeParameters),
                ),
              ];
            },
          });
        }
      },
    };
  },
});

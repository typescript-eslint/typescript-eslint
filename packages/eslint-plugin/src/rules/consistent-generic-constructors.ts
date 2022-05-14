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
            lhs.typeName.type !== AST_NODE_TYPES.Identifier ||
            lhs.typeName.name !== rhs.callee.name)
        ) {
          return;
        }
        if (mode === 'lhs' && !lhs && rhs.typeParameters) {
          const { typeParameters, callee } = rhs;
          const typeAnnotation =
            sourceCode.getText(callee) + sourceCode.getText(typeParameters);
          context.report({
            node,
            messageId: 'preferLHS',
            fix(fixer) {
              return [
                fixer.remove(typeParameters),
                fixer.insertTextAfter(node.id, ': ' + typeAnnotation),
              ];
            },
          });
        }
        if (mode === 'rhs' && lhs?.typeParameters && !rhs.typeParameters) {
          const hasParens = sourceCode.getTokenAfter(rhs.callee)?.value === '(';
          context.report({
            node,
            messageId: 'preferRHS',
            *fix(fixer) {
              yield fixer.remove(lhs.parent!);
              yield fixer.insertTextAfter(
                rhs.callee,
                sourceCode.getText(lhs.typeParameters),
              );
              if (!hasParens) {
                yield fixer.insertTextAfter(rhs.callee, '()');
              }
            },
          });
        }
      },
    };
  },
});

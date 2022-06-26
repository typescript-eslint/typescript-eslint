import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createRule } from '../util';

type MessageIds = 'preferTypeAnnotation' | 'preferConstructor';
type Options = ['type-annotation' | 'constructor'];

export default createRule<Options, MessageIds>({
  name: 'consistent-generic-constructors',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce specifying generic type arguments on type annotation or constructor name of a constructor call',
      recommended: 'strict',
    },
    messages: {
      preferTypeAnnotation:
        'The generic type arguments should be specified as part of the type annotation.',
      preferConstructor:
        'The generic type arguments should be specified as part of the constructor type arguments.',
    },
    fixable: 'code',
    schema: [
      {
        enum: ['type-annotation', 'constructor'],
      },
    ],
  },
  defaultOptions: ['constructor'],
  create(context, [mode]) {
    const sourceCode = context.getSourceCode();
    return {
      VariableDeclarator(node): void {
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
        if (mode === 'type-annotation') {
          if (!lhs && rhs.typeParameters) {
            const { typeParameters, callee } = rhs;
            const typeAnnotation =
              sourceCode.getText(callee) + sourceCode.getText(typeParameters);
            context.report({
              node,
              messageId: 'preferTypeAnnotation',
              fix(fixer) {
                return [
                  fixer.remove(typeParameters),
                  fixer.insertTextAfter(node.id, ': ' + typeAnnotation),
                ];
              },
            });
          }
          return;
        }
        if (mode === 'constructor') {
          if (lhs?.typeParameters && !rhs.typeParameters) {
            const hasParens =
              sourceCode.getTokenAfter(rhs.callee)?.value === '(';
            const extraComments = new Set(
              sourceCode.getCommentsInside(lhs.parent),
            );
            sourceCode
              .getCommentsInside(lhs.typeParameters)
              .forEach(c => extraComments.delete(c));
            context.report({
              node,
              messageId: 'preferConstructor',
              *fix(fixer) {
                yield fixer.remove(lhs.parent);
                for (const comment of extraComments) {
                  yield fixer.insertTextAfter(
                    rhs.callee,
                    sourceCode.getText(comment),
                  );
                }
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
        }
      },
    };
  },
});

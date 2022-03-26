import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import * as semver from 'semver';
import * as ts from 'typescript';
import * as util from '../util';

const is3dot5 = semver.satisfies(
  ts.version,
  `>= 3.5.0 || >= 3.5.1-rc || >= 3.5.0-beta`,
  {
    includePrerelease: true,
  },
);

const is3dot9 =
  is3dot5 &&
  semver.satisfies(ts.version, `>= 3.9.0 || >= 3.9.1-rc || >= 3.9.0-beta`, {
    includePrerelease: true,
  });

function isArrowFunctionTypeParameter(node: TSESTree.TSTypeParameter): boolean {
  return (
    node.parent?.type === AST_NODE_TYPES.TSTypeParameterDeclaration &&
    node.parent.parent?.type === AST_NODE_TYPES.ArrowFunctionExpression
  );
}

export default util.createRule({
  name: 'no-unnecessary-generic-modifier',
  meta: {
    docs: {
      description: 'Disallows generic type parameter modifiers that do nothing',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      preferDefault:
        'Prefer the shorter `= unknown` default for arrow function type parameters in .tsx files.',
      unnecessaryConstraint:
        'This `extends unknown` constraint does nothing because all type parameters extend unknown.',
      unnecessaryDefault:
        'This `= unknown` default does nothing because type parameters default to unknown.',
    },
    schema: [
      {
        additionalProperties: false,
        type: 'object',
        properties: {
          preferInJsx: {
            default: 'default',
            enum: ['constraint', 'default'],
          },
        },
      },
    ],
    type: 'problem',
  },
  defaultOptions: [
    {
      preferInJsx: 'default',
    },
  ],
  create(context) {
    // In theory, we could use the type checker for more advanced constraint types...
    // ...but in practice, these types are rare, and likely not worth requiring type info.
    // https://github.com/typescript-eslint/typescript-eslint/pull/2516#discussion_r495731858
    const unnecessaryConstraints = is3dot9
      ? new Map([
          [AST_NODE_TYPES.TSAnyKeyword, 'any'],
          [AST_NODE_TYPES.TSUnknownKeyword, 'unknown'],
        ])
      : new Map([[AST_NODE_TYPES.TSUnknownKeyword, 'unknown']]);

    const inJsx = util.isJsxFile(context.getFilename());

    return {
      TSTypeParameter(node): void {
        const { constraint, default: typeDefault } = node;

        if (constraint) {
          const replacement = unnecessaryConstraints.get(constraint.type);

          if (replacement) {
            context.report({
              data: {
                constraint,
                name: node.name.name,
              },
              fix(fixer) {
                return fixer.replaceTextRange(
                  [node.name.range[1], constraint.range[1]],
                  isArrowFunctionTypeParameter(node) && inJsx ? ',' : '',
                );
              },
              messageId: 'unnecessaryConstraint',
              node,
            });
          }
        }

        if (
          typeDefault?.type === AST_NODE_TYPES.TSUnknownKeyword &&
          !(inJsx && isArrowFunctionTypeParameter(node))
        ) {
          context.report({
            fix: fixer =>
              fixer.removeRange([
                node.constraint?.range[1] ?? node.name.range[1],
                typeDefault.range[1],
              ]),
            messageId: 'unnecessaryDefault',
            node: typeDefault,
          });
        }
      },
    };
  },
});

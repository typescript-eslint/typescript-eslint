import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as semver from 'semver';
import * as ts from 'typescript';
import * as util from '../util';

type MakeRequired<Base, Key extends keyof Base> = Omit<Base, Key> &
  Required<Pick<Base, Key>>;

type TypeParameterWithConstraint = MakeRequired<
  TSESTree.TSTypeParameter,
  'constraint'
>;

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

export default util.createRule({
  name: 'no-unnecessary-type-constraint',
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallows unnecessary constraints on generic types',
      recommended: false,
      suggestion: true,
    },
    fixable: 'code',
    messages: {
      unnecessaryConstraint:
        'Constraining the generic type `{{name}}` to `{{constraint}}` does nothing and is unnecessary.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    if (!is3dot5) {
      return {};
    }

    // In theory, we could use the type checker for more advanced constraint types...
    // ...but in practice, these types are rare, and likely not worth requiring type info.
    // https://github.com/typescript-eslint/typescript-eslint/pull/2516#discussion_r495731858
    const unnecessaryConstraints = is3dot9
      ? new Map([
          [AST_NODE_TYPES.TSAnyKeyword, 'any'],
          [AST_NODE_TYPES.TSUnknownKeyword, 'unknown'],
        ])
      : new Map([[AST_NODE_TYPES.TSUnknownKeyword, 'unknown']]);

    const inJsx = context.getFilename().toLowerCase().endsWith('tsx');

    const checkNode = (
      node: TypeParameterWithConstraint,
      inArrowFunction: boolean,
    ): void => {
      const constraint = unnecessaryConstraints.get(node.constraint.type);

      if (constraint) {
        context.report({
          data: {
            constraint,
            name: node.name.name,
          },
          fix(fixer) {
            return fixer.replaceTextRange(
              [node.name.range[1], node.constraint.range[1]],
              inArrowFunction && inJsx ? ',' : '',
            );
          },
          messageId: 'unnecessaryConstraint',
          node,
        });
      }
    };

    return {
      ':not(ArrowFunctionExpression) > TSTypeParameterDeclaration > TSTypeParameter[constraint]'(
        node: TypeParameterWithConstraint,
      ): void {
        checkNode(node, false);
      },
      'ArrowFunctionExpression > TSTypeParameterDeclaration > TSTypeParameter[constraint]'(
        node: TypeParameterWithConstraint,
      ): void {
        checkNode(node, true);
      },
    };
  },
});

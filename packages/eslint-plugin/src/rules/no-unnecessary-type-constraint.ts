import {
  getLanguageVariant,
  getScriptKind,
  isNewModuleExtension,
} from '@typescript-eslint/type-utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
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
      description: 'Disallow unnecessary constraints on generic types',
      recommended: 'error',
    },
    hasSuggestions: true,
    messages: {
      unnecessaryConstraint:
        'Constraining the generic type `{{name}}` to `{{constraint}}` does nothing and is unnecessary.',
      removeUnnecessaryConstraint:
        'Remove the unnecessary `{{constraint}}` constraint.',
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

    const filename = context.getFilename();
    const scriptKind = getScriptKind(
      filename,
      !!context.parserOptions.ecmaFeatures?.jsx,
    );
    const inJsx = getLanguageVariant(scriptKind) === ts.LanguageVariant.JSX;
    const newModuleExtension = isNewModuleExtension(filename);
    const source = context.getSourceCode();

    const checkNode = (
      node: TypeParameterWithConstraint,
      inArrowFunction: boolean,
    ): void => {
      const constraint =
        !newModuleExtension && unnecessaryConstraints.get(node.constraint.type);
      function shouldAddTrailingComma(): boolean {
        if (!inArrowFunction || !inJsx) {
          return false;
        }
        // Only <T>() => {} would need trailing comma
        return (
          (node.parent as TSESTree.TSTypeParameterDeclaration).params.length ===
            1 &&
          source.getTokensAfter(node)[0].value !== ',' &&
          !node.default
        );
      }

      if (constraint) {
        context.report({
          data: {
            constraint,
            name: node.name.name,
          },
          suggest: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: {
                constraint,
              },
              fix(fixer): TSESLint.RuleFix | null {
                return fixer.replaceTextRange(
                  [node.name.range[1], node.constraint.range[1]],
                  shouldAddTrailingComma() ? ',' : '',
                );
              },
            },
          ],
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

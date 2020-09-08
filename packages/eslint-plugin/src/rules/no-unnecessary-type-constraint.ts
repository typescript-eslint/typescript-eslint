import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as semver from 'semver';
import * as ts from 'typescript';
import * as util from '../util';

type MakeRequired<Base, Key extends keyof Base> = Omit<Base, Key> &
  Required<Pick<Base, Key>>;

type TypeParameterWithConstraint = MakeRequired<
  TSESTree.TSTypeParameter,
  'constraint'
>;

type KeywordFilter = (type: ts.Type) => boolean;

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
      requiresTypeChecking: true,
      suggestion: true,
    },
    fixable: 'code',
    messages: {
      unnecessaryConstraint:
        'Constraining a generic type to {{constraint}} does nothing and is unnecessary.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    const keywordFilters: [KeywordFilter, string][] = [];
    if (is3dot5) {
      keywordFilters.push([util.isTypeUnknownType, 'unknown']);

      if (is3dot9) {
        keywordFilters.push([util.isTypeAnyType, 'any']);
      }
    }

    if (!keywordFilters.length) {
      return {};
    }

    const inJsx = context.getFilename().toLowerCase().endsWith('tsx');

    const report = (
      node: TypeParameterWithConstraint,
      constraint: string,
      inArrowFunction: boolean,
    ): void => {
      context.report({
        data: { constraint },
        fix(fixer) {
          return fixer.replaceTextRange(
            [node.name.range[1], node.constraint.range[1]],
            inArrowFunction && inJsx ? ',' : '',
          );
        },
        messageId: 'unnecessaryConstraint',
        node,
      });
    };

    const checkNode = (
      node: TypeParameterWithConstraint,
      inArrowFunction: boolean,
    ): void => {
      const constraint = parserServices.esTreeNodeToTSNodeMap.get(
        node.constraint,
      );
      const constraintType = checker.getTypeAtLocation(constraint);

      for (const [filter, type] of keywordFilters) {
        if (filter(constraintType)) {
          report(node, type, inArrowFunction);
          return;
        }
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

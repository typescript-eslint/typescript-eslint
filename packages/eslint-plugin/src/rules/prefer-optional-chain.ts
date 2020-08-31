import {
  AST_NODE_TYPES,
  TSESTree,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type ValidChainTarget =
  | TSESTree.BinaryExpression
  | TSESTree.CallExpression
  | TSESTree.ChainExpression
  | TSESTree.Identifier
  | TSESTree.MemberExpression
  | TSESTree.ThisExpression;

/*
The AST is always constructed such the first element is always the deepest element.

I.e. for this code: `foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz`
The AST will look like this:
{
  left: {
    left: {
      left: foo
      right: foo.bar
    }
    right: foo.bar.baz
  }
  right: foo.bar.baz.buzz
}
*/

export default util.createRule({
  name: 'prefer-optional-chain',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer using concise optional chain expressions instead of chained logical ands',
      category: 'Best Practices',
      recommended: false,
      suggestion: true,
    },
    messages: {
      preferOptionalChain:
        "Prefer using an optional chain expression instead, as it's more concise and easier to read.",
      optionalChainSuggest: 'Change to an optional chain.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      [[
        'LogicalExpression[operator="&&"] > Identifier',
        'LogicalExpression[operator="&&"] > MemberExpression',
        'LogicalExpression[operator="&&"] > ChainExpression > MemberExpression',
        'LogicalExpression[operator="&&"] > BinaryExpression[operator="!=="]',
        'LogicalExpression[operator="&&"] > BinaryExpression[operator="!="]',
      ].join(',')](
        initialIdentifierOrNotEqualsExpr:
          | TSESTree.BinaryExpression
          | TSESTree.Identifier
          | TSESTree.MemberExpression,
      ): void {
        // selector guarantees this cast
        const initialExpression = (initialIdentifierOrNotEqualsExpr.parent
          ?.type === AST_NODE_TYPES.ChainExpression
          ? initialIdentifierOrNotEqualsExpr.parent.parent
          : initialIdentifierOrNotEqualsExpr.parent) as TSESTree.LogicalExpression;

        if (initialExpression.left !== initialIdentifierOrNotEqualsExpr) {
          // the node(identifier or member expression) is not the deepest left node
          return;
        }
        if (!isValidChainTarget(initialIdentifierOrNotEqualsExpr, true)) {
          return;
        }

        // walk up the tree to figure out how many logical expressions we can include
        let previous: TSESTree.LogicalExpression = initialExpression;
        let current: TSESTree.Node = initialExpression;
        let previousLeftText = getText(initialIdentifierOrNotEqualsExpr);
        let optionallyChainedCode = previousLeftText;
        let expressionCount = 1;
        while (current.type === AST_NODE_TYPES.LogicalExpression) {
          if (
            !isValidChainTarget(
              current.right,
              // only allow identifiers for the first chain - foo && foo()
              expressionCount === 1,
            )
          ) {
            break;
          }

          const leftText = previousLeftText;
          const rightText = getText(current.right);
          // can't just use startsWith because of cases like foo && fooBar.baz;
          const matchRegex = new RegExp(
            `^${
              // escape regex characters
              leftText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            }[^a-zA-Z0-9_$]`,
          );
          if (
            !matchRegex.test(rightText) &&
            // handle redundant cases like foo.bar && foo.bar
            leftText !== rightText
          ) {
            break;
          }

          // omit weird doubled up expression that make no sense like foo.bar && foo.bar
          if (rightText !== leftText) {
            expressionCount += 1;
            previousLeftText = rightText;

            /*
            Diff the left and right text to construct the fix string
            There are the following cases:

            1)
            rightText === 'foo.bar.baz.buzz'
            leftText === 'foo.bar.baz'
            diff === '.buzz'

            2)
            rightText === 'foo.bar.baz.buzz()'
            leftText === 'foo.bar.baz'
            diff === '.buzz()'

            3)
            rightText === 'foo.bar.baz.buzz()'
            leftText === 'foo.bar.baz.buzz'
            diff === '()'

            4)
            rightText === 'foo.bar.baz[buzz]'
            leftText === 'foo.bar.baz'
            diff === '[buzz]'

            5)
            rightText === 'foo.bar.baz?.buzz'
            leftText === 'foo.bar.baz'
            diff === '?.buzz'
            */
            const diff = rightText.replace(leftText, '');
            if (diff.startsWith('?')) {
              // item was "pre optional chained"
              optionallyChainedCode += diff;
            } else {
              const needsDot = diff.startsWith('(') || diff.startsWith('[');
              optionallyChainedCode += `?${needsDot ? '.' : ''}${diff}`;
            }
          }

          previous = current;
          current = util.nullThrows(
            current.parent,
            util.NullThrowsReasons.MissingParent,
          );
        }

        if (expressionCount > 1) {
          if (previous.right.type === AST_NODE_TYPES.BinaryExpression) {
            // case like foo && foo.bar !== someValue
            optionallyChainedCode += ` ${
              previous.right.operator
            } ${sourceCode.getText(previous.right.right)}`;
          }

          context.report({
            node: previous,
            messageId: 'preferOptionalChain',
            suggest: [
              {
                messageId: 'optionalChainSuggest',
                fix: (fixer): TSESLint.RuleFix[] => [
                  fixer.replaceText(previous, optionallyChainedCode),
                ],
              },
            ],
          });
        }
      },
    };

    function getText(node: ValidChainTarget): string {
      if (node.type === AST_NODE_TYPES.BinaryExpression) {
        return getText(
          // isValidChainTarget ensures this is type safe
          node.left as ValidChainTarget,
        );
      }

      if (node.type === AST_NODE_TYPES.CallExpression) {
        const calleeText = getText(
          // isValidChainTarget ensures this is type safe
          node.callee as ValidChainTarget,
        );

        // ensure that the call arguments are left untouched, or else we can break cases that _need_ whitespace:
        // - JSX: <Foo Needs Space Between Attrs />
        // - Unary Operators: typeof foo, await bar, delete baz
        const closingParenToken = util.nullThrows(
          sourceCode.getLastToken(node),
          util.NullThrowsReasons.MissingToken('closing parenthesis', node.type),
        );
        const openingParenToken = util.nullThrows(
          sourceCode.getFirstTokenBetween(
            node.callee,
            closingParenToken,
            util.isOpeningParenToken,
          ),
          util.NullThrowsReasons.MissingToken('opening parenthesis', node.type),
        );

        const argumentsText = sourceCode.text.substring(
          openingParenToken.range[0],
          closingParenToken.range[1],
        );

        return `${calleeText}${argumentsText}`;
      }

      if (node.type === AST_NODE_TYPES.Identifier) {
        return node.name;
      }

      if (node.type === AST_NODE_TYPES.ThisExpression) {
        return 'this';
      }

      if (node.type === AST_NODE_TYPES.ChainExpression) {
        /* istanbul ignore if */ if (
          node.expression.type === AST_NODE_TYPES.TSNonNullExpression
        ) {
          // this shouldn't happen
          return '';
        }
        return getText(node.expression);
      }

      return getMemberExpressionText(node);
    }

    /**
     * Gets a normalized representation of the given MemberExpression
     */
    function getMemberExpressionText(node: TSESTree.MemberExpression): string {
      let objectText: string;

      // cases should match the list in ALLOWED_MEMBER_OBJECT_TYPES
      switch (node.object.type) {
        case AST_NODE_TYPES.CallExpression:
        case AST_NODE_TYPES.Identifier:
          objectText = getText(node.object);
          break;

        case AST_NODE_TYPES.MemberExpression:
          objectText = getMemberExpressionText(node.object);
          break;

        case AST_NODE_TYPES.ThisExpression:
          objectText = getText(node.object);
          break;

        /* istanbul ignore next */
        default:
          throw new Error(`Unexpected member object type: ${node.object.type}`);
      }

      let propertyText: string;
      if (node.computed) {
        // cases should match the list in ALLOWED_COMPUTED_PROP_TYPES
        switch (node.property.type) {
          case AST_NODE_TYPES.Identifier:
            propertyText = getText(node.property);
            break;

          case AST_NODE_TYPES.Literal:
          case AST_NODE_TYPES.TemplateLiteral:
            propertyText = sourceCode.getText(node.property);
            break;

          case AST_NODE_TYPES.MemberExpression:
            propertyText = getMemberExpressionText(node.property);
            break;

          /* istanbul ignore next */
          default:
            throw new Error(
              `Unexpected member property type: ${node.object.type}`,
            );
        }

        return `${objectText}${node.optional ? '?.' : ''}[${propertyText}]`;
      } else {
        // cases should match the list in ALLOWED_NON_COMPUTED_PROP_TYPES
        switch (node.property.type) {
          case AST_NODE_TYPES.Identifier:
            propertyText = getText(node.property);
            break;

          /* istanbul ignore next */
          default:
            throw new Error(
              `Unexpected member property type: ${node.object.type}`,
            );
        }

        return `${objectText}${node.optional ? '?.' : '.'}${propertyText}`;
      }
    }
  },
});

const ALLOWED_MEMBER_OBJECT_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.CallExpression,
  AST_NODE_TYPES.Identifier,
  AST_NODE_TYPES.MemberExpression,
  AST_NODE_TYPES.ThisExpression,
]);
const ALLOWED_COMPUTED_PROP_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.Identifier,
  AST_NODE_TYPES.Literal,
  AST_NODE_TYPES.MemberExpression,
  AST_NODE_TYPES.TemplateLiteral,
]);
const ALLOWED_NON_COMPUTED_PROP_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.Identifier,
]);

function isValidChainTarget(
  node: TSESTree.Node,
  allowIdentifier: boolean,
): node is ValidChainTarget {
  if (node.type === AST_NODE_TYPES.ChainExpression) {
    return isValidChainTarget(node.expression, allowIdentifier);
  }

  if (node.type === AST_NODE_TYPES.MemberExpression) {
    const isObjectValid =
      ALLOWED_MEMBER_OBJECT_TYPES.has(node.object.type) &&
      // make sure to validate the expression is of our expected structure
      isValidChainTarget(node.object, true);
    const isPropertyValid = node.computed
      ? ALLOWED_COMPUTED_PROP_TYPES.has(node.property.type) &&
        // make sure to validate the member expression is of our expected structure
        (node.property.type === AST_NODE_TYPES.MemberExpression
          ? isValidChainTarget(node.property, allowIdentifier)
          : true)
      : ALLOWED_NON_COMPUTED_PROP_TYPES.has(node.property.type);

    return isObjectValid && isPropertyValid;
  }

  if (node.type === AST_NODE_TYPES.CallExpression) {
    return isValidChainTarget(node.callee, allowIdentifier);
  }

  if (
    allowIdentifier &&
    (node.type === AST_NODE_TYPES.Identifier ||
      node.type === AST_NODE_TYPES.ThisExpression)
  ) {
    return true;
  }

  /*
  special case for the following, where we only want the left
  - foo !== null
  - foo != null
  - foo !== undefined
  - foo != undefined
  */
  if (
    node.type === AST_NODE_TYPES.BinaryExpression &&
    ['!==', '!='].includes(node.operator) &&
    isValidChainTarget(node.left, allowIdentifier)
  ) {
    if (
      node.right.type === AST_NODE_TYPES.Identifier &&
      node.right.name === 'undefined'
    ) {
      return true;
    }
    if (
      node.right.type === AST_NODE_TYPES.Literal &&
      node.right.value === null
    ) {
      return true;
    }
  }

  return false;
}

import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export const phrases = {
  [AST_NODE_TYPES.TSTypeLiteral]: 'Type literal',
  [AST_NODE_TYPES.TSInterfaceDeclaration]: 'Interface',
} as const;

export default util.createRule({
  name: 'prefer-function-type',
  meta: {
    docs: {
      description:
        'Use function types instead of interfaces with call signatures',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      functionTypeOverCallableType:
        '{{ literalOrInterface }} only has a call signature, you should use a function type instead.',
      unexpectedThisOnFunctionOnlyInterface:
        "`this` refers to the function type '{{ interfaceName }}', did you intend to use a generic `this` parameter like `<Self>(this: Self, ...) => Self` instead?",
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    /**
     * Checks if there the interface has exactly one supertype that isn't named 'Function'
     * @param node The node being checked
     */
    function hasOneSupertype(node: TSESTree.TSInterfaceDeclaration): boolean {
      if (!node.extends || node.extends.length === 0) {
        return false;
      }
      if (node.extends.length !== 1) {
        return true;
      }
      const expr = node.extends[0].expression;

      return (
        expr.type !== AST_NODE_TYPES.Identifier || expr.name !== 'Function'
      );
    }

    /**
     * @param parent The parent of the call signature causing the diagnostic
     */
    function shouldWrapSuggestion(parent: TSESTree.Node | undefined): boolean {
      if (!parent) {
        return false;
      }

      switch (parent.type) {
        case AST_NODE_TYPES.TSUnionType:
        case AST_NODE_TYPES.TSIntersectionType:
        case AST_NODE_TYPES.TSArrayType:
          return true;
        default:
          return false;
      }
    }

    /**
     * @param call The call signature causing the diagnostic
     * @param parent The parent of the call
     * @returns The suggestion to report
     */
    function renderSuggestion(
      call:
        | TSESTree.TSCallSignatureDeclaration
        | TSESTree.TSConstructSignatureDeclaration,
      parent: TSESTree.Node,
    ): string {
      const start = call.range[0];
      const colonPos = call.returnType!.range[0] - start;
      const text = sourceCode.getText().slice(start, call.range[1]);

      let suggestion = `${text.slice(0, colonPos)} =>${text.slice(
        colonPos + 1,
      )}`;

      if (shouldWrapSuggestion(parent.parent)) {
        suggestion = `(${suggestion})`;
      }
      if (parent.type === AST_NODE_TYPES.TSInterfaceDeclaration) {
        if (typeof parent.typeParameters !== 'undefined') {
          return `type ${sourceCode
            .getText()
            .slice(
              parent.id.range[0],
              parent.typeParameters.range[1],
            )} = ${suggestion}`;
        }
        return `type ${parent.id.name} = ${suggestion}`;
      }
      return suggestion.endsWith(';') ? suggestion.slice(0, -1) : suggestion;
    }

    /**
     * @param member The TypeElement being checked
     * @param node The parent of member being checked
     */
    function checkMember(
      member: TSESTree.TypeElement,
      node: TSESTree.TSInterfaceDeclaration | TSESTree.TSTypeLiteral,
      tsThisTypes: TSESTree.TSThisType[] | null = null,
    ): void {
      if (
        (member.type === AST_NODE_TYPES.TSCallSignatureDeclaration ||
          member.type === AST_NODE_TYPES.TSConstructSignatureDeclaration) &&
        typeof member.returnType !== 'undefined'
      ) {
        if (
          tsThisTypes !== null &&
          tsThisTypes.length > 0 &&
          node.type === AST_NODE_TYPES.TSInterfaceDeclaration
        ) {
          // the message can be confusing if we don't point directly to the `this` node instead of the whole member
          // and in favour of generating at most one error we'll only report the first occurrence of `this` if there are multiple
          context.report({
            node: tsThisTypes[0],
            messageId: 'unexpectedThisOnFunctionOnlyInterface',
            data: {
              interfaceName: node.id.name,
            },
          });
          return;
        }
        const suggestion = renderSuggestion(member, node);
        const fixStart =
          node.type === AST_NODE_TYPES.TSTypeLiteral
            ? node.range[0]
            : sourceCode
                .getTokens(node)
                .filter(
                  token =>
                    token.type === AST_TOKEN_TYPES.Keyword &&
                    token.value === 'interface',
                )[0].range[0];

        context.report({
          node: member,
          messageId: 'functionTypeOverCallableType',
          data: {
            literalOrInterface: phrases[node.type],
          },
          fix(fixer) {
            return fixer.replaceTextRange(
              [fixStart, node.range[1]],
              suggestion,
            );
          },
        });
      }
    }
    let tsThisTypes: TSESTree.TSThisType[] | null = null;
    let literalNesting = 0;
    return {
      TSInterfaceDeclaration(): void {
        // when entering an interface reset the count of `this`s to empty.
        tsThisTypes = [];
      },
      'TSInterfaceDeclaration TSThisType'(node: TSESTree.TSThisType): void {
        // inside an interface keep track of all ThisType references.
        // unless it's inside a nested type literal in which case it's invalid code anyway
        // we don't want to incorrectly say "it refers to name" while typescript says it's completely invalid.
        if (literalNesting === 0 && tsThisTypes !== null) {
          tsThisTypes.push(node);
        }
      },
      'TSInterfaceDeclaration:exit'(
        node: TSESTree.TSInterfaceDeclaration,
      ): void {
        if (!hasOneSupertype(node) && node.body.body.length === 1) {
          checkMember(node.body.body[0], node, tsThisTypes);
        }
        // on exit check member and reset the array to nothing.
        tsThisTypes = null;
      },
      // keep track of nested literals to avoid complaining about invalid `this` uses
      'TSInterfaceDeclaration TSTypeLiteral'(): void {
        literalNesting += 1;
      },
      'TSInterfaceDeclaration TSTypeLiteral:exit'(): void {
        literalNesting -= 1;
      },
      'TSTypeLiteral[members.length = 1]'(node: TSESTree.TSTypeLiteral): void {
        checkMember(node.members[0], node);
      },
    };
  },
});

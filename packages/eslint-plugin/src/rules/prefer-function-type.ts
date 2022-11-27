import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

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
        'Enforce using function types instead of interfaces with call signatures',
      recommended: 'stylistic',
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
     * @param member The TypeElement being checked
     * @param node The parent of member being checked
     * @param tsThisTypes
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

        const fixable =
          node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration;

        const fix = fixable
          ? null
          : (fixer: TSESLint.RuleFixer): TSESLint.RuleFix[] => {
              const fixes: TSESLint.RuleFix[] = [];
              const start = member.range[0];
              const colonPos = member.returnType!.range[0] - start;
              const text = sourceCode.getText().slice(start, member.range[1]);
              const comments = sourceCode
                .getCommentsBefore(member)
                .concat(sourceCode.getCommentsAfter(member));
              let suggestion = `${text.slice(0, colonPos)} =>${text.slice(
                colonPos + 1,
              )}`;
              const lastChar = suggestion.endsWith(';') ? ';' : '';
              if (lastChar) {
                suggestion = suggestion.slice(0, -1);
              }
              if (shouldWrapSuggestion(node.parent)) {
                suggestion = `(${suggestion})`;
              }

              if (node.type === AST_NODE_TYPES.TSInterfaceDeclaration) {
                if (typeof node.typeParameters !== 'undefined') {
                  suggestion = `type ${sourceCode
                    .getText()
                    .slice(
                      node.id.range[0],
                      node.typeParameters.range[1],
                    )} = ${suggestion}${lastChar}`;
                } else {
                  suggestion = `type ${node.id.name} = ${suggestion}${lastChar}`;
                }
              }

              const isParentExported =
                node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration;

              if (
                node.type === AST_NODE_TYPES.TSInterfaceDeclaration &&
                isParentExported
              ) {
                const commentsText = comments.reduce((text, comment) => {
                  return (
                    text +
                    (comment.type === AST_TOKEN_TYPES.Line
                      ? `//${comment.value}`
                      : `/*${comment.value}*/`) +
                    '\n'
                  );
                }, '');
                // comments should move before export and not between export and interface declaration
                fixes.push(fixer.insertTextBefore(node.parent, commentsText));
              } else {
                comments.forEach(comment => {
                  let commentText =
                    comment.type === AST_TOKEN_TYPES.Line
                      ? `//${comment.value}`
                      : `/*${comment.value}*/`;
                  const isCommentOnTheSameLine =
                    comment.loc.start.line === member.loc.start.line;
                  if (!isCommentOnTheSameLine) {
                    commentText += '\n';
                  } else {
                    commentText += ' ';
                  }
                  suggestion = commentText + suggestion;
                });
              }

              const fixStart = node.range[0];
              fixes.push(
                fixer.replaceTextRange([fixStart, node.range[1]], suggestion),
              );
              return fixes;
            };

        context.report({
          node: member,
          messageId: 'functionTypeOverCallableType',
          data: {
            literalOrInterface: phrases[node.type],
          },
          fix,
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

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import { createRule, getInterfaceMerging } from '../util';

export const phrases = {
  [AST_NODE_TYPES.TSInterfaceDeclaration]: 'Interface',
  [AST_NODE_TYPES.TSTypeLiteral]: 'Type literal',
} as const;

export default createRule({
  name: 'prefer-function-type',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using function types instead of interfaces with call signatures',
      recommended: 'stylistic',
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      functionTypeOverCallableType:
        '{{ literalOrInterface }} only has a call signature, you should use a function type instead.',
      replaceWithFunctionType: 'Replace with a function type.',
      unexpectedThisOnFunctionOnlyInterface:
        "`this` refers to the function type '{{ interfaceName }}', did you intend to use a generic `this` parameter like `<Self>(this: Self, ...) => Self` instead?",
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    /**
     * Checks if there the interface has exactly one supertype that isn't named 'Function'
     * @param node The node being checked
     */
    function hasOneSupertype(node: TSESTree.TSInterfaceDeclaration): boolean {
      if (node.extends.length === 0) {
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
     * @param node The type literal or interface being replaced by a function type
     */
    function shouldWrapSuggestion(
      node: TSESTree.TSInterfaceDeclaration | TSESTree.TSTypeLiteral,
    ): boolean {
      const { parent } = node;
      switch (parent.type) {
        case AST_NODE_TYPES.TSArrayType:
        case AST_NODE_TYPES.TSIntersectionType:
        case AST_NODE_TYPES.TSOptionalType:
        case AST_NODE_TYPES.TSTypeOperator:
        case AST_NODE_TYPES.TSUnionType:
          return true;
        case AST_NODE_TYPES.TSConditionalType:
          return parent.checkType === node;
        case AST_NODE_TYPES.TSIndexedAccessType:
          return parent.objectType === node;
        default:
          return false;
      }
    }

    /**
     * @param member The TypeElement being checked
     * @param node The parent of member being checked
     * @param mayMerge Whether other declarations can merge with the interface
     */
    function checkMember(
      member: TSESTree.TypeElement,
      node: TSESTree.TSInterfaceDeclaration | TSESTree.TSTypeLiteral,
      tsThisTypes: TSESTree.TSThisType[] | null = null,
      mayMerge = false,
    ): void {
      if (
        (member.type === AST_NODE_TYPES.TSCallSignatureDeclaration ||
          member.type === AST_NODE_TYPES.TSConstructSignatureDeclaration) &&
        member.returnType != null
      ) {
        if (
          tsThisTypes?.length &&
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

        const isDefaultExport =
          node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration;

        const fix = isDefaultExport
          ? null
          : (fixer: TSESLint.RuleFixer): TSESLint.RuleFix[] => {
              const fixes: TSESLint.RuleFix[] = [];
              const start = member.range[0];
              // https://github.com/microsoft/TypeScript/pull/56908
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const colonPos = member.returnType!.range[0] - start;
              const text = context.sourceCode
                .getText()
                .slice(start, member.range[1]);
              // The member's text, and the interface's type parameters with
              // its name, are copied with their comments. Every other
              // comment in the replaced node is moved before the result.
              const copiedRanges = [member.range];
              if (
                node.type === AST_NODE_TYPES.TSInterfaceDeclaration &&
                node.typeParameters != null
              ) {
                copiedRanges.push([
                  node.id.range[0],
                  node.typeParameters.range[1],
                ]);
              }
              const comments = context.sourceCode
                .getCommentsInside(node)
                .filter(comment =>
                  copiedRanges.every(
                    ([copiedStart, copiedEnd]) =>
                      comment.range[1] <= copiedStart ||
                      comment.range[0] >= copiedEnd,
                  ),
                );
              let suggestion = `${text.slice(0, colonPos)} =>${text.slice(
                colonPos + 1,
              )}`;
              const lastChar = suggestion.endsWith(';') ? ';' : '';
              if (lastChar || suggestion.endsWith(',')) {
                suggestion = suggestion.slice(0, -1);
              }
              if (shouldWrapSuggestion(node)) {
                suggestion = `(${suggestion})`;
              }

              if (node.type === AST_NODE_TYPES.TSInterfaceDeclaration) {
                if (node.typeParameters != null) {
                  suggestion = `type ${context.sourceCode
                    .getText()
                    .slice(
                      node.id.range[0],
                      node.typeParameters.range[1],
                    )} = ${suggestion}${lastChar}`;
                } else {
                  suggestion = `type ${node.id.name} = ${suggestion}${lastChar}`;
                }
              }

              if (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration) {
                const commentsText = comments
                  .map(({ type, value }) =>
                    type === AST_TOKEN_TYPES.Line
                      ? `//${value}\n`
                      : `/*${value}*/\n`,
                  )
                  .join('');
                // comments should move before export and not between export and interface declaration
                fixes.push(fixer.insertTextBefore(node.parent, commentsText));
              } else {
                const commentsText = comments
                  .map(({ loc, type, value }) =>
                    type === AST_TOKEN_TYPES.Line
                      ? `//${value}\n`
                      : `/*${value}*/${
                          loc.start.line === member.loc.start.line ? ' ' : '\n'
                        }`,
                  )
                  .join('');
                suggestion = commentsText + suggestion;
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
          // A type alias can't merge with other declarations
          ...(mayMerge && fix
            ? { suggest: [{ messageId: 'replaceWithFunctionType', fix }] }
            : { fix }),
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
      'TSInterfaceDeclaration:exit'(
        node: TSESTree.TSInterfaceDeclaration,
      ): void {
        if (!hasOneSupertype(node) && node.body.body.length === 1) {
          const merging = getInterfaceMerging(context, node);
          // The merged interface has more than this call signature
          if (merging !== 'merged') {
            checkMember(
              node.body.body[0],
              node,
              tsThisTypes,
              merging === 'mergeable',
            );
          }
        }
        // on exit check member and reset the array to nothing.
        tsThisTypes = null;
      },
      'TSInterfaceDeclaration TSThisType'(node: TSESTree.TSThisType): void {
        // inside an interface keep track of all ThisType references.
        // unless it's inside a nested type literal in which case it's invalid code anyway
        // we don't want to incorrectly say "it refers to name" while typescript says it's completely invalid.
        if (literalNesting === 0 && tsThisTypes != null) {
          tsThisTypes.push(node);
        }
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

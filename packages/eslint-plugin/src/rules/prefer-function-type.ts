import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

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
        "{{ type }} has only a call signature - use '{{ sigSuggestion }}' instead.",
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
     * replaces uses of the 'this' keyword to refer to the interface name
     * so the auto suggestion works as a recursive definition.
     * Note that if the interface takes generics then 'interfaceName' would
     * need to be formatted like `Array<T>` in order for the replacements to work
     * @param start start index of source code of relevant text to replace
     * @param origColonPos the position of the colon before replacement
     * @param text text to replace, the call signature text specifically
     * @param thisRefs list of nodes corresponding to the 'this' type
     * @param interfaceName name of interface, to replace 'this' with.
     * @returns the new colon position and new text after replacement
     */
    function replaceThisRefs(
      start: number,
      origColonPos: number,
      text: string,
      thisRefs: TSESTree.TSThisType[],
      interfaceName: string,
    ): [number, string] {
      let newText = text;
      let newColonPos = origColonPos;
      // go over occurrences backward to not screw up text index.
      for (let idx = thisRefs.length - 1; idx >= 0; idx--) {
        // range is in span of text file, subtracting start gives it in index of text.
        const [a, b] = thisRefs[idx].range.map(n => n - start);
        if (a < origColonPos) {
          // replacing `this` with the interface name before the colon changes the colon position
          // forwards by the interface name minus the length of this
          newColonPos += interfaceName.length - 4; /*'this'.length*/
        }
        newText = newText.slice(0, a) + interfaceName + newText.slice(b);
      }
      return [newColonPos, newText];
    }

    /**
     * note that if parent is an interface with generics and tsThisTypes isn't empty
     * then the 'this' references are not replaced, it is expected that checkMember
     * will ensure that doesn't happen
     * @param call The call signature causing the diagnostic
     * @param parent The parent of the call
     * @returns The suggestion to report
     */
    function renderSuggestion(
      call:
        | TSESTree.TSCallSignatureDeclaration
        | TSESTree.TSConstructSignatureDeclaration,
      parent: TSESTree.Node,
      tsThisTypes?: TSESTree.TSThisType[],
    ): string {
      const start = call.range[0];
      let colonPos = call.returnType!.range[0] - start;
      let text = sourceCode.getText().slice(start, call.range[1]);

      // if there are references to 'this' replace them with interface name
      if (
        tsThisTypes !== undefined &&
        tsThisTypes.length > 0 &&
        parent.type === AST_NODE_TYPES.TSInterfaceDeclaration &&
        typeof parent.typeParameters === 'undefined'
      ) {
        [colonPos, text] = replaceThisRefs(
          start,
          colonPos,
          text,
          tsThisTypes,
          parent.id.name,
        );
      }
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
      node: TSESTree.Node,
      tsThisTypes?: TSESTree.TSThisType[],
    ): void {
      if (
        (tsThisTypes?.length ?? 0) > 0 &&
        node.type === AST_NODE_TYPES.TSInterfaceDeclaration &&
        typeof node.typeParameters !== 'undefined'
      ) {
        // if the interface uses type parameters and refers to 'this' the suggested replacement
        // is fairly complicated since now we'd have to replace each 'this' with `A<P,K>` etc.
        // and the way it is replaced in renderSuggestion is just grabbing the entire parameter string
        // including `extends` and defaults, so we'd have to actually parse through to re-construct
        // the recursive type alias which for such an edge case doesn't seem worth implementing.
        // TODO: should still probably make report without fix offered.
        return;
      }
      if (
        (member.type === AST_NODE_TYPES.TSCallSignatureDeclaration ||
          member.type === AST_NODE_TYPES.TSConstructSignatureDeclaration) &&
        typeof member.returnType !== 'undefined'
      ) {
        const suggestion = renderSuggestion(member, node, tsThisTypes);
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
            type:
              node.type === AST_NODE_TYPES.TSTypeLiteral
                ? 'Type literal'
                : 'Interface',
            sigSuggestion: suggestion,
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
    return {
      TSInterfaceDeclaration(): void {
        // when entering an interface reset the count of `this`s to empty.
        tsThisTypes = [];
      },
      'TSInterfaceDeclaration TSThisType'(node: TSESTree.TSThisType): void {
        // inside an interface keep track of all ThisType references.
        tsThisTypes?.push(node);
      },
      'TSInterfaceDeclaration:exit'(
        node: TSESTree.TSInterfaceDeclaration,
      ): void {
        if (!hasOneSupertype(node) && node.body.body.length === 1) {
          checkMember(node.body.body[0], node, tsThisTypes ?? undefined);
        }
        // on exit check member and reset the array to nothing.
        tsThisTypes = null;
      },
      'TSTypeLiteral[members.length = 1]'(node: TSESTree.TSTypeLiteral): void {
        // we don't need to check for `this` inside type literals since it's not valid.
        checkMember(node.members[0], node);
      },
    };
  },
});

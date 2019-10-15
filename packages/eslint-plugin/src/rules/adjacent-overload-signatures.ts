import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type RuleNode =
  | TSESTree.ClassBody
  | TSESTree.Program
  | TSESTree.TSModuleBlock
  | TSESTree.TSTypeLiteral
  | TSESTree.TSInterfaceBody;
type Member = TSESTree.ClassElement | TSESTree.Statement | TSESTree.TypeElement;

export default util.createRule({
  name: 'adjacent-overload-signatures',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require that member overloads be consecutive',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [],
    messages: {
      adjacentSignature: "All '{{name}}' signatures should be adjacent.",
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    /**
     * Gets the name of the member being processed.
     * @param member the member being processed.
     * @returns the name of the member or null if it's a member not relevant to the rule.
     */
    function getMemberName(member: TSESTree.Node): string | null {
      if (!member) {
        return null;
      }

      switch (member.type) {
        case AST_NODE_TYPES.ExportDefaultDeclaration:
        case AST_NODE_TYPES.ExportNamedDeclaration: {
          // export statements (e.g. export { a };)
          // have no declarations, so ignore them
          if (!member.declaration) {
            return null;
          }

          return getMemberName(member.declaration);
        }
        case AST_NODE_TYPES.TSDeclareFunction:
        case AST_NODE_TYPES.FunctionDeclaration:
          return member.id && member.id.name;
        case AST_NODE_TYPES.TSMethodSignature:
          return util.getNameFromPropertyName(member.key);
        case AST_NODE_TYPES.TSCallSignatureDeclaration:
          return 'call';
        case AST_NODE_TYPES.TSConstructSignatureDeclaration:
          return 'new';
        case AST_NODE_TYPES.MethodDefinition:
          return util.getNameFromClassMember(member, sourceCode);
      }

      return null;
    }

    interface Method {
      name: string;
      static: boolean;
    }
    function isSameMethod(method1: Method, method2: Method | null): boolean {
      return (
        !!method2 &&
        method1.name === method2.name &&
        method1.static === method2.static
      );
    }

    function getMembers(node: RuleNode): Member[] {
      switch (node.type) {
        case AST_NODE_TYPES.ClassBody:
        case AST_NODE_TYPES.Program:
        case AST_NODE_TYPES.TSModuleBlock:
        case AST_NODE_TYPES.TSInterfaceBody:
          return node.body;

        case AST_NODE_TYPES.TSTypeLiteral:
          return node.members;
      }
    }

    /**
     * Check the body for overload methods.
     * @param {ASTNode} node the body to be inspected.
     */
    function checkBodyForOverloadMethods(node: RuleNode): void {
      const members = getMembers(node);

      if (members) {
        let lastMethod: Method | null = null;
        const seenMethods: Method[] = [];

        members.forEach(member => {
          const name = getMemberName(member);
          if (name === null) {
            lastMethod = null;
            return;
          }
          const method = {
            name,
            static: 'static' in member && !!member.static,
          };

          const index = seenMethods.findIndex(seenMethod =>
            isSameMethod(method, seenMethod),
          );
          if (index > -1 && !isSameMethod(method, lastMethod)) {
            context.report({
              node: member,
              messageId: 'adjacentSignature',
              data: {
                name: (method.static ? 'static ' : '') + method.name,
              },
            });
          } else if (index === -1) {
            seenMethods.push(method);
          }

          lastMethod = method;
        });
      }
    }

    return {
      ClassBody: checkBodyForOverloadMethods,
      Program: checkBodyForOverloadMethods,
      TSModuleBlock: checkBodyForOverloadMethods,
      TSTypeLiteral: checkBodyForOverloadMethods,
      TSInterfaceBody: checkBodyForOverloadMethods,
    };
  },
});

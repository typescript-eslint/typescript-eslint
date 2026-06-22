import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  forEachChildESTree,
  isClosingParenToken,
  isCommaToken,
  isOpeningParenToken,
  isSemicolonToken,
  nullThrows,
} from '../util';

export type Options = [
  ('method' | 'property')?,
  {
    convertReadonly?: boolean;
  }?,
];
export type MessageIds = 'errorMethod' | 'errorProperty';

export default createRule<Options, MessageIds>({
  name: 'method-signature-style',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce using a particular method signature syntax',
    },
    fixable: 'code',
    messages: {
      errorMethod:
        'Shorthand method signature is forbidden. Use a function property instead.',
      errorProperty:
        'Function property signature is forbidden. Use a method shorthand instead.',
    },
    schema: [
      {
        type: 'string',
        description: 'The method signature style to enforce using.',
        enum: ['property', 'method'],
      },
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          convertReadonly: {
            type: 'boolean',
            description:
              'Whether to also convert `readonly` function-typed properties to method signatures, dropping the `readonly` modifier. Only applies when enforcing the `method` style.',
          },
        },
      },
    ],
  },
  defaultOptions: ['property', { convertReadonly: false }],

  create(context, [mode, options]) {
    const convertReadonly = options?.convertReadonly ?? false;

    function getMethodKey(
      node: TSESTree.TSMethodSignature | TSESTree.TSPropertySignature,
    ): string {
      let key = context.sourceCode.getText(node.key);
      if (node.computed) {
        key = `[${key}]`;
      }
      if (node.optional) {
        key = `${key}?`;
      }
      return key;
    }

    function getMethodParams(
      node: TSESTree.TSFunctionType | TSESTree.TSMethodSignature,
    ): string {
      let params = '()';
      if (node.params.length > 0) {
        const openingParen = nullThrows(
          context.sourceCode.getTokenBefore(
            node.params[0],
            isOpeningParenToken,
          ),
          'Missing opening paren before first parameter',
        );
        const closingParen = nullThrows(
          context.sourceCode.getTokenAfter(
            node.params[node.params.length - 1],
            isClosingParenToken,
          ),
          'Missing closing paren after last parameter',
        );

        params = context.sourceCode.text.substring(
          openingParen.range[0],
          closingParen.range[1],
        );
      }
      if (node.typeParameters != null) {
        const typeParams = context.sourceCode.getText(node.typeParameters);
        params = `${typeParams}${params}`;
      }
      return params;
    }

    function getMethodReturnType(
      node: TSESTree.TSFunctionType | TSESTree.TSMethodSignature,
    ): string {
      return node.returnType == null
        ? // if the method has no return type, it implicitly has an `any` return type
          // we just make it explicit here so we can do the fix
          'any'
        : context.sourceCode.getText(node.returnType.typeAnnotation);
    }

    function getDelimiter(node: TSESTree.Node): string {
      const lastToken = context.sourceCode.getLastToken(node);
      if (
        lastToken &&
        (isSemicolonToken(lastToken) || isCommaToken(lastToken))
      ) {
        return lastToken.value;
      }

      return '';
    }

    function isNodeParentModuleDeclaration(node: TSESTree.Node): boolean {
      if (!node.parent) {
        return false;
      }

      if (node.parent.type === AST_NODE_TYPES.TSModuleDeclaration) {
        return true;
      }

      if (node.parent.type === AST_NODE_TYPES.Program) {
        return false;
      }
      return isNodeParentModuleDeclaration(node.parent);
    }

    return {
      ...(mode === 'property' && {
        TSMethodSignature(methodNode): void {
          if (methodNode.kind !== 'method') {
            return;
          }

          const skipFix = returnTypeReferencesThisType(methodNode.returnType);
          const parent = methodNode.parent;
          const members =
            parent.type === AST_NODE_TYPES.TSInterfaceBody
              ? parent.body
              : parent.members;

          const duplicatedKeyMethodNodes: TSESTree.TSMethodSignature[] =
            members.filter(
              (element): element is TSESTree.TSMethodSignature =>
                element.type === AST_NODE_TYPES.TSMethodSignature &&
                element !== methodNode &&
                getMethodKey(element) === getMethodKey(methodNode),
            );
          const isParentModule = isNodeParentModuleDeclaration(methodNode);

          if (duplicatedKeyMethodNodes.length > 0) {
            if (isParentModule) {
              context.report({
                node: methodNode,
                messageId: 'errorMethod',
              });
            } else {
              context.report({
                node: methodNode,
                messageId: 'errorMethod',
                fix: skipFix
                  ? undefined
                  : function* fix(fixer) {
                      const methodNodes = [
                        methodNode,
                        ...duplicatedKeyMethodNodes,
                      ].sort((a, b) => (a.range[0] < b.range[0] ? -1 : 1));
                      const typeString = methodNodes
                        .map(node => {
                          const params = getMethodParams(node);
                          const returnType = getMethodReturnType(node);
                          return `(${params} => ${returnType})`;
                        })
                        .join(' & ');
                      const key = getMethodKey(methodNode);
                      const delimiter = getDelimiter(methodNode);
                      yield fixer.replaceText(
                        methodNode,
                        `${key}: ${typeString}${delimiter}`,
                      );
                      for (const node of duplicatedKeyMethodNodes) {
                        const lastToken = context.sourceCode.getLastToken(node);
                        if (lastToken) {
                          const nextToken =
                            context.sourceCode.getTokenAfter(lastToken);
                          if (nextToken) {
                            yield fixer.remove(node);
                            yield fixer.replaceTextRange(
                              [lastToken.range[1], nextToken.range[0]],
                              '',
                            );
                          }
                        }
                      }
                    },
              });
            }
            return;
          }

          if (isParentModule) {
            context.report({
              node: methodNode,
              messageId: 'errorMethod',
            });
          } else {
            context.report({
              node: methodNode,
              messageId: 'errorMethod',
              fix: skipFix
                ? undefined
                : fixer => {
                    const key = getMethodKey(methodNode);
                    const params = getMethodParams(methodNode);
                    const returnType = getMethodReturnType(methodNode);
                    const delimiter = getDelimiter(methodNode);
                    return fixer.replaceText(
                      methodNode,
                      `${key}: ${params} => ${returnType}${delimiter}`,
                    );
                  },
            });
          }
        },
      }),
      ...(mode === 'method' && {
        TSPropertySignature(propertyNode): void {
          const typeNode = propertyNode.typeAnnotation?.typeAnnotation;
          if (typeNode?.type !== AST_NODE_TYPES.TSFunctionType) {
            return;
          }

          // There is no syntax for a `readonly` method signature. By default a
          // `readonly` function-typed property is therefore left as-is (it has
          // no method-shorthand equivalent); the `convertReadonly` option opts
          // in to converting it anyway, dropping the `readonly` modifier.
          if (propertyNode.readonly && !convertReadonly) {
            return;
          }

          context.report({
            node: propertyNode,
            messageId: 'errorProperty',
            fix: fixer => {
              const key = getMethodKey(propertyNode);
              const params = getMethodParams(typeNode);
              const returnType = getMethodReturnType(typeNode);
              const delimiter = getDelimiter(propertyNode);
              return fixer.replaceText(
                propertyNode,
                `${key}${params}: ${returnType}${delimiter}`,
              );
            },
          });
        },
      }),
    };
  },
});

function returnTypeReferencesThisType(
  node: TSESTree.TSTypeAnnotation | undefined,
) {
  return (
    node &&
    forEachChildESTree(
      node.typeAnnotation,
      child => child.type === AST_NODE_TYPES.TSThisType,
    )
  );
}

import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { isTypeReference } from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

type Options = [
  {
    allowVariableAnnotationFromAny?: boolean;
    ignoreUntypedLetVariableDeclaration?: boolean;
    ignoreUntypedVariableDeclarationWithEmptyArrayValue?: boolean;
  },
];
type MessageIds =
  | 'typeReferenceResolvesToAny'
  | 'variableDeclarationInitializedToAnyWithoutAnnotation'
  | 'variableDeclarationInitializedToAnyWithAnnotation'
  | 'patternVariableDeclarationInitializedToAnyWithoutAnnotation'
  | 'patternVariableDeclarationInitializedToAny'
  | 'letVariableInitializedToNullishAndNoAnnotation'
  | 'letVariableWithNoInitialAndNoAnnotation'
  | 'loopVariableInitializedToAny'
  | 'returnAny'
  | 'passedArgumentIsAny'
  | 'assignmentValueIsAny'
  | 'updateExpressionIsAny'
  | 'booleanTestIsAny'
  | 'switchDiscriminantIsAny'
  | 'switchCaseTestIsAny';

const booleanStatementToText = {
  [AST_NODE_TYPES.IfStatement]: 'if',
  [AST_NODE_TYPES.WhileStatement]: 'while',
  [AST_NODE_TYPES.DoWhileStatement]: 'do while',
  [AST_NODE_TYPES.ConditionalExpression]: 'ternary',
};

export default util.createRule<Options, MessageIds>({
  name: 'no-unsafe-any',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Detects usages of any which can cause type safety holes within your codebase',
      category: 'Possible Errors',
      recommended: false,
    },
    messages: {
      typeReferenceResolvesToAny:
        'Referenced type {{typeName}} resolves to `any`.',
      variableDeclarationInitializedToAnyWithAnnotation:
        'Variable declaration is initialized to `any` with an explicit type annotation, which is potentially unsafe. Prefer explicit type narrowing via type guards.',
      variableDeclarationInitializedToAnyWithoutAnnotation:
        'Variable declaration {{name}} is initialized to `any` without a type annotation.',
      patternVariableDeclarationInitializedToAnyWithoutAnnotation:
        'Variable declaration {{name}} is initialized to `any` without a type annotation.',
      patternVariableDeclarationInitializedToAny:
        'Variable declaration is initialized to `any`.',
      letVariableInitializedToNullishAndNoAnnotation:
        'Variable declared with {{kind}} and initialized to `null` or `undefined` is implicitly typed as `any`. Add an explicit type annotation.',
      letVariableWithNoInitialAndNoAnnotation:
        'Variable declared with {{kind}} and no initial value is implicitly typed as `any`.',
      loopVariableInitializedToAny: 'Loop variable is typed as `any`.',
      returnAny: 'The type of the return is `any`.',
      passedArgumentIsAny: 'The passed argument is `any`.',
      assignmentValueIsAny: 'The value being assigned is `any`.',
      updateExpressionIsAny: 'The update expression variable is `any`.',
      booleanTestIsAny: 'The {{kind}} test is `any`.',
      switchDiscriminantIsAny: 'The switch discriminant is `any`.',
      switchCaseTestIsAny: 'The switch case test is `any`.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          // allow a variable with an explicit type decl when the value has type `any`
          // const x: string = returnsAny();
          allowVariableAnnotationFromAny: {
            type: 'boolean',
          },
          // ignore let variable declaration without a type annotation. These are dynamically typed by TS
          // let x;    let y = null;
          ignoreUntypedLetVariableDeclaration: {
            type: 'boolean',
          },
          // ignore variable declaration with empty array value. The array will be dynamically typed by TS
          // let x = [];    const y = [];
          ignoreUntypedVariableDeclarationWithEmptyArrayValue: {
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowVariableAnnotationFromAny: false,
      // default true because it gets dynamically typed
      ignoreUntypedLetVariableDeclaration: true,
      ignoreUntypedVariableDeclarationWithEmptyArrayValue: true,
    },
  ],
  create(
    context,
    [
      {
        allowVariableAnnotationFromAny,
        ignoreUntypedLetVariableDeclaration,
        ignoreUntypedVariableDeclarationWithEmptyArrayValue,
      },
    ],
  ) {
    const { program, esTreeNodeToTSNodeMap } = util.getParserServices(context);
    const checker = program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    const typeCache = new Map<ts.Node, ts.Type>();
    function memoize(
      fn: (node: ts.Type) => boolean,
    ): (node: ts.Node) => boolean {
      const returnCache = new Map<ts.Node, boolean>();
      return (node): boolean => {
        // check the cache for a pre-computed return value
        const cachedResult = returnCache.get(node);
        if (cachedResult) {
          return cachedResult;
        }

        // check the cache for a pre-computed type
        let type = typeCache.get(node);
        if (!type) {
          type = checker.getTypeAtLocation(node);
          typeCache.set(node, type);
        }

        const result = fn(type);
        returnCache.set(node, result);
        return result;
      };
    }

    /**
     * @returns true if the type is `any`
     */
    const isAnyType = memoize((type: ts.Type): boolean => {
      return util.isTypeFlagSet(type, ts.TypeFlags.Any);
    });

    /**
     * @returns true if the type is `any[]` or `readonly any[]`
     */
    const isAnyArrayType = memoize((type: ts.Type): boolean => {
      return (
        checker.isArrayType(type) &&
        isTypeReference(type) &&
        util.isTypeFlagSet(checker.getTypeArguments(type)[0], ts.TypeFlags.Any)
      );
    });

    function isAnyOrAnyArrayType(node: ts.Node): boolean {
      return isAnyType(node) || isAnyArrayType(node);
    }

    function reportVariableDeclarationInitializedToAny(
      node: TSESTree.VariableDeclarator,
      name?: string,
    ): void {
      if (!node.id.typeAnnotation) {
        return context.report({
          node,
          messageId: name
            ? 'variableDeclarationInitializedToAnyWithoutAnnotation'
            : 'patternVariableDeclarationInitializedToAnyWithoutAnnotation',
          data: {
            name,
            // todo
          },
        });
      }

      // there is a type annotation

      if (allowVariableAnnotationFromAny) {
        // there is an annotation on the type, and the user indicated they are okay with the "unsafe" conversion
        return;
      }
      if (
        node.id.typeAnnotation.typeAnnotation.type ===
        AST_NODE_TYPES.TSUnknownKeyword
      ) {
        // annotation with unknown is as safe as can be
        return;
      }

      return context.report({
        node,
        messageId: 'variableDeclarationInitializedToAnyWithAnnotation',
      });
    }

    function checkDestructuringPattern(
      node: TSESTree.Node,
      messageId: MessageIds,
    ): void {
      if (node.type === AST_NODE_TYPES.ObjectPattern) {
        node.properties.forEach(prop => {
          checkDestructuringPattern(prop.value ?? prop, messageId);
        });
      } else if (node.type === AST_NODE_TYPES.ArrayPattern) {
        node.elements.forEach(el => {
          if (el) {
            checkDestructuringPattern(el, messageId);
          }
        });
      } else if (node.type === AST_NODE_TYPES.AssignmentPattern) {
        checkDestructuringPattern(node.left, messageId);
      } else {
        const tsNode = esTreeNodeToTSNodeMap.get(node);
        if (isAnyOrAnyArrayType(tsNode)) {
          context.report({
            node,
            messageId,
          });
        }
      }
    }

    return {
      // Handled by the no-explicit-any rule (with a fixer)
      //TSAnyKeyword(node): void {},

      // #region typeReferenceResolvesToAny

      TSTypeReference(node): void {
        // const is a special keyword, but typescript resolves its type to any
        if (util.isConstIdentifier(node.typeName)) {
          return;
        }

        const tsNode = esTreeNodeToTSNodeMap.get(node);
        if (!isAnyType(tsNode)) {
          return;
        }

        const typeName = sourceCode.getText(node);
        context.report({
          node,
          messageId: 'typeReferenceResolvesToAny',
          data: {
            typeName,
          },
        });
      },

      // #endregion typeReferenceResolvesToAny

      // #region letVariableWithNoInitialAndNoAnnotation

      'VariableDeclaration:matches([kind = "let"], [kind = "var"]) > VariableDeclarator:not([init])'(
        node: TSESTree.VariableDeclarator,
      ): void {
        if (node.id.typeAnnotation) {
          return;
        }
        if (ignoreUntypedLetVariableDeclaration) {
          return;
        }

        const parent = node.parent as TSESTree.VariableDeclaration;
        context.report({
          node,
          messageId: 'letVariableWithNoInitialAndNoAnnotation',
          data: {
            kind: parent.kind,
          },
        });
      },

      // #endregion letVariableWithNoInitialAndNoAnnotation

      // #region letVariableInitializedToNullishAndNoAnnotation

      'VariableDeclaration:matches([kind = "let"], [kind = "var"]) > VariableDeclarator[init]'(
        node: TSESTree.VariableDeclarator,
      ): void {
        if (node.id.typeAnnotation) {
          return;
        }
        if (ignoreUntypedLetVariableDeclaration) {
          return;
        }

        const parent = node.parent as TSESTree.VariableDeclaration;
        if (
          util.isNullLiteral(node.init) ||
          util.isUndefinedIdentifier(node.init)
        ) {
          context.report({
            node,
            messageId: 'letVariableInitializedToNullishAndNoAnnotation',
            data: {
              kind: parent.kind,
            },
          });
        }
      },

      // #endregion letVariableInitializedToNullishAndNoAnnotation

      // #region variableDeclarationInitializedToAnyWithAnnotation, variableDeclarationInitializedToAnyWithoutAnnotation, patternVariableDeclarationInitializedToAny

      // const x = [];
      // this is a special case, because the type of [] is never[], but the variable gets typed as any[].
      // this means it can't be caught by the above selector
      'VariableDeclaration > VariableDeclarator > ArrayExpression[elements.length = 0].init'(
        node: TSESTree.ArrayExpression,
      ): void {
        const parent = node.parent as TSESTree.VariableDeclarator;

        if (parent.id.typeAnnotation) {
          // note that there is no way to fix the type, so you have to use a type annotation
          // so we don't report variableDeclarationInitializedToAnyWithAnnotation
          return;
        }

        if (ignoreUntypedVariableDeclarationWithEmptyArrayValue) {
          return;
        }

        context.report({
          node: parent,
          messageId: 'variableDeclarationInitializedToAnyWithoutAnnotation',
        });
      },
      // const x = ...;
      'VariableDeclaration > VariableDeclarator[init] > Identifier.id'(
        node: TSESTree.Identifier,
      ): void {
        const parent = node.parent as TSESTree.VariableDeclarator;
        /* istanbul ignore if */ if (!parent.init) {
          return;
        }

        const tsNode = esTreeNodeToTSNodeMap.get(parent.init);
        if (!isAnyOrAnyArrayType(tsNode)) {
          return;
        }

        // the variable is initialized to any | any[]...

        reportVariableDeclarationInitializedToAny(parent, node.name);
      },
      // const { x } = ...;
      // const [x] = ...;
      'VariableDeclaration > VariableDeclarator[init] > :matches(ObjectPattern, ArrayPattern).id'(
        node: TSESTree.ObjectPattern | TSESTree.ArrayPattern,
      ): void {
        const parent = node.parent as TSESTree.VariableDeclarator;
        /* istanbul ignore if */ if (!parent.init) {
          return;
        }

        const tsNode = esTreeNodeToTSNodeMap.get(parent.init);
        if (isAnyOrAnyArrayType(tsNode)) {
          // the entire init value is any, so report the entire declaration
          return reportVariableDeclarationInitializedToAny(parent);
        }

        checkDestructuringPattern(
          node,
          'patternVariableDeclarationInitializedToAny',
        );
      },

      // #endregion variableDeclarationInitializedToAnyWithAnnotation, variableDeclarationInitializedToAnyWithoutAnnotation, patternVariableDeclarationInitializedToAny

      // #region loopVariableInitializedToAny

      'ForOfStatement > VariableDeclaration.left > VariableDeclarator'(
        node: TSESTree.VariableDeclarator,
      ): void {
        if (node.id.type === AST_NODE_TYPES.Identifier) {
          const tsNode = esTreeNodeToTSNodeMap.get(node);
          if (isAnyOrAnyArrayType(tsNode)) {
            context.report({
              node,
              messageId: 'loopVariableInitializedToAny',
            });
          }
        } else {
          checkDestructuringPattern(node.id, 'loopVariableInitializedToAny');
        }
      },

      // #endregion loopVariableInitializedToAny

      // #region returnAny

      'ReturnStatement[argument]'(node: TSESTree.ReturnStatement): void {
        const argument = util.nullThrows(
          node.argument,
          util.NullThrowsReasons.MissingToken(
            'argument',
            AST_NODE_TYPES.ReturnStatement,
          ),
        );

        const tsNode = esTreeNodeToTSNodeMap.get(argument);
        if (isAnyOrAnyArrayType(tsNode)) {
          context.report({
            node,
            messageId: 'returnAny',
          });
        }
      },
      // () => 1
      'ArrowFunctionExpression > :not(BlockStatement).body'(
        node: TSESTree.Expression,
      ): void {
        const tsNode = esTreeNodeToTSNodeMap.get(node);
        if (isAnyOrAnyArrayType(tsNode)) {
          context.report({
            node,
            messageId: 'returnAny',
          });
        }
      },

      // #endregion returnAny

      // #region passedArgumentIsAny

      'CallExpression[arguments.length > 0]'(
        node: TSESTree.CallExpression,
      ): void {
        for (const argument of node.arguments) {
          const tsNode = esTreeNodeToTSNodeMap.get(argument);
          if (isAnyOrAnyArrayType(tsNode)) {
            context.report({
              node: argument,
              messageId: 'passedArgumentIsAny',
            });
          }
        }
      },

      // #endregion passedArgumentIsAny

      // #region assignmentValueIsAny

      AssignmentExpression(node): void {
        const tsNode = esTreeNodeToTSNodeMap.get(node.right);
        if (isAnyOrAnyArrayType(tsNode)) {
          context.report({
            node,
            messageId: 'assignmentValueIsAny',
          });
        }
      },

      // #endregion assignmentValueIsAny

      // #region updateExpressionIsAny

      UpdateExpression(node): void {
        const tsNode = esTreeNodeToTSNodeMap.get(node.argument);
        if (isAnyType(tsNode)) {
          context.report({
            node,
            messageId: 'updateExpressionIsAny',
          });
        }
      },

      // #endregion updateExpressionIsAny

      // #region booleanTestIsAny

      'IfStatement, WhileStatement, DoWhileStatement, ConditionalExpression'(
        node:
          | TSESTree.IfStatement
          | TSESTree.WhileStatement
          | TSESTree.DoWhileStatement
          | TSESTree.ConditionalExpression,
      ): void {
        const tsNode = esTreeNodeToTSNodeMap.get(node.test);
        if (isAnyOrAnyArrayType(tsNode)) {
          context.report({
            node: node.test,
            messageId: 'booleanTestIsAny',
            data: {
              kind: booleanStatementToText[node.type],
            },
          });
        }
      },

      // #endregion booleanTestIsAny

      // #region switchDiscriminantIsAny

      SwitchStatement(node): void {
        const tsNode = esTreeNodeToTSNodeMap.get(node.discriminant);
        if (isAnyOrAnyArrayType(tsNode)) {
          context.report({
            node: node.discriminant,
            messageId: 'switchDiscriminantIsAny',
          });
        }
      },

      // #endregion switchDiscriminantIsAny

      // #region switchCaseTestIsAny

      'SwitchCase[test]'(node: TSESTree.SwitchCase): void {
        const test = util.nullThrows(
          node.test,
          util.NullThrowsReasons.MissingToken(
            'test',
            AST_NODE_TYPES.SwitchCase,
          ),
        );

        const tsNode = esTreeNodeToTSNodeMap.get(test);
        if (isAnyOrAnyArrayType(tsNode)) {
          context.report({
            node,
            messageId: 'switchCaseTestIsAny',
          });
        }
      },

      // #endregion switchCaseTestIsAny
    };
  },
});

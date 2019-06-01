import * as tsutils from 'tsutils';
import ts from 'typescript';
import * as util from '../util';
import { typeIsOrHasBaseType } from '../util';
import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';

type MessageIds = 'preferReadonly';

type Options = [
  {
    onlyInlineLambdas?: boolean;
  }
];

const functionScopeBoundaries = [
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
  'GetAccessor',
  'MethodDefinition',
  'SetAccessor',
].join(', ');

export default util.createRule<Options, MessageIds>({
  name: 'prefer-readonly',
  meta: {
    docs: {
      description:
        "Requires that private members are marked as `readonly` if they're never modified outside of the constructor",
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      preferReadonly:
        "Member '{{name}}' is never reassigned; mark it as `readonly`.",
    },
    schema: [
      {
        allowAdditionalProperties: false,
        properties: {
          onlyInlineLambdas: {
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [{ onlyInlineLambdas: false }],
  create(context, [{ onlyInlineLambdas }]) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const classScopeStack: ClassScope[] = [];

    function handlePropertyAccessExpression(
      node: ts.PropertyAccessExpression,
      parent: ts.Node,
      classScope: ClassScope,
    ) {
      if (ts.isBinaryExpression(parent)) {
        handleParentBinaryExpression(node, parent, classScope);
        return;
      }

      if (ts.isDeleteExpression(parent)) {
        classScope.addVariableModification(node);
        return;
      }

      if (
        ts.isPostfixUnaryExpression(parent) ||
        ts.isPrefixUnaryExpression(parent)
      ) {
        handleParentPostfixOrPrefixUnaryExpression(parent, classScope);
      }
    }

    function handleParentBinaryExpression(
      node: ts.PropertyAccessExpression,
      parent: ts.BinaryExpression,
      classScope: ClassScope,
    ) {
      if (
        parent.left === node &&
        tsutils.isAssignmentKind(parent.operatorToken.kind)
      ) {
        classScope.addVariableModification(node);
      }
    }

    function handleParentPostfixOrPrefixUnaryExpression(
      node: ts.PostfixUnaryExpression | ts.PrefixUnaryExpression,
      classScope: ClassScope,
    ) {
      if (
        node.operator === ts.SyntaxKind.PlusPlusToken ||
        node.operator === ts.SyntaxKind.MinusMinusToken
      ) {
        classScope.addVariableModification(
          node.operand as ts.PropertyAccessExpression,
        );
      }
    }

    function isConstructor(node: TSESTree.Node) {
      return (
        node.type === AST_NODE_TYPES.MethodDefinition &&
        node.kind === 'constructor'
      );
    }

    function isFunctionScopeBoundaryInStack(node: TSESTree.Node) {
      if (classScopeStack.length === 0) {
        return false;
      }

      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      if (ts.isConstructorDeclaration(tsNode)) {
        return false;
      }

      return tsutils.isFunctionScopeBoundary(tsNode);
    }

    function getEsNodesFromViolatingNode(
      violatingNode: ParameterOrPropertyDeclaration,
    ) {
      if (ts.isParameterPropertyDeclaration(violatingNode)) {
        return {
          esNode: parserServices.tsNodeToESTreeNodeMap.get(violatingNode.name),
          nameNode: parserServices.tsNodeToESTreeNodeMap.get(
            violatingNode.name,
          ),
        };
      }

      return {
        esNode: parserServices.tsNodeToESTreeNodeMap.get(violatingNode),
        nameNode: parserServices.tsNodeToESTreeNodeMap.get(violatingNode.name),
      };
    }

    return {
      'ClassDeclaration, ClassExpression'(
        node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
      ) {
        classScopeStack.push(
          new ClassScope(
            checker,
            parserServices.esTreeNodeToTSNodeMap.get(node),
            onlyInlineLambdas,
          ),
        );
      },
      'ClassDeclaration, ClassExpression:exit'() {
        const finalizedClassScope = classScopeStack.pop()!;
        const sourceCode = context.getSourceCode();

        for (const violatingNode of finalizedClassScope.finalizeUnmodifiedPrivateNonReadonlys()) {
          const { esNode, nameNode } = getEsNodesFromViolatingNode(
            violatingNode,
          );
          context.report({
            data: {
              name: sourceCode.getText(nameNode),
            },
            fix: fixer => fixer.insertTextBefore(nameNode, 'readonly '),
            messageId: 'preferReadonly',
            node: esNode,
          });
        }
      },
      MemberExpression(node) {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get<
          ts.PropertyAccessExpression
        >(node);
        if (classScopeStack.length !== 0) {
          handlePropertyAccessExpression(
            tsNode,
            tsNode.parent,
            classScopeStack[classScopeStack.length - 1],
          );
        }
      },
      [functionScopeBoundaries](node: TSESTree.Node) {
        if (isConstructor(node)) {
          classScopeStack[classScopeStack.length - 1].enterConstructor(
            parserServices.esTreeNodeToTSNodeMap.get<ts.ConstructorDeclaration>(
              node,
            ),
          );
        } else if (isFunctionScopeBoundaryInStack(node)) {
          classScopeStack[classScopeStack.length - 1].enterNonConstructor();
        }
      },
      [`${functionScopeBoundaries}:exit`](node: TSESTree.Node) {
        if (isConstructor(node)) {
          classScopeStack[classScopeStack.length - 1].exitConstructor();
        } else if (isFunctionScopeBoundaryInStack(node)) {
          classScopeStack[classScopeStack.length - 1].exitNonConstructor();
        }
      },
    };
  },
});

type ParameterOrPropertyDeclaration =
  | ts.ParameterDeclaration
  | ts.PropertyDeclaration;

const OUTSIDE_CONSTRUCTOR = -1;
const DIRECTLY_INSIDE_CONSTRUCTOR = 0;

class ClassScope {
  private readonly privateModifiableMembers = new Map<
    string,
    ParameterOrPropertyDeclaration
  >();
  private readonly privateModifiableStatics = new Map<
    string,
    ParameterOrPropertyDeclaration
  >();
  private readonly memberVariableModifications = new Set<string>();
  private readonly staticVariableModifications = new Set<string>();

  private readonly classType: ts.Type;

  private constructorScopeDepth = OUTSIDE_CONSTRUCTOR;

  public constructor(
    private readonly checker: ts.TypeChecker,
    classNode: ts.ClassLikeDeclaration,
    private readonly onlyInlineLambdas?: boolean,
  ) {
    this.checker = checker;
    this.classType = checker.getTypeAtLocation(classNode);

    for (const member of classNode.members) {
      if (ts.isPropertyDeclaration(member)) {
        this.addDeclaredVariable(member);
      }
    }
  }

  public addDeclaredVariable(node: ParameterOrPropertyDeclaration) {
    if (
      !tsutils.isModifierFlagSet(node, ts.ModifierFlags.Private) ||
      tsutils.isModifierFlagSet(node, ts.ModifierFlags.Readonly) ||
      ts.isComputedPropertyName(node.name)
    ) {
      return;
    }

    if (
      this.onlyInlineLambdas &&
      node.initializer !== undefined &&
      !ts.isArrowFunction(node.initializer)
    ) {
      return;
    }

    (tsutils.isModifierFlagSet(node, ts.ModifierFlags.Static)
      ? this.privateModifiableStatics
      : this.privateModifiableMembers
    ).set(node.name.getText(), node);
  }

  public addVariableModification(node: ts.PropertyAccessExpression) {
    const modifierType = this.checker.getTypeAtLocation(node.expression);
    if (
      modifierType.symbol === undefined ||
      !typeIsOrHasBaseType(modifierType, this.classType)
    ) {
      return;
    }

    const modifyingStatic =
      tsutils.isObjectType(modifierType) &&
      tsutils.isObjectFlagSet(modifierType, ts.ObjectFlags.Anonymous);
    if (
      !modifyingStatic &&
      this.constructorScopeDepth === DIRECTLY_INSIDE_CONSTRUCTOR
    ) {
      return;
    }

    (modifyingStatic
      ? this.staticVariableModifications
      : this.memberVariableModifications
    ).add(node.name.text);
  }

  public enterConstructor(node: ts.ConstructorDeclaration) {
    this.constructorScopeDepth = DIRECTLY_INSIDE_CONSTRUCTOR;

    for (const parameter of node.parameters) {
      if (tsutils.isModifierFlagSet(parameter, ts.ModifierFlags.Private)) {
        this.addDeclaredVariable(parameter);
      }
    }
  }

  public exitConstructor() {
    this.constructorScopeDepth = OUTSIDE_CONSTRUCTOR;
  }

  public enterNonConstructor() {
    if (this.constructorScopeDepth !== OUTSIDE_CONSTRUCTOR) {
      this.constructorScopeDepth += 1;
    }
  }

  public exitNonConstructor() {
    if (this.constructorScopeDepth !== OUTSIDE_CONSTRUCTOR) {
      this.constructorScopeDepth -= 1;
    }
  }

  public finalizeUnmodifiedPrivateNonReadonlys() {
    this.memberVariableModifications.forEach(variableName => {
      this.privateModifiableMembers.delete(variableName);
    });

    this.staticVariableModifications.forEach(variableName => {
      this.privateModifiableStatics.delete(variableName);
    });

    return [
      ...Array.from(this.privateModifiableMembers.values()),
      ...Array.from(this.privateModifiableStatics.values()),
    ];
  }
}

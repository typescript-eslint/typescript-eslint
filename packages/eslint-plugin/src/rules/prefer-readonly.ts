import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  nullThrows,
  typeIsOrHasBaseType,
} from '../util';
import {
  getMemberHeadLoc,
  getParameterPropertyHeadLoc,
} from '../util/getMemberHeadLoc';

type MessageIds = 'preferReadonly';
type Options = [
  {
    onlyInlineLambdas?: boolean;
  },
];

const functionScopeBoundaries = [
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.MethodDefinition,
].join(', ');

export default createRule<Options, MessageIds>({
  name: 'prefer-readonly',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Require private members to be marked as `readonly` if they're never modified outside of the constructor",
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      preferReadonly:
        "Member '{{name}}' is never reassigned; mark it as `readonly`.",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          onlyInlineLambdas: {
            type: 'boolean',
            description:
              'Whether to restrict checking only to members immediately assigned a lambda value.',
          },
        },
      },
    ],
  },
  defaultOptions: [{ onlyInlineLambdas: false }],
  create(context, [{ onlyInlineLambdas }]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const classScopeStack: ClassScope[] = [];

    function handlePropertyAccessExpression(
      node: ts.PropertyAccessExpression,
      parent: ts.Node,
      classScope: ClassScope,
    ): void {
      if (ts.isBinaryExpression(parent)) {
        handleParentBinaryExpression(node, parent, classScope);
        return;
      }

      if (ts.isDeleteExpression(parent) || isDestructuringAssignment(node)) {
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
    ): void {
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
    ): void {
      if (
        node.operator === ts.SyntaxKind.PlusPlusToken ||
        node.operator === ts.SyntaxKind.MinusMinusToken
      ) {
        classScope.addVariableModification(
          node.operand as ts.PropertyAccessExpression,
        );
      }
    }

    function isDestructuringAssignment(
      node: ts.PropertyAccessExpression,
    ): boolean {
      let current = node.parent as ts.Node | undefined;

      while (current) {
        const parent = current.parent;

        if (
          ts.isObjectLiteralExpression(parent) ||
          ts.isArrayLiteralExpression(parent) ||
          ts.isSpreadAssignment(parent) ||
          (ts.isSpreadElement(parent) &&
            ts.isArrayLiteralExpression(parent.parent))
        ) {
          current = parent;
        } else if (
          ts.isBinaryExpression(parent) &&
          !ts.isPropertyAccessExpression(current)
        ) {
          return (
            parent.left === current &&
            parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
          );
        } else {
          break;
        }
      }

      return false;
    }

    function isFunctionScopeBoundaryInStack(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression
        | TSESTree.MethodDefinition,
    ): boolean {
      if (classScopeStack.length === 0) {
        return false;
      }

      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      if (ts.isConstructorDeclaration(tsNode)) {
        return false;
      }

      return tsutils.isFunctionScopeBoundary(tsNode);
    }

    function getEsNodesFromViolatingNode(
      violatingNode: ParameterOrPropertyDeclaration,
    ): { esNode: TSESTree.Node; nameNode: TSESTree.Node } {
      return {
        esNode: services.tsNodeToESTreeNodeMap.get(violatingNode),
        nameNode: services.tsNodeToESTreeNodeMap.get(violatingNode.name),
      };
    }

    return {
      [`${functionScopeBoundaries}:exit`](
        node:
          | TSESTree.ArrowFunctionExpression
          | TSESTree.FunctionDeclaration
          | TSESTree.FunctionExpression
          | TSESTree.MethodDefinition,
      ): void {
        if (ASTUtils.isConstructor(node)) {
          classScopeStack[classScopeStack.length - 1].exitConstructor();
        } else if (isFunctionScopeBoundaryInStack(node)) {
          classScopeStack[classScopeStack.length - 1].exitNonConstructor();
        }
      },
      'ClassDeclaration, ClassExpression'(
        node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
      ): void {
        classScopeStack.push(
          new ClassScope(
            checker,
            services.esTreeNodeToTSNodeMap.get(node),
            onlyInlineLambdas,
          ),
        );
      },
      'ClassDeclaration, ClassExpression:exit'(): void {
        const finalizedClassScope = nullThrows(
          classScopeStack.pop(),
          'Stack should exist on class exit',
        );

        for (const violatingNode of finalizedClassScope.finalizeUnmodifiedPrivateNonReadonlys()) {
          const { esNode, nameNode } =
            getEsNodesFromViolatingNode(violatingNode);

          const reportNodeOrLoc:
            | { loc: TSESTree.SourceLocation }
            | { node: TSESTree.Node } = (() => {
            switch (esNode.type) {
              case AST_NODE_TYPES.MethodDefinition:
              case AST_NODE_TYPES.PropertyDefinition:
              case AST_NODE_TYPES.TSAbstractMethodDefinition:
                return { loc: getMemberHeadLoc(context.sourceCode, esNode) };
              case AST_NODE_TYPES.TSParameterProperty:
                return {
                  loc: getParameterPropertyHeadLoc(
                    context.sourceCode,
                    esNode,
                    (nameNode as TSESTree.Identifier).name,
                  ),
                };
              default:
                return { node: esNode };
            }
          })();

          context.report({
            ...reportNodeOrLoc,
            messageId: 'preferReadonly',
            data: {
              name: context.sourceCode.getText(nameNode),
            },
            fix: fixer => fixer.insertTextBefore(nameNode, 'readonly '),
          });
        }
      },
      [functionScopeBoundaries](
        node:
          | TSESTree.ArrowFunctionExpression
          | TSESTree.FunctionDeclaration
          | TSESTree.FunctionExpression
          | TSESTree.MethodDefinition,
      ): void {
        if (ASTUtils.isConstructor(node)) {
          classScopeStack[classScopeStack.length - 1].enterConstructor(
            services.esTreeNodeToTSNodeMap.get(node),
          );
        } else if (isFunctionScopeBoundaryInStack(node)) {
          classScopeStack[classScopeStack.length - 1].enterNonConstructor();
        }
      },
      MemberExpression(node): void {
        if (classScopeStack.length !== 0 && !node.computed) {
          const tsNode = services.esTreeNodeToTSNodeMap.get(
            node,
          ) as ts.PropertyAccessExpression;
          handlePropertyAccessExpression(
            tsNode,
            tsNode.parent,
            classScopeStack[classScopeStack.length - 1],
          );
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

enum TypeToClassRelation {
  ClassAndInstance,
  Class,
  Instance,
  None,
}

class ClassScope {
  private readonly classType: ts.Type;
  private constructorScopeDepth = OUTSIDE_CONSTRUCTOR;
  private readonly memberVariableModifications = new Set<string>();
  private readonly privateModifiableMembers = new Map<
    string,
    ParameterOrPropertyDeclaration
  >();

  private readonly privateModifiableStatics = new Map<
    string,
    ParameterOrPropertyDeclaration
  >();

  private readonly staticVariableModifications = new Set<string>();

  public constructor(
    private readonly checker: ts.TypeChecker,
    classNode: ts.ClassLikeDeclaration,
    private readonly onlyInlineLambdas?: boolean,
  ) {
    const classType = checker.getTypeAtLocation(classNode);
    if (tsutils.isIntersectionType(classType)) {
      this.classType = classType.types[0];
    } else {
      this.classType = classType;
    }

    for (const member of classNode.members) {
      if (ts.isPropertyDeclaration(member)) {
        this.addDeclaredVariable(member);
      }
    }
  }

  public addDeclaredVariable(node: ParameterOrPropertyDeclaration): void {
    if (
      !(
        tsutils.isModifierFlagSet(node, ts.ModifierFlags.Private) ||
        node.name.kind === ts.SyntaxKind.PrivateIdentifier
      ) ||
      tsutils.isModifierFlagSet(
        node,
        ts.ModifierFlags.Accessor | ts.ModifierFlags.Readonly,
      ) ||
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

  public addVariableModification(node: ts.PropertyAccessExpression): void {
    const modifierType = this.checker.getTypeAtLocation(node.expression);

    const relationOfModifierTypeToClass =
      this.getTypeToClassRelation(modifierType);

    if (
      relationOfModifierTypeToClass === TypeToClassRelation.Instance &&
      this.constructorScopeDepth === DIRECTLY_INSIDE_CONSTRUCTOR
    ) {
      return;
    }

    if (
      relationOfModifierTypeToClass === TypeToClassRelation.Instance ||
      relationOfModifierTypeToClass === TypeToClassRelation.ClassAndInstance
    ) {
      this.memberVariableModifications.add(node.name.text);
    }
    if (
      relationOfModifierTypeToClass === TypeToClassRelation.Class ||
      relationOfModifierTypeToClass === TypeToClassRelation.ClassAndInstance
    ) {
      this.staticVariableModifications.add(node.name.text);
    }
  }

  public enterConstructor(
    node:
      | ts.ConstructorDeclaration
      | ts.GetAccessorDeclaration
      | ts.MethodDeclaration
      | ts.SetAccessorDeclaration,
  ): void {
    this.constructorScopeDepth = DIRECTLY_INSIDE_CONSTRUCTOR;

    for (const parameter of node.parameters) {
      if (tsutils.isModifierFlagSet(parameter, ts.ModifierFlags.Private)) {
        this.addDeclaredVariable(parameter);
      }
    }
  }

  public enterNonConstructor(): void {
    if (this.constructorScopeDepth !== OUTSIDE_CONSTRUCTOR) {
      this.constructorScopeDepth += 1;
    }
  }

  public exitConstructor(): void {
    this.constructorScopeDepth = OUTSIDE_CONSTRUCTOR;
  }

  public exitNonConstructor(): void {
    if (this.constructorScopeDepth !== OUTSIDE_CONSTRUCTOR) {
      this.constructorScopeDepth -= 1;
    }
  }

  public finalizeUnmodifiedPrivateNonReadonlys(): ParameterOrPropertyDeclaration[] {
    this.memberVariableModifications.forEach(variableName => {
      this.privateModifiableMembers.delete(variableName);
    });

    this.staticVariableModifications.forEach(variableName => {
      this.privateModifiableStatics.delete(variableName);
    });

    return [
      ...this.privateModifiableMembers.values(),
      ...this.privateModifiableStatics.values(),
    ];
  }

  public getTypeToClassRelation(type: ts.Type): TypeToClassRelation {
    if (type.isIntersection()) {
      let result: TypeToClassRelation = TypeToClassRelation.None;
      for (const subType of type.types) {
        const subTypeResult = this.getTypeToClassRelation(subType);
        switch (subTypeResult) {
          case TypeToClassRelation.Class:
            if (result === TypeToClassRelation.Instance) {
              return TypeToClassRelation.ClassAndInstance;
            }
            result = TypeToClassRelation.Class;
            break;
          case TypeToClassRelation.Instance:
            if (result === TypeToClassRelation.Class) {
              return TypeToClassRelation.ClassAndInstance;
            }
            result = TypeToClassRelation.Instance;
            break;
        }
      }
      return result;
    }
    if (type.isUnion()) {
      // any union of class/instance and something else will prevent access to
      // private members, so we assume that union consists only of classes
      // or class instances, because otherwise tsc will report an error
      return this.getTypeToClassRelation(type.types[0]);
    }

    if (!type.getSymbol() || !typeIsOrHasBaseType(type, this.classType)) {
      return TypeToClassRelation.None;
    }

    const typeIsClass =
      tsutils.isObjectType(type) &&
      tsutils.isObjectFlagSet(type, ts.ObjectFlags.Anonymous);

    if (typeIsClass) {
      return TypeToClassRelation.Class;
    }

    return TypeToClassRelation.Instance;
  }
}

/* eslint-disable @typescript-eslint/no-this-alias -- we do a bunch of "start iterating from here" code which isn't actually aliasing `this` */
import type {
  Scope,
  ScopeManager,
  Variable,
} from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';

import { Visitor } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ClassNode, Key, MemberNode } from './types';

import { nullThrows, NullThrowsReasons } from '..';
import {
  extractNameForMember,
  extractNameForMemberExpression,
} from './extractComputedName';
import { privateKey, publicKey } from './types';

export class Member {
  /**
   * The node that declares this member
   */
  public readonly node: MemberNode;

  /**
   * The resolved, unique key for this member.
   */
  public readonly key: Key;

  /**
   * The member name, as given in the source code.
   */
  public readonly name: string;

  /**
   * The node that represents the member name in the source code.
   * Used for reporting errors.
   */
  public readonly nameNode: TSESTree.Node;

  /**
   * The number of writes to this member.
   */
  public writeCount = 0;

  /**
   * The number of reads from this member.
   */
  public readCount = 0;

  private constructor(
    node: MemberNode,
    key: Key,
    name: string,
    nameNode: TSESTree.Node,
  ) {
    this.node = node;
    this.key = key;
    this.name = name;
    this.nameNode = nameNode;
  }
  public static create(node: MemberNode): Member | null {
    const name = extractNameForMember(node);
    if (name == null) {
      return null;
    }
    return new Member(node, name.key, name.codeName, name.nameNode);
  }

  public isAccessor(): boolean {
    if (
      this.node.type === AST_NODE_TYPES.MethodDefinition ||
      this.node.type === AST_NODE_TYPES.TSAbstractMethodDefinition
    ) {
      return this.node.kind === 'set' || this.node.kind === 'get';
    }

    return (
      this.node.type === AST_NODE_TYPES.AccessorProperty ||
      this.node.type === AST_NODE_TYPES.TSAbstractAccessorProperty
    );
  }

  public isHashPrivate(): boolean {
    return (
      'key' in this.node &&
      this.node.key.type === AST_NODE_TYPES.PrivateIdentifier
    );
  }

  public isPrivate(): boolean {
    return this.node.accessibility === 'private';
  }

  public isStatic(): boolean {
    return this.node.static;
  }

  public isUsed(): boolean {
    return (
      this.readCount > 0 ||
      // any usage of an accessor is considered a usage as accessor can have side effects
      (this.writeCount > 0 && this.isAccessor())
    );
  }
}

function isWriteOnlyUsage(node: TSESTree.Node, parent: TSESTree.Node): boolean {
  if (
    parent.type !== AST_NODE_TYPES.AssignmentExpression &&
    parent.type !== AST_NODE_TYPES.ForInStatement &&
    parent.type !== AST_NODE_TYPES.ForOfStatement &&
    parent.type !== AST_NODE_TYPES.AssignmentPattern
  ) {
    return false;
  }

  // If it's on the right then it's a read not a write
  if (parent.left !== node) {
    return false;
  }

  if (
    parent.type === AST_NODE_TYPES.AssignmentExpression &&
    // For any other operator (such as '+=') we still consider it a read operation
    parent.operator !== '='
  ) {
    // if the read operation is "discarded" in an empty statement, then it is write only.
    return parent.parent.type === AST_NODE_TYPES.ExpressionStatement;
  }

  return true;
}

function countReference(identifierParent: TSESTree.Node, member: Member) {
  const identifierGrandparent = nullThrows(
    identifierParent.parent,
    NullThrowsReasons.MissingParent,
  );

  if (isWriteOnlyUsage(identifierParent, identifierGrandparent)) {
    member.writeCount += 1;
    return;
  }

  const identifierGreatGrandparent = identifierGrandparent.parent;

  // A statement which only increments (`this.#x++;`)
  if (
    identifierGrandparent.type === AST_NODE_TYPES.UpdateExpression &&
    identifierGreatGrandparent?.type === AST_NODE_TYPES.ExpressionStatement
  ) {
    member.writeCount += 1;
    return;
  }

  /*
   * ({ x: this.#usedInDestructuring } = bar);
   *
   * But should treat the following as a read:
   * ({ [this.#x]: a } = foo);
   */
  if (
    identifierGrandparent.type === AST_NODE_TYPES.Property &&
    identifierGreatGrandparent?.type === AST_NODE_TYPES.ObjectPattern &&
    identifierGrandparent.value === identifierParent
  ) {
    member.writeCount += 1;
    return;
  }

  // [...this.#unusedInRestPattern] = bar;
  if (identifierGrandparent.type === AST_NODE_TYPES.RestElement) {
    member.writeCount += 1;
    return;
  }

  // [this.#unusedInAssignmentPattern] = bar;
  if (identifierGrandparent.type === AST_NODE_TYPES.ArrayPattern) {
    member.writeCount += 1;
    return;
  }

  member.readCount += 1;
}

type IntermediateNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.Program
  | TSESTree.StaticBlock;

abstract class ThisScope extends Visitor {
  /**
   * True if the context is considered a static context and so `this` refers to
   * the class and not an instance (eg a static method or a static block).
   */
  protected readonly isStaticThisContext: boolean;

  /**
   * The classes directly declared within this class -- for example a class declared within a method.
   * This does not include grandchild classes.
   */
  public readonly childScopes: ThisScope[] = [];

  /**
   * The scope manager instance used to resolve variables to improve discovery of usages.
   */
  public readonly scopeManager: ScopeManager;

  /**
   * The parent class scope if one exists.
   */
  public readonly upper: ThisScope | null;

  /**
   * The context of the `this` reference in the current scope.
   */
  protected readonly thisContext: ClassScope | null;

  constructor(
    scopeManager: ScopeManager,
    upper: ThisScope | null,
    thisContext: 'none' | 'self' | ClassScope,
    isStaticThisContext: boolean,
  ) {
    super({});
    this.scopeManager = scopeManager;
    this.upper = upper;
    this.isStaticThisContext = isStaticThisContext;

    if (thisContext === 'self') {
      if (!(this instanceof ClassScope)) {
        throw new Error('Cannot use `self` unless it is in a ClassScope');
      }
      this.thisContext = this;
    } else if (thisContext === 'none') {
      this.thisContext = null;
    } else {
      this.thisContext = thisContext;
    }
  }

  private findNearestScope(node: TSESTree.Node): Scope | null {
    let currentScope: Scope | null | undefined;
    let currentNode: TSESTree.Node | undefined = node;
    do {
      currentScope = this.scopeManager.acquire(currentNode);
      if (currentNode.parent == null) {
        break;
      }
      currentNode = currentNode.parent;
    } while (currentScope == null);
    return currentScope;
  }
  private findVariableInScope(
    node: TSESTree.Node,
    name: string,
  ): Variable | null {
    let currentScope = this.findNearestScope(node);
    let variable = null;

    while (currentScope != null) {
      variable = currentScope.set.get(name) ?? null;
      if (variable != null) {
        break;
      }

      currentScope = currentScope.upper;
    }

    return variable;
  }

  private getObjectClass(node: TSESTree.MemberExpression): {
    thisContext: ThisScope['thisContext'];
    type: 'instance' | 'static';
  } | null {
    switch (node.object.type) {
      case AST_NODE_TYPES.ThisExpression: {
        if (this.thisContext == null) {
          return null;
        }
        return {
          thisContext: this.thisContext,
          type: this.isStaticThisContext ? 'static' : 'instance',
        };
      }

      case AST_NODE_TYPES.Identifier: {
        const thisContext = this.findClassScopeWithName(node.object.name);
        if (thisContext != null) {
          return { thisContext, type: 'static' };
        }

        // the following code does some very rudimentary scope analysis to handle some trivial cases
        const variable = this.findVariableInScope(node, node.object.name);
        if (variable == null || variable.defs.length === 0) {
          return null;
        }

        const firstDef = variable.defs[0];
        switch (firstDef.node.type) {
          // detect simple reassignment of `this`
          // ```
          // class Foo {
          //   private prop: number;
          //   method(thing: Foo) {
          //     const self = this;
          //     return self.prop;
          //   }
          // }
          // ```
          case AST_NODE_TYPES.VariableDeclarator: {
            const value = firstDef.node.init;
            if (value == null || value.type !== AST_NODE_TYPES.ThisExpression) {
              return null;
            }

            if (
              variable.references.some(
                ref => ref.isWrite() && ref.init !== true,
              )
            ) {
              // variable is assigned to multiple times so we can't be sure that it's still the same class
              return null;
            }

            // we have a case like `const self = this` or `let self = this` that is not reassigned
            // so we can safely assume that it's still the same class!
            return {
              thisContext: this.thisContext,
              type: this.isStaticThisContext ? 'static' : 'instance',
            };
          }

          // Look for variables typed as the current class:
          // ```
          // class Foo {
          //   private prop: number;
          //   method(thing: Foo) {
          //     // this references the private instance member but not via `this` so we can't see it
          //     thing.prop = 1;
          //   }
          // }
          // ```
          default: {
            const typeAnnotation = (() => {
              if (
                'typeAnnotation' in firstDef.name &&
                firstDef.name.typeAnnotation != null
              ) {
                return firstDef.name.typeAnnotation.typeAnnotation;
              }

              return null;
            })();

            if (typeAnnotation == null) {
              return null;
            }

            // Cases like `method(thing: Foo) { ... }`
            if (
              typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
              typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier
            ) {
              const typeName = typeAnnotation.typeName.name;
              const typeScope = this.findClassScopeWithName(typeName);
              if (typeScope != null) {
                return { thisContext: typeScope, type: 'instance' };
              }
            }

            // Cases like `method(thing: typeof Foo) { ... }`
            if (
              typeAnnotation.type === AST_NODE_TYPES.TSTypeQuery &&
              typeAnnotation.exprName.type === AST_NODE_TYPES.Identifier
            ) {
              const exprName = typeAnnotation.exprName.name;
              const exprScope = this.findClassScopeWithName(exprName);
              if (exprScope != null) {
                return { thisContext: exprScope, type: 'static' };
              }
            }
          }
        }
        return null;
      }
      case AST_NODE_TYPES.MemberExpression:
        // TODO - we could probably recurse here to do some more complex analysis and support like `foo.bar.baz` nested references
        return null;

      default:
        return null;
    }
  }

  private visitClass(node: ClassNode): void {
    const classScope = new ClassScope(node, this, this.scopeManager);
    this.childScopes.push(classScope);
    classScope.visitChildren(node);
  }

  private visitIntermediate(node: IntermediateNode): void {
    const intermediateScope = new IntermediateScope(
      this.scopeManager,
      this,
      node,
    );
    this.childScopes.push(intermediateScope);
    intermediateScope.visitChildren(node);
  }

  /**
   * Gets the nearest class scope with the given name.
   */
  public findClassScopeWithName(name: string): ClassScope | null {
    let currentScope: ThisScope | null = this;
    while (currentScope != null) {
      if (
        currentScope instanceof ClassScope &&
        currentScope.className === name
      ) {
        return currentScope;
      }
      currentScope = currentScope.upper;
    }
    return null;
  }

  /////////////////////
  // Visit selectors //
  /////////////////////

  protected AssignmentExpression(node: TSESTree.AssignmentExpression): void {
    this.visitChildren(node);

    if (
      node.right.type === AST_NODE_TYPES.ThisExpression &&
      node.left.type === AST_NODE_TYPES.ObjectPattern
    ) {
      this.handleThisDestructuring(node.left);
    }
  }

  protected AssignmentPattern(node: TSESTree.AssignmentPattern): void {
    this.visitChildren(node);

    if (
      node.right.type === AST_NODE_TYPES.ThisExpression &&
      node.left.type === AST_NODE_TYPES.ObjectPattern
    ) {
      this.handleThisDestructuring(node.left);
    }
  }

  protected ClassDeclaration(node: TSESTree.ClassDeclaration): void {
    this.visitClass(node);
  }

  protected ClassExpression(node: TSESTree.ClassExpression): void {
    this.visitClass(node);
  }

  protected FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
    this.visitIntermediate(node);
  }

  protected FunctionExpression(node: TSESTree.FunctionExpression): void {
    this.visitIntermediate(node);
  }

  protected MemberExpression(node: TSESTree.MemberExpression): void {
    this.visitChildren(node);

    if (node.property.type === AST_NODE_TYPES.PrivateIdentifier) {
      // will be handled by the PrivateIdentifier visitor
      return;
    }

    const propertyName = extractNameForMemberExpression(node);
    if (propertyName == null) {
      return;
    }

    const objectClassName = this.getObjectClass(node);
    if (objectClassName == null) {
      return;
    }

    if (objectClassName.thisContext == null) {
      return;
    }

    const members =
      objectClassName.type === 'instance'
        ? objectClassName.thisContext.members.instance
        : objectClassName.thisContext.members.static;
    const member = members.get(propertyName.key);
    if (member == null) {
      return;
    }

    countReference(node, member);
  }

  protected PrivateIdentifier(node: TSESTree.PrivateIdentifier): void {
    this.visitChildren(node);

    if (
      (node.parent.type === AST_NODE_TYPES.MethodDefinition ||
        node.parent.type === AST_NODE_TYPES.PropertyDefinition) &&
      node.parent.key === node
    ) {
      // ignore the member definition
      return;
    }

    // We can actually be pretty loose with our code here thanks to how private
    // members are designed.
    //
    // 1) classes CANNOT have a static and instance private member with the
    //    same name, so we don't need to match up static access.
    // 2) nested classes CANNOT access a private member of their parent class if
    //    the member has the same name as a private member of the nested class.
    //
    // together this means that we can just look for the member upwards until we
    // find a match and we know that will be the correct match!

    let currentScope: ThisScope | null = this;
    const key = privateKey(node);
    while (currentScope != null) {
      if (currentScope.thisContext != null) {
        const member =
          currentScope.thisContext.members.instance.get(key) ??
          currentScope.thisContext.members.static.get(key);
        if (member != null) {
          countReference(node.parent, member);
          return;
        }
      }

      currentScope = currentScope.upper;
    }
  }

  protected StaticBlock(node: TSESTree.StaticBlock): void {
    this.visitIntermediate(node);
  }

  protected VariableDeclarator(node: TSESTree.VariableDeclarator): void {
    this.visitChildren(node);

    if (
      node.init?.type === AST_NODE_TYPES.ThisExpression &&
      node.id.type === AST_NODE_TYPES.ObjectPattern
    ) {
      this.handleThisDestructuring(node.id);
    }
  }

  /**
   * Handles destructuring from `this` in ObjectPattern.
   * Example: const { property } = this;
   */
  private handleThisDestructuring(pattern: TSESTree.ObjectPattern): void {
    if (this.thisContext == null) {
      return;
    }

    for (const prop of pattern.properties) {
      if (prop.type !== AST_NODE_TYPES.Property) {
        continue;
      }

      if (prop.key.type !== AST_NODE_TYPES.Identifier) {
        continue;
      }

      const memberKey = publicKey(prop.key.name);
      const members = this.isStaticThisContext
        ? this.thisContext.members.static
        : this.thisContext.members.instance;
      const member = members.get(memberKey);

      if (member == null) {
        continue;
      }

      countReference(prop.key, member);
    }
  }
}

/**
 * Any other scope that is not a class scope
 *
 * When we visit a function declaration/expression the `this` reference is
 * rebound so it no longer refers to the class.
 *
 * This also supports a function's `this` parameter.
 */
class IntermediateScope extends ThisScope {
  constructor(
    scopeManager: ScopeManager,
    upper: ThisScope | null,
    node: IntermediateNode,
  ) {
    if (node.type === AST_NODE_TYPES.Program) {
      super(scopeManager, upper, 'none', false);
      return;
    }

    if (node.type === AST_NODE_TYPES.StaticBlock) {
      if (upper == null || !(upper instanceof ClassScope)) {
        throw new Error(
          'Cannot have a static block without an upper ClassScope',
        );
      }
      super(scopeManager, upper, upper, true);
      return;
    }

    // method definition
    if (
      (node.parent.type === AST_NODE_TYPES.MethodDefinition ||
        node.parent.type === AST_NODE_TYPES.PropertyDefinition) &&
      node.parent.value === node
    ) {
      if (upper == null || !(upper instanceof ClassScope)) {
        throw new Error(
          'Cannot have a class method/property without an upper ClassScope',
        );
      }
      super(scopeManager, upper, upper, node.parent.static);
      return;
    }

    // function with a `this` parameter
    if (
      upper != null &&
      node.params.length > 0 &&
      node.params[0].type === AST_NODE_TYPES.Identifier &&
      node.params[0].name === 'this'
    ) {
      const thisType = node.params[0].typeAnnotation?.typeAnnotation;
      if (
        thisType?.type === AST_NODE_TYPES.TSTypeReference &&
        thisType.typeName.type === AST_NODE_TYPES.Identifier
      ) {
        const thisContext = upper.findClassScopeWithName(
          thisType.typeName.name,
        );
        if (thisContext != null) {
          super(scopeManager, upper, thisContext, false);
          return;
        }
      }
    }

    super(scopeManager, upper, 'none', false);
  }
}

export interface ClassScopeResult {
  /**
   * The classes name as given in the source code.
   * If this is `null` then the class is an anonymous class.
   */
  readonly className: string | null;
  /**
   * The class's members, keyed by their name
   */
  readonly members: {
    readonly instance: Map<Key, Member>;
    readonly static: Map<Key, Member>;
  };
}

class ClassScope extends ThisScope implements ClassScopeResult {
  public readonly className: string | null;

  /**
   * The class's members, keyed by their name
   */
  public readonly members: ClassScopeResult['members'] = {
    instance: new Map(),
    static: new Map(),
  };

  /**
   * The node that declares this class.
   */
  public readonly theClass: ClassNode;

  public constructor(
    theClass: ClassNode,
    upper: ClassScope | IntermediateScope | null,
    scopeManager: ScopeManager,
  ) {
    super(scopeManager, upper, 'self', false);

    this.theClass = theClass;
    this.className = theClass.id?.name ?? null;

    for (const memberNode of theClass.body.body) {
      switch (memberNode.type) {
        case AST_NODE_TYPES.MethodDefinition:
          if (memberNode.kind === 'constructor') {
            for (const parameter of memberNode.value.params) {
              if (parameter.type !== AST_NODE_TYPES.TSParameterProperty) {
                continue;
              }

              const member = Member.create(parameter);
              if (member == null) {
                continue;
              }

              this.members.instance.set(member.key, member);
            }

            // break instead of falling through because the constructor is not a "member" we track
            break;
          }
        // intentional fallthrough
        case AST_NODE_TYPES.AccessorProperty:
        case AST_NODE_TYPES.PropertyDefinition:
        case AST_NODE_TYPES.TSAbstractAccessorProperty:
        case AST_NODE_TYPES.TSAbstractMethodDefinition:
        case AST_NODE_TYPES.TSAbstractPropertyDefinition: {
          const member = Member.create(memberNode);
          if (member == null) {
            continue;
          }
          if (member.isStatic()) {
            this.members.static.set(member.key, member);
          } else {
            this.members.instance.set(member.key, member);
          }
          break;
        }

        case AST_NODE_TYPES.StaticBlock:
          // static blocks declare no members
          continue;

        case AST_NODE_TYPES.TSIndexSignature:
          // index signatures are type signatures only and are fully computed
          continue;
      }
    }
  }
}

export function analyzeClassMemberUsage(
  program: TSESTree.Program,
  scopeManager: ScopeManager,
): ReadonlyMap<ClassNode, ClassScopeResult> {
  const rootScope = new IntermediateScope(scopeManager, null, program);
  rootScope.visit(program);
  return traverseScopes(rootScope);
}

function traverseScopes(
  currentScope: ThisScope,
  analysisResults = new Map<ClassNode, ClassScopeResult>(),
) {
  if (currentScope instanceof ClassScope) {
    analysisResults.set(currentScope.theClass, currentScope);
  }

  for (const childScope of currentScope.childScopes) {
    traverseScopes(childScope, analysisResults);
  }

  return analysisResults;
}

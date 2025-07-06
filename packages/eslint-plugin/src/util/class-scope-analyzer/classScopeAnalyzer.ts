/* eslint-disable @typescript-eslint/no-this-alias -- we do a bunch of "start iterating from here" code which isn't actually aliasing `this` */
import type { ScopeManager } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';

import { Visitor } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ClassNode, Key, MemberNode } from './types';

import {
  extractNameForMember,
  extractNameForMemberExpression,
} from './extractComputedName';
import { privateKey } from './types';

export class Member {
  /**
   * The node that declares this member
   */
  public readonly node: MemberNode;

  /**
   * The member name, as given in the source code.
   */
  public readonly name: Key;

  /**
   * The number of references to this member.
   */
  public referenceCount = 0;

  private constructor(node: MemberNode, name: Key) {
    this.node = node;
    this.name = name;
  }
  public static create(node: MemberNode): Member | null {
    const name = extractNameForMember(node);
    if (name == null) {
      return null;
    }
    return new Member(node, name);
  }

  public isPrivate(): boolean {
    return this.node.accessibility === 'private';
  }

  public isStatic(): boolean {
    return this.node.static;
  }
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

  private getObjectClass(node: TSESTree.MemberExpression): {
    thisContext: ThisScope['thisContext'];
    type: 'instance' | 'static';
  } | null {
    switch (node.object.type) {
      case AST_NODE_TYPES.ThisExpression: {
        if (this.thisContext == null) {
          return null;
        }
        return { thisContext: this.thisContext, type: 'instance' };
      }

      case AST_NODE_TYPES.Identifier: {
        const thisContext = this.findClassScopeWithName(node.object.name);
        if (thisContext != null) {
          return { thisContext, type: 'static' };
        }

        // TODO -- use scope analysis to do some basic type resolution to handle cases like:
        // ```
        // class Foo {
        //   private prop: number;
        //   method(thing: Foo) {
        //     // this references the private instance member but not via `this` so we can't see it
        //     thing.prop = 1;
        //   }
        // }

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
    classScope.visit(node);
  }

  private visitIntermediate(node: IntermediateNode): void {
    const intermediateScope = new IntermediateScope(
      this.scopeManager,
      this,
      node,
    );
    this.childScopes.push(intermediateScope);
    intermediateScope.visit(node);
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
    const member = members.get(propertyName);
    if (member == null) {
      return;
    }

    member.referenceCount += 1;
  }

  protected PrivateIdentifier(node: TSESTree.PrivateIdentifier): void {
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
          member.referenceCount += 1;
          return;
        }
      }

      currentScope = currentScope.upper;
    }
  }

  protected StaticBlock(node: TSESTree.StaticBlock): void {
    this.visitIntermediate(node);
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
        case AST_NODE_TYPES.AccessorProperty:
        case AST_NODE_TYPES.MethodDefinition:
        case AST_NODE_TYPES.PropertyDefinition:
        case AST_NODE_TYPES.TSAbstractAccessorProperty:
        case AST_NODE_TYPES.TSAbstractMethodDefinition:
        case AST_NODE_TYPES.TSAbstractPropertyDefinition: {
          const member = Member.create(memberNode);
          if (member == null) {
            continue;
          }
          if (member.isStatic()) {
            this.members.static.set(member.name, member);
          } else {
            this.members.instance.set(member.name, member);
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

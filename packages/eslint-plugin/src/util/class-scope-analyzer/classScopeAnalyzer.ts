import type { ScopeManager } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';

import { Visitor } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ClassNode, FunctionNode, Key, MemberNode } from './types';

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

  /**
   * True if the variable is considered an accessor
   */
  public isAccessor(): boolean {
    return (
      this.node.type === AST_NODE_TYPES.AccessorProperty ||
      ('kind' in this.node &&
        (this.node.kind === 'get' || this.node.kind === 'set'))
    );
  }

  /**
   * True if the variable has the `private` accessibility modifier.
   */
  public isPrivate(): boolean {
    return this.node.accessibility === 'private';
  }
  /**
   * True if the variable has the `protected` accessibility modifier.
   */
  public isProtected(): boolean {
    return this.node.accessibility === 'protected';
  }

  /**
   * True if the variable has the `public` accessibility modifier.
   */
  public isPublic(): boolean {
    return this.node.accessibility === 'public';
  }
}

abstract class ThisScope extends Visitor {
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
  ) {
    super({});
    this.scopeManager = scopeManager;
    this.upper = upper;

    if (thisContext === 'self') {
      this.thisContext = this as unknown as ClassScope;
    } else if (thisContext === 'none') {
      this.thisContext = null;
    } else {
      this.thisContext = thisContext;
    }
  }

  private getObjectClass(
    node: TSESTree.MemberExpression,
  ): { thisContext: ThisScope; type: 'instance' | 'static' } | null {
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
        return null;
      }
      case AST_NODE_TYPES.MemberExpression:
        // TODO - we could probably recurse here to do some more complex analysis and support like
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

  private visitFunction(node: FunctionNode): void {
    const functionScope = new FunctionScope(this.scopeManager, this, node);
    this.childScopes.push(functionScope);
    functionScope.visit(node);
  }

  /**
   * Gets the nearest class scope with the given name.
   */
  public findClassScopeWithName(name: string): ClassScope | null {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
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
    this.visitFunction(node);
  }

  protected FunctionExpression(node: TSESTree.FunctionExpression): void {
    if (
      (node.parent.type === AST_NODE_TYPES.MethodDefinition ||
        node.parent.type === AST_NODE_TYPES.PropertyDefinition) &&
      node.parent.value === node
    ) {
      // if the function is a method's implementation then the `this` is guaranteed to be the class
      this.visit(node);
    } else {
      // TODO(bradzacher):
      // - we could handle manual bound functions like `(function () { ... }).bind(this)`
      // - we could handle auto-bound methods like `[].map(function () {}, this)`
      this.visitFunction(node);
    }
  }

  protected MemberExpression(node: TSESTree.MemberExpression): void {
    const propertyName = extractNameForMemberExpression(node);
    if (propertyName == null) {
      return;
    }

    const objectClassName = this.getObjectClass(node);
  }

  protected PrivateIdentifier(node: TSESTree.PrivateIdentifier): void {
    const member = this.thisContext?.members.get(privateKey(node));
    if (member == null) {
      return;
    }

    member.referenceCount += 1;
  }
}

/**
 * When we visit a function declaration/expression the `this` reference is
 * rebound so it no longer refers to the class.
 *
 * This also supports a function's `this` parameter.
 */
export class FunctionScope extends ThisScope {
  constructor(
    scopeManager: ScopeManager,
    upper: ThisScope,
    node: FunctionNode,
  ) {
    if (
      node.params[0].type !== AST_NODE_TYPES.Identifier ||
      node.params[0].name !== 'this'
    ) {
      super(scopeManager, upper, 'none');
      return;
    }

    const thisType = node.params[0].typeAnnotation?.typeAnnotation;
    if (
      thisType == null ||
      thisType.type !== AST_NODE_TYPES.TSTypeReference ||
      thisType.typeName.type !== AST_NODE_TYPES.Identifier
    ) {
      super(scopeManager, upper, 'none');
      return;
    }

    const thisContext = upper.findClassScopeWithName(thisType.typeName.name);
    if (thisContext == null) {
      super(scopeManager, upper, 'none');
      return;
    }

    super(scopeManager, upper, thisContext);
  }
}

export class ClassScope extends ThisScope {
  /**
   * The classes name as given in the source code.
   * If this is `null` then the class is an anonymous class.
   */
  public readonly className: string | null;

  /**
   * The class's members, keyed by their name
   */
  public readonly members = new Map<Key, Member>();

  /**
   * The node that declares this class.
   */
  public readonly theClass: ClassNode;

  public constructor(
    theClass: ClassNode,
    upper: ClassScope | FunctionScope | null,
    scopeManager: ScopeManager,
  ) {
    super(scopeManager, upper, 'self');

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
          this.members.set(member.name, member);
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
  theClass: ClassNode,
  scopeManager: ScopeManager,
): ClassScope {
  const analyzer = new ClassScope(theClass, null, scopeManager);
  analyzer.visit(theClass);
  return analyzer;
}

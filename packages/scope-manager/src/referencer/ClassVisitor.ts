import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { ClassNameDefinition, ParameterDefinition } from '../definition';
import type { Referencer } from './Referencer';
import { TypeVisitor } from './TypeVisitor';
import { Visitor } from './Visitor';

class ClassVisitor extends Visitor {
  readonly #classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression;
  readonly #referencer: Referencer;

  constructor(
    referencer: Referencer,
    node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  ) {
    super(referencer);
    this.#referencer = referencer;
    this.#classNode = node;
  }

  static visit(
    referencer: Referencer,
    node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  ): void {
    const classVisitor = new ClassVisitor(referencer, node);
    classVisitor.visitClass(node);
  }

  override visit(node: TSESTree.Node | null | undefined): void {
    // make sure we only handle the nodes we are designed to handle
    if (node && node.type in this) {
      super.visit(node);
    } else {
      this.#referencer.visit(node);
    }
  }

  ///////////////////
  // Visit helpers //
  ///////////////////

  protected visitClass(
    node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  ): void {
    if (node.type === AST_NODE_TYPES.ClassDeclaration && node.id) {
      this.#referencer
        .currentScope()
        .defineIdentifier(node.id, new ClassNameDefinition(node.id, node));
    }

    node.decorators.forEach(d => this.#referencer.visit(d));

    this.#referencer.scopeManager.nestClassScope(node);

    if (node.id) {
      // define the class name again inside the new scope
      // references to the class should not resolve directly to the parent class
      this.#referencer
        .currentScope()
        .defineIdentifier(node.id, new ClassNameDefinition(node.id, node));
    }

    this.#referencer.visit(node.superClass);

    // visit the type param declarations
    this.visitType(node.typeParameters);
    // then the usages
    this.visitType(node.superTypeArguments);
    node.implements.forEach(imp => this.visitType(imp));

    this.visit(node.body);

    this.#referencer.close(node);
  }

  protected visitPropertyDefinition(
    node:
      | TSESTree.AccessorProperty
      | TSESTree.PropertyDefinition
      | TSESTree.TSAbstractAccessorProperty
      | TSESTree.TSAbstractPropertyDefinition,
  ): void {
    this.visitPropertyBase(node);
    /**
     * class A {
     *   @meta     // <--- check this
     *   foo: Type;
     * }
     */
    this.visitType(node.typeAnnotation);
  }

  protected visitFunctionParameterTypeAnnotation(
    node: TSESTree.Parameter,
  ): void {
    switch (node.type) {
      case AST_NODE_TYPES.AssignmentPattern:
        this.visitType(node.left.typeAnnotation);
        break;
      case AST_NODE_TYPES.TSParameterProperty:
        this.visitFunctionParameterTypeAnnotation(node.parameter);
        break;
      default:
        this.visitType(node.typeAnnotation);
    }
  }

  protected visitMethodFunction(
    node: TSESTree.FunctionExpression,
    methodNode: TSESTree.MethodDefinition,
  ): void {
    if (node.id) {
      // FunctionExpression with name creates its special scope;
      // FunctionExpressionNameScope.
      this.#referencer.scopeManager.nestFunctionExpressionNameScope(node);
    }

    // Consider this function is in the MethodDefinition.
    this.#referencer.scopeManager.nestFunctionScope(node, true);

    /**
     * class A {
     *   @meta     // <--- check this
     *   foo(a: Type) {}
     *
     *   @meta     // <--- check this
     *   foo(): Type {}
     * }
     */
    let withMethodDecorators = !!methodNode.decorators.length;
    /**
     * class A {
     *   foo(
     *     @meta    // <--- check this
     *     a: Type
     *   ) {}
     *
     *   set foo(
     *     @meta    // <--- EXCEPT this. TS do nothing for this
     *     a: Type
     *   ) {}
     * }
     */
    withMethodDecorators ||=
      methodNode.kind !== 'set' &&
      node.params.some(param => param.decorators.length);
    if (!withMethodDecorators && methodNode.kind === 'set') {
      const keyName = getLiteralMethodKeyName(methodNode);

      /**
       * class A {
       *   @meta      // <--- check this
       *   get a() {}
       *   set ['a'](v: Type) {}
       * }
       */
      if (
        keyName != null &&
        this.#classNode.body.body.find(
          (node): node is TSESTree.MethodDefinition =>
            node !== methodNode &&
            node.type === AST_NODE_TYPES.MethodDefinition &&
            // Node must both be static or not
            node.static === methodNode.static &&
            getLiteralMethodKeyName(node) === keyName,
        )?.decorators.length
      ) {
        withMethodDecorators = true;
      }
    }

    /**
     * @meta      // <--- check this
     * class A {
     *   constructor(a: Type) {}
     * }
     */
    if (
      !withMethodDecorators &&
      methodNode.kind === 'constructor' &&
      this.#classNode.decorators.length
    ) {
      withMethodDecorators = true;
    }

    // Process parameter declarations.
    for (const param of node.params) {
      this.visitPattern(
        param,
        (pattern, info) => {
          this.#referencer
            .currentScope()
            .defineIdentifier(
              pattern,
              new ParameterDefinition(pattern, node, info.rest),
            );

          this.#referencer.referencingDefaultValue(
            pattern,
            info.assignments,
            null,
            true,
          );
        },
        { processRightHandNodes: true },
      );
      this.visitFunctionParameterTypeAnnotation(param);
      param.decorators.forEach(d => this.visit(d));
    }

    this.visitType(node.returnType);
    this.visitType(node.typeParameters);

    this.#referencer.visitChildren(node.body);
    this.#referencer.close(node);
  }

  protected visitPropertyBase(
    node:
      | TSESTree.AccessorProperty
      | TSESTree.PropertyDefinition
      | TSESTree.TSAbstractAccessorProperty
      | TSESTree.TSAbstractMethodDefinition
      | TSESTree.TSAbstractPropertyDefinition,
  ): void {
    if (node.computed) {
      this.#referencer.visit(node.key);
    }

    if (node.value) {
      if (
        node.type === AST_NODE_TYPES.PropertyDefinition ||
        node.type === AST_NODE_TYPES.AccessorProperty
      ) {
        this.#referencer.scopeManager.nestClassFieldInitializerScope(
          node.value,
        );
      }

      this.#referencer.visit(node.value);

      if (
        node.type === AST_NODE_TYPES.PropertyDefinition ||
        node.type === AST_NODE_TYPES.AccessorProperty
      ) {
        this.#referencer.close(node.value);
      }
    }

    node.decorators.forEach(d => this.#referencer.visit(d));
  }

  protected visitMethod(node: TSESTree.MethodDefinition): void {
    if (node.computed) {
      this.#referencer.visit(node.key);
    }

    if (node.value.type === AST_NODE_TYPES.FunctionExpression) {
      this.visitMethodFunction(node.value, node);
    } else {
      this.#referencer.visit(node.value);
    }

    node.decorators.forEach(d => this.#referencer.visit(d));
  }

  protected visitType(node: TSESTree.Node | null | undefined): void {
    if (!node) {
      return;
    }
    TypeVisitor.visit(this.#referencer, node);
  }

  /////////////////////
  // Visit selectors //
  /////////////////////

  protected AccessorProperty(node: TSESTree.AccessorProperty): void {
    this.visitPropertyDefinition(node);
  }

  protected ClassBody(node: TSESTree.ClassBody): void {
    // this is here on purpose so that this visitor explicitly declares visitors
    // for all nodes it cares about (see the instance visit method above)
    this.visitChildren(node);
  }

  protected PropertyDefinition(node: TSESTree.PropertyDefinition): void {
    this.visitPropertyDefinition(node);
  }

  protected MethodDefinition(node: TSESTree.MethodDefinition): void {
    this.visitMethod(node);
  }

  protected TSAbstractAccessorProperty(
    node: TSESTree.TSAbstractAccessorProperty,
  ): void {
    this.visitPropertyDefinition(node);
  }

  protected TSAbstractPropertyDefinition(
    node: TSESTree.TSAbstractPropertyDefinition,
  ): void {
    this.visitPropertyDefinition(node);
  }

  protected TSAbstractMethodDefinition(
    node: TSESTree.TSAbstractMethodDefinition,
  ): void {
    this.visitPropertyBase(node);
  }

  protected Identifier(node: TSESTree.Identifier): void {
    this.#referencer.visit(node);
  }

  protected PrivateIdentifier(): void {
    // intentionally skip
  }

  protected StaticBlock(node: TSESTree.StaticBlock): void {
    this.#referencer.scopeManager.nestClassStaticBlockScope(node);

    node.body.forEach(b => this.visit(b));

    this.#referencer.close(node);
  }
}

/**
 * Only if key is one of [identifier, string, number], ts will combine metadata of accessors .
 * class A {
 *   get a() {}
 *   set ['a'](v: Type) {}
 *
 *   get [1]() {}
 *   set [1](v: Type) {}
 *
 *   // Following won't be combined
 *   get [key]() {}
 *   set [key](v: Type) {}
 *
 *   get [true]() {}
 *   set [true](v: Type) {}
 *
 *   get ['a'+'b']() {}
 *   set ['a'+'b']() {}
 * }
 */
function getLiteralMethodKeyName(
  node: TSESTree.MethodDefinition,
): number | string | null {
  if (node.computed && node.key.type === AST_NODE_TYPES.Literal) {
    if (
      typeof node.key.value === 'string' ||
      typeof node.key.value === 'number'
    ) {
      return node.key.value;
    }
  } else if (!node.computed && node.key.type === AST_NODE_TYPES.Identifier) {
    return node.key.name;
  }
  return null;
}

export { ClassVisitor };

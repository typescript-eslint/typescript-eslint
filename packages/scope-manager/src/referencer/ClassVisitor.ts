import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';
import { ClassNameDefinition, ParameterDefinition } from '../definition';
import { Referencer } from './Referencer';
import { TypeVisitor } from './TypeVisitor';
import { Visitor } from './Visitor';

class ClassVisitor extends Visitor {
  readonly #classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression;
  readonly #referencer: Referencer;
  readonly #emitDecoratorMetadata: boolean;

  constructor(
    referencer: Referencer,
    node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
    emitDecoratorMetadata: boolean,
  ) {
    super(referencer);
    this.#referencer = referencer;
    this.#classNode = node;
    this.#emitDecoratorMetadata = emitDecoratorMetadata;
  }

  static visit(
    referencer: Referencer,
    node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
    emitDecoratorMetadata: boolean,
  ): void {
    const classVisitor = new ClassVisitor(
      referencer,
      node,
      emitDecoratorMetadata,
    );
    classVisitor.visitClass(node);
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

    node.decorators?.forEach(d => this.visit(d));

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
    this.visitType(node.superTypeParameters);
    node.implements?.forEach(imp => this.visitType(imp));

    this.visit(node.body);

    this.#referencer.close(node);
  }

  protected visitClassProperty(
    node: TSESTree.TSAbstractClassProperty | TSESTree.ClassProperty,
  ): void {
    this.visitProperty(node);
    /**
     * class A {
     *   @meta     // <--- check this
     *   foo: Type;
     * }
     */
    this.visitMetadataType(node.typeAnnotation, !!node.decorators);
  }

  protected visitFunctionParameterTypeAnnotation(
    node: TSESTree.Parameter,
    withDecorators: boolean,
  ): void {
    if ('typeAnnotation' in node) {
      this.visitMetadataType(node.typeAnnotation, withDecorators);
    } else if (node.type === AST_NODE_TYPES.AssignmentPattern) {
      this.visitMetadataType(node.left.typeAnnotation, withDecorators);
    } else if (node.type === AST_NODE_TYPES.TSParameterProperty) {
      this.visitFunctionParameterTypeAnnotation(node.parameter, withDecorators);
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
    let withMethodDecorators = !!methodNode.decorators;
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
    withMethodDecorators =
      withMethodDecorators ||
      (methodNode.kind !== 'set' &&
        node.params.some(param => param.decorators));
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
        keyName !== null &&
        this.#classNode.body.body.find(
          (node): node is TSESTree.MethodDefinition =>
            node !== methodNode &&
            node.type === AST_NODE_TYPES.MethodDefinition &&
            // Node must both be static or not
            node.static === methodNode.static &&
            getLiteralMethodKeyName(node) === keyName,
        )?.decorators
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
      this.#classNode.decorators
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
      this.visitFunctionParameterTypeAnnotation(param, withMethodDecorators);
      param.decorators?.forEach(d => this.visit(d));
    }

    this.visitMetadataType(node.returnType, withMethodDecorators);
    this.visitType(node.typeParameters);

    // In TypeScript there are a number of function-like constructs which have no body,
    // so check it exists before traversing
    if (node.body) {
      // Skip BlockStatement to prevent creating BlockStatement scope.
      if (node.body.type === AST_NODE_TYPES.BlockStatement) {
        this.#referencer.visitChildren(node.body);
      } else {
        this.#referencer.visit(node.body);
      }
    }

    this.#referencer.close(node);
  }

  protected visitProperty(
    node:
      | TSESTree.ClassProperty
      | TSESTree.TSAbstractClassProperty
      | TSESTree.TSAbstractMethodDefinition,
  ): void {
    if (node.computed) {
      this.#referencer.visit(node.key);
    }

    this.#referencer.visit(node.value);

    if ('decorators' in node) {
      node.decorators?.forEach(d => this.#referencer.visit(d));
    }
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

    if ('decorators' in node) {
      node.decorators?.forEach(d => this.#referencer.visit(d));
    }
  }

  protected visitType(node: TSESTree.Node | null | undefined): void {
    if (!node) {
      return;
    }
    TypeVisitor.visit(this.#referencer, node);
  }

  protected visitMetadataType(
    node: TSESTree.TSTypeAnnotation | null | undefined,
    withDecorators: boolean,
  ): void {
    if (!node) {
      return;
    }
    // emit decorators metadata only work for TSTypeReference in ClassDeclaration
    if (
      this.#classNode.type === AST_NODE_TYPES.ClassDeclaration &&
      !this.#classNode.declare &&
      node.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
      this.#emitDecoratorMetadata
    ) {
      let identifier: TSESTree.Identifier;
      if (
        node.typeAnnotation.typeName.type === AST_NODE_TYPES.TSQualifiedName
      ) {
        let iter = node.typeAnnotation.typeName;
        while (iter.left.type === AST_NODE_TYPES.TSQualifiedName) {
          iter = iter.left;
        }
        identifier = iter.left;
      } else {
        identifier = node.typeAnnotation.typeName;
      }

      if (withDecorators) {
        return this.#referencer
          .currentScope()
          .referenceDualValueType(identifier);
      }
    }
    this.visitType(node);
  }

  /////////////////////
  // Visit selectors //
  /////////////////////

  protected ClassProperty(node: TSESTree.ClassProperty): void {
    this.visitClassProperty(node);
  }

  protected MethodDefinition(node: TSESTree.MethodDefinition): void {
    this.visitMethod(node);
  }

  protected TSAbstractClassProperty(
    node: TSESTree.TSAbstractClassProperty,
  ): void {
    this.visitClassProperty(node);
  }

  protected TSAbstractMethodDefinition(
    node: TSESTree.TSAbstractMethodDefinition,
  ): void {
    this.visitProperty(node);
  }

  protected Identifier(node: TSESTree.Identifier): void {
    this.#referencer.visit(node);
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
): string | number | null {
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

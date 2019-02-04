import { ScopeManager } from 'eslint-scope';
import { Definition, ParameterDefinition } from 'eslint-scope/lib/definition';
import OriginalPatternVisitor from 'eslint-scope/lib/pattern-visitor';
import Reference from 'eslint-scope/lib/reference';
import OriginalReferencer from 'eslint-scope/lib/referencer';
import { Scope } from 'eslint-scope/lib/scope';
import { getKeys as fallback } from 'eslint-visitor-keys';
import { ParserOptions } from './parser-options';
import { visitorKeys as childVisitorKeys } from './visitor-keys';
import {
  PatternVisitorCallback,
  PatternVisitorOptions
} from 'eslint-scope/lib/options';
import { es } from '@typescript-eslint/typescript-estree';

/**
 * Define the override function of `Scope#__define` for global augmentation.
 * @param {Function} define The original Scope#__define method.
 * @returns {Function} The override function.
 */
function overrideDefine(define: any) {
  return /* @this {Scope} */ function(this: any, node: any, definition: any) {
    define.call(this, node, definition);

    // Set `variable.eslintUsed` to tell ESLint that the variable is exported.
    const variable = this.set.get(node.name);
    if (variable) {
      variable.eslintUsed = true;
    }
  };
}

/** The scope class for enum. */
class EnumScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: es.Node | null
  ) {
    // @ts-ignore
    super(scopeManager, 'enum', upperScope, block, false);
  }
}

class PatternVisitor extends OriginalPatternVisitor {
  constructor(
    options: PatternVisitorOptions,
    rootPattern: any,
    callback: PatternVisitorCallback
  ) {
    super(options, rootPattern, callback);
  }

  Identifier(node: es.Identifier): void {
    super.Identifier(node);
    if (node.decorators) {
      this.rightHandNodes.push(...node.decorators);
    }
    if (node.typeAnnotation) {
      this.rightHandNodes.push(node.typeAnnotation);
    }
  }

  ArrayPattern(node: es.ArrayPattern): void {
    node.elements.forEach(this.visit, this);
    // TODO: there is no decorators in definition of ArrayPattern
    if ((node as any).decorators) {
      this.rightHandNodes.push(...(node as any).decorators);
    }
    if (node.typeAnnotation) {
      this.rightHandNodes.push(node.typeAnnotation);
    }
  }

  ObjectPattern(node: es.ObjectPattern): void {
    node.properties.forEach(this.visit, this);
    // TODO: there is no decorators in definition of ObjectPattern
    if ((node as any).decorators) {
      this.rightHandNodes.push(...(node as any).decorators);
    }
    if (node.typeAnnotation) {
      this.rightHandNodes.push(node.typeAnnotation);
    }
  }

  RestElement(node: es.RestElement): void {
    super.RestElement(node);
    if (node.typeAnnotation) {
      this.rightHandNodes.push(node.typeAnnotation);
    }
  }
}

class Referencer extends OriginalReferencer {
  protected typeMode: boolean;

  constructor(options: any, scopeManager: ScopeManager) {
    super(options, scopeManager);
    this.typeMode = false;
  }

  /**
   * Override to use PatternVisitor we overrode.
   * @param node The Identifier node to visit.
   * @param [options] The flag to visit right-hand side nodes.
   * @param callback The callback function for left-hand side nodes.
   */
  visitPattern<T extends es.BaseNode>(
    node: T,
    options: PatternVisitorOptions,
    callback: PatternVisitorCallback
  ): void {
    if (!node) {
      return;
    }

    if (typeof options === 'function') {
      callback = options;
      options = { processRightHandNodes: false };
    }

    const visitor = new PatternVisitor(this.options, node, callback);
    visitor.visit(node);

    if (options.processRightHandNodes) {
      // @ts-ignore
      visitor.rightHandNodes.forEach(this.visit, this);
    }
  }

  /**
   * Override.
   * Visit `node.typeParameters` and `node.returnType` additionally to find `typeof` expressions.
   * @param node The function node to visit.
   */
  visitFunction(
    node:
      | es.FunctionDeclaration
      | es.FunctionExpression
      | es.ArrowFunctionExpression
  ): void {
    const { type, id, typeParameters, params, returnType, body } = node;
    const scopeManager = this.scopeManager;
    const upperScope = this.currentScope();

    // Process the name.
    if (type === 'FunctionDeclaration' && id) {
      upperScope.__define(
        id,
        new Definition('FunctionName', id, node, null, null, null)
      );

      // Remove overload definition to avoid confusion of no-redeclare rule.
      const { defs, identifiers } = upperScope.set.get(id.name)!;
      for (let i = 0; i < defs.length; ++i) {
        const def = defs[i];
        if (
          def.type === 'FunctionName' &&
          // @ts-ignore
          def.node.type === 'TSDeclareFunction'
        ) {
          defs.splice(i, 1);
          identifiers.splice(i, 1);
          break;
        }
      }
    } else if (type === 'FunctionExpression' && id) {
      scopeManager.__nestFunctionExpressionNameScope(node);
    }

    // Process the type parameters
    this.visit(typeParameters);

    // Open the function scope.
    scopeManager.__nestFunctionScope(node, this.isInnerMethodDefinition);
    const innerScope = this.currentScope();

    // Process parameter declarations.
    for (let i = 0; i < params.length; ++i) {
      this.visitPattern(
        params[i],
        { processRightHandNodes: true },
        (pattern, info) => {
          innerScope.__define(
            pattern,
            new ParameterDefinition(pattern, node, i, info.rest)
          );
          this.referencingDefaultValue(pattern, info.assignments, null, true);
        }
      );
    }

    // Process the return type.
    this.visit(returnType);

    // Process the body.
    if (body && body.type === 'BlockStatement') {
      this.visitChildren(body);
    } else {
      this.visit(body);
    }

    // Close the function scope.
    this.close(node);
  }

  /**
   * Override.
   * Visit decorators.
   * @param node The class node to visit.
   */
  visitClass(node: es.ClassDeclaration | es.ClassExpression): void {
    this.visitDecorators(node.decorators);

    const upperTypeMode = this.typeMode;
    this.typeMode = true;
    if (node.superTypeParameters) {
      this.visit(node.superTypeParameters);
    }
    if (node.implements) {
      node.implements.forEach(this.visit, this);
    }
    this.typeMode = upperTypeMode;

    super.visitClass(node);
  }

  /**
   * Visit typeParameters.
   * @param node The node to visit.
   */
  visitTypeParameters(node: {
    typeParameters?:
      | es.TSTypeParameterDeclaration
      | es.TSTypeParameterInstantiation;
  }): void {
    if (node.typeParameters) {
      const upperTypeMode = this.typeMode;
      this.typeMode = true;
      this.visit(node.typeParameters);
      this.typeMode = upperTypeMode;
    }
  }

  /**
   * Override.
   */
  JSXOpeningElement(node: es.JSXOpeningElement): void {
    this.visit(node.name);
    this.visitTypeParameters(node);
    node.attributes.forEach(this.visit, this);
  }

  /**
   * Override.
   * Don't create the reference object in the type mode.
   * @param node The Identifier node to visit.
   */
  Identifier(node: es.Identifier): void {
    this.visitDecorators(node.decorators);

    if (!this.typeMode) {
      super.Identifier(node);
    }

    this.visit(node.typeAnnotation);
  }

  /**
   * Override.
   * Visit decorators.
   * @param node The MethodDefinition node to visit.
   */
  MethodDefinition(
    node: es.MethodDefinition | es.TSAbstractMethodDefinition
  ): void {
    this.visitDecorators(node.decorators);
    super.MethodDefinition(node);
  }

  /**
   * Don't create the reference object for the key if not computed.
   * @param node The ClassProperty node to visit.
   */
  ClassProperty(node: es.ClassProperty | es.TSAbstractClassProperty): void {
    const upperTypeMode = this.typeMode;
    const { computed, decorators, key, typeAnnotation, value } = node;

    this.typeMode = false;
    this.visitDecorators(decorators);
    if (computed) {
      this.visit(key);
    }
    this.typeMode = true;
    this.visit(typeAnnotation);
    this.typeMode = false;
    this.visit(value);

    this.typeMode = upperTypeMode;
  }

  /**
   * Visit new expression.
   * @param node The NewExpression node to visit.
   */
  NewExpression(node: es.NewExpression): void {
    this.visitTypeParameters(node);
    this.visit(node.callee);
    if (node.arguments) {
      node.arguments.forEach(this.visit, this);
    }
  }

  /**
   * Override.
   * Visit call expression.
   * @param node The CallExpression node to visit.
   */
  CallExpression(node: es.CallExpression): void {
    this.visitTypeParameters(node);

    this.visit(node.callee);
    if (node.arguments) {
      node.arguments.forEach(this.visit, this);
    }
  }

  /**
   * Define the variable of this function declaration only once.
   * Because to avoid confusion of `no-redeclare` rule by overloading.
   * @param node The TSDeclareFunction node to visit.
   */
  TSDeclareFunction(node: es.TSDeclareFunction): void {
    const upperTypeMode = this.typeMode;
    const scope = this.currentScope();
    const { id, typeParameters, params, returnType } = node;

    // Ignore this if other overloadings have already existed.
    if (id) {
      const variable = scope.set.get(id.name);
      const defs = variable && variable.defs;
      const existed = defs && defs.some(d => d.type === 'FunctionName');
      if (!existed) {
        scope.__define(
          id,
          new Definition('FunctionName', id, node, null, null, null)
        );
      }
    }

    // Find `typeof` expressions.
    this.typeMode = true;
    this.visit(typeParameters);
    params.forEach(this.visit, this);
    this.visit(returnType);
    this.typeMode = upperTypeMode;
  }

  /**
   * Create reference objects for the references in parameters and return type.
   * @param node The TSEmptyBodyFunctionExpression node to visit.
   */
  TSEmptyBodyFunctionExpression(node: es.FunctionExpression): void {
    const upperTypeMode = this.typeMode;
    const { typeParameters, params, returnType } = node;

    this.typeMode = true;
    this.visit(typeParameters);
    params.forEach(this.visit, this);
    this.visit(returnType);
    this.typeMode = upperTypeMode;
  }

  /**
   * Don't make variable because it declares only types.
   * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
   * @param node The TSInterfaceDeclaration node to visit.
   */
  TSInterfaceDeclaration(node: es.TSInterfaceDeclaration): void {
    this.visitTypeNodes(node);
  }

  /**
   * Don't make variable because it declares only types.
   * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
   * @param node The TSClassImplements node to visit.
   */
  TSClassImplements(node: es.TSClassImplements): void {
    this.visitTypeNodes(node);
  }

  /**
   * Don't make variable because it declares only types.
   * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
   * @param node The TSIndexSignature node to visit.
   */
  TSIndexSignature(node: es.TSIndexSignature): void {
    this.visitTypeNodes(node);
  }

  /**
   * Visit type assertion.
   * @param node The TSTypeAssertion node to visit.
   */
  TSTypeAssertion(node: es.TSTypeAssertion): void {
    if (this.typeMode) {
      this.visit(node.typeAnnotation);
    } else {
      this.typeMode = true;
      this.visit(node.typeAnnotation);
      this.typeMode = false;
    }

    this.visit(node.expression);
  }

  /**
   * Visit as expression.
   * @param node The TSAsExpression node to visit.
   */
  TSAsExpression(node: es.TSAsExpression): void {
    this.visit(node.expression);

    if (this.typeMode) {
      this.visit(node.typeAnnotation);
    } else {
      this.typeMode = true;
      this.visit(node.typeAnnotation);
      this.typeMode = false;
    }
  }

  /**
   * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
   * @param node The TSTypeAnnotation node to visit.
   */
  TSTypeAnnotation(node: es.TSTypeAnnotation): void {
    this.visitTypeNodes(node);
  }

  /**
   * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
   * @param node The TSTypeParameterDeclaration node to visit.
   */
  TSTypeParameterDeclaration(node: es.TSTypeParameterDeclaration): void {
    this.visitTypeNodes(node);
  }

  /**
   * Create reference objects for the references in `typeof` expression.
   * @param node The TSTypeQuery node to visit.
   */
  TSTypeQuery(node: es.TSTypeQuery): void {
    if (this.typeMode) {
      this.typeMode = false;
      this.visitChildren(node);
      this.typeMode = true;
    } else {
      this.visitChildren(node);
    }
  }

  /**
   * @param node The TSTypeParameter node to visit.
   */
  TSTypeParameter(node: es.TSTypeParameter): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSInferType node to visit.
   */
  TSInferType(node: es.TSInferType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSTypeReference node to visit.
   */
  TSTypeReference(node: es.TSTypeReference): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSTypeLiteral node to visit.
   */
  TSTypeLiteral(node: es.TSTypeLiteral): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSLiteralType node to visit.
   */
  TSLiteralType(node: es.TSLiteralType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSIntersectionType node to visit.
   */
  TSIntersectionType(node: es.TSIntersectionType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSConditionalType node to visit.
   */
  TSConditionalType(node: es.TSConditionalType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSIndexedAccessType node to visit.
   */
  TSIndexedAccessType(node: es.TSIndexedAccessType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSMappedType node to visit.
   */
  TSMappedType(node: es.TSMappedType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSOptionalType node to visit.
   */
  TSOptionalType(node: es.TSOptionalType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSParenthesizedType node to visit.
   */
  TSParenthesizedType(node: es.TSParenthesizedType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSRestType node to visit.
   */
  TSRestType(node: es.TSRestType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSTupleType node to visit.
   */
  TSTupleType(node: es.TSTupleType): void {
    this.visitTypeNodes(node);
  }

  /**
   * Create reference objects for the object part. (This is `obj.prop`)
   * @param node The TSQualifiedName node to visit.
   */
  TSQualifiedName(node: es.TSQualifiedName): void {
    this.visit(node.left);
  }

  /**
   * Create reference objects for the references in computed keys.
   * @param node The TSPropertySignature node to visit.
   */
  TSPropertySignature(node: es.TSPropertySignature): void {
    const upperTypeMode = this.typeMode;
    const { computed, key, typeAnnotation, initializer } = node;

    if (computed) {
      this.typeMode = false;
      this.visit(key);
      this.typeMode = true;
    } else {
      this.typeMode = true;
      this.visit(key);
    }
    this.visit(typeAnnotation);
    this.visit(initializer);

    this.typeMode = upperTypeMode;
  }

  /**
   * Create reference objects for the references in computed keys.
   * @param node The TSMethodSignature node to visit.
   */
  TSMethodSignature(node: es.TSMethodSignature): void {
    const upperTypeMode = this.typeMode;
    const { computed, key, typeParameters, params, returnType } = node;

    if (computed) {
      this.typeMode = false;
      this.visit(key);
      this.typeMode = true;
    } else {
      this.typeMode = true;
      this.visit(key);
    }
    this.visit(typeParameters);
    params.forEach(this.visit, this);
    this.visit(returnType);

    this.typeMode = upperTypeMode;
  }

  /**
   * Create variable object for the enum.
   * The enum declaration creates a scope for the enum members.
   *
   * enum E {
   *   A,
   *   B,
   *   C = A + B // A and B are references to the enum member.
   * }
   *
   * const a = 0
   * enum E {
   *   A = a // a is above constant.
   * }
   *
   * @param node The TSEnumDeclaration node to visit.
   */
  TSEnumDeclaration(node: es.TSEnumDeclaration): void {
    const { id, members } = node;
    const scopeManager = this.scopeManager;
    const scope = this.currentScope();

    if (id) {
      scope.__define(id, new Definition('EnumName', id, node));
    }

    scopeManager.__nestScope(new EnumScope(scopeManager, scope, node));
    for (const member of members) {
      this.visit(member);
    }
    this.close(node);
  }

  /**
   * Create variable object for the enum member and create reference object for the initializer.
   * And visit the initializer.
   *
   * @param node The TSEnumMember node to visit.
   */
  TSEnumMember(node: es.TSEnumMember): void {
    const { id, initializer } = node;
    const scope = this.currentScope();

    scope.__define(id, new Definition('EnumMemberName', id, node));
    if (initializer) {
      scope.__referencing(id, Reference.WRITE, initializer, null, false, true);
      this.visit(initializer);
    }
  }

  /**
   * Create the variable object for the module name, and visit children.
   * @param node The TSModuleDeclaration node to visit.
   */
  TSModuleDeclaration(node: es.TSModuleDeclaration): void {
    const scope = this.currentScope();
    const { id, body } = node;

    if (node.global) {
      this.visitGlobalAugmentation(node);
      return;
    }

    if (id && id.type === 'Identifier') {
      scope.__define(
        id,
        new Definition('NamespaceName', id, node, null, null, null)
      );
    }
    this.visit(body);
  }

  TSTypeAliasDeclaration(node: es.TSTypeAliasDeclaration): void {
    this.typeMode = true;
    this.visitChildren(node);
    this.typeMode = false;
  }

  /**
   * Process the module block.
   * @param node The TSModuleBlock node to visit.
   */
  TSModuleBlock(node: es.TSModuleBlock): void {
    this.scopeManager.__nestBlockScope(node);
    this.visitChildren(node);
    this.close(node);
  }

  TSAbstractClassProperty(node: es.TSAbstractClassProperty): void {
    this.ClassProperty(node);
  }
  TSAbstractMethodDefinition(node: es.TSAbstractMethodDefinition): void {
    this.MethodDefinition(node);
  }

  /**
   * Process import equal declaration
   * @param node The TSImportEqualsDeclaration node to visit.
   */
  TSImportEqualsDeclaration(node: es.TSImportEqualsDeclaration): void {
    const { id, moduleReference } = node;
    if (id && id.type === 'Identifier') {
      this.currentScope().__define(
        id,
        new Definition('ImportBinding', id, node, null, null, null)
      );
    }
    this.visit(moduleReference);
  }

  /**
   * Process the global augmentation.
   * 1. Set the global scope as the current scope.
   * 2. Configure the global scope to set `variable.eslintUsed = true` for all defined variables. This means `no-unused-vars` doesn't warn those.
   * @param node The TSModuleDeclaration node to visit.
   */
  visitGlobalAugmentation(node: es.TSModuleDeclaration): void {
    const scopeManager = this.scopeManager;
    const currentScope = this.currentScope();
    const globalScope = scopeManager.globalScope;
    const originalDefine = globalScope.__define;

    globalScope.__define = overrideDefine(originalDefine);
    scopeManager.__currentScope = globalScope;

    // Skip TSModuleBlock to avoid to create that block scope.
    if (node.body && node.body.type === 'TSModuleBlock') {
      node.body.body.forEach(this.visit, this);
    }

    scopeManager.__currentScope = currentScope;
    globalScope.__define = originalDefine;
  }

  /**
   * Process decorators.
   * @param decorators The decorator nodes to visit.
   */
  visitDecorators(decorators?: es.Decorator[]): void {
    if (decorators) {
      decorators.forEach(this.visit, this);
    }
  }

  /**
   * Process all child of type nodes
   * @param node node to be processed
   */
  visitTypeNodes(node: es.Node): void {
    if (this.typeMode) {
      this.visitChildren(node);
    } else {
      this.typeMode = true;
      this.visitChildren(node);
      this.typeMode = false;
    }
  }
}

export function analyzeScope(ast: any, parserOptions: ParserOptions) {
  const options = {
    ignoreEval: true,
    optimistic: false,
    directive: false,
    nodejsScope:
      parserOptions.sourceType === 'script' &&
      (parserOptions.ecmaFeatures &&
        parserOptions.ecmaFeatures.globalReturn) === true,
    impliedStrict: false,
    sourceType: parserOptions.sourceType,
    ecmaVersion: parserOptions.ecmaVersion || 2018,
    childVisitorKeys,
    fallback
  };

  const scopeManager = new ScopeManager(options);
  const referencer = new Referencer(options, scopeManager);

  referencer.visit(ast);

  return scopeManager;
}

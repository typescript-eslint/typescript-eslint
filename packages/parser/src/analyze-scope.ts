import Reference from 'eslint-scope/lib/reference';
import OriginalReferencer from 'eslint-scope/lib/referencer';
import { getKeys as fallback } from 'eslint-visitor-keys';
import { ParserOptions } from './parser-options';
import { visitorKeys as childVisitorKeys } from './visitor-keys';
import {
  PatternVisitorCallback,
  PatternVisitorOptions
} from 'eslint-scope/lib/options';
import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';

import {
  Definition,
  ParameterDefinition,
  TypeDefinition
} from './scope/definition';
import { typeReferencing } from './scope/reference';
import { ScopeManager } from './scope/scope-manager';
import { PatternVisitor } from './scope/pattern-visitor';
import { Scope } from './scope/scopes';

class Referencer extends OriginalReferencer<Scope, ScopeManager> {
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
  visitPattern<T extends TSESTree.BaseNode>(
    node: T,
    options: PatternVisitorOptions | PatternVisitorCallback,
    callback?: PatternVisitorCallback
  ): void {
    if (!node) {
      return;
    }

    if (typeof options === 'function') {
      callback = options;
      options = { processRightHandNodes: false };
    }

    const visitor = new PatternVisitor(this.options, node, callback!);
    visitor.visit(node);

    // Process the right hand nodes recursively.
    if (options.processRightHandNodes) {
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
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression
      | TSESTree.ArrowFunctionExpression
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

    // Open the function scope.
    scopeManager.__nestFunctionScope(node, this.isInnerMethodDefinition);
    const innerScope = this.currentScope();

    // Process the type parameters
    this.visit(typeParameters);

    // Process parameter declarations.
    for (let i = 0; i < params.length; ++i) {
      this.visitPattern(
        params[i],
        { processRightHandNodes: true },
        (pattern, info) => {
          if (
            pattern.type !== AST_NODE_TYPES.Identifier ||
            pattern.name !== 'this'
          ) {
            innerScope.__define(
              pattern,
              new ParameterDefinition(pattern, node, i, info.rest)
            );
            this.referencingDefaultValue(pattern, info.assignments, null, true);
          }
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
  visitClass(node: TSESTree.ClassDeclaration | TSESTree.ClassExpression): void {
    if (node.type === AST_NODE_TYPES.ClassDeclaration && node.id) {
      this.currentScope().__define(
        node.id,
        new Definition('ClassName', node.id, node, null, null, null)
      );
    }

    this.visitDecorators(node.decorators);
    this.visit(node.superClass);

    this.scopeManager.__nestClassScope(node);

    if (node.id) {
      this.currentScope().__define(
        node.id,
        new Definition('ClassName', node.id, node)
      );
    }

    const upperTypeMode = this.typeMode;
    this.typeMode = true;
    if (node.typeParameters) {
      this.visit(node.typeParameters);
    }
    if (node.superTypeParameters) {
      this.visit(node.superTypeParameters);
    }
    if (node.implements) {
      node.implements.forEach(this.visit, this);
    }
    this.typeMode = upperTypeMode;

    this.visit(node.body);

    this.close(node);
  }

  /**
   * Visit typeParameters.
   * @param node The node to visit.
   */
  visitTypeParameters(node: {
    typeParameters?:
      | TSESTree.TSTypeParameterDeclaration
      | TSESTree.TSTypeParameterInstantiation;
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
  JSXOpeningElement(node: TSESTree.JSXOpeningElement): void {
    this.visit(node.name);
    this.visitTypeParameters(node);
    node.attributes.forEach(this.visit, this);
  }

  /**
   * Override.
   * Don't create the reference object in the type mode.
   * @param node The Identifier node to visit.
   */
  Identifier(node: TSESTree.Identifier): void {
    const currentScope = this.currentScope();

    this.visitDecorators(node.decorators);

    if (this.typeMode) {
      typeReferencing(currentScope, node);
    } else {
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
    node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
  ): void {
    this.visitDecorators(node.decorators);
    super.MethodDefinition(node);
  }

  /**
   * Don't create the reference object for the key if not computed.
   * @param node The ClassProperty node to visit.
   */
  ClassProperty(
    node: TSESTree.ClassProperty | TSESTree.TSAbstractClassProperty
  ): void {
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
  NewExpression(node: TSESTree.NewExpression): void {
    this.visitTypeParameters(node);
    this.visit(node.callee);

    node.arguments.forEach(this.visit, this);
  }

  /**
   * Override.
   * Visit call expression.
   * @param node The CallExpression node to visit.
   */
  CallExpression(node: TSESTree.CallExpression): void {
    this.visitTypeParameters(node);

    this.visit(node.callee);

    node.arguments.forEach(this.visit, this);
  }

  /**
   * Define the variable of this function declaration only once.
   * Because to avoid confusion of `no-redeclare` rule by overloading.
   * @param node The TSDeclareFunction node to visit.
   */
  TSDeclareFunction(node: TSESTree.TSDeclareFunction): void {
    const scopeManager = this.scopeManager;
    const upperScope = this.currentScope();
    const { id, typeParameters, params, returnType } = node;

    // Ignore this if other overloadings have already existed.
    if (id) {
      const variable = upperScope.set.get(id.name);
      const defs = variable && variable.defs;
      const existed = defs && defs.some(d => d.type === 'FunctionName');
      if (!existed) {
        upperScope.__define(
          id,
          new Definition('FunctionName', id, node, null, null, null)
        );
      }
    }

    // Open the function scope.
    scopeManager.__nestEmptyFunctionScope(node);
    const innerScope = this.currentScope();

    // Process the type parameters
    this.visit(typeParameters);

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

          // Set `variable.eslintUsed` to tell ESLint that the variable is used.
          const variable = innerScope.set.get(pattern.name);
          if (variable) {
            variable.eslintUsed = true;
          }
          this.referencingDefaultValue(pattern, info.assignments, null, true);
        }
      );
    }

    // Process the return type.
    this.visit(returnType);

    // Close the function scope.
    this.close(node);
  }

  /**
   * Create reference objects for the references in parameters and return type.
   * @param node The TSEmptyBodyFunctionExpression node to visit.
   */
  TSEmptyBodyFunctionExpression(
    node: TSESTree.TSEmptyBodyFunctionExpression
  ): void {
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
  TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration): void {
    const upperTypeMode = this.typeMode;
    this.typeMode = true;

    const scopeManager = this.scopeManager;
    const scope = this.currentScope();

    if (node.id) {
      scope.__defineType(
        node.id,
        new TypeDefinition('InterfaceName', node.id, node, null, null, null)
      );
    }

    scopeManager.__nestInterfaceScope(node);

    this.visit(node.typeParameters);

    if (node.extends) {
      node.extends.forEach(this.visit, this);
    }

    this.visit(node.body);
    this.close(node);

    this.typeMode = upperTypeMode;
  }

  /**
   * Don't make variable because it declares only types.
   * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
   * @param node The TSClassImplements node to visit.
   */
  TSClassImplements(node: TSESTree.TSClassImplements): void {
    this.visitTypeNodes(node);
  }

  /**
   * Don't make variable because it declares only types.
   * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
   * @param node The TSIndexSignature node to visit.
   */
  TSIndexSignature(node: TSESTree.TSIndexSignature): void {
    const upperType = this.typeMode;
    this.typeMode = true;
    let i: number;
    let iz: number;

    // Process parameter declarations.
    for (i = 0, iz = node.parameters.length; i < iz; ++i) {
      this.visitPattern(
        node.parameters[i],
        { processRightHandNodes: true },
        () => {}
      );
    }

    this.visit(node.typeAnnotation);

    this.typeMode = upperType;
  }

  /**
   * Visit type assertion.
   * @param node The TSTypeAssertion node to visit.
   */
  TSTypeAssertion(node: TSESTree.TSTypeAssertion): void {
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
  TSAsExpression(node: TSESTree.TSAsExpression): void {
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
  TSTypeAnnotation(node: TSESTree.TSTypeAnnotation): void {
    this.visitTypeNodes(node);
  }

  /**
   * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
   * @param node The TSTypeParameterDeclaration node to visit.
   */
  TSTypeParameterDeclaration(node: TSESTree.TSTypeParameterDeclaration): void {
    let i: number, iz: number;

    // Process parameter declarations.
    for (i = 0, iz = node.params.length; i < iz; ++i) {
      this.visitPattern(
        node.params[i],
        { processRightHandNodes: true },
        (pattern, info) => {
          this.currentScope().__defineType(
            pattern,
            new TypeDefinition('TypeParameter', pattern, node, null, i)
          );

          this.referencingDefaultValue(pattern, info.assignments, null, true);
        }
      );
    }
  }

  /**
   * Create reference objects for the references in `typeof` expression.
   * @param node The TSTypeQuery node to visit.
   */
  TSTypeQuery(node: TSESTree.TSTypeQuery): void {
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
  TSTypeParameter(node: TSESTree.TSTypeParameter): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSInferType node to visit.
   */
  TSInferType(node: TSESTree.TSInferType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSTypeReference node to visit.
   */
  TSTypeReference(node: TSESTree.TSTypeReference): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSTypeLiteral node to visit.
   */
  TSTypeLiteral(node: TSESTree.TSTypeLiteral): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSLiteralType node to visit.
   */
  TSLiteralType(node: TSESTree.TSLiteralType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSIntersectionType node to visit.
   */
  TSIntersectionType(node: TSESTree.TSIntersectionType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSConditionalType node to visit.
   */
  TSConditionalType(node: TSESTree.TSConditionalType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSIndexedAccessType node to visit.
   */
  TSIndexedAccessType(node: TSESTree.TSIndexedAccessType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSMappedType node to visit.
   */
  TSMappedType(node: TSESTree.TSMappedType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSOptionalType node to visit.
   */
  TSOptionalType(node: TSESTree.TSOptionalType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSParenthesizedType node to visit.
   */
  TSParenthesizedType(node: TSESTree.TSParenthesizedType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSRestType node to visit.
   */
  TSRestType(node: TSESTree.TSRestType): void {
    this.visitTypeNodes(node);
  }

  /**
   * @param node The TSTupleType node to visit.
   */
  TSTupleType(node: TSESTree.TSTupleType): void {
    this.visitTypeNodes(node);
  }

  /**
   * Create reference objects for the object part. (This is `obj.prop`)
   * @param node The TSQualifiedName node to visit.
   */
  TSQualifiedName(node: TSESTree.TSQualifiedName): void {
    this.visit(node.left);
  }

  /**
   * Create reference objects for the references in computed keys.
   * @param node The TSPropertySignature node to visit.
   */
  TSPropertySignature(node: TSESTree.TSPropertySignature): void {
    this.visitTypeProperty(node);
  }

  /**
   * Create reference objects for the references in computed keys.
   * @param node The TSMethodSignature node to visit.
   */
  TSMethodSignature(node: TSESTree.TSMethodSignature): void {
    this.visitTypeFunctionSignature(node);
  }

  TSConstructorType(node: TSESTree.TSConstructorType): void {
    this.visitTypeFunctionSignature(node);
  }

  TSConstructSignatureDeclaration(
    node: TSESTree.TSConstructSignatureDeclaration
  ): void {
    this.visitTypeFunctionSignature(node);
  }

  TSCallSignatureDeclaration(node: TSESTree.TSCallSignatureDeclaration): void {
    this.visitTypeFunctionSignature(node);
  }

  TSFunctionType(node: TSESTree.TSFunctionType) {
    this.visitTypeFunctionSignature(node);
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
  TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
    const { id, members } = node;
    const scopeManager = this.scopeManager;
    const scope = this.currentScope();

    if (id) {
      scope.__define(id, new Definition('EnumName', id, node));
    }

    scopeManager.__nestEnumScope(node);
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
  TSEnumMember(node: TSESTree.TSEnumMember): void {
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
  TSModuleDeclaration(node: TSESTree.TSModuleDeclaration): void {
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

  TSTypeAliasDeclaration(node: TSESTree.TSTypeAliasDeclaration): void {
    const scopeManager = this.scopeManager;
    const scope = this.currentScope();
    this.typeMode = true;

    if (node.id && node.id.type === 'Identifier') {
      scope.__defineType(
        node.id,
        new Definition('TypeAliasName', node.id, node, null, null, 'type')
      );
    }

    scopeManager.__nestTypeAliasScope(node);

    if (node.typeParameters) {
      this.visit(node.typeParameters);
    }

    if (node.typeAnnotation) {
      this.visit(node.typeAnnotation);
    }

    this.close(node);

    this.typeMode = false;
  }

  /**
   * Process the module block.
   * @param node The TSModuleBlock node to visit.
   */
  TSModuleBlock(node: TSESTree.TSModuleBlock): void {
    this.scopeManager.__nestBlockScope(node);
    this.visitChildren(node);
    this.close(node);
  }

  TSAbstractClassProperty(node: TSESTree.TSAbstractClassProperty): void {
    this.ClassProperty(node);
  }

  TSAbstractMethodDefinition(node: TSESTree.TSAbstractMethodDefinition): void {
    this.MethodDefinition(node);
  }

  /**
   * Process import equal declaration
   * @param node The TSImportEqualsDeclaration node to visit.
   */
  TSImportEqualsDeclaration(node: TSESTree.TSImportEqualsDeclaration): void {
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
  visitGlobalAugmentation(node: TSESTree.TSModuleDeclaration): void {
    const scopeManager = this.scopeManager;
    const currentScope = this.currentScope();
    scopeManager.__currentScope = scopeManager.globalScope;

    // Skip TSModuleBlock to avoid to create that block scope.
    if (node.body && node.body.type === 'TSModuleBlock') {
      node.body.body.forEach(this.visit, this);
    }

    scopeManager.__currentScope = currentScope;
  }

  /**
   * Process decorators.
   * @param decorators The decorator nodes to visit.
   */
  visitDecorators(decorators?: TSESTree.Decorator[]): void {
    if (decorators) {
      decorators.forEach(this.visit, this);
    }
  }

  /**
   * Process all child of type nodes
   * @param node node to be processed
   */
  visitTypeNodes(node: TSESTree.Node): void {
    if (this.typeMode) {
      this.visitChildren(node);
    } else {
      this.typeMode = true;
      this.visitChildren(node);
      this.typeMode = false;
    }
  }

  /**
   * Create reference objects for the references in computed keys.
   * @param node The TSMethodSignature node to visit.
   */
  visitTypeFunctionSignature(
    node:
      | TSESTree.TSMethodSignature
      | TSESTree.TSConstructorType
      | TSESTree.TSConstructSignatureDeclaration
      | TSESTree.TSCallSignatureDeclaration
      | TSESTree.TSFunctionType
  ): void {
    const upperTypeMode = this.typeMode;
    this.typeMode = true;

    if (node.type === AST_NODE_TYPES.TSMethodSignature) {
      if (node.computed) {
        this.visit(node.key);
      }
    }

    this.visit(node.typeParameters);
    node.params.forEach(this.visit, this);
    this.visit(node.returnType);

    this.typeMode = upperTypeMode;
  }

  visitTypeProperty(node: TSESTree.TSPropertySignature) {
    const upperTypeMode = this.typeMode;

    if (node.computed) {
      this.visit(node.key);
    }

    this.visit(node.typeAnnotation);
    this.visit(node.initializer);

    this.typeMode = upperTypeMode;
  }

  /**
   * @param node
   */
  visitProperty(
    node:
      | TSESTree.MethodDefinition
      | TSESTree.TSAbstractMethodDefinition
      | TSESTree.Property
  ) {
    let previous = false;

    if (node.computed) {
      this.visit(node.key);
    }

    const isMethodDefinition =
      node.type === AST_NODE_TYPES.MethodDefinition ||
      node.type === AST_NODE_TYPES.TSAbstractMethodDefinition;

    if (isMethodDefinition) {
      previous = this.pushInnerMethodDefinition(true);
    }
    if ('value' in node) {
      this.visit(node.value);
    }
    if (isMethodDefinition) {
      this.popInnerMethodDefinition(previous);
    }
  }
}

export function analyzeScope(
  ast: any,
  parserOptions: ParserOptions
): ScopeManager {
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

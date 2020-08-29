import { AST_NODE_TYPES, Lib, TSESTree } from '@typescript-eslint/types';
import { ExportVisitor } from './ExportVisitor';
import { ImportVisitor } from './ImportVisitor';
import { PatternVisitor } from './PatternVisitor';
import { ReferenceFlag, ReferenceImplicitGlobal } from './Reference';
import { ScopeManager } from '../ScopeManager';
import { TypeVisitor } from './TypeVisitor';
import { Visitor, VisitorOptions } from './Visitor';
import { assert } from '../assert';
import {
  CatchClauseDefinition,
  ClassNameDefinition,
  FunctionNameDefinition,
  ImportBindingDefinition,
  ParameterDefinition,
  TSEnumMemberDefinition,
  TSEnumNameDefinition,
  TSModuleNameDefinition,
  VariableDefinition,
} from '../definition';
import { lib as TSLibraries } from '../lib';
import { Scope, GlobalScope } from '../scope';

interface ReferencerOptions extends VisitorOptions {
  lib: Lib[];
}

// Referencing variables and creating bindings.
class Referencer extends Visitor {
  #isInnerMethodDefinition: boolean;
  #lib: Lib[];
  public readonly scopeManager: ScopeManager;

  constructor(options: ReferencerOptions, scopeManager: ScopeManager) {
    super(options);
    this.scopeManager = scopeManager;
    this.#lib = options.lib;
    this.#isInnerMethodDefinition = false;
  }

  public currentScope(): Scope;
  public currentScope(throwOnNull: true): Scope | null;
  public currentScope(dontThrowOnNull?: true): Scope | null {
    if (!dontThrowOnNull) {
      assert(this.scopeManager.currentScope, 'aaa');
    }
    return this.scopeManager.currentScope;
  }

  public close(node: TSESTree.Node): void {
    while (this.currentScope(true) && node === this.currentScope().block) {
      this.scopeManager.currentScope = this.currentScope().close(
        this.scopeManager,
      );
    }
  }

  protected pushInnerMethodDefinition(
    isInnerMethodDefinition: boolean,
  ): boolean {
    const previous = this.#isInnerMethodDefinition;

    this.#isInnerMethodDefinition = isInnerMethodDefinition;
    return previous;
  }

  protected popInnerMethodDefinition(
    isInnerMethodDefinition: boolean | undefined,
  ): void {
    this.#isInnerMethodDefinition = !!isInnerMethodDefinition;
  }

  protected referencingDefaultValue(
    pattern: TSESTree.Identifier,
    assignments: (TSESTree.AssignmentExpression | TSESTree.AssignmentPattern)[],
    maybeImplicitGlobal: ReferenceImplicitGlobal | null,
    init: boolean,
  ): void {
    assignments.forEach(assignment => {
      this.currentScope().referenceValue(
        pattern,
        ReferenceFlag.Write,
        assignment.right,
        maybeImplicitGlobal,
        init,
      );
    });
  }

  private populateGlobalsFromLib(globalScope: GlobalScope): void {
    for (const lib of this.#lib) {
      const variables = TSLibraries[lib];
      /* istanbul ignore if */ if (!variables) {
        throw new Error(`Invalid value for lib provided: ${lib}`);
      }
      for (const variable of Object.values(variables)) {
        globalScope.defineImplicitVariable(variable);
      }
    }
  }

  ///////////////////
  // Visit helpers //
  ///////////////////

  protected visitClass(
    node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  ): void {
    if (node.type === AST_NODE_TYPES.ClassDeclaration && node.id) {
      this.currentScope().defineIdentifier(
        node.id,
        new ClassNameDefinition(node.id, node),
      );
    }

    node.decorators?.forEach(d => this.visit(d));

    this.scopeManager.nestClassScope(node);

    if (node.id) {
      // define the class name again inside the new scope
      // references to the class should not resolve directly to the parent class
      this.currentScope().defineIdentifier(
        node.id,
        new ClassNameDefinition(node.id, node),
      );
    }

    this.visit(node.superClass);

    // visit the type param declarations
    this.visitType(node.typeParameters);
    // then the usages
    this.visitType(node.superTypeParameters);
    node.implements?.forEach(imp => this.visitType(imp));

    this.visit(node.body);

    this.close(node);
  }

  protected visitForIn(
    node: TSESTree.ForInStatement | TSESTree.ForOfStatement,
  ): void {
    if (
      node.left.type === AST_NODE_TYPES.VariableDeclaration &&
      node.left.kind !== 'var'
    ) {
      this.scopeManager.nestForScope(node);
    }

    if (node.left.type === AST_NODE_TYPES.VariableDeclaration) {
      this.visit(node.left);
      this.visitPattern(node.left.declarations[0].id, pattern => {
        this.currentScope().referenceValue(
          pattern,
          ReferenceFlag.Write,
          node.right,
          null,
          true,
        );
      });
    } else {
      this.visitPattern(
        node.left,
        (pattern, info) => {
          const maybeImplicitGlobal = !this.currentScope().isStrict
            ? {
                pattern,
                node,
              }
            : null;
          this.referencingDefaultValue(
            pattern,
            info.assignments,
            maybeImplicitGlobal,
            false,
          );
          this.currentScope().referenceValue(
            pattern,
            ReferenceFlag.Write,
            node.right,
            maybeImplicitGlobal,
            false,
          );
        },
        { processRightHandNodes: true },
      );
    }
    this.visit(node.right);
    this.visit(node.body);

    this.close(node);
  }

  protected visitFunctionParameterTypeAnnotation(
    node: TSESTree.Parameter,
  ): void {
    if ('typeAnnotation' in node) {
      this.visitType(node.typeAnnotation);
    } else if (node.type === AST_NODE_TYPES.AssignmentPattern) {
      this.visitType(node.left.typeAnnotation);
    } else if (node.type === AST_NODE_TYPES.TSParameterProperty) {
      this.visitFunctionParameterTypeAnnotation(node.parameter);
    }
  }
  protected visitFunction(
    node:
      | TSESTree.ArrowFunctionExpression
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression
      | TSESTree.TSDeclareFunction
      | TSESTree.TSEmptyBodyFunctionExpression,
  ): void {
    // FunctionDeclaration name is defined in upper scope
    // NOTE: Not referring variableScope. It is intended.
    // Since
    //  in ES5, FunctionDeclaration should be in FunctionBody.
    //  in ES6, FunctionDeclaration should be block scoped.

    if (node.type === AST_NODE_TYPES.FunctionExpression) {
      if (node.id) {
        // FunctionExpression with name creates its special scope;
        // FunctionExpressionNameScope.
        this.scopeManager.nestFunctionExpressionNameScope(node);
      }
    } else if (node.id) {
      // id is defined in upper scope
      this.currentScope().defineIdentifier(
        node.id,
        new FunctionNameDefinition(node.id, node),
      );
    }

    // Consider this function is in the MethodDefinition.
    this.scopeManager.nestFunctionScope(node, this.#isInnerMethodDefinition);

    // Process parameter declarations.
    for (const param of node.params) {
      this.visitPattern(
        param,
        (pattern, info) => {
          this.currentScope().defineIdentifier(
            pattern,
            new ParameterDefinition(pattern, node, info.rest),
          );

          this.referencingDefaultValue(pattern, info.assignments, null, true);
        },
        { processRightHandNodes: true },
      );
      this.visitFunctionParameterTypeAnnotation(param);
      param.decorators?.forEach(d => this.visit(d));
    }

    this.visitType(node.returnType);
    this.visitType(node.typeParameters);

    // In TypeScript there are a number of function-like constructs which have no body,
    // so check it exists before traversing
    if (node.body) {
      // Skip BlockStatement to prevent creating BlockStatement scope.
      if (node.body.type === AST_NODE_TYPES.BlockStatement) {
        this.visitChildren(node.body);
      } else {
        this.visit(node.body);
      }
    }

    this.close(node);
  }

  protected visitProperty(
    node:
      | TSESTree.ClassProperty
      | TSESTree.MethodDefinition
      | TSESTree.Property
      | TSESTree.TSAbstractClassProperty
      | TSESTree.TSAbstractMethodDefinition,
  ): void {
    let previous;

    if (node.computed) {
      this.visit(node.key);
    }

    const isMethodDefinition = node.type === AST_NODE_TYPES.MethodDefinition;
    if (isMethodDefinition) {
      previous = this.pushInnerMethodDefinition(true);
    }
    this.visit(node.value);
    if (isMethodDefinition) {
      this.popInnerMethodDefinition(previous);
    }

    if ('decorators' in node) {
      node.decorators?.forEach(d => this.visit(d));
    }
  }

  protected visitType(node: TSESTree.Node | null | undefined): void {
    if (!node) {
      return;
    }
    TypeVisitor.visit(this, node);
  }

  protected visitTypeAssertion(
    node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
  ): void {
    this.visit(node.expression);
    this.visitType(node.typeAnnotation);
  }

  /////////////////////
  // Visit selectors //
  /////////////////////

  protected ArrowFunctionExpression(
    node: TSESTree.ArrowFunctionExpression,
  ): void {
    this.visitFunction(node);
  }

  protected AssignmentExpression(node: TSESTree.AssignmentExpression): void {
    if (PatternVisitor.isPattern(node.left)) {
      if (node.operator === '=') {
        this.visitPattern(
          node.left,
          (pattern, info) => {
            const maybeImplicitGlobal = !this.currentScope().isStrict
              ? {
                  pattern,
                  node,
                }
              : null;
            this.referencingDefaultValue(
              pattern,
              info.assignments,
              maybeImplicitGlobal,
              false,
            );
            this.currentScope().referenceValue(
              pattern,
              ReferenceFlag.Write,
              node.right,
              maybeImplicitGlobal,
              false,
            );
          },
          { processRightHandNodes: true },
        );
      } else if (node.left.type === AST_NODE_TYPES.Identifier) {
        this.currentScope().referenceValue(
          node.left,
          ReferenceFlag.ReadWrite,
          node.right,
        );
      }
    } else {
      this.visit(node.left);
    }
    this.visit(node.right);
  }

  protected BlockStatement(node: TSESTree.BlockStatement): void {
    if (this.scopeManager.isES6()) {
      this.scopeManager.nestBlockScope(node);
    }

    this.visitChildren(node);

    this.close(node);
  }

  protected BreakStatement(): void {
    // don't reference the break statement's label
  }

  protected CallExpression(node: TSESTree.CallExpression): void {
    this.visitChildren(node, ['typeParameters']);
    this.visitType(node.typeParameters);
  }

  protected CatchClause(node: TSESTree.CatchClause): void {
    this.scopeManager.nestCatchScope(node);

    if (node.param) {
      const param = node.param;
      this.visitPattern(
        param,
        (pattern, info) => {
          this.currentScope().defineIdentifier(
            pattern,
            new CatchClauseDefinition(param, node),
          );
          this.referencingDefaultValue(pattern, info.assignments, null, true);
        },
        { processRightHandNodes: true },
      );
    }
    this.visit(node.body);

    this.close(node);
  }

  protected ClassExpression(node: TSESTree.ClassExpression): void {
    this.visitClass(node);
  }

  protected ClassDeclaration(node: TSESTree.ClassDeclaration): void {
    this.visitClass(node);
  }

  protected ClassProperty(node: TSESTree.ClassProperty): void {
    this.visitProperty(node);
    this.visitType(node.typeAnnotation);
  }

  protected ContinueStatement(): void {
    // don't reference the continue statement's label
  }

  protected ExportAllDeclaration(): void {
    // this defines no local variables
  }

  protected ExportDefaultDeclaration(
    node: TSESTree.ExportDefaultDeclaration,
  ): void {
    if (node.declaration.type === AST_NODE_TYPES.Identifier) {
      ExportVisitor.visit(this, node);
    } else {
      this.visit(node.declaration);
    }
  }

  protected ExportNamedDeclaration(
    node: TSESTree.ExportNamedDeclaration,
  ): void {
    if (node.declaration) {
      this.visit(node.declaration);
    } else {
      ExportVisitor.visit(this, node);
    }
  }

  protected ForInStatement(node: TSESTree.ForInStatement): void {
    this.visitForIn(node);
  }

  protected ForOfStatement(node: TSESTree.ForOfStatement): void {
    this.visitForIn(node);
  }

  protected ForStatement(node: TSESTree.ForStatement): void {
    // Create ForStatement declaration.
    // NOTE: In ES6, ForStatement dynamically generates per iteration environment. However, this is
    // a static analyzer, we only generate one scope for ForStatement.
    if (
      node.init &&
      node.init.type === AST_NODE_TYPES.VariableDeclaration &&
      node.init.kind !== 'var'
    ) {
      this.scopeManager.nestForScope(node);
    }

    this.visitChildren(node);

    this.close(node);
  }

  protected FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
    this.visitFunction(node);
  }

  protected FunctionExpression(node: TSESTree.FunctionExpression): void {
    this.visitFunction(node);
  }

  protected Identifier(node: TSESTree.Identifier): void {
    this.currentScope().referenceValue(node);
    this.visitType(node.typeAnnotation);
  }

  protected ImportDeclaration(node: TSESTree.ImportDeclaration): void {
    assert(
      this.scopeManager.isES6() && this.scopeManager.isModule(),
      'ImportDeclaration should appear when the mode is ES6 and in the module context.',
    );

    ImportVisitor.visit(this, node);
  }

  protected LabeledStatement(node: TSESTree.LabeledStatement): void {
    this.visit(node.body);
  }

  protected MemberExpression(node: TSESTree.MemberExpression): void {
    this.visit(node.object);
    if (node.computed) {
      this.visit(node.property);
    }
  }

  protected MetaProperty(): void {
    // meta properties all builtin globals
  }

  protected MethodDefinition(node: TSESTree.MethodDefinition): void {
    this.visitProperty(node);
  }

  protected NewExpression(node: TSESTree.NewExpression): void {
    this.visitChildren(node, ['typeParameters']);
    this.visitType(node.typeParameters);
  }

  protected Program(node: TSESTree.Program): void {
    const globalScope = this.scopeManager.nestGlobalScope(node);
    this.populateGlobalsFromLib(globalScope);

    if (this.scopeManager.isGlobalReturn()) {
      // Force strictness of GlobalScope to false when using node.js scope.
      this.currentScope().isStrict = false;
      this.scopeManager.nestFunctionScope(node, false);
    }

    if (this.scopeManager.isES6() && this.scopeManager.isModule()) {
      this.scopeManager.nestModuleScope(node);
    }

    if (
      this.scopeManager.isStrictModeSupported() &&
      this.scopeManager.isImpliedStrict()
    ) {
      this.currentScope().isStrict = true;
    }

    this.visitChildren(node);
    this.close(node);
  }

  protected Property(node: TSESTree.Property): void {
    this.visitProperty(node);
  }

  protected SwitchStatement(node: TSESTree.SwitchStatement): void {
    this.visit(node.discriminant);

    if (this.scopeManager.isES6()) {
      this.scopeManager.nestSwitchScope(node);
    }

    for (const switchCase of node.cases) {
      this.visit(switchCase);
    }

    this.close(node);
  }

  protected TSAbstractClassProperty(
    node: TSESTree.TSAbstractClassProperty,
  ): void {
    this.visitProperty(node);
  }

  protected TSAbstractMethodDefinition(
    node: TSESTree.TSAbstractMethodDefinition,
  ): void {
    this.visitProperty(node);
  }

  protected TSAsExpression(node: TSESTree.TSAsExpression): void {
    this.visitTypeAssertion(node);
  }

  protected TSDeclareFunction(node: TSESTree.TSDeclareFunction): void {
    this.visitFunction(node);
  }

  protected TSImportEqualsDeclaration(
    node: TSESTree.TSImportEqualsDeclaration,
  ): void {
    this.currentScope().defineIdentifier(
      node.id,
      new ImportBindingDefinition(node.id, node, node),
    );

    if (node.moduleReference.type === AST_NODE_TYPES.TSQualifiedName) {
      this.visit(node.moduleReference.left);
    } else {
      this.visit(node.moduleReference);
    }
  }

  protected TSEmptyBodyFunctionExpression(
    node: TSESTree.TSEmptyBodyFunctionExpression,
  ): void {
    this.visitFunction(node);
  }

  protected TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
    this.currentScope().defineIdentifier(
      node.id,
      new TSEnumNameDefinition(node.id, node),
    );

    // enum members can be referenced within the enum body
    this.scopeManager.nestTSEnumScope(node);

    // define the enum name again inside the new enum scope
    // references to the enum should not resolve directly to the enum
    this.currentScope().defineIdentifier(
      node.id,
      new TSEnumNameDefinition(node.id, node),
    );

    for (const member of node.members) {
      // TS resolves literal named members to be actual names
      // enum Foo {
      //   'a' = 1,
      //   b = a, // this references the 'a' member
      // }
      if (
        member.id.type === AST_NODE_TYPES.Literal &&
        typeof member.id.value === 'string'
      ) {
        const name = member.id as TSESTree.StringLiteral;
        this.currentScope().defineLiteralIdentifier(
          name,
          new TSEnumMemberDefinition(name, member),
        );
      } else if (
        !member.computed &&
        member.id.type === AST_NODE_TYPES.Identifier
      ) {
        this.currentScope().defineIdentifier(
          member.id,
          new TSEnumMemberDefinition(member.id, member),
        );
      }

      this.visit(member.initializer);
    }

    this.close(node);
  }

  protected TSInterfaceDeclaration(
    node: TSESTree.TSInterfaceDeclaration,
  ): void {
    this.visitType(node);
  }

  protected TSModuleDeclaration(node: TSESTree.TSModuleDeclaration): void {
    if (node.id.type === AST_NODE_TYPES.Identifier) {
      this.currentScope().defineIdentifier(
        node.id,
        new TSModuleNameDefinition(node.id, node),
      );
    }

    this.scopeManager.nestTSModuleScope(node);

    this.visit(node.body);

    this.close(node);
  }

  protected TSTypeAliasDeclaration(
    node: TSESTree.TSTypeAliasDeclaration,
  ): void {
    this.visitType(node);
  }

  protected TSTypeAssertion(node: TSESTree.TSTypeAssertion): void {
    this.visitTypeAssertion(node);
  }

  protected UpdateExpression(node: TSESTree.UpdateExpression): void {
    if (PatternVisitor.isPattern(node.argument)) {
      this.visitPattern(node.argument, pattern => {
        this.currentScope().referenceValue(
          pattern,
          ReferenceFlag.ReadWrite,
          null,
        );
      });
    } else {
      this.visitChildren(node);
    }
  }

  protected VariableDeclaration(node: TSESTree.VariableDeclaration): void {
    const variableTargetScope =
      node.kind === 'var'
        ? this.currentScope().variableScope
        : this.currentScope();

    for (const decl of node.declarations) {
      const init = decl.init;

      this.visitPattern(
        decl.id,
        (pattern, info) => {
          variableTargetScope.defineIdentifier(
            pattern,
            new VariableDefinition(pattern, decl, node),
          );

          this.referencingDefaultValue(pattern, info.assignments, null, true);
          if (init) {
            this.currentScope().referenceValue(
              pattern,
              ReferenceFlag.Write,
              init,
              null,
              true,
            );
          }
        },
        { processRightHandNodes: true },
      );

      if (decl.init) {
        this.visit(decl.init);
      }

      if ('typeAnnotation' in decl.id) {
        this.visitType(decl.id.typeAnnotation);
      }
    }
  }

  protected WithStatement(node: TSESTree.WithStatement): void {
    this.visit(node.object);

    // Then nest scope for WithStatement.
    this.scopeManager.nestWithScope(node);

    this.visit(node.body);

    this.close(node);
  }
}

export { Referencer, ReferencerOptions };

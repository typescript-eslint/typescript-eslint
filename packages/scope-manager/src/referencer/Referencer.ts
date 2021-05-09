import { AST_NODE_TYPES, Lib, TSESTree } from '@typescript-eslint/types';
import { ClassVisitor } from './ClassVisitor';
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
  jsxPragma: string;
  jsxFragmentName: string | null;
  lib: Lib[];
  emitDecoratorMetadata: boolean;
}

// Referencing variables and creating bindings.
class Referencer extends Visitor {
  #jsxPragma: string;
  #jsxFragmentName: string | null;
  #hasReferencedJsxFactory = false;
  #hasReferencedJsxFragmentFactory = false;
  #lib: Lib[];
  readonly #emitDecoratorMetadata: boolean;
  public readonly scopeManager: ScopeManager;

  constructor(options: ReferencerOptions, scopeManager: ScopeManager) {
    super(options);
    this.scopeManager = scopeManager;
    this.#jsxPragma = options.jsxPragma;
    this.#jsxFragmentName = options.jsxFragmentName;
    this.#lib = options.lib;
    this.#emitDecoratorMetadata = options.emitDecoratorMetadata;
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

  public referencingDefaultValue(
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

    // for const assertions (`{} as const` / `<const>{}`)
    globalScope.defineImplicitVariable({
      name: 'const',
      eslintImplicitGlobalSetting: 'readonly',
      isTypeVariable: true,
      isValueVariable: false,
    });
  }

  /**
   * Searches for a variable named "name" in the upper scopes and adds a pseudo-reference from itself to itself
   */
  private referenceInSomeUpperScope(name: string): boolean {
    let scope = this.scopeManager.currentScope;
    while (scope) {
      const variable = scope.set.get(name);
      if (!variable) {
        scope = scope.upper;
        continue;
      }

      scope.referenceValue(variable.identifiers[0]);
      return true;
    }

    return false;
  }

  private referenceJsxPragma(): void {
    if (this.#hasReferencedJsxFactory) {
      return;
    }
    this.#hasReferencedJsxFactory = this.referenceInSomeUpperScope(
      this.#jsxPragma,
    );
  }

  private referenceJsxFragment(): void {
    if (
      this.#jsxFragmentName === null ||
      this.#hasReferencedJsxFragmentFactory
    ) {
      return;
    }
    this.#hasReferencedJsxFragmentFactory = this.referenceInSomeUpperScope(
      this.#jsxFragmentName,
    );
  }

  ///////////////////
  // Visit helpers //
  ///////////////////

  protected visitClass(
    node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  ): void {
    ClassVisitor.visit(this, node, this.#emitDecoratorMetadata);
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
    this.scopeManager.nestFunctionScope(node, false);

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

  protected visitProperty(node: TSESTree.Property): void {
    if (node.computed) {
      this.visit(node.key);
    }

    this.visit(node.value);
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
    let left = node.left;
    switch (left.type) {
      case AST_NODE_TYPES.TSAsExpression:
      case AST_NODE_TYPES.TSTypeAssertion:
        // explicitly visit the type annotation
        this.visitType(left.typeAnnotation);
      // intentional fallthrough
      case AST_NODE_TYPES.TSNonNullExpression:
        // unwrap the expression
        left = left.expression;
    }

    if (PatternVisitor.isPattern(left)) {
      if (node.operator === '=') {
        this.visitPattern(
          left,
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
      } else if (left.type === AST_NODE_TYPES.Identifier) {
        this.currentScope().referenceValue(
          left,
          ReferenceFlag.ReadWrite,
          node.right,
        );
      }
    } else {
      this.visit(left);
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

  protected JSXAttribute(node: TSESTree.JSXAttribute): void {
    this.visit(node.value);
  }

  protected JSXClosingElement(): void {
    // should not be counted as a reference
  }

  protected JSXFragment(node: TSESTree.JSXFragment): void {
    this.referenceJsxPragma();
    this.referenceJsxFragment();
    this.visitChildren(node);
  }

  protected JSXIdentifier(node: TSESTree.JSXIdentifier): void {
    this.currentScope().referenceValue(node);
  }

  protected JSXMemberExpression(node: TSESTree.JSXMemberExpression): void {
    this.visit(node.object);
    // we don't ever reference the property as it's always going to be a property on the thing
  }

  protected JSXOpeningElement(node: TSESTree.JSXOpeningElement): void {
    this.referenceJsxPragma();
    if (node.name.type === AST_NODE_TYPES.JSXIdentifier) {
      if (node.name.name[0].toUpperCase() === node.name.name[0]) {
        // lower cased component names are always treated as "intrinsic" names, and are converted to a string,
        // not a variable by JSX transforms:
        // <div /> => React.createElement("div", null)
        this.visit(node.name);
      }
    } else {
      this.visit(node.name);
    }
    this.visitType(node.typeParameters);
    for (const attr of node.attributes) {
      this.visit(attr);
    }
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

  protected TaggedTemplateExpression(
    node: TSESTree.TaggedTemplateExpression,
  ): void {
    this.visit(node.tag);
    this.visit(node.quasi);
    this.visitType(node.typeParameters);
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
    if (node.id.type === AST_NODE_TYPES.Identifier && !node.global) {
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

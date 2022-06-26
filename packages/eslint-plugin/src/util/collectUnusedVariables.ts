import {
  AST_NODE_TYPES,
  TSESLint,
  ASTUtils,
  TSESTree,
  ESLintUtils,
} from '@typescript-eslint/utils';
import { ImplicitLibVariable } from '@typescript-eslint/scope-manager';
import { Visitor } from '@typescript-eslint/scope-manager/dist/referencer/Visitor';

class UnusedVarsVisitor<
  TMessageIds extends string,
  TOptions extends readonly unknown[],
> extends Visitor {
  private static readonly RESULTS_CACHE = new WeakMap<
    TSESTree.Program,
    ReadonlySet<TSESLint.Scope.Variable>
  >();

  readonly #scopeManager: TSESLint.Scope.ScopeManager;
  // readonly #unusedVariables = new Set<TSESLint.Scope.Variable>();

  private constructor(context: TSESLint.RuleContext<TMessageIds, TOptions>) {
    super({
      visitChildrenEvenIfSelectorExists: true,
    });

    this.#scopeManager = ESLintUtils.nullThrows(
      context.getSourceCode().scopeManager,
      'Missing required scope manager',
    );
  }

  public static collectUnusedVariables<
    TMessageIds extends string,
    TOptions extends readonly unknown[],
  >(
    context: TSESLint.RuleContext<TMessageIds, TOptions>,
  ): ReadonlySet<TSESLint.Scope.Variable> {
    const program = context.getSourceCode().ast;
    const cached = this.RESULTS_CACHE.get(program);
    if (cached) {
      return cached;
    }

    const visitor = new this(context);
    visitor.visit(program);

    const unusedVars = visitor.collectUnusedVariables(
      visitor.getScope(program),
    );
    this.RESULTS_CACHE.set(program, unusedVars);
    return unusedVars;
  }

  private collectUnusedVariables(
    scope: TSESLint.Scope.Scope,
    unusedVariables = new Set<TSESLint.Scope.Variable>(),
  ): ReadonlySet<TSESLint.Scope.Variable> {
    for (const variable of scope.variables) {
      if (
        // skip function expression names,
        scope.functionExpressionScope ||
        // variables marked with markVariableAsUsed(),
        variable.eslintUsed ||
        // implicit lib variables (from @typescript-eslint/scope-manager),
        variable instanceof ImplicitLibVariable ||
        // basic exported variables
        isExported(variable) ||
        // variables implicitly exported via a merged declaration
        isMergableExported(variable) ||
        // used variables
        isUsedVariable(variable)
      ) {
        continue;
      }

      unusedVariables.add(variable);
    }

    for (const childScope of scope.childScopes) {
      this.collectUnusedVariables(childScope, unusedVariables);
    }

    return unusedVariables;
  }

  //#region HELPERS

  private getScope<T extends TSESLint.Scope.Scope = TSESLint.Scope.Scope>(
    currentNode: TSESTree.Node,
  ): T {
    // On Program node, get the outermost scope to avoid return Node.js special function scope or ES modules scope.
    const inner = currentNode.type !== AST_NODE_TYPES.Program;

    let node: TSESTree.Node | undefined = currentNode;
    while (node) {
      const scope = this.#scopeManager.acquire(node, inner);

      if (scope) {
        if (scope.type === 'function-expression-name') {
          return scope.childScopes[0] as T;
        }
        return scope as T;
      }

      node = node.parent;
    }

    return this.#scopeManager.scopes[0] as T;
  }

  private markVariableAsUsed(
    variableOrIdentifier: TSESLint.Scope.Variable | TSESTree.Identifier,
  ): void;
  private markVariableAsUsed(name: string, parent: TSESTree.Node): void;
  private markVariableAsUsed(
    variableOrIdentifierOrName:
      | TSESLint.Scope.Variable
      | TSESTree.Identifier
      | string,
    parent?: TSESTree.Node,
  ): void {
    if (
      typeof variableOrIdentifierOrName !== 'string' &&
      !('type' in variableOrIdentifierOrName)
    ) {
      variableOrIdentifierOrName.eslintUsed = true;
      return;
    }

    let name: string;
    let node: TSESTree.Node;
    if (typeof variableOrIdentifierOrName === 'string') {
      name = variableOrIdentifierOrName;
      node = parent!;
    } else {
      name = variableOrIdentifierOrName.name;
      node = variableOrIdentifierOrName;
    }

    let currentScope: TSESLint.Scope.Scope | null = this.getScope(node);
    while (currentScope) {
      const variable = currentScope.variables.find(
        scopeVar => scopeVar.name === name,
      );

      if (variable) {
        variable.eslintUsed = true;
        return;
      }

      currentScope = currentScope.upper;
    }
  }

  private visitClass(
    node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  ): void {
    // skip a variable of class itself name in the class scope
    const scope = this.getScope<TSESLint.Scope.Scopes.ClassScope>(node);
    for (const variable of scope.variables) {
      if (variable.identifiers[0] === scope.block.id) {
        this.markVariableAsUsed(variable);
        return;
      }
    }
  }

  private visitFunction(
    node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
  ): void {
    const scope = this.getScope(node);
    // skip implicit "arguments" variable
    const variable = scope.set.get('arguments');
    if (variable?.defs.length === 0) {
      this.markVariableAsUsed(variable);
    }
  }

  private visitFunctionTypeSignature(
    node:
      | TSESTree.TSCallSignatureDeclaration
      | TSESTree.TSConstructorType
      | TSESTree.TSConstructSignatureDeclaration
      | TSESTree.TSDeclareFunction
      | TSESTree.TSEmptyBodyFunctionExpression
      | TSESTree.TSFunctionType
      | TSESTree.TSMethodSignature,
  ): void {
    // function type signature params create variables because they can be referenced within the signature,
    // but they obviously aren't unused variables for the purposes of this rule.
    for (const param of node.params) {
      this.visitPattern(param, name => {
        this.markVariableAsUsed(name);
      });
    }
  }

  private visitSetter(
    node: TSESTree.MethodDefinition | TSESTree.Property,
  ): void {
    if (node.kind === 'set') {
      // ignore setter parameters because they're syntactically required to exist
      for (const param of (node.value as TSESTree.FunctionLike).params) {
        this.visitPattern(param, id => {
          this.markVariableAsUsed(id);
        });
      }
    }
  }

  //#endregion HELPERS

  //#region VISITORS
  // NOTE - This is a simple visitor - meaning it does not support selectors

  protected ClassDeclaration = this.visitClass;

  protected ClassExpression = this.visitClass;

  protected FunctionDeclaration = this.visitFunction;

  protected FunctionExpression = this.visitFunction;

  protected ForInStatement(node: TSESTree.ForInStatement): void {
    /**
     * (Brad Zacher): I hate that this has to exist.
     * But it is required for compat with the base ESLint rule.
     *
     * In 2015, ESLint decided to add an exception for these two specific cases
     * ```
     * for (var key in object) return;
     *
     * var key;
     * for (key in object) return;
     * ```
     *
     * I disagree with it, but what are you going to do...
     *
     * https://github.com/eslint/eslint/issues/2342
     */

    let idOrVariable;
    if (node.left.type === AST_NODE_TYPES.VariableDeclaration) {
      const variable = this.#scopeManager.getDeclaredVariables(node.left)[0];
      if (!variable) {
        return;
      }
      idOrVariable = variable;
    }
    if (node.left.type === AST_NODE_TYPES.Identifier) {
      idOrVariable = node.left;
    }

    if (idOrVariable == null) {
      return;
    }

    let body = node.body;
    if (node.body.type === AST_NODE_TYPES.BlockStatement) {
      if (node.body.body.length !== 1) {
        return;
      }
      body = node.body.body[0];
    }

    if (body.type !== AST_NODE_TYPES.ReturnStatement) {
      return;
    }

    this.markVariableAsUsed(idOrVariable);
  }

  protected Identifier(node: TSESTree.Identifier): void {
    const scope = this.getScope(node);
    if (
      scope.type === TSESLint.Scope.ScopeType.function &&
      node.name === 'this'
    ) {
      // this parameters should always be considered used as they're pseudo-parameters
      if ('params' in scope.block && scope.block.params.includes(node)) {
        this.markVariableAsUsed(node);
      }
    }
  }

  protected MethodDefinition = this.visitSetter;

  protected Property = this.visitSetter;

  protected TSCallSignatureDeclaration = this.visitFunctionTypeSignature;

  protected TSConstructorType = this.visitFunctionTypeSignature;

  protected TSConstructSignatureDeclaration = this.visitFunctionTypeSignature;

  protected TSDeclareFunction = this.visitFunctionTypeSignature;

  protected TSEmptyBodyFunctionExpression = this.visitFunctionTypeSignature;

  protected TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
    // enum members create variables because they can be referenced within the enum,
    // but they obviously aren't unused variables for the purposes of this rule.
    const scope = this.getScope(node);
    for (const variable of scope.variables) {
      this.markVariableAsUsed(variable);
    }
  }

  protected TSFunctionType = this.visitFunctionTypeSignature;

  protected TSMappedType(node: TSESTree.TSMappedType): void {
    // mapped types create a variable for their type name, but it's not necessary to reference it,
    // so we shouldn't consider it as unused for the purpose of this rule.
    this.markVariableAsUsed(node.typeParameter.name);
  }

  protected TSMethodSignature = this.visitFunctionTypeSignature;

  protected TSModuleDeclaration(node: TSESTree.TSModuleDeclaration): void {
    // -- global augmentation can be in any file, and they do not need exports
    if (node.global === true) {
      this.markVariableAsUsed('global', node.parent);
    }
  }

  protected TSParameterProperty(node: TSESTree.TSParameterProperty): void {
    let identifier: TSESTree.Identifier | null = null;
    switch (node.parameter.type) {
      case AST_NODE_TYPES.AssignmentPattern:
        if (node.parameter.left.type === AST_NODE_TYPES.Identifier) {
          identifier = node.parameter.left;
        }
        break;

      case AST_NODE_TYPES.Identifier:
        identifier = node.parameter;
        break;
    }

    if (identifier) {
      this.markVariableAsUsed(identifier);
    }
  }

  //#endregion VISITORS
}

//#region private helpers

/**
 * Checks the position of given nodes.
 * @param inner A node which is expected as inside.
 * @param outer A node which is expected as outside.
 * @returns `true` if the `inner` node exists in the `outer` node.
 */
function isInside(inner: TSESTree.Node, outer: TSESTree.Node): boolean {
  return inner.range[0] >= outer.range[0] && inner.range[1] <= outer.range[1];
}

/**
 * Determine if an identifier is referencing an enclosing name.
 * This only applies to declarations that create their own scope (modules, functions, classes)
 * @param ref The reference to check.
 * @param nodes The candidate function nodes.
 * @returns True if it's a self-reference, false if not.
 */
function isSelfReference(
  ref: TSESLint.Scope.Reference,
  nodes: Set<TSESTree.Node>,
): boolean {
  let scope: TSESLint.Scope.Scope | null = ref.from;

  while (scope) {
    if (nodes.has(scope.block)) {
      return true;
    }

    scope = scope.upper;
  }

  return false;
}

const MERGABLE_TYPES = new Set([
  AST_NODE_TYPES.TSInterfaceDeclaration,
  AST_NODE_TYPES.TSTypeAliasDeclaration,
  AST_NODE_TYPES.TSModuleDeclaration,
  AST_NODE_TYPES.ClassDeclaration,
  AST_NODE_TYPES.FunctionDeclaration,
]);
/**
 * Determine if the variable is directly exported
 * @param variable the variable to check
 * @param target the type of node that is expected to be exported
 */
function isMergableExported(variable: TSESLint.Scope.Variable): boolean {
  // If all of the merged things are of the same type, TS will error if not all of them are exported - so we only need to find one
  for (const def of variable.defs) {
    // parameters can never be exported.
    // their `node` prop points to the function decl, which can be exported
    // so we need to special case them
    if (def.type === TSESLint.Scope.DefinitionType.Parameter) {
      continue;
    }

    if (
      (MERGABLE_TYPES.has(def.node.type) &&
        def.node.parent?.type === AST_NODE_TYPES.ExportNamedDeclaration) ||
      def.node.parent?.type === AST_NODE_TYPES.ExportDefaultDeclaration
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Determines if a given variable is being exported from a module.
 * @param variable eslint-scope variable object.
 * @returns True if the variable is exported, false if not.
 */
function isExported(variable: TSESLint.Scope.Variable): boolean {
  const definition = variable.defs[0];

  if (definition) {
    let node = definition.node;

    if (node.type === AST_NODE_TYPES.VariableDeclarator) {
      node = node.parent!;
    } else if (definition.type === TSESLint.Scope.DefinitionType.Parameter) {
      return false;
    }

    return node.parent!.type.indexOf('Export') === 0;
  }
  return false;
}

/**
 * Determines if the variable is used.
 * @param variable The variable to check.
 * @returns True if the variable is used
 */
function isUsedVariable(variable: TSESLint.Scope.Variable): boolean {
  /**
   * Gets a list of function definitions for a specified variable.
   * @param variable eslint-scope variable object.
   * @returns Function nodes.
   */
  function getFunctionDefinitions(
    variable: TSESLint.Scope.Variable,
  ): Set<TSESTree.Node> {
    const functionDefinitions = new Set<TSESTree.Node>();

    variable.defs.forEach(def => {
      // FunctionDeclarations
      if (def.type === TSESLint.Scope.DefinitionType.FunctionName) {
        functionDefinitions.add(def.node);
      }

      // FunctionExpressions
      if (
        def.type === TSESLint.Scope.DefinitionType.Variable &&
        (def.node.init?.type === AST_NODE_TYPES.FunctionExpression ||
          def.node.init?.type === AST_NODE_TYPES.ArrowFunctionExpression)
      ) {
        functionDefinitions.add(def.node.init);
      }
    });
    return functionDefinitions;
  }

  function getTypeDeclarations(
    variable: TSESLint.Scope.Variable,
  ): Set<TSESTree.Node> {
    const nodes = new Set<TSESTree.Node>();

    variable.defs.forEach(def => {
      if (
        def.node.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
        def.node.type === AST_NODE_TYPES.TSTypeAliasDeclaration
      ) {
        nodes.add(def.node);
      }
    });

    return nodes;
  }

  function getModuleDeclarations(
    variable: TSESLint.Scope.Variable,
  ): Set<TSESTree.Node> {
    const nodes = new Set<TSESTree.Node>();

    variable.defs.forEach(def => {
      if (def.node.type === AST_NODE_TYPES.TSModuleDeclaration) {
        nodes.add(def.node);
      }
    });

    return nodes;
  }

  /**
   * Checks if the ref is contained within one of the given nodes
   */
  function isInsideOneOf(
    ref: TSESLint.Scope.Reference,
    nodes: Set<TSESTree.Node>,
  ): boolean {
    for (const node of nodes) {
      if (isInside(ref.identifier, node)) {
        return true;
      }
    }

    return false;
  }

  /**
   * If a given reference is left-hand side of an assignment, this gets
   * the right-hand side node of the assignment.
   *
   * In the following cases, this returns null.
   *
   * - The reference is not the LHS of an assignment expression.
   * - The reference is inside of a loop.
   * - The reference is inside of a function scope which is different from
   *   the declaration.
   * @param ref A reference to check.
   * @param prevRhsNode The previous RHS node.
   * @returns The RHS node or null.
   */
  function getRhsNode(
    ref: TSESLint.Scope.Reference,
    prevRhsNode: TSESTree.Node | null,
  ): TSESTree.Node | null {
    /**
     * Checks whether the given node is in a loop or not.
     * @param node The node to check.
     * @returns `true` if the node is in a loop.
     */
    function isInLoop(node: TSESTree.Node): boolean {
      let currentNode: TSESTree.Node | undefined = node;
      while (currentNode) {
        if (ASTUtils.isFunction(currentNode)) {
          break;
        }

        if (ASTUtils.isLoop(currentNode)) {
          return true;
        }

        currentNode = currentNode.parent;
      }

      return false;
    }

    const id = ref.identifier;
    const parent = id.parent;
    const grandparent = parent.parent!;
    const refScope = ref.from.variableScope;
    const varScope = ref.resolved!.scope.variableScope;
    const canBeUsedLater = refScope !== varScope || isInLoop(id);

    /*
     * Inherits the previous node if this reference is in the node.
     * This is for `a = a + a`-like code.
     */
    if (prevRhsNode && isInside(id, prevRhsNode)) {
      return prevRhsNode;
    }

    if (
      parent.type === AST_NODE_TYPES.AssignmentExpression &&
      grandparent.type === AST_NODE_TYPES.ExpressionStatement &&
      id === parent.left &&
      !canBeUsedLater
    ) {
      return parent.right;
    }
    return null;
  }

  /**
   * Checks whether a given reference is a read to update itself or not.
   * @param ref A reference to check.
   * @param rhsNode The RHS node of the previous assignment.
   * @returns The reference is a read to update itself.
   */
  function isReadForItself(
    ref: TSESLint.Scope.Reference,
    rhsNode: TSESTree.Node | null,
  ): boolean {
    /**
     * Checks whether a given Identifier node exists inside of a function node which can be used later.
     *
     * "can be used later" means:
     * - the function is assigned to a variable.
     * - the function is bound to a property and the object can be used later.
     * - the function is bound as an argument of a function call.
     *
     * If a reference exists in a function which can be used later, the reference is read when the function is called.
     * @param id An Identifier node to check.
     * @param rhsNode The RHS node of the previous assignment.
     * @returns `true` if the `id` node exists inside of a function node which can be used later.
     */
    function isInsideOfStorableFunction(
      id: TSESTree.Node,
      rhsNode: TSESTree.Node,
    ): boolean {
      /**
       * Finds a function node from ancestors of a node.
       * @param node A start node to find.
       * @returns A found function node.
       */
      function getUpperFunction(node: TSESTree.Node): TSESTree.Node | null {
        let currentNode: TSESTree.Node | undefined = node;
        while (currentNode) {
          if (ASTUtils.isFunction(currentNode)) {
            return currentNode;
          }
          currentNode = currentNode.parent;
        }

        return null;
      }

      /**
       * Checks whether a given function node is stored to somewhere or not.
       * If the function node is stored, the function can be used later.
       * @param funcNode A function node to check.
       * @param rhsNode The RHS node of the previous assignment.
       * @returns `true` if under the following conditions:
       *      - the funcNode is assigned to a variable.
       *      - the funcNode is bound as an argument of a function call.
       *      - the function is bound to a property and the object satisfies above conditions.
       */
      function isStorableFunction(
        funcNode: TSESTree.Node,
        rhsNode: TSESTree.Node,
      ): boolean {
        let node = funcNode;
        let parent = funcNode.parent;

        while (parent && isInside(parent, rhsNode)) {
          switch (parent.type) {
            case AST_NODE_TYPES.SequenceExpression:
              if (parent.expressions[parent.expressions.length - 1] !== node) {
                return false;
              }
              break;

            case AST_NODE_TYPES.CallExpression:
            case AST_NODE_TYPES.NewExpression:
              return parent.callee !== node;

            case AST_NODE_TYPES.AssignmentExpression:
            case AST_NODE_TYPES.TaggedTemplateExpression:
            case AST_NODE_TYPES.YieldExpression:
              return true;

            default:
              if (
                parent.type.endsWith('Statement') ||
                parent.type.endsWith('Declaration')
              ) {
                /*
                 * If it encountered statements, this is a complex pattern.
                 * Since analyzing complex patterns is hard, this returns `true` to avoid false positive.
                 */
                return true;
              }
          }

          node = parent;
          parent = parent.parent;
        }

        return false;
      }

      const funcNode = getUpperFunction(id);

      return (
        !!funcNode &&
        isInside(funcNode, rhsNode) &&
        isStorableFunction(funcNode, rhsNode)
      );
    }

    const id = ref.identifier;
    const parent = id.parent;
    const grandparent = parent.parent!;

    return (
      ref.isRead() && // in RHS of an assignment for itself. e.g. `a = a + 1`
      // self update. e.g. `a += 1`, `a++`
      ((parent.type === AST_NODE_TYPES.AssignmentExpression &&
        grandparent.type === AST_NODE_TYPES.ExpressionStatement &&
        parent.left === id) ||
        (parent.type === AST_NODE_TYPES.UpdateExpression &&
          grandparent.type === AST_NODE_TYPES.ExpressionStatement) ||
        (!!rhsNode &&
          isInside(id, rhsNode) &&
          !isInsideOfStorableFunction(id, rhsNode)))
    );
  }

  const functionNodes = getFunctionDefinitions(variable);
  const isFunctionDefinition = functionNodes.size > 0;

  const typeDeclNodes = getTypeDeclarations(variable);
  const isTypeDecl = typeDeclNodes.size > 0;

  const moduleDeclNodes = getModuleDeclarations(variable);
  const isModuleDecl = moduleDeclNodes.size > 0;

  let rhsNode: TSESTree.Node | null = null;

  return variable.references.some(ref => {
    const forItself = isReadForItself(ref, rhsNode);

    rhsNode = getRhsNode(ref, rhsNode);

    return (
      ref.isRead() &&
      !forItself &&
      !(isFunctionDefinition && isSelfReference(ref, functionNodes)) &&
      !(isTypeDecl && isInsideOneOf(ref, typeDeclNodes)) &&
      !(isModuleDecl && isSelfReference(ref, moduleDeclNodes))
    );
  });
}

//#endregion private helpers

/**
 * Collects the set of unused variables for a given context.
 *
 * Due to complexity, this does not take into consideration:
 * - variables within declaration files
 * - variables within ambient module declarations
 */
function collectUnusedVariables<
  TMessageIds extends string,
  TOptions extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>,
): ReadonlySet<TSESLint.Scope.Variable> {
  return UnusedVarsVisitor.collectUnusedVariables(context);
}

export { collectUnusedVariables };

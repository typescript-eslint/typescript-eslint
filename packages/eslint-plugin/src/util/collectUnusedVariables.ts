import type {
  ScopeManager,
  ScopeVariable,
} from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';

import {
  DefinitionType,
  ESLintScopeVariable,
  ImplicitLibVariable,
  ScopeType,
  Visitor,
} from '@typescript-eslint/scope-manager';
import {
  AST_NODE_TYPES,
  ASTUtils,
  ESLintUtils,
  TSESLint,
} from '@typescript-eslint/utils';
import { Node } from 'typescript';

import { isTypeImport } from './isTypeImport';
import { referenceContainsTypeQuery } from './referenceContainsTypeQuery';

interface VariableAnalysis {
  readonly unusedVariables: ReadonlySet<ScopeVariable>;
  readonly usedVariables: ReadonlySet<ScopeVariable>;
}
interface MutableVariableAnalysis {
  readonly unusedVariables: Set<ScopeVariable>;
  readonly usedVariables: Set<ScopeVariable>;
}

/**
 * This class leverages an AST visitor to mark variables as used via the
 * `eslintUsed` property.
 */
class UnusedVarsVisitor extends Visitor {
  /**
   * We keep a weak cache so that multiple rules can share the calculation
   */
  private static readonly RESULTS_CACHE = new WeakMap<
    TSESTree.Program,
    VariableAnalysis
  >();

  protected ClassDeclaration = this.visitClass;

  protected ClassExpression = this.visitClass;

  protected ForInStatement = this.visitForInForOf;

  protected ForOfStatement = this.visitForInForOf;

  //#region HELPERS

  protected FunctionDeclaration = this.visitFunction;

  protected FunctionExpression = this.visitFunction;
  protected MethodDefinition = this.visitSetter;
  protected Property = this.visitSetter;

  protected TSCallSignatureDeclaration = this.visitFunctionTypeSignature;

  protected TSConstructorType = this.visitFunctionTypeSignature;

  protected TSConstructSignatureDeclaration = this.visitFunctionTypeSignature;

  protected TSDeclareFunction = this.visitFunctionTypeSignature;

  protected TSEmptyBodyFunctionExpression = this.visitFunctionTypeSignature;

  //#endregion HELPERS

  //#region VISITORS
  // NOTE - This is a simple visitor - meaning it does not support selectors

  protected TSFunctionType = this.visitFunctionTypeSignature;

  protected TSMethodSignature = this.visitFunctionTypeSignature;

  readonly #scopeManager: TSESLint.Scope.ScopeManager;

  private constructor(scopeManager: ScopeManager) {
    super({
      visitChildrenEvenIfSelectorExists: true,
    });

    this.#scopeManager = scopeManager;
  }

  public static collectUnusedVariables(
    program: TSESTree.Program,
    scopeManager: ScopeManager,
  ): VariableAnalysis {
    const cached = this.RESULTS_CACHE.get(program);
    if (cached) {
      return cached;
    }

    const visitor = new this(scopeManager);
    visitor.visit(program);

    const unusedVars = visitor.collectUnusedVariables(
      visitor.getScope(program),
    );
    this.RESULTS_CACHE.set(program, unusedVars);
    return unusedVars;
  }

  protected Identifier(node: TSESTree.Identifier): void {
    const scope = this.getScope(node);
    if (
      scope.type === TSESLint.Scope.ScopeType.function &&
      node.name === 'this' &&
      // this parameters should always be considered used as they're pseudo-parameters
      'params' in scope.block &&
      scope.block.params.includes(node)
    ) {
      this.markVariableAsUsed(node);
    }
  }

  protected TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
    // enum members create variables because they can be referenced within the enum,
    // but they obviously aren't unused variables for the purposes of this rule.
    const scope = this.getScope(node);
    for (const variable of scope.variables) {
      this.markVariableAsUsed(variable);
    }
  }

  protected TSMappedType(node: TSESTree.TSMappedType): void {
    // mapped types create a variable for their type name, but it's not necessary to reference it,
    // so we shouldn't consider it as unused for the purpose of this rule.
    this.markVariableAsUsed(node.key);
  }

  protected TSModuleDeclaration(node: TSESTree.TSModuleDeclaration): void {
    // -- global augmentation can be in any file, and they do not need exports
    if (node.kind === 'global') {
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

  private collectUnusedVariables(
    scope: TSESLint.Scope.Scope,
    variables: MutableVariableAnalysis = {
      unusedVariables: new Set(),
      usedVariables: new Set(),
    },
  ): VariableAnalysis {
    if (
      // skip function expression names
      // this scope is created just to house the variable that allows a function
      // expression to self-reference if it has a name defined
      !scope.functionExpressionScope
    ) {
      for (const variable of scope.variables) {
        // cases that we don't want to treat as used or unused
        if (
          // implicit lib variables (from @typescript-eslint/scope-manager)
          // these aren't variables that should be checked ever
          variable instanceof ImplicitLibVariable
        ) {
          continue;
        }

        if (
          // variables marked with markVariableAsUsed()
          variable.eslintUsed ||
          // basic exported variables
          isExported(variable) ||
          // variables implicitly exported via a merged declaration
          isMergableExported(variable) ||
          // used variables
          isUsedVariable(variable)
        ) {
          variables.usedVariables.add(variable);
        } else {
          variables.unusedVariables.add(variable);
        }
      }
    }

    for (const childScope of scope.childScopes) {
      this.collectUnusedVariables(childScope, variables);
    }

    return variables;
  }

  private getScope(currentNode: TSESTree.Node): TSESLint.Scope.Scope {
    // On Program node, get the outermost scope to avoid return Node.js special function scope or ES modules scope.
    const inner = currentNode.type !== AST_NODE_TYPES.Program;

    let node: TSESTree.Node | undefined = currentNode;
    while (node) {
      const scope = this.#scopeManager.acquire(node, inner);

      if (scope) {
        if (scope.type === ScopeType.functionExpressionName) {
          return scope.childScopes[0];
        }
        return scope;
      }

      node = node.parent;
    }

    return this.#scopeManager.scopes[0];
  }

  private markVariableAsUsed(
    variableOrIdentifier: ScopeVariable | TSESTree.Identifier,
  ): void;
  private markVariableAsUsed(name: string, parent: TSESTree.Node): void;
  private markVariableAsUsed(
    variableOrIdentifierOrName: string | ScopeVariable | TSESTree.Identifier,
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    const scope = this.getScope(node) as TSESLint.Scope.Scopes.ClassScope;
    for (const variable of scope.variables) {
      if (variable.identifiers[0] === scope.block.id) {
        this.markVariableAsUsed(variable);
        return;
      }
    }
  }

  private visitForInForOf(
    node: TSESTree.ForInStatement | TSESTree.ForOfStatement,
  ): void {
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
      const variable = this.#scopeManager.getDeclaredVariables(node.left).at(0);
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

const exportExceptDefTypes: DefinitionType[] = [
  DefinitionType.Variable,
  DefinitionType.Type,
];
/**
 * In edge cases, the existing used logic does not work.
 * When the type and variable name of the variable are the same
 * @ref https://github.com/typescript-eslint/typescript-eslint/issues/10658
 * @param variable the variable to check
 * @returns true if it is an edge case
 */
function isSafeUnusedExportCondition(variable: ScopeVariable): boolean {
  if (variable instanceof ESLintScopeVariable) {
    return true;
  }
  if (variable.isTypeVariable && variable.isValueVariable) {
    return !variable.defs
      .map(d => d.type)
      .every(t => exportExceptDefTypes.includes(t));
  }
  return true;
}

const MERGABLE_TYPES = new Set([
  AST_NODE_TYPES.ClassDeclaration,
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.TSInterfaceDeclaration,
  AST_NODE_TYPES.TSModuleDeclaration,
  AST_NODE_TYPES.TSTypeAliasDeclaration,
]);
/**
 * Determine if the variable is directly exported
 * @param variable the variable to check
 */
function isMergableExported(variable: ScopeVariable): boolean {
  const safeFlag = isSafeUnusedExportCondition(variable);
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
      return (
        safeFlag || def.node.type !== AST_NODE_TYPES.TSTypeAliasDeclaration
      );
    }
  }

  return false;
}

/**
 * Determines if a given variable is being exported from a module.
 * @param variable eslint-scope variable object.
 * @returns True if the variable is exported, false if not.
 */
function isExported(variable: ScopeVariable): boolean {
  const safeFlag = isSafeUnusedExportCondition(variable);
  return variable.defs.some(definition => {
    let node = definition.node;

    if (node.type === AST_NODE_TYPES.VariableDeclarator) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      node = node.parent!;
    } else if (definition.type === TSESLint.Scope.DefinitionType.Parameter) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const isExportedFlag = node.parent!.type.startsWith('Export');

    return (
      isExportedFlag &&
      (safeFlag || node.type !== AST_NODE_TYPES.TSTypeAliasDeclaration)
    );
  });
}

const LOGICAL_ASSIGNMENT_OPERATORS = new Set(['??=', '&&=', '||=']);

/**
 * Determines if the variable is used.
 * @param variable The variable to check.
 * @returns True if the variable is used
 */
function isUsedVariable(variable: ScopeVariable): boolean {
  /**
   * Gets a list of function definitions for a specified variable.
   * @param variable eslint-scope variable object.
   * @returns Function nodes.
   */
  function getFunctionDefinitions(variable: ScopeVariable): Set<TSESTree.Node> {
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

  function getTypeDeclarations(variable: ScopeVariable): Set<TSESTree.Node> {
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

  function getModuleDeclarations(variable: ScopeVariable): Set<TSESTree.Node> {
    const nodes = new Set<TSESTree.Node>();

    variable.defs.forEach(def => {
      if (def.node.type === AST_NODE_TYPES.TSModuleDeclaration) {
        nodes.add(def.node);
      }
    });

    return nodes;
  }

  function getEnumDeclarations(variable: ScopeVariable): Set<TSESTree.Node> {
    const nodes = new Set<TSESTree.Node>();

    variable.defs.forEach(def => {
      if (def.node.type === AST_NODE_TYPES.TSEnumDeclaration) {
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
   * Checks whether a given node is unused expression or not.
   * @param node The node itself
   * @returns The node is an unused expression.
   */
  function isUnusedExpression(node: TSESTree.Expression): boolean {
    const parent = node.parent;

    if (parent.type === AST_NODE_TYPES.ExpressionStatement) {
      return true;
    }

    if (parent.type === AST_NODE_TYPES.SequenceExpression) {
      const isLastExpression =
        parent.expressions[parent.expressions.length - 1] === node;

      if (!isLastExpression) {
        return true;
      }
      return isUnusedExpression(parent);
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
    const refScope = ref.from.variableScope;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      isUnusedExpression(parent) &&
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

    return (
      ref.isRead() && // in RHS of an assignment for itself. e.g. `a = a + 1`
      // self update. e.g. `a += 1`, `a++`
      ((parent.type === AST_NODE_TYPES.AssignmentExpression &&
        !LOGICAL_ASSIGNMENT_OPERATORS.has(parent.operator) &&
        isUnusedExpression(parent) &&
        parent.left === id) ||
        (parent.type === AST_NODE_TYPES.UpdateExpression &&
          isUnusedExpression(parent)) ||
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

  const enumDeclNodes = getEnumDeclarations(variable);
  const isEnumDecl = enumDeclNodes.size > 0;

  const isImportedAsType = variable.defs.every(isTypeImport);

  let rhsNode: TSESTree.Node | null = null;

  return variable.references.some(ref => {
    const forItself = isReadForItself(ref, rhsNode);

    rhsNode = getRhsNode(ref, rhsNode);

    return (
      ref.isRead() &&
      !forItself &&
      !(!isImportedAsType && referenceContainsTypeQuery(ref.identifier)) &&
      !(isFunctionDefinition && isSelfReference(ref, functionNodes)) &&
      !(isTypeDecl && isInsideOneOf(ref, typeDeclNodes)) &&
      !(isModuleDecl && isSelfReference(ref, moduleDeclNodes)) &&
      !(isEnumDecl && isSelfReference(ref, enumDeclNodes))
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
export function collectVariables<
  MessageIds extends string,
  Options extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
): VariableAnalysis {
  return UnusedVarsVisitor.collectUnusedVariables(
    context.sourceCode.ast,
    ESLintUtils.nullThrows(
      context.sourceCode.scopeManager,
      'Missing required scope manager',
    ),
  );
}

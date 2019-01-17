// Type definitions for eslint-scope 4.0.0
// Project: http://github.com/eslint/eslint-scope
// Definitions by: Armano <https://github.com/armano2>
declare module 'eslint-scope/lib/options' {
  export type PatternVisitorCallback = (pattern: any, info: any) => void;

  export interface PatternVisitorOptions {
    processRightHandNodes?: boolean;
  }

  export abstract class Visitor {
    visitChildren(node: Node): void;
    visit(node: Node): void;
  }
}

declare module 'eslint-scope/lib/variable' {
  import * as eslint from 'eslint';
  import { Identifier } from 'estree';
  import Reference from 'eslint-scope/lib/reference';

  class Variable implements eslint.Scope.Variable {
    name: string;
    identifiers: Identifier[];
    references: Reference[];
    defs: eslint.Scope.Definition[];
  }
  export default Variable;
}

declare module 'eslint-scope/lib/definition' {
  import { Identifier, Node } from 'estree';

  class Definition {
    type: string;
    name: Identifier;
    node: Node;
    parent?: Node | null;
    index?: number | null;
    kind?: string | null;

    constructor(
      type: string,
      name: Identifier,
      node: Node,
      parent?: Node | null,
      index?: number | null,
      kind?: string | null
    );
  }

  class ParameterDefinition extends Definition {
    rest?: boolean;

    constructor(
      name: Identifier,
      node: Node,
      index?: number | null,
      rest?: boolean
    );
  }

  export { ParameterDefinition, Definition };
}

declare module 'eslint-scope/lib/pattern-visitor' {
  import ScopeManager from 'eslint-scope/lib/scope-manager';
  import { Node } from 'estree';
  import {
    PatternVisitorCallback,
    PatternVisitorOptions,
    Visitor
  } from 'eslint-scope/lib/options';

  class PatternVisitor extends Visitor {
    protected options: any;
    protected scopeManager: ScopeManager;
    protected parent?: Node;
    public rightHandNodes: Node[];

    static isPattern(node: Node): boolean;

    constructor(
      options: PatternVisitorOptions,
      rootPattern: any,
      callback: PatternVisitorCallback
    );

    Identifier(pattern: Node): void;
    Property(property: Node): void;
    ArrayPattern(pattern: Node): void;
    AssignmentPattern(pattern: Node): void;
    RestElement(pattern: Node): void;
    MemberExpression(node: Node): void;
    SpreadElement(node: Node): void;
    ArrayExpression(node: Node): void;
    AssignmentExpression(node: Node): void;
    CallExpression(node: Node): void;
  }

  export default PatternVisitor;
}

declare module 'eslint-scope/lib/referencer' {
  import { Scope } from 'eslint-scope/lib/scope';
  import ScopeManager from 'eslint-scope/lib/scope-manager';
  import { Node } from 'estree';
  import {
    PatternVisitorCallback,
    PatternVisitorOptions,
    Visitor
  } from 'eslint-scope/lib/options';

  class Referencer extends Visitor {
    protected isInnerMethodDefinition: boolean;
    protected options: any;
    protected scopeManager: ScopeManager;
    protected parent?: Node;

    constructor(options: any, scopeManager: ScopeManager);

    currentScope(): Scope;
    close(node: Node): void;
    pushInnerMethodDefinition(isInnerMethodDefinition: boolean): boolean;
    popInnerMethodDefinition(isInnerMethodDefinition: boolean): void;

    referencingDefaultValue(
      pattern: any,
      assignments: any,
      maybeImplicitGlobal: any,
      init: boolean
    ): void;
    visitPattern(
      node: Node,
      options: PatternVisitorOptions,
      callback: PatternVisitorCallback
    ): void;
    visitFunction(node: Node): void;
    visitClass(node: Node): void;
    visitProperty(node: Node): void;
    visitForIn(node: Node): void;
    visitVariableDeclaration(
      variableTargetScope: any,
      type: any,
      node: Node,
      index: any
    ): void;

    AssignmentExpression(node: Node): void;
    CatchClause(node: Node): void;
    Program(node: Node): void;
    Identifier(node: Node): void;
    UpdateExpression(node: Node): void;
    MemberExpression(node: Node): void;
    Property(node: Node): void;
    MethodDefinition(node: Node): void;
    BreakStatement(): void;
    ContinueStatement(): void;
    LabeledStatement(node: Node): void;
    ForStatement(node: Node): void;
    ClassExpression(node: Node): void;
    ClassDeclaration(node: Node): void;
    CallExpression(node: Node): void;
    BlockStatement(node: Node): void;
    ThisExpression(): void;
    WithStatement(node: Node): void;
    VariableDeclaration(node: Node): void;
    SwitchStatement(node: Node): void;
    FunctionDeclaration(node: Node): void;
    FunctionExpression(node: Node): void;
    ForOfStatement(node: Node): void;
    ForInStatement(node: Node): void;
    ArrowFunctionExpression(node: Node): void;
    ImportDeclaration(node: Node): void;
    visitExportDeclaration(node: Node): void;
    ExportDeclaration(node: Node): void;
    ExportNamedDeclaration(node: Node): void;
    ExportSpecifier(node: Node): void;
    MetaProperty(): void;
  }

  export default Referencer;
}

declare module 'eslint-scope/lib/scope' {
  import * as eslint from 'eslint';
  import { Node } from 'estree';
  import Reference from 'eslint-scope/lib/reference';
  import Variable from 'eslint-scope/lib/variable';
  import ScopeManager from 'eslint-scope/lib/scope-manager';
  import { Definition } from 'eslint-scope/lib/definition';

  type ScopeType =
    | 'block'
    | 'catch'
    | 'class'
    | 'for'
    | 'function'
    | 'function-expression-name'
    | 'global'
    | 'module'
    | 'switch'
    | 'with'
    | 'TDZ';

  class Scope implements eslint.Scope.Scope {
    type: ScopeType;
    isStrict: boolean;
    upper: Scope | null;
    childScopes: Scope[];
    variableScope: Scope;
    block: Node;
    variables: Variable[];
    set: Map<string, Variable>;
    references: Reference[];
    through: Reference[];
    thisFound?: boolean;
    functionExpressionScope: boolean;

    constructor(
      scopeManager: ScopeManager,
      type: ScopeType,
      upperScope: Scope | null,
      block: Node | null,
      isMethodDefinition: boolean
    );

    __shouldStaticallyClose(scopeManager: ScopeManager): boolean;
    __shouldStaticallyCloseForGlobal(ref: any): boolean;
    __staticCloseRef(ref: any): void;
    __dynamicCloseRef(ref: any): void;
    __globalCloseRef(ref: any): void;
    __close(scopeManager: ScopeManager): Scope;
    __isValidResolution(ref: any, variable: any): boolean;
    __resolve(ref: any): boolean;
    __delegateToUpperScope(ref: any): void;
    __addDeclaredVariablesOfNode(variable: any, node: Node): void;
    __defineGeneric(
      name: any,
      set: any,
      variables: any,
      node: any,
      def: Definition
    ): void;

    __define(node: Node, def: Definition): void;

    __referencing(
      node: Node,
      assign: number,
      writeExpr: Node,
      maybeImplicitGlobal: any,
      partial: any,
      init: any
    ): void;

    __detectEval(): void;
    __detectThis(): void;
    __isClosed(): boolean;
    /**
     * returns resolved {Reference}
     * @method Scope#resolve
     * @param {Espree.Identifier} ident - identifier to be resolved.
     * @returns {Reference} reference
     */
    resolve(ident: Node): Reference;

    /**
     * returns this scope is static
     * @method Scope#isStatic
     * @returns {boolean} static
     */
    isStatic(): boolean;

    /**
     * returns this scope has materialized arguments
     * @method Scope#isArgumentsMaterialized
     * @returns {boolean} arguemnts materialized
     */
    isArgumentsMaterialized(): boolean;

    /**
     * returns this scope has materialized `this` reference
     * @method Scope#isThisMaterialized
     * @returns {boolean} this materialized
     */
    isThisMaterialized(): boolean;

    isUsedName(name: any): boolean;
  }

  class GlobalScope extends Scope {
    constructor(scopeManager: ScopeManager, block: Node | null);
  }

  class ModuleScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: Node | null
    );
  }

  class FunctionExpressionNameScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: Node | null
    );
  }

  class CatchScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: Node | null
    );
  }

  class WithScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: Node | null
    );
  }

  class BlockScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: Node | null
    );
  }

  class SwitchScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: Node | null
    );
  }

  class FunctionScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: Node | null,
      isMethodDefinition: boolean
    );
  }

  class ForScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: Node | null
    );
  }

  class ClassScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: Node | null
    );
  }

  export {
    Scope,
    GlobalScope,
    ModuleScope,
    FunctionExpressionNameScope,
    CatchScope,
    WithScope,
    BlockScope,
    SwitchScope,
    FunctionScope,
    ForScope,
    ClassScope
  };
}

declare module 'eslint-scope/lib/reference' {
  import * as eslint from 'eslint';
  import { Identifier, Node } from 'estree';
  import { Scope } from 'eslint-scope/lib/scope';
  import Variable from 'eslint-scope/lib/variable';

  class Reference implements eslint.Scope.Reference {
    identifier: Identifier;
    from: Scope;
    resolved: Variable | null;
    writeExpr: Node | null;
    init: boolean;

    isWrite(): boolean;
    isRead(): boolean;
    isWriteOnly(): boolean;
    isReadOnly(): boolean;
    isReadWrite(): boolean;

    static READ: 0x1;
    static WRITE: 0x2;
    static RW: 0x3;
  }
  export default Reference;
}

declare module 'eslint-scope/lib/scope-manager' {
  import * as eslint from 'eslint';
  import { Scope } from 'eslint-scope/lib/scope';
  import Variable from 'eslint-scope/lib/variable';

  interface ScopeManagerOptions {
    directive?: boolean;
    optimistic?: boolean;
    ignoreEval?: boolean;
    nodejsScope?: boolean;
    sourceType?: 'module' | 'script';
    impliedStrict?: boolean;
    ecmaVersion?: number;
  }

  class ScopeManager implements eslint.Scope.ScopeManager {
    __options: ScopeManagerOptions;
    __currentScope: Scope;
    scopes: Scope[];
    globalScope: Scope;

    constructor(options: ScopeManagerOptions);

    __useDirective(): boolean;
    __isOptimistic(): boolean;
    __ignoreEval(): boolean;
    __isNodejsScope(): boolean;
    isModule(): boolean;
    isImpliedStrict(): boolean;
    isStrictModeSupported(): boolean;

    // Returns appropriate scope for this node.
    __get(node: Node): Scope;
    getDeclaredVariables(node: {}): Variable[];
    acquire(node: {}, inner?: boolean): Scope | null;
    acquireAll(node: Node): Scope | null;
    release(node: Node, inner?: boolean): Scope | null;
    attach(): void;
    detach(): void;

    __nestScope(scope: Scope): Scope;
    __nestGlobalScope(node: Node): Scope;
    __nestBlockScope(node: Node): Scope;
    __nestFunctionScope(node: Node, isMethodDefinition: boolean): Scope;
    __nestForScope(node: Node): Scope;
    __nestCatchScope(node: Node): Scope;
    __nestWithScope(node: Node): Scope;
    __nestClassScope(node: Node): Scope;
    __nestSwitchScope(node: Node): Scope;
    __nestModuleScope(node: Node): Scope;
    __nestFunctionExpressionNameScope(node: Node): Scope;

    __isES6(): boolean;
  }
  export default ScopeManager;
}

declare module 'eslint-scope' {
  import ScopeManager from 'eslint-scope/lib/scope-manager';
  import Reference from 'eslint-scope/lib/reference';
  import Scope from 'eslint-scope/lib/scope';
  import Variable from 'eslint-scope/lib/variable';

  interface AnalysisOptions {
    optimistic?: boolean;
    directive?: boolean;
    ignoreEval?: boolean;
    nodejsScope?: boolean;
    impliedStrict?: boolean;
    fallback?: string | ((node: {}) => string[]);
    sourceType?: 'script' | 'module';
    ecmaVersion?: number;
  }
  function analyze(ast: {}, options?: AnalysisOptions): ScopeManager;

  const version: string;

  export {
    AnalysisOptions,
    version,
    Reference,
    Variable,
    Scope,
    ScopeManager,
    analyze
  };
}

declare module 'eslint/lib/util/traverser';

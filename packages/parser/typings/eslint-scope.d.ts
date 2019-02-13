// Type definitions for eslint-scope 4.0.0
// Project: http://github.com/eslint/eslint-scope
// Definitions by: Armano <https://github.com/armano2>

//-----------------------------------------------------------------------
// TODO - figure out how to make ScopeManager exportable so that
//        the module's type declaration files don't break
//-----------------------------------------------------------------------

declare module 'eslint-scope/lib/options' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  export type PatternVisitorCallback = (
    pattern: TSESTree.Identifier,
    info: {
      rest: boolean;
      topLevel: boolean;
      assignments: TSESTree.AssignmentPattern[];
    }
  ) => void;

  export interface PatternVisitorOptions {
    processRightHandNodes?: boolean;
  }

  export abstract class Visitor {
    visitChildren<T extends TSESTree.BaseNode | undefined | null>(
      node?: T
    ): void;
    visit<T extends TSESTree.BaseNode | undefined | null>(node?: T): void;
  }
}

declare module 'eslint-scope/lib/variable' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import Reference from 'eslint-scope/lib/reference';
  import { Definition } from 'eslint-scope/lib/definition';

  export default class Variable {
    name: string;
    identifiers: TSESTree.Identifier[];
    references: Reference[];
    defs: Definition[];
    eslintUsed?: boolean;
    stack?: any;
    tainted?: boolean;
  }
}

declare module 'eslint-scope/lib/definition' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';

  export class Definition {
    type: string;
    name: TSESTree.Node;
    node: TSESTree.Node;
    parent?: TSESTree.Node | null;
    index?: number | null;
    kind?: string | null;
    rest?: boolean;

    constructor(
      type: string,
      name: TSESTree.Node,
      node: TSESTree.Node,
      parent?: TSESTree.Node | null,
      index?: number | null,
      kind?: string | null
    );
  }

  export class ParameterDefinition extends Definition {
    constructor(
      name: TSESTree.Node,
      node: TSESTree.Node,
      index?: number | null,
      rest?: boolean
    );
  }
}

declare module 'eslint-scope/lib/pattern-visitor' {
  import ScopeManager from 'eslint-scope/lib/scope-manager';
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import {
    PatternVisitorCallback,
    PatternVisitorOptions,
    Visitor
  } from 'eslint-scope/lib/options';

  export default class PatternVisitor extends Visitor {
    protected options: any;
    protected scopeManager: ScopeManager;
    protected parent?: TSESTree.Node;
    public rightHandNodes: TSESTree.Node[];
    public assignments: TSESTree.Node[];
    public restElements: TSESTree.Node[];

    static isPattern(node: TSESTree.Node): boolean;

    constructor(
      options: PatternVisitorOptions,
      rootPattern: any,
      callback: PatternVisitorCallback
    );

    Identifier(pattern: TSESTree.Node): void;
    Property(property: TSESTree.Node): void;
    ArrayPattern(pattern: TSESTree.Node): void;
    AssignmentPattern(pattern: TSESTree.Node): void;
    RestElement(pattern: TSESTree.Node): void;
    MemberExpression(node: TSESTree.Node): void;
    SpreadElement(node: TSESTree.Node): void;
    ArrayExpression(node: TSESTree.Node): void;
    AssignmentExpression(node: TSESTree.Node): void;
    CallExpression(node: TSESTree.Node): void;
  }
}

declare module 'eslint-scope/lib/referencer' {
  import { Scope } from 'eslint-scope/lib/scope';
  import ScopeManager from 'eslint-scope/lib/scope-manager';
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import {
    PatternVisitorCallback,
    PatternVisitorOptions,
    Visitor
  } from 'eslint-scope/lib/options';

  export default class Referencer<SC extends Scope, SM extends ScopeManager<SC>> extends Visitor {
    protected isInnerMethodDefinition: boolean;
    protected options: any;
    protected scopeManager: SM;
    protected parent?: TSESTree.Node;

    constructor(options: any, scopeManager: SM);

    currentScope(): SC;
    close(node: TSESTree.Node): void;
    pushInnerMethodDefinition(isInnerMethodDefinition: boolean): boolean;
    popInnerMethodDefinition(isInnerMethodDefinition: boolean): void;

    referencingDefaultValue(
      pattern: any,
      assignments: any,
      maybeImplicitGlobal: any,
      init: boolean
    ): void;
    visitPattern(
      node: TSESTree.Node,
      options: PatternVisitorOptions,
      callback: PatternVisitorCallback
    ): void;
    visitFunction(node: TSESTree.Node): void;
    visitClass(node: TSESTree.Node): void;
    visitProperty(
      node:
        | TSESTree.MethodDefinition
        | TSESTree.TSAbstractMethodDefinition
        | TSESTree.Property
    ): void;
    visitForIn(node: TSESTree.Node): void;
    visitVariableDeclaration(
      variableTargetScope: any,
      type: any,
      node: TSESTree.Node,
      index: any
    ): void;

    AssignmentExpression(node: TSESTree.Node): void;
    CatchClause(node: TSESTree.Node): void;
    Program(node: TSESTree.Node): void;
    Identifier(node: TSESTree.Node): void;
    UpdateExpression(node: TSESTree.Node): void;
    MemberExpression(node: TSESTree.Node): void;
    Property(node: TSESTree.Node): void;
    MethodDefinition(node: TSESTree.Node): void;
    BreakStatement(): void;
    ContinueStatement(): void;
    LabeledStatement(node: TSESTree.Node): void;
    ForStatement(node: TSESTree.Node): void;
    ClassExpression(node: TSESTree.Node): void;
    ClassDeclaration(node: TSESTree.Node): void;
    CallExpression(node: TSESTree.Node): void;
    BlockStatement(node: TSESTree.Node): void;
    ThisExpression(): void;
    WithStatement(node: TSESTree.Node): void;
    VariableDeclaration(node: TSESTree.Node): void;
    SwitchStatement(node: TSESTree.Node): void;
    FunctionDeclaration(node: TSESTree.Node): void;
    FunctionExpression(node: TSESTree.Node): void;
    ForOfStatement(node: TSESTree.Node): void;
    ForInStatement(node: TSESTree.Node): void;
    ArrowFunctionExpression(node: TSESTree.Node): void;
    ImportDeclaration(node: TSESTree.Node): void;
    visitExportDeclaration(node: TSESTree.Node): void;
    ExportDeclaration(node: TSESTree.Node): void;
    ExportNamedDeclaration(node: TSESTree.Node): void;
    ExportSpecifier(node: TSESTree.Node): void;
    MetaProperty(): void;
  }
}

declare module 'eslint-scope/lib/scope' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import Reference from 'eslint-scope/lib/reference';
  import Variable from 'eslint-scope/lib/variable';
  import ScopeManager from 'eslint-scope/lib/scope-manager';
  import { Definition } from 'eslint-scope/lib/definition';

  export type ScopeType =
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
    | 'TDZ'
    | 'enum'
    | 'empty-function'
    | 'interface'
    | 'type-alias';

  export class Scope {
    type: ScopeType;
    isStrict: boolean;
    upper: Scope | null;
    childScopes: Scope[];
    variableScope: Scope;
    block: TSESTree.Node;
    variables: Variable[];
    set: Map<string, Variable>;
    references: Reference[];
    through: Reference[];
    thisFound?: boolean;
    taints: Map<string, boolean>;
    functionExpressionScope: boolean;
    __left: Reference[];

    constructor(
      scopeManager: ScopeManager,
      type: ScopeType,
      upperScope: Scope | null,
      block: TSESTree.Node | null,
      isMethodDefinition: boolean
    );

    __shouldStaticallyClose(scopeManager: ScopeManager): boolean;
    __shouldStaticallyCloseForGlobal(ref: any): boolean;
    __staticCloseRef(ref: any): void;
    __dynamicCloseRef(ref: any): void;
    __globalCloseRef(ref: any): void;
    __close(scopeManager: ScopeManager): Scope;
    __isValidResolution(ref: any, variable: any): variable is Variable;
    __resolve(ref: Reference): boolean;
    __delegateToUpperScope(ref: any): void;
    __addDeclaredVariablesOfNode(variable: any, node: TSESTree.Node): void;
    __defineGeneric(
      name: string,
      set: Map<string, Variable>,
      variables: Variable[],
      node: TSESTree.Identifier,
      def: Definition
    ): void;

    __define(node: TSESTree.Node, def: Definition): void;

    __referencing(
      node: TSESTree.Node,
      assign?: number,
      writeExpr?: TSESTree.Node,
      maybeImplicitGlobal?: any,
      partial?: any,
      init?: any
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
    resolve(ident: TSESTree.Node): Reference;

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

  export class GlobalScope extends Scope {
    constructor(scopeManager: ScopeManager, block: TSESTree.Node | null);
  }

  export class ModuleScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: TSESTree.Node | null
    );
  }

  export class FunctionExpressionNameScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: TSESTree.Node | null
    );
  }

  export class CatchScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: TSESTree.Node | null
    );
  }

  export class WithScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: TSESTree.Node | null
    );
  }

  export class BlockScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: TSESTree.Node | null
    );
  }

  export class SwitchScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: TSESTree.Node | null
    );
  }

  export class FunctionScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: TSESTree.Node | null,
      isMethodDefinition: boolean
    );
  }

  export class ForScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: TSESTree.Node | null
    );
  }

  export class ClassScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: TSESTree.Node | null
    );
  }
}

declare module 'eslint-scope/lib/reference' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import { Scope } from 'eslint-scope/lib/scope';
  import Variable from 'eslint-scope/lib/variable';

  export type ReferenceFlag = 0x1 | 0x2 | 0x3;

  export default class Reference {
    identifier: TSESTree.Identifier;
    from: Scope;
    resolved: Variable | null;
    writeExpr: TSESTree.Node | null;
    init: boolean;
    partial: boolean;
    protected __maybeImplicitGlobal: boolean;
    tainted?: boolean;

    typeMode?: boolean;

    constructor(
      identifier: TSESTree.Identifier,
      scope: Scope,
      flag?: ReferenceFlag,
      writeExpr?: TSESTree.Node | null,
      maybeImplicitGlobal?: boolean,
      partial?: boolean,
      init?: boolean
    );

    isWrite(): boolean;
    isRead(): boolean;
    isWriteOnly(): boolean;
    isReadOnly(): boolean;
    isReadWrite(): boolean;

    static READ: 0x1;
    static WRITE: 0x2;
    static RW: 0x3;
  }
}

declare module 'eslint-scope/lib/scope-manager' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import { Scope } from 'eslint-scope/lib/scope';
  import Variable from 'eslint-scope/lib/variable';

  export interface ScopeManagerOptions {
    directive?: boolean;
    optimistic?: boolean;
    ignoreEval?: boolean;
    nodejsScope?: boolean;
    sourceType?: 'module' | 'script';
    impliedStrict?: boolean;
    ecmaVersion?: number;
  }

  export default class ScopeManager<SC extends Scope = Scope> {
    protected __options: ScopeManagerOptions;
    __currentScope: SC;
    protected __nodeToScope: WeakMap<TSESTree.Node, SC[]>;
    protected __declaredVariables: WeakMap<TSESTree.Node, Variable[]>;

    scopes: SC[];
    globalScope: SC;

    constructor(options: ScopeManagerOptions);

    __useDirective(): boolean;
    __isOptimistic(): boolean;
    __ignoreEval(): boolean;
    __isNodejsScope(): boolean;
    isModule(): boolean;
    isImpliedStrict(): boolean;
    isStrictModeSupported(): boolean;

    // Returns appropriate scope for this node.
    __get(node: TSESTree.Node): SC[] | undefined;
    getDeclaredVariables(node: TSESTree.Node): Variable[];
    acquire(node: TSESTree.Node, inner?: boolean): SC | null;
    acquireAll(node: TSESTree.Node): SC | null;
    release(node: TSESTree.Node, inner?: boolean): SC | null;
    attach(): void;
    detach(): void;

    __nestScope<T extends Scope>(scope: T): T;
    __nestGlobalScope(node: TSESTree.Node): SC;
    __nestBlockScope(node: TSESTree.Node): SC;
    __nestFunctionScope(
      node: TSESTree.Node,
      isMethodDefinition: boolean
    ): SC;
    __nestForScope(node: TSESTree.Node): SC;
    __nestCatchScope(node: TSESTree.Node): SC;
    __nestWithScope(node: TSESTree.Node): SC;
    __nestClassScope(node: TSESTree.Node): SC;
    __nestSwitchScope(node: TSESTree.Node): SC;
    __nestModuleScope(node: TSESTree.Node): SC;
    __nestFunctionExpressionNameScope(node: TSESTree.Node): SC;

    __isES6(): boolean;
  }
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

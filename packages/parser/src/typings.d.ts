// Type definitions for eslint-scope 4.0.0
// Project: http://github.com/eslint/eslint-scope
// Definitions by: Armano <https://github.com/armano2>
declare module 'eslint-scope/lib/options' {
  import { es } from '@typescript-eslint/typescript-estree';
  export type PatternVisitorCallback = (pattern: any, info: any) => void;

  export interface PatternVisitorOptions {
    processRightHandNodes?: boolean;
  }

  export abstract class Visitor {
    visitChildren<T extends es.BaseNode>(node?: T): void;
    visit<T extends es.BaseNode>(node?: T): void;
  }
}

declare module 'eslint-scope/lib/variable' {
  import { es } from '@typescript-eslint/typescript-estree';
  import Reference from 'eslint-scope/lib/reference';
  import { Definition } from 'eslint-scope/lib/definition';

  export default class Variable {
    name: string;
    identifiers: es.Identifier[];
    references: Reference[];
    defs: Definition[];
  }
}

declare module 'eslint-scope/lib/definition' {
  import { es } from '@typescript-eslint/typescript-estree';

  export class Definition {
    type: string;
    name: es.BindingName;
    node: es.Node;
    parent?: es.Node | null;
    index?: number | null;
    kind?: string | null;

    constructor(
      type: string,
      name: es.BindingName | es.PropertyName,
      node: es.Node,
      parent?: es.Node | null,
      index?: number | null,
      kind?: string | null
    );
  }

  export class ParameterDefinition extends Definition {
    rest?: boolean;

    constructor(
      name: es.BindingName | es.PropertyName,
      node: es.Node,
      index?: number | null,
      rest?: boolean
    );
  }
}

declare module 'eslint-scope/lib/pattern-visitor' {
  import ScopeManager from 'eslint-scope/lib/scope-manager';
  import { es } from '@typescript-eslint/typescript-estree';
  import {
    PatternVisitorCallback,
    PatternVisitorOptions,
    Visitor
  } from 'eslint-scope/lib/options';

  export default class PatternVisitor extends Visitor {
    protected options: any;
    protected scopeManager: ScopeManager;
    protected parent?: es.Node;
    public rightHandNodes: es.Node[];

    static isPattern(node: es.Node): boolean;

    constructor(
      options: PatternVisitorOptions,
      rootPattern: any,
      callback: PatternVisitorCallback
    );

    Identifier(pattern: es.Node): void;
    Property(property: es.Node): void;
    ArrayPattern(pattern: es.Node): void;
    AssignmentPattern(pattern: es.Node): void;
    RestElement(pattern: es.Node): void;
    MemberExpression(node: es.Node): void;
    SpreadElement(node: es.Node): void;
    ArrayExpression(node: es.Node): void;
    AssignmentExpression(node: es.Node): void;
    CallExpression(node: es.Node): void;
  }
}

declare module 'eslint-scope/lib/referencer' {
  import { Scope } from 'eslint-scope/lib/scope';
  import ScopeManager from 'eslint-scope/lib/scope-manager';
  import { es } from '@typescript-eslint/typescript-estree';
  import {
    PatternVisitorCallback,
    PatternVisitorOptions,
    Visitor
  } from 'eslint-scope/lib/options';

  export default class Referencer extends Visitor {
    protected isInnerMethodDefinition: boolean;
    protected options: any;
    protected scopeManager: ScopeManager;
    protected parent?: es.Node;

    constructor(options: any, scopeManager: ScopeManager);

    currentScope(): Scope;
    close(node: es.Node): void;
    pushInnerMethodDefinition(isInnerMethodDefinition: boolean): boolean;
    popInnerMethodDefinition(isInnerMethodDefinition: boolean): void;

    referencingDefaultValue(
      pattern: any,
      assignments: any,
      maybeImplicitGlobal: any,
      init: boolean
    ): void;
    visitPattern(
      node: es.Node,
      options: PatternVisitorOptions,
      callback: PatternVisitorCallback
    ): void;
    visitFunction(node: es.Node): void;
    visitClass(node: es.Node): void;
    visitProperty(node: es.Node): void;
    visitForIn(node: es.Node): void;
    visitVariableDeclaration(
      variableTargetScope: any,
      type: any,
      node: es.Node,
      index: any
    ): void;

    AssignmentExpression(node: es.Node): void;
    CatchClause(node: es.Node): void;
    Program(node: es.Node): void;
    Identifier(node: es.Node): void;
    UpdateExpression(node: es.Node): void;
    MemberExpression(node: es.Node): void;
    Property(node: es.Node): void;
    MethodDefinition(node: es.Node): void;
    BreakStatement(): void;
    ContinueStatement(): void;
    LabeledStatement(node: es.Node): void;
    ForStatement(node: es.Node): void;
    ClassExpression(node: es.Node): void;
    ClassDeclaration(node: es.Node): void;
    CallExpression(node: es.Node): void;
    BlockStatement(node: es.Node): void;
    ThisExpression(): void;
    WithStatement(node: es.Node): void;
    VariableDeclaration(node: es.Node): void;
    SwitchStatement(node: es.Node): void;
    FunctionDeclaration(node: es.Node): void;
    FunctionExpression(node: es.Node): void;
    ForOfStatement(node: es.Node): void;
    ForInStatement(node: es.Node): void;
    ArrowFunctionExpression(node: es.Node): void;
    ImportDeclaration(node: es.Node): void;
    visitExportDeclaration(node: es.Node): void;
    ExportDeclaration(node: es.Node): void;
    ExportNamedDeclaration(node: es.Node): void;
    ExportSpecifier(node: es.Node): void;
    MetaProperty(): void;
  }
}

declare module 'eslint-scope/lib/scope' {
  import { es } from '@typescript-eslint/typescript-estree';
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
    | 'TDZ';

  export class Scope {
    type: ScopeType;
    isStrict: boolean;
    upper: Scope | null;
    childScopes: Scope[];
    variableScope: Scope;
    block: es.Node;
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
      block: es.Node | null,
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
    __addDeclaredVariablesOfNode(variable: any, node: es.Node): void;
    __defineGeneric(
      name: any,
      set: any,
      variables: any,
      node: any,
      def: Definition
    ): void;

    __define(node: es.Node, def: Definition): void;

    __referencing(
      node: es.Node,
      assign: number,
      writeExpr: es.Node,
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
    resolve(ident: es.Node): Reference;

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
    constructor(scopeManager: ScopeManager, block: es.Node | null);
  }

  export class ModuleScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: es.Node | null
    );
  }

  export class FunctionExpressionNameScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: es.Node | null
    );
  }

  export class CatchScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: es.Node | null
    );
  }

  export class WithScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: es.Node | null
    );
  }

  export class BlockScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: es.Node | null
    );
  }

  export class SwitchScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: es.Node | null
    );
  }

  export class FunctionScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: es.Node | null,
      isMethodDefinition: boolean
    );
  }

  export class ForScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: es.Node | null
    );
  }

  export class ClassScope extends Scope {
    constructor(
      scopeManager: ScopeManager,
      upperScope: Scope,
      block: es.Node | null
    );
  }
}

declare module 'eslint-scope/lib/reference' {
  import { es } from '@typescript-eslint/typescript-estree';
  import { Scope } from 'eslint-scope/lib/scope';
  import Variable from 'eslint-scope/lib/variable';

  export default class Reference {
    identifier: es.Identifier;
    from: Scope;
    resolved: Variable | null;
    writeExpr: es.Node | null;
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
}

declare module 'eslint-scope/lib/scope-manager' {
  import { es } from '@typescript-eslint/typescript-estree';
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

  export default class ScopeManager {
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
    __get(node: es.Node): Scope;
    getDeclaredVariables(node: es.Node): Variable[];
    acquire(node: es.Node, inner?: boolean): Scope | null;
    acquireAll(node: es.Node): Scope | null;
    release(node: es.Node, inner?: boolean): Scope | null;
    attach(): void;
    detach(): void;

    __nestScope(scope: Scope): Scope;
    __nestGlobalScope(node: es.Node): Scope;
    __nestBlockScope(node: es.Node): Scope;
    __nestFunctionScope(node: es.Node, isMethodDefinition: boolean): Scope;
    __nestForScope(node: es.Node): Scope;
    __nestCatchScope(node: es.Node): Scope;
    __nestWithScope(node: es.Node): Scope;
    __nestClassScope(node: es.Node): Scope;
    __nestSwitchScope(node: es.Node): Scope;
    __nestModuleScope(node: es.Node): Scope;
    __nestFunctionExpressionNameScope(node: es.Node): Scope;

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

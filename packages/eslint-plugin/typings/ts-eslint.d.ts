/*
Redefine these types for these reasons:
1) We can better control what properties are option and what are not.
2) We have to replace definitions with our definitions which use our typescript-estree types.
3) We can better document the fields so it's easier for new contributers to understand.

The def is wrapped up in a fake module so that it can be used in eslint-rules.d.ts
*/

declare module 'ts-eslint' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import { ParserServices } from '@typescript-eslint/parser';
  import { AST, Linter } from 'eslint';
  import { JSONSchema4 } from 'json-schema';

  //#region SourceCode

  namespace SourceCode {
    export interface Config {
      text: string;
      ast: AST.Program;
      parserServices?: ParserServices;
      scopeManager?: Scope.ScopeManager;
      visitorKeys?: VisitorKeys;
    }

    export interface VisitorKeys {
      [nodeType: string]: string[];
    }

    export type FilterPredicate = (
      tokenOrComment: TSESTree.Token | TSESTree.Comment
    ) => boolean;

    export type CursorWithSkipOptions =
      | number
      | FilterPredicate
      | {
          includeComments?: boolean;
          filter?: FilterPredicate;
          skip?: number;
        };

    export type CursorWithCountOptions =
      | number
      | FilterPredicate
      | {
          includeComments?: boolean;
          filter?: FilterPredicate;
          count?: number;
        };
  }

  class SourceCode {
    text: string;
    ast: AST.Program;
    lines: string[];
    hasBOM: boolean;
    parserServices: ParserServices;
    scopeManager: Scope.ScopeManager;
    visitorKeys: SourceCode.VisitorKeys;

    constructor(text: string, ast: AST.Program);
    // eslint-disable-next-line no-dupe-class-members
    constructor(config: SourceCode.Config);

    static splitLines(text: string): string[];

    getText(
      node?: TSESTree.Node,
      beforeCount?: number,
      afterCount?: number
    ): string;

    getLines(): string[];

    getAllComments(): TSESTree.Comment[];

    getComments(
      node: TSESTree.Node
    ): { leading: TSESTree.Comment[]; trailing: TSESTree.Comment[] };

    getJSDocComment(node: TSESTree.Node): TSESTree.Node | TSESTree.Token | null;

    getNodeByRangeIndex(index: number): TSESTree.Node | null;

    isSpaceBetweenTokens(
      first: TSESTree.Token,
      second: TSESTree.Token
    ): boolean;

    getLocFromIndex(index: number): TSESTree.LineAndColumnData;

    getIndexFromLoc(location: TSESTree.LineAndColumnData): number;

    // Inherited methods from TokenStore
    // ---------------------------------

    getTokenByRangeStart(
      offset: number,
      options?: { includeComments?: boolean }
    ): TSESTree.Token | null;

    getFirstToken(
      node: TSESTree.Node,
      options?: SourceCode.CursorWithSkipOptions
    ): TSESTree.Token | null;

    getFirstTokens(
      node: TSESTree.Node,
      options?: SourceCode.CursorWithCountOptions
    ): TSESTree.Token[];

    getLastToken(
      node: TSESTree.Node,
      options?: SourceCode.CursorWithSkipOptions
    ): TSESTree.Token | null;

    getLastTokens(
      node: TSESTree.Node,
      options?: SourceCode.CursorWithCountOptions
    ): TSESTree.Token[];

    getTokenBefore(
      node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      options?: SourceCode.CursorWithSkipOptions
    ): TSESTree.Token | null;

    getTokensBefore(
      node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      options?: SourceCode.CursorWithCountOptions
    ): TSESTree.Token[];

    getTokenAfter(
      node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      options?: SourceCode.CursorWithSkipOptions
    ): TSESTree.Token | null;

    getTokensAfter(
      node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      options?: SourceCode.CursorWithCountOptions
    ): TSESTree.Token[];

    getFirstTokenBetween(
      left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      options?: SourceCode.CursorWithSkipOptions
    ): TSESTree.Token | null;

    getFirstTokensBetween(
      left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      options?: SourceCode.CursorWithCountOptions
    ): TSESTree.Token[];

    getLastTokenBetween(
      left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      options?: SourceCode.CursorWithSkipOptions
    ): TSESTree.Token | null;

    getLastTokensBetween(
      left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      options?: SourceCode.CursorWithCountOptions
    ): TSESTree.Token[];

    getTokensBetween(
      left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
      padding?:
        | number
        | SourceCode.FilterPredicate
        | SourceCode.CursorWithCountOptions
    ): TSESTree.Token[];

    getTokens(
      node: TSESTree.Node,
      beforeCount?: number,
      afterCount?: number
    ): TSESTree.Token[];
    // eslint-disable-next-line no-dupe-class-members
    getTokens(
      node: TSESTree.Node,
      options: SourceCode.FilterPredicate | SourceCode.CursorWithCountOptions
    ): TSESTree.Token[];

    commentsExistBetween(
      left: TSESTree.Node | TSESTree.Token,
      right: TSESTree.Node | TSESTree.Token
    ): boolean;

    getCommentsBefore(
      nodeOrToken: TSESTree.Node | TSESTree.Token
    ): TSESTree.Comment[];

    getCommentsAfter(
      nodeOrToken: TSESTree.Node | TSESTree.Token
    ): TSESTree.Comment[];

    getCommentsInside(node: TSESTree.Node): TSESTree.Comment[];
  }

  //#endregion SourceCode

  //#region Rule

  interface RuleMetaDataDocs {
    /**
     * The general category the rule falls within
     */
    category: 'Best Practices' | 'Stylistic Issues' | 'Variables';
    /**
     * Concise description of the rule
     */
    description: string;
    /**
     * Extra information linking the rule to a tslint rule
     */
    extraDescription?: string[];
    /**
     * The recommendation level for the rule.
     * Used by the build tools to generate the recommended config.
     * Set to false to not include it as a recommendation
     */
    recommended: 'error' | 'warn' | false;
    /**
     * The URL of the rule's docs
     */
    url: string;
  }
  interface RuleMetaData<TMessageIds extends string> {
    /**
     * True if the rule is deprecated, false otherwise
     */
    deprecated?: boolean;
    /**
     * Documentation for the rule
     */
    docs: RuleMetaDataDocs;
    /**
     * The fixer category. Omit if there is no fixer
     */
    fixable?: 'code' | 'whitespace';
    /**
     * A map of messages which the rule can report.
     * The key is the messageId, and the string is the parameterised error string.
     * See: https://eslint.org/docs/developer-guide/working-with-rules#messageids
     */
    messages: Record<TMessageIds, string>;
    /**
     * The type of rule.
     * - `"problem"` means the rule is identifying code that either will cause an error or may cause a confusing behavior. Developers should consider this a high priority to resolve.
     * - `"suggestion"` means the rule is identifying something that could be done in a better way but no errors will occur if the code isn’t changed.
     * - `"layout"` means the rule cares primarily about whitespace, semicolons, commas, and parentheses, all the parts of the program that determine how the code looks rather than how it executes. These rules work on parts of the code that aren’t specified in the AST.
     */
    type: 'suggestion' | 'problem' | 'layout';
    /**
     * The name of the rule this rule was replaced by, if it was deprecated.
     */
    replacedBy?: string;
    /**
     * The options schema. Supply an empty array if there are no options.
     */
    schema: JSONSchema4 | JSONSchema4[];
  }

  interface RuleFix {
    range: AST.Range;
    text: string;
  }

  interface RuleFixer {
    insertTextAfter(
      nodeOrToken: TSESTree.Node | TSESTree.Token,
      text: string
    ): RuleFix;

    insertTextAfterRange(range: AST.Range, text: string): RuleFix;

    insertTextBefore(
      nodeOrToken: TSESTree.Node | TSESTree.Token,
      text: string
    ): RuleFix;

    insertTextBeforeRange(range: AST.Range, text: string): RuleFix;

    remove(nodeOrToken: TSESTree.Node | TSESTree.Token): RuleFix;

    removeRange(range: AST.Range): RuleFix;

    replaceText(
      nodeOrToken: TSESTree.Node | TSESTree.Token,
      text: string
    ): RuleFix;

    replaceTextRange(range: AST.Range, text: string): RuleFix;
  }

  type ReportFixFunction = (fixer: RuleFixer) => null | RuleFix | RuleFix[];

  interface ReportDescriptor<TMessageIds extends string> {
    /**
     * The parameters for the message string associated with `messageId`.
     */
    data?: Record<string, any>;
    /**
     * The fixer function.
     */
    fix?: ReportFixFunction | null;
    /**
     * The messageId which is being reported.
     */
    messageId: TMessageIds;
    /**
     * The Node or AST Token which the report is being attached to
     */
    node: TSESTree.Node | TSESTree.Comment | TSESTree.Token;
    /**
     * An override of the location of the report
     */
    loc?: TSESTree.SourceLocation;
  }

  interface RuleContext<
    TMessageIds extends string,
    TOptions extends Readonly<any[]>
  > {
    /**
     * The rule ID.
     */
    id: string;
    /**
     * An array of the configured options for this rule.
     * This array does not include the rule severity.
     */
    options: TOptions;
    /**
     * The shared settings from configuration.
     * We do not have any shared settings in this plugin.
     */
    settings: {};
    /**
     * The name of the parser from configuration.
     */
    parserPath: string;
    /**
     * The parser options configured for this run
     */
    parserOptions: Linter.ParserOptions;
    /**
     * An object containing parser-provided services for rules
     */
    parserServices?: ParserServices;

    /**
     * Returns an array of the ancestors of the currently-traversed node, starting at
     * the root of the AST and continuing through the direct parent of the current node.
     * This array does not include the currently-traversed node itself.
     */
    getAncestors(): TSESTree.Node[];

    /**
     * Returns a list of variables declared by the given node.
     * This information can be used to track references to variables.
     */
    getDeclaredVariables(node: TSESTree.Node): Scope.Variable[];

    /**
     * Returns the filename associated with the source.
     */
    getFilename(): string;

    /**
     * Returns the scope of the currently-traversed node.
     * This information can be used track references to variables.
     */
    getScope(): Scope.Scope;

    /**
     * Returns a SourceCode object that you can use to work with the source that
     * was passed to ESLint.
     */
    getSourceCode(): SourceCode;

    /**
     * Marks a variable with the given name in the current scope as used.
     * This affects the no-unused-vars rule.
     */
    markVariableAsUsed(name: string): boolean;

    /**
     * Reports a problem in the code.
     */
    report(descriptor: ReportDescriptor<TMessageIds>): void;
  }

  // This isn't the correct signature, but it makes it easier to do custom unions within reusable listneers
  // never will break someone's code unless they specifically type the function argument
  type RuleFunction = (node: never) => void;
  type RuleListener = Record<string, RuleFunction>;

  interface RuleModule<
    TMessageIds extends string,
    TOptions extends Readonly<any[]>,
    // for extending base rules
    TRuleListener extends RuleListener = RuleListener
  > {
    /**
     * Metadata about the rule
     */
    meta: RuleMetaData<TMessageIds>;

    /**
     * Function which returns an object with methods that ESLint calls to “visit”
     * nodes while traversing the abstract syntax tree.
     */
    create(context: RuleContext<TMessageIds, TOptions>): TRuleListener;
  }

  //#endregion Rule

  namespace Scope {
    interface ScopeManager {
      scopes: Scope[];
      globalScope: Scope | null;

      acquire(node: TSESTree.Node, inner?: boolean): Scope | null;

      getDeclaredVariables(node: TSESTree.Node): Variable[];
    }

    interface Reference {
      identifier: TSESTree.Identifier;
      from: Scope;
      resolved: Variable | null;
      writeExpr: TSESTree.Node | null;
      init: boolean;

      isWrite(): boolean;

      isRead(): boolean;

      isWriteOnly(): boolean;

      isReadOnly(): boolean;

      isReadWrite(): boolean;
    }

    interface Variable {
      name: string;
      identifiers: TSESTree.Identifier[];
      references: Reference[];
      defs: Definition[];
      scope: Scope;
      eslintUsed?: boolean;
    }

    interface Scope {
      type:
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
      isStrict: boolean;
      upper: Scope | null;
      childScopes: Scope[];
      variableScope: Scope;
      block: TSESTree.Node;
      variables: Variable[];
      set: Map<string, Variable>;
      references: Reference[];
      through: Reference[];
      functionExpressionScope: boolean;
    }

    type DefinitionType =
      | { type: 'CatchClause'; node: TSESTree.CatchClause; parent: null }
      | {
          type: 'ClassName';
          node: TSESTree.ClassDeclaration | TSESTree.ClassExpression;
          parent: null;
        }
      | {
          type: 'FunctionName';
          node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression;
          parent: null;
        }
      | { type: 'ImplicitGlobalVariable'; node: TSESTree.Program; parent: null }
      | {
          type: 'ImportBinding';
          node:
            | TSESTree.ImportSpecifier
            | TSESTree.ImportDefaultSpecifier
            | TSESTree.ImportNamespaceSpecifier;
          parent: TSESTree.ImportDeclaration;
        }
      | {
          type: 'Parameter';
          node:
            | TSESTree.FunctionDeclaration
            | TSESTree.FunctionExpression
            | TSESTree.ArrowFunctionExpression;
          parent: null;
        }
      | { type: 'TDZ'; node: any; parent: null }
      | {
          type: 'Variable';
          node: TSESTree.VariableDeclarator;
          parent: TSESTree.VariableDeclaration;
        };

    type Definition = DefinitionType & { name: TSESTree.Identifier };
  }

  export {
    ReportDescriptor,
    ReportFixFunction,
    RuleContext,
    RuleFix,
    RuleFunction,
    RuleListener,
    RuleMetaData,
    RuleMetaDataDocs,
    Scope
  };
  export default RuleModule;
}

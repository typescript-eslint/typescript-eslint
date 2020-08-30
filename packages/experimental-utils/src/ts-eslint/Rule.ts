import { JSONSchema4 } from '../json-schema';
import { ParserServices, TSESTree } from '../ts-estree';
import { AST } from './AST';
import { Linter } from './Linter';
import { Scope } from './Scope';
import { SourceCode } from './SourceCode';

interface RuleMetaDataDocs {
  /**
   * The general category the rule falls within
   */
  category:
    | 'Best Practices'
    | 'Stylistic Issues'
    | 'Variables'
    | 'Possible Errors';
  /**
   * Concise description of the rule
   */
  description: string;
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
  /**
   * Specifies whether the rule can return suggestions.
   */
  suggestion?: boolean;
  /**
   * Does the rule require us to create a full TypeScript Program in order for it
   * to type-check code. This is only used for documentation purposes.
   */
  requiresTypeChecking?: boolean;
  /**
   * Does the rule extend (or is it based off of) an ESLint code rule?
   * Alternately accepts the name of the base rule, in case the rule has been renamed.
   * This is only used for documentation purposes.
   */
  extendsBaseRule?: boolean | string;
}
interface RuleMetaData<TMessageIds extends string> {
  /**
   * True if the rule is deprecated, false otherwise
   */
  deprecated?: boolean;
  /**
   * Documentation for the rule, unnecessary for custom rules/plugins
   */
  docs?: RuleMetaDataDocs;
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
  replacedBy?: string[];
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
    text: string,
  ): RuleFix;

  insertTextAfterRange(range: AST.Range, text: string): RuleFix;

  insertTextBefore(
    nodeOrToken: TSESTree.Node | TSESTree.Token,
    text: string,
  ): RuleFix;

  insertTextBeforeRange(range: AST.Range, text: string): RuleFix;

  remove(nodeOrToken: TSESTree.Node | TSESTree.Token): RuleFix;

  removeRange(range: AST.Range): RuleFix;

  replaceText(
    nodeOrToken: TSESTree.Node | TSESTree.Token,
    text: string,
  ): RuleFix;

  replaceTextRange(range: AST.Range, text: string): RuleFix;
}

type ReportFixFunction = (
  fixer: RuleFixer,
) => null | RuleFix | RuleFix[] | IterableIterator<RuleFix>;
type ReportSuggestionArray<TMessageIds extends string> = ReportDescriptorBase<
  TMessageIds
>[];

interface ReportDescriptorBase<TMessageIds extends string> {
  /**
   * The parameters for the message string associated with `messageId`.
   */
  readonly data?: Readonly<Record<string, unknown>>;
  /**
   * The fixer function.
   */
  readonly fix?: ReportFixFunction | null;
  /**
   * The messageId which is being reported.
   */
  readonly messageId: TMessageIds;

  // we disallow this because it's much better to use messageIds for reusable errors that are easily testable
  // readonly desc?: string;
}
interface ReportDescriptorWithSuggestion<TMessageIds extends string>
  extends ReportDescriptorBase<TMessageIds> {
  /**
   * 6.7's Suggestions API
   */
  readonly suggest?: Readonly<ReportSuggestionArray<TMessageIds>> | null;
}

interface ReportDescriptorNodeOptionalLoc {
  /**
   * The Node or AST Token which the report is being attached to
   */
  readonly node: TSESTree.Node | TSESTree.Comment | TSESTree.Token;
  /**
   * An override of the location of the report
   */
  readonly loc?:
    | Readonly<TSESTree.SourceLocation>
    | Readonly<TSESTree.LineAndColumnData>;
}
interface ReportDescriptorLocOnly {
  /**
   * An override of the location of the report
   */
  loc: Readonly<TSESTree.SourceLocation> | Readonly<TSESTree.LineAndColumnData>;
}
type ReportDescriptor<
  TMessageIds extends string
> = ReportDescriptorWithSuggestion<TMessageIds> &
  (ReportDescriptorNodeOptionalLoc | ReportDescriptorLocOnly);

interface RuleContext<
  TMessageIds extends string,
  TOptions extends readonly unknown[]
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
   * The shared settings from configuration.
   * We do not have any shared settings in this plugin.
   */
  settings: Record<string, unknown>;

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
  getSourceCode(): Readonly<SourceCode>;

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

// This isn't the correct signature, but it makes it easier to do custom unions within reusable listeners
// never will break someone's code unless they specifically type the function argument
type RuleFunction<T extends TSESTree.BaseNode = never> = (node: T) => void;

interface RuleListener {
  [nodeSelector: string]: RuleFunction | undefined;
  ArrayExpression?: RuleFunction<TSESTree.ArrayExpression>;
  ArrayPattern?: RuleFunction<TSESTree.ArrayPattern>;
  ArrowFunctionExpression?: RuleFunction<TSESTree.ArrowFunctionExpression>;
  AssignmentPattern?: RuleFunction<TSESTree.AssignmentPattern>;
  AssignmentExpression?: RuleFunction<TSESTree.AssignmentExpression>;
  AwaitExpression?: RuleFunction<TSESTree.AwaitExpression>;
  BigIntLiteral?: RuleFunction<TSESTree.BigIntLiteral>;
  BinaryExpression?: RuleFunction<TSESTree.BinaryExpression>;
  BlockStatement?: RuleFunction<TSESTree.BlockStatement>;
  BreakStatement?: RuleFunction<TSESTree.BreakStatement>;
  CallExpression?: RuleFunction<TSESTree.CallExpression>;
  CatchClause?: RuleFunction<TSESTree.CatchClause>;
  ChainExpression?: RuleFunction<TSESTree.ChainExpression>;
  ClassBody?: RuleFunction<TSESTree.ClassBody>;
  ClassDeclaration?: RuleFunction<TSESTree.ClassDeclaration>;
  ClassExpression?: RuleFunction<TSESTree.ClassExpression>;
  ClassProperty?: RuleFunction<TSESTree.ClassProperty>;
  Comment?: RuleFunction<TSESTree.Comment>;
  ConditionalExpression?: RuleFunction<TSESTree.ConditionalExpression>;
  ContinueStatement?: RuleFunction<TSESTree.ContinueStatement>;
  DebuggerStatement?: RuleFunction<TSESTree.DebuggerStatement>;
  Decorator?: RuleFunction<TSESTree.Decorator>;
  DoWhileStatement?: RuleFunction<TSESTree.DoWhileStatement>;
  EmptyStatement?: RuleFunction<TSESTree.EmptyStatement>;
  ExportAllDeclaration?: RuleFunction<TSESTree.ExportAllDeclaration>;
  ExportDefaultDeclaration?: RuleFunction<TSESTree.ExportDefaultDeclaration>;
  ExportNamedDeclaration?: RuleFunction<TSESTree.ExportNamedDeclaration>;
  ExportSpecifier?: RuleFunction<TSESTree.ExportSpecifier>;
  ExpressionStatement?: RuleFunction<TSESTree.ExpressionStatement>;
  ForInStatement?: RuleFunction<TSESTree.ForInStatement>;
  ForOfStatement?: RuleFunction<TSESTree.ForOfStatement>;
  ForStatement?: RuleFunction<TSESTree.ForStatement>;
  FunctionDeclaration?: RuleFunction<TSESTree.FunctionDeclaration>;
  FunctionExpression?: RuleFunction<TSESTree.FunctionExpression>;
  Identifier?: RuleFunction<TSESTree.Identifier>;
  IfStatement?: RuleFunction<TSESTree.IfStatement>;
  ImportDeclaration?: RuleFunction<TSESTree.ImportDeclaration>;
  ImportDefaultSpecifier?: RuleFunction<TSESTree.ImportDefaultSpecifier>;
  ImportExpression?: RuleFunction<TSESTree.ImportExpression>;
  ImportNamespaceSpecifier?: RuleFunction<TSESTree.ImportNamespaceSpecifier>;
  ImportSpecifier?: RuleFunction<TSESTree.ImportSpecifier>;
  JSXAttribute?: RuleFunction<TSESTree.JSXAttribute>;
  JSXClosingElement?: RuleFunction<TSESTree.JSXClosingElement>;
  JSXClosingFragment?: RuleFunction<TSESTree.JSXClosingFragment>;
  JSXElement?: RuleFunction<TSESTree.JSXElement>;
  JSXEmptyExpression?: RuleFunction<TSESTree.JSXEmptyExpression>;
  JSXExpressionContainer?: RuleFunction<TSESTree.JSXExpressionContainer>;
  JSXFragment?: RuleFunction<TSESTree.JSXFragment>;
  JSXIdentifier?: RuleFunction<TSESTree.JSXIdentifier>;
  JSXMemberExpression?: RuleFunction<TSESTree.JSXMemberExpression>;
  JSXOpeningElement?: RuleFunction<TSESTree.JSXOpeningElement>;
  JSXOpeningFragment?: RuleFunction<TSESTree.JSXOpeningFragment>;
  JSXSpreadAttribute?: RuleFunction<TSESTree.JSXSpreadAttribute>;
  JSXSpreadChild?: RuleFunction<TSESTree.JSXSpreadChild>;
  JSXText?: RuleFunction<TSESTree.JSXText>;
  LabeledStatement?: RuleFunction<TSESTree.LabeledStatement>;
  Literal?: RuleFunction<TSESTree.Literal>;
  LogicalExpression?: RuleFunction<TSESTree.LogicalExpression>;
  MemberExpression?: RuleFunction<TSESTree.MemberExpression>;
  MetaProperty?: RuleFunction<TSESTree.MetaProperty>;
  MethodDefinition?: RuleFunction<TSESTree.MethodDefinition>;
  NewExpression?: RuleFunction<TSESTree.NewExpression>;
  ObjectExpression?: RuleFunction<TSESTree.ObjectExpression>;
  ObjectPattern?: RuleFunction<TSESTree.ObjectPattern>;
  Program?: RuleFunction<TSESTree.Program>;
  Property?: RuleFunction<TSESTree.Property>;
  RestElement?: RuleFunction<TSESTree.RestElement>;
  ReturnStatement?: RuleFunction<TSESTree.ReturnStatement>;
  SequenceExpression?: RuleFunction<TSESTree.SequenceExpression>;
  SpreadElement?: RuleFunction<TSESTree.SpreadElement>;
  Super?: RuleFunction<TSESTree.Super>;
  SwitchCase?: RuleFunction<TSESTree.SwitchCase>;
  SwitchStatement?: RuleFunction<TSESTree.SwitchStatement>;
  TaggedTemplateExpression?: RuleFunction<TSESTree.TaggedTemplateExpression>;
  TemplateElement?: RuleFunction<TSESTree.TemplateElement>;
  TemplateLiteral?: RuleFunction<TSESTree.TemplateLiteral>;
  ThisExpression?: RuleFunction<TSESTree.ThisExpression>;
  ThrowStatement?: RuleFunction<TSESTree.ThrowStatement>;
  Token?: RuleFunction<TSESTree.Token>;
  TryStatement?: RuleFunction<TSESTree.TryStatement>;
  TSAbstractClassProperty?: RuleFunction<TSESTree.TSAbstractClassProperty>;
  TSAbstractKeyword?: RuleFunction<TSESTree.TSAbstractKeyword>;
  TSAbstractMethodDefinition?: RuleFunction<
    TSESTree.TSAbstractMethodDefinition
  >;
  TSAnyKeyword?: RuleFunction<TSESTree.TSAnyKeyword>;
  TSArrayType?: RuleFunction<TSESTree.TSArrayType>;
  TSAsExpression?: RuleFunction<TSESTree.TSAsExpression>;
  TSAsyncKeyword?: RuleFunction<TSESTree.TSAsyncKeyword>;
  TSBigIntKeyword?: RuleFunction<TSESTree.TSBigIntKeyword>;
  TSBooleanKeyword?: RuleFunction<TSESTree.TSBooleanKeyword>;
  TSCallSignatureDeclaration?: RuleFunction<
    TSESTree.TSCallSignatureDeclaration
  >;
  TSClassImplements?: RuleFunction<TSESTree.TSClassImplements>;
  TSConditionalType?: RuleFunction<TSESTree.TSConditionalType>;
  TSConstructorType?: RuleFunction<TSESTree.TSConstructorType>;
  TSConstructSignatureDeclaration?: RuleFunction<
    TSESTree.TSConstructSignatureDeclaration
  >;
  TSDeclareKeyword?: RuleFunction<TSESTree.TSDeclareKeyword>;
  TSDeclareFunction?: RuleFunction<TSESTree.TSDeclareFunction>;
  TSEmptyBodyFunctionExpression?: RuleFunction<
    TSESTree.TSEmptyBodyFunctionExpression
  >;
  TSEnumDeclaration?: RuleFunction<TSESTree.TSEnumDeclaration>;
  TSEnumMember?: RuleFunction<TSESTree.TSEnumMember>;
  TSExportAssignment?: RuleFunction<TSESTree.TSExportAssignment>;
  TSExportKeyword?: RuleFunction<TSESTree.TSExportKeyword>;
  TSExternalModuleReference?: RuleFunction<TSESTree.TSExternalModuleReference>;
  TSFunctionType?: RuleFunction<TSESTree.TSFunctionType>;
  TSImportEqualsDeclaration?: RuleFunction<TSESTree.TSImportEqualsDeclaration>;
  TSImportType?: RuleFunction<TSESTree.TSImportType>;
  TSIndexedAccessType?: RuleFunction<TSESTree.TSIndexedAccessType>;
  TSIndexSignature?: RuleFunction<TSESTree.TSIndexSignature>;
  TSInferType?: RuleFunction<TSESTree.TSInferType>;
  TSInterfaceBody?: RuleFunction<TSESTree.TSInterfaceBody>;
  TSInterfaceDeclaration?: RuleFunction<TSESTree.TSInterfaceDeclaration>;
  TSInterfaceHeritage?: RuleFunction<TSESTree.TSInterfaceHeritage>;
  TSIntersectionType?: RuleFunction<TSESTree.TSIntersectionType>;
  TSLiteralType?: RuleFunction<TSESTree.TSLiteralType>;
  TSMappedType?: RuleFunction<TSESTree.TSMappedType>;
  TSMethodSignature?: RuleFunction<TSESTree.TSMethodSignature>;
  TSModuleBlock?: RuleFunction<TSESTree.TSModuleBlock>;
  TSModuleDeclaration?: RuleFunction<TSESTree.TSModuleDeclaration>;
  TSNamespaceExportDeclaration?: RuleFunction<
    TSESTree.TSNamespaceExportDeclaration
  >;
  TSNeverKeyword?: RuleFunction<TSESTree.TSNeverKeyword>;
  TSNonNullExpression?: RuleFunction<TSESTree.TSNonNullExpression>;
  TSNullKeyword?: RuleFunction<TSESTree.TSNullKeyword>;
  TSNumberKeyword?: RuleFunction<TSESTree.TSNumberKeyword>;
  TSObjectKeyword?: RuleFunction<TSESTree.TSObjectKeyword>;
  TSOptionalType?: RuleFunction<TSESTree.TSOptionalType>;
  TSParameterProperty?: RuleFunction<TSESTree.TSParameterProperty>;
  TSParenthesizedType?: RuleFunction<TSESTree.TSParenthesizedType>;
  TSPrivateKeyword?: RuleFunction<TSESTree.TSPrivateKeyword>;
  TSPropertySignature?: RuleFunction<TSESTree.TSPropertySignature>;
  TSProtectedKeyword?: RuleFunction<TSESTree.TSProtectedKeyword>;
  TSPublicKeyword?: RuleFunction<TSESTree.TSPublicKeyword>;
  TSQualifiedName?: RuleFunction<TSESTree.TSQualifiedName>;
  TSReadonlyKeyword?: RuleFunction<TSESTree.TSReadonlyKeyword>;
  TSRestType?: RuleFunction<TSESTree.TSRestType>;
  TSStaticKeyword?: RuleFunction<TSESTree.TSStaticKeyword>;
  TSStringKeyword?: RuleFunction<TSESTree.TSStringKeyword>;
  TSSymbolKeyword?: RuleFunction<TSESTree.TSSymbolKeyword>;
  TSThisType?: RuleFunction<TSESTree.TSThisType>;
  TSTupleType?: RuleFunction<TSESTree.TSTupleType>;
  TSTypeAliasDeclaration?: RuleFunction<TSESTree.TSTypeAliasDeclaration>;
  TSTypeAnnotation?: RuleFunction<TSESTree.TSTypeAnnotation>;
  TSTypeAssertion?: RuleFunction<TSESTree.TSTypeAssertion>;
  TSTypeLiteral?: RuleFunction<TSESTree.TSTypeLiteral>;
  TSTypeOperator?: RuleFunction<TSESTree.TSTypeOperator>;
  TSTypeParameter?: RuleFunction<TSESTree.TSTypeParameter>;
  TSTypeParameterDeclaration?: RuleFunction<
    TSESTree.TSTypeParameterDeclaration
  >;
  TSTypeParameterInstantiation?: RuleFunction<
    TSESTree.TSTypeParameterInstantiation
  >;
  TSTypePredicate?: RuleFunction<TSESTree.TSTypePredicate>;
  TSTypeQuery?: RuleFunction<TSESTree.TSTypeQuery>;
  TSTypeReference?: RuleFunction<TSESTree.TSTypeReference>;
  TSUndefinedKeyword?: RuleFunction<TSESTree.TSUndefinedKeyword>;
  TSUnionType?: RuleFunction<TSESTree.TSUnionType>;
  TSUnknownKeyword?: RuleFunction<TSESTree.TSUnknownKeyword>;
  TSVoidKeyword?: RuleFunction<TSESTree.TSVoidKeyword>;
  UnaryExpression?: RuleFunction<TSESTree.UnaryExpression>;
  UpdateExpression?: RuleFunction<TSESTree.UpdateExpression>;
  VariableDeclaration?: RuleFunction<TSESTree.VariableDeclaration>;
  VariableDeclarator?: RuleFunction<TSESTree.VariableDeclarator>;
  WhileStatement?: RuleFunction<TSESTree.WhileStatement>;
  WithStatement?: RuleFunction<TSESTree.WithStatement>;
  YieldExpression?: RuleFunction<TSESTree.YieldExpression>;
}

interface RuleModule<
  TMessageIds extends string,
  TOptions extends readonly unknown[],
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
  create(context: Readonly<RuleContext<TMessageIds, TOptions>>): TRuleListener;
}

type RuleCreateFunction = (
  context: Readonly<RuleContext<never, unknown[]>>,
) => RuleListener;

export {
  ReportDescriptor,
  ReportFixFunction,
  ReportSuggestionArray,
  RuleContext,
  RuleCreateFunction,
  RuleFix,
  RuleFixer,
  RuleFunction,
  RuleListener,
  RuleMetaData,
  RuleMetaDataDocs,
  RuleModule,
};

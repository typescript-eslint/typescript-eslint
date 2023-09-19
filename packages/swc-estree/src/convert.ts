/* eslint-disable @typescript-eslint/internal/prefer-ast-types-enum -- swc shares strings with us but doesn't have an enum */

import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type * as SwcAst from './swc-ast';

export function convert(
  code: string,
  ast: SwcAst.Module | SwcAst.Script,
): TSESTree.Program {
  const VISITORS = getVisitors(code);

  return (VISITORS[ast.type] as (node: typeof ast) => TSESTree.Program)(ast);
}

function createIndexToLocTable(code: string): TSESTree.Position[] {
  let line = 1;
  let column = 0;

  const table: TSESTree.Position[] = [];
  for (let i = 0; i < code.length; i += 1) {
    table[i] = {
      line,
      column,
    };

    if (code[i] === '\n') {
      line += 1;
      column = 0;
    } else {
      column += 1;
    }
  }

  return table;
}

type VisitorsObject = {
  [k in SwcAst.SwcNodeType]: (
    node: Extract<SwcAst.SwcNode, { type: k }>,
  ) => TSESTree.Node;
};
const getVisitors = (code: string): VisitorsObject => {
  const indexToLocTable = createIndexToLocTable(code);
  const createNode = <T>(
    span: Omit<SwcAst.Span, 'ctxt'>,
    tsESTreeNode: Omit<T, 'loc' | 'range' | 'parent'>,
  ): T => {
    return {
      ...tsESTreeNode,
      range: [span.start, span.end],
      loc: {
        start: indexToLocTable[span.start],
        end: indexToLocTable[span.end],
      },
    } as T;
  };
  const sliceCode = (span: Omit<SwcAst.Span, 'ctxt'>): string => {
    return code.slice(span.start, span.end);
  };

  // SHARED HELPERS

  type VisitClassReturn<T> = T extends SwcAst.ClassDeclaration
    ? TSESTree.ClassDeclarationWithName
    : TSESTree.ClassExpression;
  function visitClass<
    T extends SwcAst.ClassDeclaration | SwcAst.ClassExpression,
  >(node: T): VisitClassReturn<T> {
    const id = maybeNull(node.identifier, VISITORS.Identifier);
    const implementsNode = node.implements.map(i =>
      VISITORS.TsExpressionWithTypeArguments(
        i,
        AST_NODE_TYPES.TSClassImplements,
      ),
    );
    const superClass = maybeNull(
      node.superClass,
      UNIONS.LeftHandSideExpression,
    );
    const superTypeArguments = maybeUndefined(
      node.superTypeParams,
      VISITORS.TsTypeParameterInstantiation,
    );
    const typeParameters = maybeUndefined(
      node.typeParams,
      VISITORS.TsTypeParameterDeclaration,
    );

    // SWC doesn't wrap the body in its own node, nor does it encode the
    // location of the opening brace token
    const preambleEnd = (
      implementsNode[implementsNode.length - 1] ??
      superTypeArguments ??
      superClass ??
      typeParameters ??
      id
    ).range[1];
    const classText = sliceCode({ start: preambleEnd, end: node.span.end });
    const openingBrace = classText.indexOf('{');
    if (openingBrace === -1) {
      // this should be impossible
      throw new Error('Unable to find opening `{` for class body');
    }

    const body = createNode<TSESTree.ClassBody>(
      { start: openingBrace, end: node.span.end },
      {
        type: AST_NODE_TYPES.ClassBody,
        body: node.body.map(UNIONS.ClassElement).filter(exists),
      },
    );

    if (node.type === 'ClassDeclaration') {
      if (id == null) {
        // SWC uses a different node for id-less class
        throw new Error('ClassDeclation must have an ID');
      }

      return createNode<TSESTree.ClassDeclarationWithName>(
        node.span,
        withDeprecatedAliasGetter(
          {
            type: AST_NODE_TYPES.ClassDeclaration,
            abstract: node.isAbstract,
            body,
            declare: node.declare,
            decorators: node.decorators?.map(VISITORS.Decorator) ?? [],
            id,
            implements: implementsNode,
            superClass,
            superTypeArguments,
            typeParameters,
          },
          'superTypeParameters',
          'superTypeArguments',
        ),
      ) as VisitClassReturn<T>;
    }

    return createNode<TSESTree.ClassExpression>(
      node.span,
      withDeprecatedAliasGetter(
        {
          type: AST_NODE_TYPES.ClassExpression,
          abstract: false,
          body,
          declare: false,
          decorators: [],
          id,
          implements: implementsNode,
          superClass,
          superTypeArguments,
          typeParameters,
        },
        'superTypeParameters',
        'superTypeArguments',
      ),
    ) as VisitClassReturn<T>;
  }
  // END SHARED HELPERS

  /*
  a little workaround to convert the UNIONS signature of
  ((node: T1) => U1) | ((node: T2) => U2) | ((node: T3) => U3) | ...
  to
  (node: T1 | T2 | T3) => (U1 | U2 | U3)
  The former is not possible to call, but the latter is
  */
  type VisitorUnionFunction<T extends SwcAst.SwcNode> = (
    node: T,
  ) => ReturnType<(typeof VISITORS)[T['type']]>;

  const UNIONS = {
    BindingName(node: SwcAst.Pattern): TSESTree.BindingName {
      if (
        node.type !== 'ArrayPattern' &&
        node.type !== 'Identifier' &&
        node.type !== 'ObjectPattern'
      ) {
        throw new Error(`Unexpected ${node.type} in an Expression location`);
      }

      return (VISITORS[node.type] as VisitorUnionFunction<typeof node>)(node);
    },
    CallExpressionArgument(
      node: SwcAst.Argument,
    ): TSESTree.CallExpressionArgument {
      const expr = UNIONS.Expression(node.expression);
      if (node.spread) {
        return createNode<TSESTree.SpreadElement>(
          { start: node.spread.start, end: node.spread.end },
          {
            type: AST_NODE_TYPES.SpreadElement,
            argument: expr,
          },
        );
      }
      return expr;
    },
    ClassElement(node: SwcAst.ClassMember): TSESTree.ClassElement | null {
      if (node.type === AST_NODE_TYPES.EmptyStatement) {
        // ESTree does not encode empty members
        // class Foo { ; } -> syntactically valid but the semi just dangles :hmm:
        return null;
      }

      return (VISITORS[node.type] as VisitorUnionFunction<typeof node>)(node);
    },
    Expression(node: SwcAst.Expression | SwcAst.Pattern): TSESTree.Expression {
      if (
        node.type === 'AssignmentPattern' ||
        node.type === 'Invalid' ||
        node.type === 'JSXEmptyExpression' ||
        node.type === 'JSXMemberExpression' ||
        node.type === 'JSXNamespacedName' ||
        node.type === 'JSXText' ||
        node.type === 'PrivateName' ||
        node.type === 'RestElement'
      ) {
        throw new Error(`Unexpected ${node.type} in an Expression location`);
      }

      return (VISITORS[node.type] as VisitorUnionFunction<typeof node>)(node);
    },
    DestructuringPattern(node: SwcAst.Pattern): TSESTree.DestructuringPattern {
      if (
        node.type !== 'ArrayPattern' &&
        node.type !== 'AssignmentPattern' &&
        node.type !== 'Identifier' &&
        node.type !== 'MemberExpression' &&
        node.type !== 'ObjectPattern' &&
        node.type !== 'RestElement'
      ) {
        throw new Error(`Unexpected ${node.type} in an Expression location`);
      }

      // TODO
      return (VISITORS[node.type] as VisitorUnionFunction<typeof node>)(node);
    },
    LeftHandSideExpression(
      node: SwcAst.Expression | SwcAst.Super,
    ): TSESTree.LeftHandSideExpression {
      if (
        node.type !== 'ArrayExpression' &&
        node.type !== 'ArrowFunctionExpression' &&
        node.type !== 'BigIntLiteral' &&
        node.type !== 'BooleanLiteral' &&
        node.type !== 'CallExpression' &&
        node.type !== 'ClassExpression' &&
        node.type !== 'FunctionExpression' &&
        node.type !== 'Identifier' &&
        node.type !== 'JSXElement' &&
        node.type !== 'JSXFragment' &&
        node.type !== 'MemberExpression' &&
        node.type !== 'MetaProperty' &&
        node.type !== 'NullLiteral' &&
        node.type !== 'NumericLiteral' &&
        node.type !== 'ObjectExpression' &&
        node.type !== 'RegExpLiteral' &&
        node.type !== 'SequenceExpression' &&
        node.type !== 'StringLiteral' &&
        node.type !== 'Super' &&
        node.type !== 'TaggedTemplateExpression' &&
        node.type !== 'TemplateLiteral' &&
        node.type !== 'ThisExpression' &&
        node.type !== 'TsAsExpression' &&
        node.type !== 'TsNonNullExpression' &&
        node.type !== 'TsTypeAssertion'
      ) {
        throw new Error(
          `Unexpected ${node.type} in an LeftHandSideExpression location`,
        );
      }

      return (VISITORS[node.type] as VisitorUnionFunction<typeof node>)(node);
    },
    Parameter(
      node: SwcAst.Pattern | SwcAst.TsParameterProperty,
    ): TSESTree.Parameter {
      if (
        node.type !== 'ArrayPattern' &&
        node.type !== 'AssignmentPattern' &&
        node.type !== 'Identifier' &&
        node.type !== 'ObjectPattern' &&
        node.type !== 'RestElement' &&
        node.type !== 'TsParameterProperty'
      ) {
        throw new Error(`Unexpected ${node.type} in an Expression location`);
      }

      return (VISITORS[node.type] as VisitorUnionFunction<typeof node>)(node);
    },
    Statement(node: SwcAst.Statement): TSESTree.Statement {
      return (VISITORS[node.type] as VisitorUnionFunction<typeof node>)(node);
    },
    TypeNode(node: SwcAst.TsType): TSESTree.TypeNode {
      return (VISITORS[node.type] as VisitorUnionFunction<typeof node>)(node);
    },
  };

  const VISITORS = {
    ArrayExpression(node): TSESTree.ArrayExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ArrayExpression,
        elements: node.elements.map(el => {
          if (el == null) {
            return null;
          }

          if (el.spread) {
            return createNode<TSESTree.SpreadElement>(
              {
                start: el.spread.start,
                end: el.spread.end + (el.expression as SwcAst.HasSpan).span.end,
              },
              {
                type: AST_NODE_TYPES.SpreadElement,
                argument: UNIONS.Expression(el.expression),
              },
            );
          }

          return UNIONS.Expression(el.expression);
        }),
      });
    },
    ArrayPattern(node, param?: SwcAst.Param): TSESTree.ArrayPattern {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ArrayPattern,
        decorators: param?.decorators?.map(VISITORS.Decorator) ?? [],
        elements: node.elements.map(el => {
          if (el == null) {
            return null;
          }

          return UNIONS.DestructuringPattern(el);
        }),
        optional: node.optional,
        typeAnnotation: maybeUndefined(
          node.typeAnnotation,
          VISITORS.TsTypeAnnotation,
        ),
      });
    },
    ArrowFunctionExpression(node): TSESTree.ArrowFunctionExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ArrowFunctionExpression,
        async: node.async,
        body:
          node.body.type === 'BlockStatement'
            ? VISITORS.BlockStatement(node.body)
            : UNIONS.Expression(node.body),
        expression: node.body.type !== 'BlockStatement',
        generator: node.generator,
        id: null,
        params: node.params.map(p => UNIONS.Parameter(p)),
        returnType: maybeUndefined(node.returnType, VISITORS.TsTypeAnnotation),
        typeParameters: maybeUndefined(
          node.typeParameters,
          VISITORS.TsTypeParameterDeclaration,
        ),
      });
    },
    AssignmentExpression(node): TSESTree.AssignmentExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.AssignmentExpression,
        left: UNIONS.Expression(node.left),
        right: UNIONS.Expression(node.right),
        operator: node.operator,
      });
    },
    AssignmentPattern(node, param?: SwcAst.Param): TSESTree.AssignmentPattern {
      return createNode(node.span, {
        type: AST_NODE_TYPES.AssignmentPattern,
        decorators: param?.decorators?.map(VISITORS.Decorator) ?? [],
        left: UNIONS.BindingName(node.left),
        optional: false, // SWC treats optional assignment patterns as a syntax error
        right: UNIONS.Expression(node.right),
        typeAnnotation: maybeUndefined(
          node.typeAnnotation,
          VISITORS.TsTypeAnnotation,
        ),
      });
    },
    AssignmentPatternProperty(node): TSESTree.Property {
      const value =
        node.value == null
          ? // { a }
            VISITORS.Identifier(node.key)
          : // { a = 1 }
            createNode<TSESTree.AssignmentPattern>(node.span, {
              type: AST_NODE_TYPES.AssignmentPattern,
              decorators: [],
              left: VISITORS.Identifier(node.key),
              optional: false,
              right: UNIONS.Expression(node.value),
              typeAnnotation: undefined,
            });

      return createNode(node.span, {
        type: AST_NODE_TYPES.Property,
        key: VISITORS.Identifier(node.key),
        computed: false,
        kind: 'init',
        value,
        method: false,
        optional: false,
        shorthand: true,
      });
    },
    AssignmentProperty(node): TSESTree.Property {
      // this node doesn't have any tests in the SWC repo
      // so IDK what it's supposed to be?
      throw new Error(`Unexpected node ${node.type} during AST conversion.`);
    },
    AwaitExpression(node): TSESTree.AwaitExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.AwaitExpression,
        argument: UNIONS.Expression(node.argument),
      });
    },
    BigIntLiteral(node): TSESTree.BigIntLiteral {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Literal,
        value: node.value,
        bigint: String(node.value),
        raw: node.raw ?? sliceCode(node.span),
      });
    },
    BinaryExpression(
      node,
    ): TSESTree.BinaryExpression | TSESTree.LogicalExpression {
      if (node.operator === '??') {
        // :confused-screaming:
        return createNode<TSESTree.LogicalExpression>(node.span, {
          type: AST_NODE_TYPES.LogicalExpression,
          left: UNIONS.Expression(node.left),
          operator: node.operator,
          right: UNIONS.Expression(node.right),
        });
      }

      return createNode<TSESTree.BinaryExpression>(node.span, {
        type: AST_NODE_TYPES.BinaryExpression,
        left: UNIONS.Expression(node.left),
        operator: node.operator,
        right: UNIONS.Expression(node.right),
      });
    },
    BlockStatement(node): TSESTree.BlockStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.BlockStatement,
        body: node.stmts.map(UNIONS.Statement),
      });
    },
    BooleanLiteral(node): TSESTree.BooleanLiteral {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Literal,
        value: node.value,
        raw: String(node.value) as 'false' | 'true',
      });
    },
    BreakStatement(node): TSESTree.BreakStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.BreakStatement,
        label: maybeNull(node.label, VISITORS.Identifier),
      });
    },
    CallExpression(
      node,
      optional = false,
    ): TSESTree.CallExpression | TSESTree.ImportExpression {
      if (node.callee.type === 'Import') {
        if (node.arguments.length !== 1 && node.arguments.length !== 2) {
          throw new Error('Dynamic imports must have exactly 1 or 2 arguments');
        }
        const source = node.arguments[0];
        const attributes = node.arguments[1] as SwcAst.Argument | undefined;
        if (source.spread || attributes?.spread) {
          throw new Error('Dynamic import arguments must not be spread');
        }
        return createNode<TSESTree.ImportExpression>(node.span, {
          type: AST_NODE_TYPES.ImportExpression,
          attributes: maybeNull(attributes?.expression, UNIONS.Expression),
          source: UNIONS.Expression(source.expression),
        });
      }

      return createNode<TSESTree.CallExpression>(
        node.span,
        withDeprecatedAliasGetter(
          {
            type: AST_NODE_TYPES.CallExpression,
            arguments: node.arguments.map(UNIONS.CallExpressionArgument),
            callee: UNIONS.LeftHandSideExpression(node.callee),
            optional,
            typeArguments: maybeUndefined(
              node.typeArguments,
              VISITORS.TsTypeParameterInstantiation,
            ),
          },
          'typeParameters',
          'typeArguments',
        ),
      );
    },
    CatchClause(node): TSESTree.CatchClause {
      return createNode(node.span, {
        type: AST_NODE_TYPES.CatchClause,
        body: VISITORS.BlockStatement(node.body),
        param: maybeNull(node.param, UNIONS.BindingName),
      });
    },
    ClassDeclaration(node): TSESTree.ClassDeclarationWithName {
      return visitClass(node);
    },
    ClassExpression(node): TSESTree.ClassExpression {
      return visitClass(node);
    },
    ClassMethod(node): TSESTree.MethodDefinition {
      return createNode(node.span, {
        type: AST_NODE_TYPES.MethodDefinition,
      });
    },
    ClassProperty(node): TSESTree.PropertyDefinition {
      return createNode(node.span, {
        type: AST_NODE_TYPES.PropertyDefinition,
      });
    },
    /* ComputedPropName */ Computed(node): TSESTree.Expression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Expression,
      });
    },
    ConditionalExpression(node): TSESTree.ConditionalExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ConditionalExpression,
      });
    },
    Constructor(node): TSESTree.MethodDefinition {
      return createNode(node.span, {
        type: AST_NODE_TYPES.MethodDefinition,
      });
    },
    ContinueStatement(node): TSESTree.ContinueStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ContinueStatement,
      });
    },
    DebuggerStatement(node): TSESTree.DebuggerStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.DebuggerStatement,
      });
    },
    Decorator(node): TSESTree.Decorator {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Decorator,
      });
    },
    DoWhileStatement(node): TSESTree.DoWhileStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.DoWhileStatement,
      });
    },
    EmptyStatement(node): TSESTree.EmptyStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.EmptyStatement,
      });
    },
    ExportAllDeclaration(node): TSESTree.ExportAllDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ExportAllDeclaration,
      });
    },
    ExportDeclaration(node): TSESTree.ExportDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ExportDeclaration,
      });
    },
    ExportDefaultDeclaration(node): TSESTree.ExportDefaultDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ExportDefaultDeclaration,
      });
    },
    ExportDefaultExpression(node): TSESTree.ExportDefaultDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ExportDefaultDeclaration,
      });
    },
    ExportDefaultSpecifier(node): never {
      // this node doesn't have any tests in the SWC repo
      // so IDK what it's supposed to be?
      throw new Error(`Unexpected node ${node.type} during AST conversion.`);
    },
    ExportNamedDeclaration(node): TSESTree.ExportNamedDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ExportNamedDeclaration,
      });
    },
    ExportNamespaceSpecifier(node): TSESTree.ExportAllDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ExportAllDeclaration,
      });
    },
    ExpressionStatement(node): TSESTree.ExpressionStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ExpressionStatement,
      });
    },
    ForInStatement(node): TSESTree.ForInStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ForInStatement,
      });
    },
    ForOfStatement(node): TSESTree.ForOfStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ForOfStatement,
      });
    },
    ForStatement(node): TSESTree.ForStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ForStatement,
      });
    },
    FunctionDeclaration(node): TSESTree.FunctionDeclarationWithName {
      return createNode(node.span, {
        type: AST_NODE_TYPES.FunctionDeclaration,
      });
    },
    FunctionExpression(node): TSESTree.FunctionExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.FunctionExpression,
      });
    },
    GetterProperty(node): TSESTree.Property {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Property,
      });
    },
    Identifier(node): TSESTree.Identifier {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Identifier,
      });
    },
    IfStatement(node): TSESTree.IfStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.IfStatement,
      });
    },
    Import(node): never {
      // SWC parses import expressions as
      //
      // import(thing)
      // ^^^^^^^^^^^^^ CallExpression
      // ^^^^^^        Import
      //
      // But ESTree parses it as
      //
      // ^^^^^^^^^^^^^ ImportExpression
      throw new Error(`Unexpected node ${node.type} during AST conversion.`);
    },
    ImportDeclaration(node): TSESTree.ImportDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ImportDeclaration,
      });
    },
    ImportDefaultSpecifier(node): TSESTree.ImportDefaultSpecifier {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ImportDefaultSpecifier,
      });
    },
    ImportNamespaceSpecifier(node): TSESTree.ImportNamespaceSpecifier {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ImportNamespaceSpecifier,
      });
    },
    JSXAttribute(node): TSESTree.JSXAttribute {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXAttribute,
      });
    },
    JSXClosingElement(node): TSESTree.JSXClosingElement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXClosingElement,
      });
    },
    JSXClosingFragment(node): TSESTree.JSXClosingFragment {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXClosingFragment,
      });
    },
    JSXElement(node): TSESTree.JSXElement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXElement,
      });
    },
    JSXEmptyExpression(node): TSESTree.JSXEmptyExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXEmptyExpression,
      });
    },
    JSXExpressionContainer(node): TSESTree.JSXExpressionContainer {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXExpressionContainer,
      });
    },
    JSXFragment(node): TSESTree.JSXFragment {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXFragment,
      });
    },
    JSXMemberExpression(node): TSESTree.JSXMemberExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXMemberExpression,
      });
    },
    JSXNamespacedName(node): TSESTree.JSXNamespacedName {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXNamespacedName,
      });
    },
    JSXOpeningElement(node): TSESTree.JSXOpeningElement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXOpeningElement,
      });
    },
    JSXOpeningFragment(node): TSESTree.JSXOpeningFragment {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXOpeningFragment,
      });
    },
    JSXSpreadChild(node): TSESTree.JSXSpreadChild {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXSpreadChild,
      });
    },
    JSXText(node): TSESTree.JSXText {
      return createNode(node.span, {
        type: AST_NODE_TYPES.JSXText,
      });
    },
    KeyValuePatternProperty(node): TSESTree.Property {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Property,
      });
    },
    KeyValueProperty(node): TSESTree.Property {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Property,
      });
    },
    LabeledStatement(node): TSESTree.LabeledStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.LabeledStatement,
      });
    },
    MemberExpression(node): TSESTree.MemberExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.MemberExpression,
      });
    },
    MetaProperty(node): TSESTree.MetaProperty {
      return createNode(node.span, {
        type: AST_NODE_TYPES.MetaProperty,
      });
    },
    MethodProperty(node): TSESTree.Property {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Property,
      });
    },
    Module(node): TSESTree.Program {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Program,
      });
    },
    /* NamedExportSpecifier */ ExportSpecifier(node): TSESTree.ExportSpecifier {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ExportSpecifier,
      });
    },
    /* NamedImportSpecifier */ ImportSpecifier(node): TSESTree.ImportSpecifier {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ImportSpecifier,
      });
    },
    NewExpression(node): TSESTree.NewExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.NewExpression,
      });
    },
    NullLiteral(node): TSESTree.NullLiteral {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Literal,
        value: null,
        raw: 'null',
      });
    },
    NumericLiteral(node): TSESTree.NumberLiteral {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Literal,
        value: node.value,
        raw: node.raw ?? sliceCode(node.span),
      });
    },
    ObjectExpression(node): TSESTree.ObjectExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ObjectExpression,
      });
    },
    ObjectPattern(node): TSESTree.ObjectPattern {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ObjectPattern,
      });
    },
    OptionalChainingExpression(node): TSESTree.ChainElement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ChainElement,
      });
    },
    /* Param */ Parameter(node): TSESTree.Parameter {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Parameter,
      });
    },
    ParenthesisExpression(node): TSESTree.Expression {
      // we do not have an AST node for the parenthesized node
      return UNIONS.Expression(node.expression);
    },
    PrivateMethod(node): TSESTree.MethodDefinition {
      return createNode(node.span, {
        type: AST_NODE_TYPES.MethodDefinition,
      });
    },
    PrivateName(node): TSESTree.PrivateIdentifier {
      return createNode(node.span, {
        type: AST_NODE_TYPES.PrivateIdentifier,
      });
    },
    PrivateProperty(node): TSESTree.PropertyDefinition {
      return createNode(node.span, {
        type: AST_NODE_TYPES.PropertyDefinition,
      });
    },
    RegExpLiteral(node): TSESTree.RegExpLiteral {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Literal,
        value: new RegExp(node.pattern, node.flags),
        raw: sliceCode(node.span),
        regex: {
          flags: node.flags,
          pattern: node.pattern,
        },
      });
    },
    RestElement(node): TSESTree.RestElement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.RestElement,
      });
    },
    ReturnStatement(node): TSESTree.ReturnStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ReturnStatement,
      });
    },
    Script(node): TSESTree.Program {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Program,
      });
    },
    SequenceExpression(node): TSESTree.SequenceExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.SequenceExpression,
      });
    },
    SetterProperty(node): TSESTree.Property {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Property,
      });
    },
    SpreadElement(node): TSESTree.SpreadElement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.SpreadElement,
      });
    },
    StaticBlock(node): TSESTree.StaticBlock {
      return createNode(node.span, {
        type: AST_NODE_TYPES.StaticBlock,
      });
    },
    StringLiteral(node): TSESTree.StringLiteral {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Literal,
        value: node.value,
        raw: node.raw ?? sliceCode(node.span),
      });
    },
    Super(node): TSESTree.Super {
      return createNode(node.span, {
        type: AST_NODE_TYPES.Super,
      });
    },
    SuperPropExpression(node): TSESTree.MemberExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.MemberExpression,
      });
    },
    SwitchCase(node): TSESTree.SwitchCase {
      return createNode(node.span, {
        type: AST_NODE_TYPES.SwitchCase,
      });
    },
    SwitchStatement(node): TSESTree.SwitchStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.SwitchStatement,
      });
    },
    TaggedTemplateExpression(node): TSESTree.TaggedTemplateExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TaggedTemplateExpression,
      });
    },
    TemplateElement(node): TSESTree.TemplateElement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TemplateElement,
      });
    },
    TemplateLiteral(node): TSESTree.TemplateLiteral {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TemplateLiteral,
      });
    },
    ThisExpression(node): TSESTree.ThisExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ThisExpression,
      });
    },
    ThrowStatement(node): TSESTree.ThrowStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.ThrowStatement,
      });
    },
    TryStatement(node): TSESTree.TryStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TryStatement,
      });
    },
    TsArrayType(node): TSESTree.TSArrayType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSArrayType,
      });
    },
    TsAsExpression(node): TSESTree.TSAsExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSAsExpression,
      });
    },
    TsCallSignatureDeclaration(node): TSESTree.TSCallSignatureDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSCallSignatureDeclaration,
      });
    },
    TsConditionalType(node): TSESTree.TSConditionalType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSConditionalType,
      });
    },
    TsConstAssertion(node): TSESTree.TSTypeAssertion {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypeAssertion,
      });
    },
    TsConstructorType(node): TSESTree.TSConstructorType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSConstructorType,
      });
    },
    TsConstructSignatureDeclaration(
      node,
    ): TSESTree.TSConstructSignatureDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSConstructSignatureDeclaration,
      });
    },
    TsEnumDeclaration(node): TSESTree.TSEnumDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSEnumDeclaration,
      });
    },
    TsEnumMember(node): TSESTree.TSEnumMember {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSEnumMember,
      });
    },
    TsExportAssignment(node): TSESTree.TSExportAssignment {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSExportAssignment,
      });
    },
    TsExpressionWithTypeArguments<
      T extends
        | AST_NODE_TYPES.TSClassImplements
        | AST_NODE_TYPES.TSInterfaceHeritage,
    >(
      node: SwcAst.TsExpressionWithTypeArguments,
      // is undefined to match the expected signature check
      type?: T,
    ): Extract<TSESTree.Node, { type: T }> {
      if (type == null) {
        throw new Error(
          'Missing `type` argument in `TsExpressionWithTypeArguments`. This is a bug in the conversion logic.',
        );
      }

      return createNode<
        TSESTree.TSClassImplements | TSESTree.TSInterfaceHeritage
      >(
        node.span,
        withDeprecatedAliasGetter(
          {
            type,
            expression: UNIONS.Expression(node.expression),
            typeArguments: maybeUndefined(
              node.typeArguments,
              VISITORS.TsTypeParameterInstantiation,
            ),
          },
          'typeParameters',
          'typeArguments',
        ),
      ) as Extract<TSESTree.Node, { type: T }>;
    },
    TsExternalModuleReference(node): TSESTree.TSExternalModuleReference {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSExternalModuleReference,
      });
    },
    TsFunctionType(node): TSESTree.TSFunctionType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSFunctionType,
      });
    },
    TsGetterSignature(node): TSESTree.TSMethodSignature {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSMethodSignature,
      });
    },
    TsImportEqualsDeclaration(node): TSESTree.TSImportEqualsDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSImportEqualsDeclaration,
      });
    },
    TsImportType(node): TSESTree.TSImportType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSImportType,
      });
    },
    TsIndexedAccessType(node): TSESTree.TSIndexedAccessType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSIndexedAccessType,
      });
    },
    TsIndexSignature(node): TSESTree.TSIndexSignature {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSIndexSignature,
      });
    },
    TsInferType(node): TSESTree.TSInferType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSInferType,
      });
    },
    TsInstantiation(node): TSESTree.TSInstantiationExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSInstantiationExpression,
      });
    },
    TsInterfaceBody(node): TSESTree.TSInterfaceBody {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSInterfaceBody,
      });
    },
    TsInterfaceDeclaration(node): TSESTree.TSInterfaceDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSInterfaceDeclaration,
      });
    },
    TsIntersectionType(node): TSESTree.TSIntersectionType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSIntersectionType,
      });
    },
    TsKeywordType(
      node,
    ):
      | TSESTree.TSAnyKeyword
      | TSESTree.TSUnknownKeyword
      | TSESTree.TSNumberKeyword
      | TSESTree.TSObjectKeyword
      | TSESTree.TSBooleanKeyword
      | TSESTree.TSBigIntKeyword
      | TSESTree.TSStringKeyword
      | TSESTree.TSSymbolKeyword
      | TSESTree.TSVoidKeyword
      | TSESTree.TSUndefinedKeyword
      | TSESTree.TSNullKeyword
      | TSESTree.TSNeverKeyword
      | TSESTree.TSIntrinsicKeyword {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSIntrinsicKeyword,
      });
    },
    TsLiteralType(node): TSESTree.TSLiteralType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSLiteralType,
      });
    },
    TsMappedType(node): TSESTree.TSMappedType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSMappedType,
      });
    },
    TsMethodSignature(node): TSESTree.TSMethodSignature {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSMethodSignature,
      });
    },
    TsModuleBlock(node): TSESTree.TSModuleBlock {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSModuleBlock,
      });
    },
    TsModuleDeclaration(node): TSESTree.TSModuleDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSModuleDeclaration,
      });
    },
    TsNamespaceDeclaration(node): TSESTree.TSModuleDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSModuleDeclaration,
      });
    },
    TsNamespaceExportDeclaration(node): TSESTree.TSNamespaceExportDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSNamespaceExportDeclaration,
      });
    },
    TsNonNullExpression(node): TSESTree.TSNonNullExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSNonNullExpression,
      });
    },
    TsOptionalType(node): TSESTree.TSOptionalType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSOptionalType,
      });
    },
    TsParameterProperty(node): TSESTree.TSParameterProperty {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSParameterProperty,
      });
    },
    TsParenthesizedType(node): TSESTree.TypeNode {
      // we do not have an AST node for the parenthesized node
      return UNIONS.TsType(node.typeAnnotation);
    },
    TsPropertySignature(node): TSESTree.TSPropertySignature {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSPropertySignature,
      });
    },
    TsQualifiedName(node): TSESTree.TSQualifiedName {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSQualifiedName,
      });
    },
    TsRestType(node): TSESTree.TSRestType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSRestType,
      });
    },
    TsSatisfiesExpression(node): TSESTree.TSSatisfiesExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSSatisfiesExpression,
      });
    },
    TsSetterSignature(node): TSESTree.TSMethodSignature {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSMethodSignature,
      });
    },
    TsThisType(node): TSESTree.TSThisType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSThisType,
      });
    },
    TsTupleElement(
      node,
    ): TSESTree.TSTypeReference | TSESTree.TSNamedTupleMember {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSNamedTupleMember,
      });
    },
    TsTupleType(node): TSESTree.TSTupleType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTupleType,
      });
    },
    TsTypeAliasDeclaration(node): TSESTree.TSTypeAliasDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypeAliasDeclaration,
      });
    },
    TsTypeAnnotation(node): TSESTree.TSTypeAnnotation {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypeAnnotation,
      });
    },
    TsTypeAssertion(node): TSESTree.TSTypeAssertion {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypeAssertion,
      });
    },
    TsTypeLiteral(node): TSESTree.TSTypeLiteral {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypeLiteral,
      });
    },
    TsTypeOperator(node): TSESTree.TSTypeOperator {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypeOperator,
      });
    },
    TsTypeParameter(node): TSESTree.TSTypeParameter {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypeParameter,
      });
    },
    TsTypeParameterDeclaration(node): TSESTree.TSTypeParameterDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypeParameterDeclaration,
      });
    },
    TsTypeParameterInstantiation(node): TSESTree.TSTypeParameterInstantiation {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypeParameterInstantiation,
      });
    },
    TsTypePredicate(node): TSESTree.TSTypePredicate {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypePredicate,
      });
    },
    TsTypeQuery(node): TSESTree.TSTypeQuery {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypeQuery,
      });
    },
    TsTypeReference(node): TSESTree.TSTypeReference {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSTypeReference,
      });
    },
    TsUnionType(node): TSESTree.TSUnionType {
      return createNode(node.span, {
        type: AST_NODE_TYPES.TSUnionType,
      });
    },
    UnaryExpression(node): TSESTree.UnaryExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.UnaryExpression,
      });
    },
    UpdateExpression(node): TSESTree.UpdateExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.UpdateExpression,
      });
    },
    VariableDeclaration(node): TSESTree.VariableDeclaration {
      return createNode(node.span, {
        type: AST_NODE_TYPES.VariableDeclaration,
      });
    },
    VariableDeclarator(node): TSESTree.VariableDeclarator {
      return createNode(node.span, {
        type: AST_NODE_TYPES.VariableDeclarator,
      });
    },
    WhileStatement(node): TSESTree.WhileStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.WhileStatement,
      });
    },
    WithStatement(node): TSESTree.WithStatement {
      return createNode(node.span, {
        type: AST_NODE_TYPES.WithStatement,
      });
    },
    YieldExpression(node): TSESTree.YieldExpression {
      return createNode(node.span, {
        type: AST_NODE_TYPES.YieldExpression,
      });
    },
  } satisfies {
    [k in SwcAst.SwcNodeType]: (
      node: Extract<SwcAst.SwcNode, { type: k }>,
    ) => TSESTree.Node;
  };

  return VISITORS;
};

function maybeUndefined<T, U>(
  node: T | undefined,
  fn: (node: T) => U,
): U | undefined {
  if (node == null) {
    return undefined;
  }
  return fn(node);
}

function maybeNull<T, U>(node: T | undefined, fn: (node: T) => U): U | null {
  if (node == null) {
    return null;
  }
  return fn(node);
}

function exists<T>(arg: T | null | undefined): arg is T {
  return arg != null;
}

function withDeprecatedAliasGetter<
  Properties extends { type: string },
  AliasKey extends string,
  ValueKey extends string & keyof Properties,
>(
  node: Properties,
  aliasKey: AliasKey,
  valueKey: ValueKey,
): Properties & Record<AliasKey, Properties[ValueKey]> {
  let warned = false;

  Object.defineProperty(node, aliasKey, {
    configurable: true,
    get(): Properties[typeof valueKey] {
      if (!warned) {
        process.emitWarning(
          `The '${aliasKey}' property is deprecated on ${node.type} nodes. Use '${valueKey}' instead. See https://typescript-eslint.io/linting/troubleshooting#the-key-property-is-deprecated-on-type-nodes-use-key-instead-warnings.`,
          'DeprecationWarning',
        );
        warned = true;
      }

      return node[valueKey];
    },
    set(value: Properties[typeof valueKey]): void {
      Object.defineProperty(node, aliasKey, {
        enumerable: true,
        writable: true,
        value,
      });
    },
  });

  return node as Properties & Record<AliasKey, Properties[ValueKey]>;
}

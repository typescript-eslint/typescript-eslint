import type { Expression, Node } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isExpression(node: Node): node is Expression {
  switch (node.kind) {
    case SyntaxKind.ArrayLiteralExpression:
    case SyntaxKind.ArrowFunction:
    case SyntaxKind.AsExpression:
    case SyntaxKind.AwaitExpression:
    case SyntaxKind.BinaryExpression:
    case SyntaxKind.CallExpression:
    case SyntaxKind.ClassExpression:
    case SyntaxKind.CommaListExpression:
    case SyntaxKind.ConditionalExpression:
    case SyntaxKind.DeleteExpression:
    case SyntaxKind.ElementAccessExpression:
    case SyntaxKind.FalseKeyword:
    case SyntaxKind.FunctionExpression:
    case SyntaxKind.Identifier:
    case SyntaxKind.JsxElement:
    case SyntaxKind.JsxFragment:
    case SyntaxKind.JsxExpression:
    case SyntaxKind.JsxOpeningElement:
    case SyntaxKind.JsxOpeningFragment:
    case SyntaxKind.JsxSelfClosingElement:
    case SyntaxKind.MetaProperty:
    case SyntaxKind.NewExpression:
    case SyntaxKind.NonNullExpression:
    case SyntaxKind.NoSubstitutionTemplateLiteral:
    case SyntaxKind.NullKeyword:
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.ObjectLiteralExpression:
    case SyntaxKind.OmittedExpression:
    case SyntaxKind.ParenthesizedExpression:
    case SyntaxKind.PostfixUnaryExpression:
    case SyntaxKind.PrefixUnaryExpression:
    case SyntaxKind.PropertyAccessExpression:
    case SyntaxKind.RegularExpressionLiteral:
    case SyntaxKind.SpreadElement:
    case SyntaxKind.StringLiteral:
    case SyntaxKind.SuperKeyword:
    case SyntaxKind.TaggedTemplateExpression:
    case SyntaxKind.TemplateExpression:
    case SyntaxKind.ThisKeyword:
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.TypeAssertionExpression:
    case SyntaxKind.TypeOfExpression:
    case SyntaxKind.VoidExpression:
    case SyntaxKind.YieldExpression:
      return true;
    default:
      return false;
  }
}

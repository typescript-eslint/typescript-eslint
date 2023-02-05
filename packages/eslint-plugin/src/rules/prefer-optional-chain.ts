import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isBinaryExpression } from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

type TMessageIds = 'preferOptionalChain' | 'optionalChainSuggest';
type TOptions = [];

const enum NullishComparisonType {
  /** `x != null`, `x != undefined` */
  NotEqNullOrUndefined,
  /** `x == null`, `x == undefined` */
  EqNullOrUndefined,

  /** `x !== null` */
  NotEqNull,
  /** `x === null` */
  EqNull,

  /** `x !== undefined`, `typeof x !== 'undefined'` */
  NotEqUndefined,
  /** `x === undefined`, `typeof x === 'undefined'` */
  EqUndefined,

  /** `x` */
  NotBoolean,
  /** `!x` */
  Boolean,
}
type ValueComparisonNode =
  | TSESTree.Expression
  | TSESTree.PrivateIdentifier
  | TSESTree.SpreadElement;
type TypeComparisonNode =
  | TSESTree.TSTypeParameterInstantiation
  | TSESTree.TypeNode;
const enum OperandValidity {
  Valid,
  Invalid,
}
interface ValidOperand {
  type: OperandValidity.Valid;
  comparedName: ValueComparisonNode;
  comparisonType: NullishComparisonType;
  node: TSESTree.Expression;
}
interface InvalidOperand {
  type: OperandValidity.Invalid;
}
type Operand = ValidOperand | InvalidOperand;
function gatherLogicalOperands(node: TSESTree.LogicalExpression): {
  operands: Operand[];
  seenLogicals: Set<TSESTree.LogicalExpression>;
} {
  const enum ComparisonValueType {
    Null,
    Undefined,
    UndefinedStringLiteral,
  }

  const result: Operand[] = [];
  const { operands, seenLogicals } = flattenLogicalOperands(node);

  for (const operand of operands) {
    switch (operand.type) {
      case AST_NODE_TYPES.BinaryExpression: {
        // check for "yoda" style logical: null != x
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- TODO - add ignore IIFE option
        const { comparedExpression, comparedValue } = (() => {
          const comparedValueLeft = getComparisonValueType(node.left);
          if (comparedValueLeft) {
            return {
              comparedExpression: operand.right,
              comparedValue: comparedValueLeft,
            };
          } else {
            return {
              comparedExpression: operand.left,
              comparedValue: getComparisonValueType(operand.right),
            };
          }
        })();

        if (comparedValue === ComparisonValueType.UndefinedStringLiteral) {
          if (
            comparedExpression.type === AST_NODE_TYPES.UnaryExpression &&
            comparedExpression.operator === 'typeof'
          ) {
            // typeof x === 'undefined'
            result.push({
              type: OperandValidity.Valid,
              comparedName: comparedExpression.argument,
              comparisonType: node.operator.startsWith('!')
                ? NullishComparisonType.NotEqUndefined
                : NullishComparisonType.EqUndefined,
              node: operand,
            });
            continue;
          }

          // typeof x === 'string' et al :(
          result.push({ type: OperandValidity.Invalid });
          continue;
        }

        switch (operand.operator) {
          case '!=':
          case '==':
            if (
              comparedValue === ComparisonValueType.Null ||
              comparedValue === ComparisonValueType.Undefined
            ) {
              // x == null, x == undefined
              result.push({
                type: OperandValidity.Valid,
                comparedName: comparedExpression,
                comparisonType: operand.operator.startsWith('!')
                  ? NullishComparisonType.NotEqNullOrUndefined
                  : NullishComparisonType.EqNullOrUndefined,
                node: operand,
              });
              continue;
            }
            // x == something :(
            result.push({ type: OperandValidity.Invalid });
            continue;

          case '!==':
          case '===': {
            const comparedName = comparedExpression;
            switch (comparedValue) {
              case ComparisonValueType.Null:
                result.push({
                  type: OperandValidity.Valid,
                  comparedName,
                  comparisonType: operand.operator.startsWith('!')
                    ? NullishComparisonType.NotEqNull
                    : NullishComparisonType.EqNull,
                  node: operand,
                });
                continue;

              case ComparisonValueType.Undefined:
                result.push({
                  type: OperandValidity.Valid,
                  comparedName,
                  comparisonType: operand.operator.startsWith('!')
                    ? NullishComparisonType.NotEqUndefined
                    : NullishComparisonType.EqUndefined,
                  node: operand,
                });
                continue;

              default:
                // x === something :(
                result.push({ type: OperandValidity.Invalid });
                continue;
            }
          }
        }

        result.push({ type: OperandValidity.Invalid });
        continue;
      }

      case AST_NODE_TYPES.UnaryExpression:
        if (operand.operator === '!') {
          // TODO(#4820) - use types here to determine if there is a boolean type that might be refined out
          result.push({
            type: OperandValidity.Valid,
            comparedName: operand.argument,
            comparisonType: NullishComparisonType.NotBoolean,
            node: operand,
          });
        }
        result.push({ type: OperandValidity.Invalid });
        continue;

      case AST_NODE_TYPES.Identifier:
        // TODO(#4820) - use types here to determine if there is a boolean type that might be refined out
        result.push({
          type: OperandValidity.Valid,
          comparedName: operand,
          comparisonType: NullishComparisonType.Boolean,
          node: operand,
        });
        continue;
    }
  }

  return {
    operands: result,
    seenLogicals,
  };

  /*
  The AST is always constructed such the first element is always the deepest element.
  I.e. for this code: `foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz`
  The AST will look like this:
  {
    left: {
      left: {
        left: foo
        right: foo.bar
      }
      right: foo.bar.baz
    }
    right: foo.bar.baz.buzz
  }

  So given any logical expression, we can perform a depth-first traversal to get
  the operands in order.

  Note that this function purposely does not inspect mixed logical expressions
  like `foo || foo.bar && foo.bar.baz` - it will ignore
  */
  function flattenLogicalOperands(node: TSESTree.LogicalExpression): {
    operands: TSESTree.Expression[];
    seenLogicals: Set<TSESTree.LogicalExpression>;
  } {
    const operands: TSESTree.Expression[] = [];
    const seenLogicals = new Set<TSESTree.LogicalExpression>([node]);

    const stack: TSESTree.Expression[] = [node.right, node.left];
    let current: TSESTree.Expression | undefined;
    while ((current = stack.pop())) {
      if (
        current.type === AST_NODE_TYPES.LogicalExpression &&
        current.operator === node.operator
      ) {
        seenLogicals.add(current);
        stack.push(current.right);
        stack.push(current.left);
      } else {
        operands.push(current);
      }
    }

    return {
      operands,
      seenLogicals,
    };
  }

  function getComparisonValueType(
    node: TSESTree.Expression,
  ): ComparisonValueType | null {
    switch (node.type) {
      case AST_NODE_TYPES.Literal:
        if (node.value === null && node.raw === 'null') {
          return ComparisonValueType.Null;
        }
        if (node.value === 'undefined') {
          return ComparisonValueType.UndefinedStringLiteral;
        }
        return null;

      case AST_NODE_TYPES.Identifier:
        if (node.name === 'undefined') {
          return ComparisonValueType.Undefined;
        }
        return null;
    }

    return null;
  }
}

function compareArray<TNode>(
  compare: (a: TNode, b: TNode) => NodeComparisonResult,
): <TArr extends ReadonlyArray<TNode>>(
  arrayA: TArr,
  arrayB: TArr,
) => NodeComparisonResult.Equal | NodeComparisonResult.Invalid {
  return (arrayA, arrayB) => {
    if (arrayA.length !== arrayB.length) {
      return NodeComparisonResult.Invalid;
    }

    const result = arrayA.every((elA, idx) => {
      const elB = arrayB[idx];
      if (elA == null || elB == null) {
        return elA === elB;
      }
      return compare(elA, elB);
    });
    if (result) {
      return NodeComparisonResult.Equal;
    }
    return NodeComparisonResult.Invalid;
  };
}
const compareNodeArray = compareArray(compareNodes);
const compareTypeNodeArray = compareArray(compareTypes);

const enum NodeComparisonResult {
  /** the two nodes are comparably the same */
  Equal,
  /** the left node is a subset of the right node */
  Subset,
  /** the left node is not the same or is a superset of the right node */
  Invalid,
}
function compareTypes(
  nodeA: TypeComparisonNode | null | undefined,
  nodeB: TypeComparisonNode | null | undefined,
): NodeComparisonResult {
  if (nodeA == null || nodeB == null) {
    if (nodeA !== nodeB) {
      return NodeComparisonResult.Invalid;
    }
    return NodeComparisonResult.Equal;
  }

  switch (nodeA.type) {
    case AST_NODE_TYPES.TSAbstractKeyword:
    case AST_NODE_TYPES.TSAnyKeyword:
    case AST_NODE_TYPES.TSAsyncKeyword:
    case AST_NODE_TYPES.TSBigIntKeyword:
    case AST_NODE_TYPES.TSBooleanKeyword:
    case AST_NODE_TYPES.TSDeclareKeyword:
    case AST_NODE_TYPES.TSExportKeyword:
    case AST_NODE_TYPES.TSIntrinsicKeyword:
    case AST_NODE_TYPES.TSNeverKeyword:
    case AST_NODE_TYPES.TSNullKeyword:
    case AST_NODE_TYPES.TSNumberKeyword:
    case AST_NODE_TYPES.TSObjectKeyword:
    case AST_NODE_TYPES.TSPrivateKeyword:
    case AST_NODE_TYPES.TSProtectedKeyword:
    case AST_NODE_TYPES.TSPublicKeyword:
    case AST_NODE_TYPES.TSReadonlyKeyword:
    case AST_NODE_TYPES.TSStaticKeyword:
    case AST_NODE_TYPES.TSStringKeyword:
    case AST_NODE_TYPES.TSSymbolKeyword:
    case AST_NODE_TYPES.TSUndefinedKeyword:
    case AST_NODE_TYPES.TSUnknownKeyword:
    case AST_NODE_TYPES.TSVoidKeyword:
      return NodeComparisonResult.Equal;

    case AST_NODE_TYPES.TSArrayType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSConditionalType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSConstructorType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSFunctionType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSImportType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSIndexedAccessType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSInferType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSIntersectionType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSLiteralType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSMappedType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSNamedTupleMember:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSOptionalType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSQualifiedName:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSRestType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSTemplateLiteralType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSThisType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSTupleType:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSTypeLiteral:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSTypeOperator:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSTypeParameterInstantiation:
      return compareTypeNodeArray(nodeA.params, (nodeB as typeof nodeA).params);

    case AST_NODE_TYPES.TSTypePredicate:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSTypeQuery:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSTypeReference:
      // TODO
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSUnionType:
      // TODO
      return NodeComparisonResult.Invalid;

    default:
      nodeA satisfies never;
      return NodeComparisonResult.Invalid;
  }
}
function compareNodes(
  nodeA: ValueComparisonNode | null | undefined,
  nodeB: ValueComparisonNode | null | undefined,
): NodeComparisonResult {
  if (nodeA == null || nodeB == null) {
    if (nodeA !== nodeB) {
      return NodeComparisonResult.Invalid;
    }
    return NodeComparisonResult.Equal;
  }

  if (nodeA.type !== nodeB.type) {
    // special case where nodes are allowed to be non-equal
    // a?.b && a.b.c
    // ^^^^ ChainExpression, MemberExpression
    //         ^^^^^ MemberExpression
    // Can be fixed to
    // a?.b?.c
    if (nodeA.type === AST_NODE_TYPES.ChainExpression) {
      return compareNodes(nodeA.expression, nodeB);
    }
    if (nodeB.type === AST_NODE_TYPES.ChainExpression) {
      return compareNodes(nodeA, nodeB.expression);
    }

    // special case for optional member expressions
    // a && a.b
    // ^ Identifier
    //      ^^^ MemberExpression
    if (
      nodeA.type === AST_NODE_TYPES.Identifier &&
      nodeB.type === AST_NODE_TYPES.MemberExpression
    ) {
      if (compareNodes(nodeA, nodeB.object) !== NodeComparisonResult.Invalid) {
        return NodeComparisonResult.Subset;
      }
      return NodeComparisonResult.Invalid;
    }

    // special case for optional call expressions
    // a.b && a.b()
    // ^^^ MemberExpression
    //        ^^^^^ CallExpression
    // Can be fixed to
    // a.b?.()
    if (
      (nodeA.type === AST_NODE_TYPES.MemberExpression ||
        nodeA.type === AST_NODE_TYPES.Identifier) &&
      nodeB.type === AST_NODE_TYPES.CallExpression
    ) {
      if (compareNodes(nodeA, nodeB.callee) !== NodeComparisonResult.Invalid) {
        return NodeComparisonResult.Subset;
      }
      return NodeComparisonResult.Invalid;
    }

    // special case for chaining off of a meta property
    if (nodeA.type === AST_NODE_TYPES.MetaProperty) {
      switch (nodeB.type) {
        // import.meta && import.meta.foo
        case AST_NODE_TYPES.MemberExpression: {
          const objectCompare = compareNodes(nodeA, nodeB.object);
          if (objectCompare !== NodeComparisonResult.Invalid) {
            return NodeComparisonResult.Subset;
          }
          return NodeComparisonResult.Invalid;
        }

        // import.meta && import.meta.bar()
        case AST_NODE_TYPES.CallExpression: {
          const calleeCompare = compareNodes(nodeA, nodeB.callee);
          if (calleeCompare !== NodeComparisonResult.Invalid) {
            return NodeComparisonResult.Subset;
          }
          return NodeComparisonResult.Invalid;
        }

        default:
          return NodeComparisonResult.Invalid;
      }
    }

    return NodeComparisonResult.Invalid;
  }

  switch (nodeA.type) {
    // these expressions create a new instance each time - so it makes no sense to compare the chain
    case AST_NODE_TYPES.ArrayExpression:
    case AST_NODE_TYPES.ArrowFunctionExpression:
    case AST_NODE_TYPES.ClassExpression:
    case AST_NODE_TYPES.FunctionExpression:
    case AST_NODE_TYPES.JSXElement:
    case AST_NODE_TYPES.JSXFragment:
    case AST_NODE_TYPES.NewExpression:
    case AST_NODE_TYPES.ObjectExpression:
      return NodeComparisonResult.Invalid;

    // chaining from assignments could change the value irrevocably - so it makes no sense to compare the chain
    case AST_NODE_TYPES.AssignmentExpression:
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.AwaitExpression:
      return compareNodes(nodeA.argument, (nodeB as typeof nodeA).argument);

    // binary expressions always return either boolean or number - so it makes no sense to compare the chain
    case AST_NODE_TYPES.BinaryExpression:
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.CallExpression: {
      const nodeBCall = nodeB as typeof nodeA;

      // check for cases like
      // foo() && foo()(bar)
      // ^^^^^ nodeA
      //          ^^^^^^^^^^ nodeB
      // we don't want to check the arguments in this case
      const aSubsetOfB = compareNodes(nodeA, nodeBCall.callee);
      if (aSubsetOfB !== NodeComparisonResult.Invalid) {
        return aSubsetOfB;
      }

      const calleeCompare = compareNodes(nodeA.callee, nodeBCall.callee);
      if (calleeCompare !== NodeComparisonResult.Equal) {
        return NodeComparisonResult.Invalid;
      }

      // NOTE - we purposely ignore optional flag because for our purposes
      // foo?.bar() && foo.bar?.()?.baz
      // or
      // foo.bar() && foo?.bar?.()?.baz
      // are going to be exactly the same

      const argumentCompare = compareNodeArray(
        nodeA.arguments,
        nodeBCall.arguments,
      );
      if (argumentCompare !== NodeComparisonResult.Equal) {
        return NodeComparisonResult.Invalid;
      }

      const typeParamCompare = compareTypes(
        nodeA.typeParameters,
        nodeBCall.typeParameters,
      );
      if (typeParamCompare === NodeComparisonResult.Equal) {
        return NodeComparisonResult.Equal;
      }

      return NodeComparisonResult.Invalid;
    }

    case AST_NODE_TYPES.ChainExpression:
      return compareNodes(nodeA.expression, (nodeB as typeof nodeA).expression);

    // TODO - we could handle this, but it's pretty nonsensical and needlessly complicated to do something like
    // (x ? y : z) && (x ? y : z).prop
    // Let's put a pin in this unless someone asks for it
    case AST_NODE_TYPES.ConditionalExpression:
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.Identifier:
    case AST_NODE_TYPES.PrivateIdentifier:
      if (nodeA.name === (nodeB as typeof nodeA).name) {
        return NodeComparisonResult.Equal;
      }
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.ImportExpression: {
      const nodeBImport = nodeB as typeof nodeA;
      const sourceCompare = compareNodes(nodeA.source, nodeBImport.source);
      if (sourceCompare !== NodeComparisonResult.Equal) {
        return NodeComparisonResult.Invalid;
      }

      if (nodeA.attributes == null || nodeBImport.attributes == null) {
        if (nodeA.attributes !== nodeBImport.attributes) {
          return NodeComparisonResult.Invalid;
        }
        return NodeComparisonResult.Equal;
      }

      if (
        compareNodes(nodeA.attributes, nodeBImport.attributes) ===
        NodeComparisonResult.Equal
      ) {
        return NodeComparisonResult.Equal;
      }

      return NodeComparisonResult.Invalid;
    }

    case AST_NODE_TYPES.Literal: {
      const nodeBLiteral = nodeB as typeof nodeA;
      if (
        nodeA.raw === nodeBLiteral.raw &&
        nodeA.value === nodeBLiteral.value
      ) {
        return NodeComparisonResult.Equal;
      }
      return NodeComparisonResult.Invalid;
    }

    // TODO - we could handle this, but it's pretty nonsensical and needlessly complicated to do something like
    // (x || y) && (x || y).z
    // Let's put a pin in this unless someone asks for it
    case AST_NODE_TYPES.LogicalExpression:
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.MemberExpression: {
      const nodeBMember = nodeB as typeof nodeA;
      if (nodeA.computed !== nodeBMember.computed) {
        return NodeComparisonResult.Invalid;
      }

      // check for cases like
      // foo.bar && foo.bar.baz
      // ^^^^^^^ nodeA
      //            ^^^^^^^^^^^ nodeB
      // we don't want to check the property in this case
      const aSubsetOfB = compareNodes(nodeA, nodeBMember.object);
      if (aSubsetOfB !== NodeComparisonResult.Invalid) {
        return aSubsetOfB;
      }

      // NOTE - we purposely ignore optional flag because for our purposes
      // foo?.bar && foo.bar?.baz
      // or
      // foo.bar && foo?.bar?.baz
      // are going to be exactly the same

      const objectCompare = compareNodes(nodeA.object, nodeBMember.object);
      if (objectCompare !== NodeComparisonResult.Equal) {
        return NodeComparisonResult.Invalid;
      }

      return compareNodes(nodeA.property, nodeBMember.property);
    }

    case AST_NODE_TYPES.MetaProperty: {
      const nodeBMeta = nodeB as typeof nodeA;
      const metaCompare = compareNodes(nodeA.meta, nodeBMeta.meta);
      if (metaCompare !== NodeComparisonResult.Equal) {
        return NodeComparisonResult.Invalid;
      }
      const propCompare = compareNodes(nodeA.property, nodeBMeta.property);
      if (propCompare === NodeComparisonResult.Equal) {
        return NodeComparisonResult.Equal;
      }
      return NodeComparisonResult.Invalid;
    }

    case AST_NODE_TYPES.SequenceExpression:
      return compareNodeArray(
        nodeA.expressions,
        (nodeB as typeof nodeA).expressions,
      );

    case AST_NODE_TYPES.SpreadElement:
      return compareNodes(nodeA.argument, (nodeB as typeof nodeA).argument);

    // constant expressions are TIGHT
    case AST_NODE_TYPES.Super:
    case AST_NODE_TYPES.ThisExpression:
      return NodeComparisonResult.Equal;

    // TODO - we could handle this, but it's pretty nonsensical and needlessly complicated to do something like
    // tag`foo${bar}` && tag`foo${bar}`.prop
    // Additionally the template tag might return a new value each time.
    // Let's put a pin in this unless someone asks for it.
    case AST_NODE_TYPES.TaggedTemplateExpression:
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TemplateLiteral: {
      const nodeBTemplate = nodeB as typeof nodeA;
      const areQuasisEqual =
        nodeA.quasis.length === nodeBTemplate.quasis.length &&
        nodeA.quasis.every((elA, idx) => {
          const elB = nodeBTemplate.quasis[idx];
          return elA === elB;
        });
      if (!areQuasisEqual) {
        return NodeComparisonResult.Invalid;
      }

      return compareNodeArray(nodeA.expressions, nodeBTemplate.expressions);
    }

    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSSatisfiesExpression:
    case AST_NODE_TYPES.TSTypeAssertion: {
      const nodeBAssertion = nodeB as typeof nodeA;
      const expressionCompare = compareNodes(
        nodeA.expression,
        nodeBAssertion.expression,
      );
      if (expressionCompare === NodeComparisonResult.Invalid) {
        return NodeComparisonResult.Invalid;
      }

      const typeCompare = compareTypes(
        nodeA.typeAnnotation,
        nodeBAssertion.typeAnnotation,
      );
      if (typeCompare === NodeComparisonResult.Equal) {
        return expressionCompare;
      }

      return NodeComparisonResult.Invalid;
    }

    // it's syntactically invalid for an instantiation expression to be part of a chain
    case AST_NODE_TYPES.TSInstantiationExpression:
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSNonNullExpression:
      return compareNodes(nodeA.expression, (nodeB as typeof nodeA).expression);

    // unary expressions alway return one of number, boolean, string or undefined - so it makes no sense to compare the chain
    case AST_NODE_TYPES.UnaryExpression:
      return NodeComparisonResult.Invalid;

    // update expression returns a number and also changes the value each time - so it makes no sense to compare the chain
    case AST_NODE_TYPES.UpdateExpression:
      return NodeComparisonResult.Invalid;

    // yield returns the value passed to the `next` function, so it may not be the same each time - so it makes no sense to compare the chain
    case AST_NODE_TYPES.YieldExpression:
      return NodeComparisonResult.Invalid;

    // these aren't actually valid expressions.
    // https://github.com/typescript-eslint/typescript-eslint/blob/20d7caee35ab84ae6381fdf04338c9e2b9e2bc48/packages/ast-spec/src/unions/Expression.ts#L37-L43
    case AST_NODE_TYPES.ArrayPattern:
    case AST_NODE_TYPES.ObjectPattern:
      return NodeComparisonResult.Invalid;

    default:
      nodeA satisfies never;
      return NodeComparisonResult.Invalid;
  }
}

type OperandAnalyzer = (
  operand: ValidOperand,
  index: number,
  chain: readonly ValidOperand[],
) => readonly [ValidOperand, ...ValidOperand[]] | null;
const analyzeAndChainOperand: OperandAnalyzer = (operand, index, chain) => {
  switch (operand.comparisonType) {
    case NullishComparisonType.NotBoolean:
    case NullishComparisonType.NotEqNullOrUndefined:
      return [operand];

    case NullishComparisonType.NotEqNull: {
      // TODO(#4820) - use types here to determine if the value is just `null` (eg `=== null` would be enough on its own)

      // handle `x === null || x === undefined`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType === NullishComparisonType.NotEqUndefined &&
        compareNodes(operand.node, nextOperand.node) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      } else {
        return null;
      }
    }

    case NullishComparisonType.NotEqUndefined: {
      // TODO(#4820) - use types here to determine if the value is just `undefined` (eg `=== undefined` would be enough on its own)

      // handle `x === undefined || x === null`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType === NullishComparisonType.NotEqNull &&
        compareNodes(operand.node, nextOperand.node) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      } else {
        return null;
      }
    }

    default:
      return null;
  }
};
const analyzeOrChainOperand: OperandAnalyzer = (operand, index, chain) => {
  switch (operand.comparisonType) {
    case NullishComparisonType.Boolean:
    case NullishComparisonType.EqNullOrUndefined:
      return [operand];

    case NullishComparisonType.EqNull: {
      // TODO(#4820) - use types here to determine if the value is just `null` (eg `=== null` would be enough on its own)

      // handle `x === null || x === undefined`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType === NullishComparisonType.EqUndefined &&
        compareNodes(operand.node, nextOperand.node) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      } else {
        return null;
      }
    }

    case NullishComparisonType.EqUndefined: {
      // TODO(#4820) - use types here to determine if the value is just `undefined` (eg `=== undefined` would be enough on its own)

      // handle `x === undefined || x === null`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType === NullishComparisonType.EqNull &&
        compareNodes(operand.node, nextOperand.node) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      } else {
        return null;
      }
    }

    default:
      return null;
  }
};

function analyzeChain(
  context: TSESLint.RuleContext<TMessageIds, TOptions>,
  operator: TSESTree.LogicalExpression['operator'],
  chain: ValidOperand[],
): void {
  if (chain.length === 0) {
    return;
  }

  const analyzeOperand = ((): OperandAnalyzer | null => {
    switch (operator) {
      case '&&':
        return analyzeAndChainOperand;

      case '||':
        return analyzeOrChainOperand;

      case '??':
        return null;
    }
  })();
  if (!analyzeOperand) {
    return;
  }

  let subChain: ValidOperand[] = [];
  const maybeReportThenReset = (
    newChainSeed?: readonly ValidOperand[],
  ): void => {
    if (subChain.length > 1) {
      context.report({
        messageId: 'preferOptionalChain',
        loc: {
          start: subChain[0].node.loc.start,
          end: subChain[subChain.length - 1].node.loc.end,
        },
      });
    }

    // we've reached the end of a chain of logical expressions
    // we know the validated
    subChain = newChainSeed ? [...newChainSeed] : [];
  };

  for (let i = 0; i < chain.length; i += 1) {
    const lastOperand = subChain[subChain.length - 1] as
      | ValidOperand
      | undefined;
    const operand = chain[i];

    const validatedOperands = analyzeOperand(operand, i, chain);
    if (!validatedOperands) {
      maybeReportThenReset();
      continue;
    }
    // in case multiple operands were consumed - make sure to correctly increment the index
    i += validatedOperands.length - 1;

    if (lastOperand) {
      const currentOperand = validatedOperands[0];
      const comparisonResult = compareNodes(
        lastOperand.node,
        currentOperand.node,
      );
      if (
        comparisonResult === NodeComparisonResult.Subset ||
        comparisonResult === NodeComparisonResult.Equal
      ) {
        // the operands are comparable, so we can continue searching
        subChain.push(...validatedOperands);
      } else {
        maybeReportThenReset(validatedOperands);
      }
    }
  }
}

export default util.createRule<TOptions, TMessageIds>({
  name: 'prefer-optional-chain',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using concise optional chain expressions instead of chained logical ands, negated logical ors, or empty objects',
      recommended: 'strict',
    },
    hasSuggestions: true,
    messages: {
      preferOptionalChain:
        "Prefer using an optional chain expression instead, as it's more concise and easier to read.",
      optionalChainSuggest: 'Change to an optional chain.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    const parserServices = util.getParserServices(context, true);

    const seenLogicals = new Set<TSESTree.LogicalExpression>();

    return {
      // specific handling for `(foo ?? {}).bar` / `(foo || {}).bar`
      'LogicalExpression[operator="||"], LogicalExpression[operator="??"]'(
        node: TSESTree.LogicalExpression,
      ): void {
        seenLogicals.add(node);

        const leftNode = node.left;
        const rightNode = node.right;
        const parentNode = node.parent;
        const isRightNodeAnEmptyObjectLiteral =
          rightNode.type === AST_NODE_TYPES.ObjectExpression &&
          rightNode.properties.length === 0;
        if (
          !isRightNodeAnEmptyObjectLiteral ||
          !parentNode ||
          parentNode.type !== AST_NODE_TYPES.MemberExpression ||
          parentNode.optional
        ) {
          return;
        }

        function isLeftSideLowerPrecedence(): boolean {
          const logicalTsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

          const leftTsNode = parserServices.esTreeNodeToTSNodeMap.get(leftNode);
          const operator = isBinaryExpression(logicalTsNode)
            ? logicalTsNode.operatorToken.kind
            : ts.SyntaxKind.Unknown;
          const leftPrecedence = util.getOperatorPrecedence(
            leftTsNode.kind,
            operator,
          );

          return leftPrecedence < util.OperatorPrecedence.LeftHandSide;
        }
        context.report({
          node: parentNode,
          messageId: 'optionalChainSuggest',
          suggest: [
            {
              messageId: 'optionalChainSuggest',
              fix: (fixer): TSESLint.RuleFix => {
                const leftNodeText = sourceCode.getText(leftNode);
                // Any node that is made of an operator with higher or equal precedence,
                const maybeWrappedLeftNode = isLeftSideLowerPrecedence()
                  ? `(${leftNodeText})`
                  : leftNodeText;
                const propertyToBeOptionalText = sourceCode.getText(
                  parentNode.property,
                );
                const maybeWrappedProperty = parentNode.computed
                  ? `[${propertyToBeOptionalText}]`
                  : propertyToBeOptionalText;
                return fixer.replaceTextRange(
                  parentNode.range,
                  `${maybeWrappedLeftNode}?.${maybeWrappedProperty}`,
                );
              },
            },
          ],
        });
      },

      'LogicalExpression[operator!="??"]'(
        node: TSESTree.LogicalExpression,
      ): void {
        if (seenLogicals.has(node)) {
          return;
        }

        const { operands, seenLogicals: newSeenLogicals } =
          gatherLogicalOperands(node);

        for (const logical of newSeenLogicals) {
          seenLogicals.add(logical);
        }

        let currentChain: ValidOperand[] = [];
        for (const operand of operands) {
          if (operand.type === OperandValidity.Invalid) {
            analyzeChain(context, node.operator, currentChain);
            currentChain = [];
          } else {
            currentChain.push(operand);
          }
        }

        // make sure to check whatever's left
        analyzeChain(context, node.operator, currentChain);
      },
    };
  },
});

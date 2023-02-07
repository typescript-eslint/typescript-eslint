import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { visitorKeys } from '@typescript-eslint/visitor-keys';
import { isBinaryExpression } from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

type TMessageIds = 'preferOptionalChain' | 'optionalChainSuggest';
type TOptions = [];

const enum ComparisonValueType {
  Null = 'Null', // eslint-disable-line @typescript-eslint/internal/prefer-ast-types-enum
  Undefined = 'Undefined',
  UndefinedStringLiteral = 'UndefinedStringLiteral',
}
const enum OperandValidity {
  Valid = 'Valid',
  Invalid = 'Invalid',
}
const enum NodeComparisonResult {
  /** the two nodes are comparably the same */
  Equal = 'Equal',
  /** the left node is a subset of the right node */
  Subset = 'Subset',
  /** the left node is not the same or is a superset of the right node */
  Invalid = 'Invalid',
}
const enum NullishComparisonType {
  /** `x != null`, `x != undefined` */
  NotEqualNullOrUndefined = 'NotEqualNullOrUndefined',
  /** `x == null`, `x == undefined` */
  EqualNullOrUndefined = 'EqualNullOrUndefined',

  /** `x !== null` */
  NotStrictEqualNull = 'NotStrictEqualNull',
  /** `x === null` */
  StrictEqualNull = 'StrictEqualNull',

  /** `x !== undefined`, `typeof x !== 'undefined'` */
  NotStrictEqualUndefined = 'NotStrictEqualUndefined',
  /** `x === undefined`, `typeof x === 'undefined'` */
  StrictEqualUndefined = 'StrictEqualUndefined',

  /** `!x` */
  NotBoolean = 'NotBoolean',
  /** `x` */
  Boolean = 'Boolean', // eslint-disable-line @typescript-eslint/internal/prefer-ast-types-enum
}

interface ValidOperand {
  type: OperandValidity.Valid;
  comparedName: TSESTree.Node;
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
                ? NullishComparisonType.NotStrictEqualUndefined
                : NullishComparisonType.StrictEqualUndefined,
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
                  ? NullishComparisonType.NotEqualNullOrUndefined
                  : NullishComparisonType.EqualNullOrUndefined,
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
                    ? NullishComparisonType.NotStrictEqualNull
                    : NullishComparisonType.StrictEqualNull,
                  node: operand,
                });
                continue;

              case ComparisonValueType.Undefined:
                result.push({
                  type: OperandValidity.Valid,
                  comparedName,
                  comparisonType: operand.operator.startsWith('!')
                    ? NullishComparisonType.NotStrictEqualUndefined
                    : NullishComparisonType.StrictEqualUndefined,
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
          continue;
        }
        result.push({ type: OperandValidity.Invalid });
        continue;

      case AST_NODE_TYPES.LogicalExpression:
        // explicitly ignore the mixed logical expression cases
        result.push({ type: OperandValidity.Invalid });
        continue;

      default:
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
  like `foo || foo.bar && foo.bar.baz` - separate selector
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
        // eslint-disable-next-line eqeqeq -- intentional exact comparison against null
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

function compareArrays(
  arrayA: unknown[],
  arrayB: unknown[],
): NodeComparisonResult.Equal | NodeComparisonResult.Invalid {
  if (arrayA.length !== arrayB.length) {
    return NodeComparisonResult.Invalid;
  }

  const result = arrayA.every((elA, idx) => {
    const elB = arrayB[idx];
    if (elA == null || elB == null) {
      return elA === elB;
    }
    return compareUnknownValues(elA, elB) === NodeComparisonResult.Equal;
  });
  if (result) {
    return NodeComparisonResult.Equal;
  }
  return NodeComparisonResult.Invalid;
}

function isValidNode(x: unknown): x is TSESTree.Node {
  return (
    typeof x === 'object' &&
    x != null &&
    'type' in x &&
    typeof x.type === 'string'
  );
}
function isValidChainExpressionToLookThrough(
  node: TSESTree.Node,
): node is TSESTree.ChainExpression {
  return (
    !(
      node.parent?.type === AST_NODE_TYPES.MemberExpression &&
      node.parent.object === node
    ) &&
    !(
      node.parent?.type === AST_NODE_TYPES.CallExpression &&
      node.parent.callee === node
    ) &&
    node.type === AST_NODE_TYPES.ChainExpression
  );
}
function compareUnknownValues(
  valueA: unknown,
  valueB: unknown,
): NodeComparisonResult {
  if (valueA == null || valueB == null) {
    if (valueA !== valueB) {
      return NodeComparisonResult.Invalid;
    }
    return NodeComparisonResult.Equal;
  }

  if (!isValidNode(valueA) || !isValidNode(valueB)) {
    return NodeComparisonResult.Invalid;
  }

  return compareNodes(valueA, valueB);
}
function compareByVisiting(
  nodeA: TSESTree.Node,
  nodeB: TSESTree.Node,
): NodeComparisonResult.Equal | NodeComparisonResult.Invalid {
  const currentVisitorKeys = visitorKeys[nodeA.type];
  if (currentVisitorKeys == null) {
    // we don't know how to visit this node, so assume it's invalid to avoid false-positives / broken fixers
    return NodeComparisonResult.Invalid;
  }

  if (currentVisitorKeys.length === 0) {
    // assume nodes with no keys are constant things like keywords
    return NodeComparisonResult.Equal;
  }

  for (const key of currentVisitorKeys) {
    // @ts-expect-error - dynamic access but it's safe
    const nodeAChildOrChildren = nodeA[key] as unknown;
    // @ts-expect-error - dynamic access but it's safe
    const nodeBChildOrChildren = nodeB[key] as unknown;

    if (Array.isArray(nodeAChildOrChildren)) {
      const arrayA = nodeAChildOrChildren as unknown[];
      const arrayB = nodeBChildOrChildren as unknown[];

      const result = compareArrays(arrayA, arrayB);
      if (!result) {
        return NodeComparisonResult.Invalid;
      }
      // fallthrough to the next key as the key was "equal"
    } else {
      const result = compareUnknownValues(
        nodeAChildOrChildren,
        nodeBChildOrChildren,
      );
      if (result !== NodeComparisonResult.Equal) {
        return NodeComparisonResult.Invalid;
      }
      // fallthrough to the next key as the key was "equal"
    }
  }

  return NodeComparisonResult.Equal;
}
type CompareNodesArgument = TSESTree.Node | null | undefined;
function compareNodesUncached(
  nodeA: TSESTree.Node,
  nodeB: TSESTree.Node,
): NodeComparisonResult {
  if (nodeA.type !== nodeB.type) {
    // special cases where nodes are allowed to be non-equal

    // look through a chain expression node at the top-level because it only
    // exists to delimit the end of an optional chain
    //
    // a?.b && a.b.c
    // ^^^^ ChainExpression, MemberExpression
    //         ^^^^^ MemberExpression
    //
    // except for in this class of cases
    // (a?.b).c && a.b.c
    // because the parentheses have runtime meaning (sad face)
    if (isValidChainExpressionToLookThrough(nodeA)) {
      return compareNodes(nodeA.expression, nodeB);
    }
    if (isValidChainExpressionToLookThrough(nodeB)) {
      return compareNodes(nodeA, nodeB.expression);
    }

    // look through the type-only non-null assertion because its existence could
    // possibly be replaced by an optional chain instead
    //
    // a.b! && a.b.c
    // ^^^^ TSNonNullExpression
    if (nodeA.type === AST_NODE_TYPES.TSNonNullExpression) {
      return compareNodes(nodeA.expression, nodeB);
    }
    if (nodeB.type === AST_NODE_TYPES.TSNonNullExpression) {
      return compareNodes(nodeA, nodeB.expression);
    }

    // special case for subset optional chains where the node types don't match,
    // but we want to try comparing by discarding the "extra" code
    //
    // a && a.b
    //      ^ compare this
    // a && a()
    //      ^ compare this
    // a.b && a.b()
    //        ^^^ compare this
    // a() && a().b
    //        ^^^ compare this
    // import.meta && import.meta.b
    //                ^^^^^^^^^^^ compare this
    if (
      nodeA.type === AST_NODE_TYPES.CallExpression ||
      nodeA.type === AST_NODE_TYPES.Identifier ||
      nodeA.type === AST_NODE_TYPES.MemberExpression ||
      nodeA.type === AST_NODE_TYPES.MetaProperty
    ) {
      switch (nodeB.type) {
        case AST_NODE_TYPES.MemberExpression:
          if (nodeB.property.type === AST_NODE_TYPES.PrivateIdentifier) {
            // Private identifiers in optional chaining is not currently allowed
            // TODO - handle this once TS supports it (https://github.com/microsoft/TypeScript/issues/42734)
            return NodeComparisonResult.Invalid;
          }
          if (
            compareNodes(nodeA, nodeB.object) !== NodeComparisonResult.Invalid
          ) {
            return NodeComparisonResult.Subset;
          }
          return NodeComparisonResult.Invalid;

        case AST_NODE_TYPES.CallExpression:
          if (
            compareNodes(nodeA, nodeB.callee) !== NodeComparisonResult.Invalid
          ) {
            return NodeComparisonResult.Subset;
          }
          return NodeComparisonResult.Invalid;

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

      const argumentCompare = compareArrays(
        nodeA.arguments,
        nodeBCall.arguments,
      );
      if (argumentCompare !== NodeComparisonResult.Equal) {
        return NodeComparisonResult.Invalid;
      }

      const typeParamCompare = compareNodes(
        nodeA.typeParameters,
        nodeBCall.typeParameters,
      );
      if (typeParamCompare === NodeComparisonResult.Equal) {
        return NodeComparisonResult.Equal;
      }

      return NodeComparisonResult.Invalid;
    }

    case AST_NODE_TYPES.ChainExpression:
      // special case handling for ChainExpression because it's allowed to be a subset
      return compareNodes(nodeA, (nodeB as typeof nodeA).expression);

    case AST_NODE_TYPES.Identifier:
    case AST_NODE_TYPES.PrivateIdentifier:
      if (nodeA.name === (nodeB as typeof nodeA).name) {
        return NodeComparisonResult.Equal;
      }
      return NodeComparisonResult.Invalid;

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

    case AST_NODE_TYPES.LogicalExpression: {
      const nodeBLogical = nodeB as typeof nodeA;

      // TODO - we could handle this, but it's pretty nonsensical and needlessly complicated to do something like
      // (x || y) && (x || y).z
      // Let's put a pin in this unless someone asks for it
      if (
        (nodeA.parent?.type === AST_NODE_TYPES.MemberExpression &&
          nodeA.parent.object === nodeA) ||
        nodeA.parent?.type === AST_NODE_TYPES.LogicalExpression
      ) {
        return NodeComparisonResult.Invalid;
      }

      const leftCompare = compareNodes(nodeA.left, nodeBLogical.left);
      if (leftCompare !== NodeComparisonResult.Equal) {
        return NodeComparisonResult.Invalid;
      }
      const rightCompare = compareNodes(nodeA.right, nodeBLogical.right);
      if (rightCompare === NodeComparisonResult.Equal) {
        return NodeComparisonResult.Equal;
      }
      return NodeComparisonResult.Invalid;
    }

    case AST_NODE_TYPES.MemberExpression: {
      const nodeBMember = nodeB as typeof nodeA;

      if (nodeBMember.property.type === AST_NODE_TYPES.PrivateIdentifier) {
        // Private identifiers in optional chaining is not currently allowed
        // TODO - handle this once TS supports it (https://github.com/microsoft/TypeScript/issues/42734)
        return NodeComparisonResult.Invalid;
      }

      // check for cases like
      // foo.bar && foo.bar.baz
      // ^^^^^^^ nodeA
      //            ^^^^^^^^^^^ nodeB
      // result === Equal
      //
      // foo.bar && foo.bar.baz.bam
      // ^^^^^^^ nodeA
      //            ^^^^^^^^^^^^^^^ nodeB
      // result === Subset
      //
      // we don't want to check the property in this case
      const aSubsetOfB = compareNodes(nodeA, nodeBMember.object);
      if (aSubsetOfB !== NodeComparisonResult.Invalid) {
        return NodeComparisonResult.Subset;
      }

      if (nodeA.computed !== nodeBMember.computed) {
        return NodeComparisonResult.Invalid;
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

    // TODO - we could handle this, but it's pretty nonsensical and needlessly complicated to do something like
    // tag`foo${bar}` && tag`foo${bar}`.prop
    // Additionally the template tag might return a new value each time.
    // Let's put a pin in this unless someone asks for it.
    case AST_NODE_TYPES.TaggedTemplateExpression:
      return NodeComparisonResult.Invalid;

    case AST_NODE_TYPES.TSTemplateLiteralType:
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

      return compareNodes(nodeA, nodeBTemplate);
    }

    case AST_NODE_TYPES.TemplateElement: {
      const nodeBElement = nodeB as typeof nodeA;
      if (nodeA.value.cooked === nodeBElement.value.cooked) {
        return NodeComparisonResult.Equal;
      }
      return NodeComparisonResult.Invalid;
    }

    // it's syntactically invalid for an instantiation expression to be part of a chain
    case AST_NODE_TYPES.TSInstantiationExpression:
      return NodeComparisonResult.Invalid;

    // these aren't actually valid expressions.
    // https://github.com/typescript-eslint/typescript-eslint/blob/20d7caee35ab84ae6381fdf04338c9e2b9e2bc48/packages/ast-spec/src/unions/Expression.ts#L37-L43
    case AST_NODE_TYPES.ArrayPattern:
    case AST_NODE_TYPES.ObjectPattern:
      return NodeComparisonResult.Invalid;

    // update expression returns a number and also changes the value each time - so it makes no sense to compare the chain
    case AST_NODE_TYPES.UpdateExpression:
      return NodeComparisonResult.Invalid;

    // yield returns the value passed to the `next` function, so it may not be the same each time - so it makes no sense to compare the chain
    case AST_NODE_TYPES.YieldExpression:
      return NodeComparisonResult.Invalid;

    // general-case automatic handling of nodes to save us implementing every
    // single case by hand. This just iterates the visitor keys to recursively
    // check the children.
    //
    // Any specific logic cases or short-circuits should be listed as separate
    // cases so that they don't fall into this generic handling
    default:
      return compareByVisiting(nodeA, nodeB);
  }
}
const COMPARE_NODES_CACHE = new WeakMap<
  TSESTree.Node,
  WeakMap<TSESTree.Node, NodeComparisonResult>
>();
function compareNodes(
  nodeA: CompareNodesArgument,
  nodeB: CompareNodesArgument,
): NodeComparisonResult {
  if (nodeA == null || nodeB == null) {
    if (nodeA !== nodeB) {
      return NodeComparisonResult.Invalid;
    }
    return NodeComparisonResult.Equal;
  }

  const cached = COMPARE_NODES_CACHE.get(nodeA)?.get(nodeB);
  if (cached) {
    return cached;
  }

  const result = compareNodesUncached(nodeA, nodeB);
  let mapA = COMPARE_NODES_CACHE.get(nodeA);
  if (mapA == null) {
    mapA = new WeakMap();
    COMPARE_NODES_CACHE.set(nodeA, mapA);
  }
  mapA.set(nodeB, result);
  return result;
}

// I hate that these functions are identical aside from the enum values used
// I can't think of a good way to reuse the code here in a way that will preserve
// the type safety and simplicity.

type OperandAnalyzer = (
  operand: ValidOperand,
  index: number,
  chain: readonly ValidOperand[],
) => readonly [ValidOperand] | readonly [ValidOperand, ValidOperand] | null;
const analyzeAndChainOperand: OperandAnalyzer = (operand, index, chain) => {
  switch (operand.comparisonType) {
    case NullishComparisonType.Boolean:
    case NullishComparisonType.NotEqualNullOrUndefined:
      return [operand];

    case NullishComparisonType.NotStrictEqualNull: {
      // handle `x !== null && x !== undefined`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType ===
          NullishComparisonType.NotStrictEqualUndefined &&
        compareNodes(operand.comparedName, nextOperand.comparedName) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      } else {
        return [operand];
      }
    }

    case NullishComparisonType.NotStrictEqualUndefined: {
      // handle `x !== undefined && x !== null`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType ===
          NullishComparisonType.NotStrictEqualNull &&
        compareNodes(operand.comparedName, nextOperand.comparedName) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      } else {
        return [operand];
      }
    }

    default:
      return null;
  }
};
const analyzeOrChainOperand: OperandAnalyzer = (operand, index, chain) => {
  switch (operand.comparisonType) {
    case NullishComparisonType.NotBoolean:
    case NullishComparisonType.EqualNullOrUndefined:
      return [operand];

    case NullishComparisonType.StrictEqualNull: {
      // TODO(#4820) - use types here to determine if the value is just `null` (eg `=== null` would be enough on its own)

      // handle `x === null || x === undefined`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType ===
          NullishComparisonType.StrictEqualUndefined &&
        compareNodes(operand.comparedName, nextOperand.comparedName) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      } else {
        return null;
      }
    }

    case NullishComparisonType.StrictEqualUndefined: {
      // TODO(#4820) - use types here to determine if the value is just `undefined` (eg `=== undefined` would be enough on its own)

      // handle `x === undefined || x === null`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType === NullishComparisonType.StrictEqualNull &&
        compareNodes(operand.comparedName, nextOperand.comparedName) ===
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
  // need at least 2 operands in a chain for it to be a chain
  if (chain.length <= 1) {
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

    // purposely inspect and push the last operand because the prior operands don't matter
    // this also means we won't false-positive in cases like
    // foo !== null && foo !== undefined
    const currentOperand = validatedOperands[validatedOperands.length - 1];
    if (lastOperand) {
      const comparisonResult = compareNodes(
        lastOperand.comparedName,
        currentOperand.comparedName,
      );
      if (comparisonResult === NodeComparisonResult.Subset) {
        // the operands are comparable, so we can continue searching
        subChain.push(currentOperand);
      } else if (comparisonResult === NodeComparisonResult.Invalid) {
        maybeReportThenReset(validatedOperands);
      } else if (comparisonResult === NodeComparisonResult.Equal) {
        // purposely don't push this case because the node is a no-op and if
        // we consider it then we might report on things like
        // foo && foo
      }
    } else {
      subChain.push(currentOperand);
    }
  }

  // check the leftovers
  maybeReportThenReset();
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

        seenLogicals.add(node);

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

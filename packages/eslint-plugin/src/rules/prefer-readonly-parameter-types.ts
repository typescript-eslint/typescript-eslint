import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { isObjectType, isUnionType, unionTypeParts } from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

export default util.createRule({
  name: 'prefer-readonly-parameter-types',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'TODO',
      category: 'Possible Errors',
      recommended: false,
      requiresTypeChecking: true,
    },
    schema: [
      {
        type: 'string',
        enum: ['prefer-readonly', 'prefer-mutable', 'ignore'],
      },
    ],
    messages: {
      shouldBeReadonly: 'Parameter should be a read only type',
    },
  },
  defaultOptions: [],
  create(context) {
    const { esTreeNodeToTSNodeMap, program } = util.getParserServices(context);
    const checker = program.getTypeChecker();

    /**
     * Returns:
     * - null if the type is not an array or tuple,
     * - true if the type is a readonly array or readonly tuple,
     * - false if the type is a mutable array or mutable tuple.
     */
    function isTypeReadonlyArrayOrTuple(type: ts.Type): boolean | null {
      function checkTypeArguments(arrayType: ts.TypeReference): boolean {
        const typeArguments = checker.getTypeArguments(arrayType);
        if (typeArguments.length === 0) {
          // this shouldn't happen in reality as:
          // - tuples require at least 1 type argument
          // - ReadonlyArray requires at least 1 type argument
          return true;
        }

        // validate the element types are also readonly
        if (typeArguments.some(typeArg => !isTypeReadonly(typeArg))) {
          return false;
        }
        return true;
      }

      if (checker.isArrayType(type)) {
        const symbol = util.nullThrows(
          type.getSymbol(),
          util.NullThrowsReasons.MissingToken('symbol', 'array type'),
        );
        const escapedName = symbol.getEscapedName();
        if (escapedName === 'Array' && escapedName !== 'ReadonlyArray') {
          return false;
        }

        return checkTypeArguments(type);
      }

      if (checker.isTupleType(type)) {
        if (!type.target.readonly) {
          return false;
        }

        return checkTypeArguments(type);
      }

      return null;
    }

    /**
     * Returns:
     * - null if the type is not an object,
     * - true if the type is an object with only readonly props,
     * - false if the type is an object with at least one mutable prop.
     */
    function isTypeReadonlyObject(type: ts.Type): boolean | null {
      function checkIndex(kind: ts.IndexKind): boolean | null {
        const indexInfo = checker.getIndexInfoOfType(type, kind);
        if (indexInfo) {
          return indexInfo.isReadonly ? true : false;
        }

        return null;
      }

      const isStringIndexReadonly = checkIndex(ts.IndexKind.String);
      if (isStringIndexReadonly !== null) {
        return isStringIndexReadonly;
      }

      const isNumberIndexReadonly = checkIndex(ts.IndexKind.Number);
      if (isNumberIndexReadonly !== null) {
        return isNumberIndexReadonly;
      }

      const properties = type.getProperties();
      if (properties.length) {
        // NOTES:
        // - port isReadonlySymbol - https://github.com/Microsoft/TypeScript/blob/4212484ae18163df867f53dab19a8cc0c6000793/src/compiler/checker.ts#L26285
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        declare function isReadonlySymbol(symbol: ts.Symbol): boolean;

        for (const property of properties) {
          if (!isReadonlySymbol(property)) {
            return false;
          }
        }

        // all properties were readonly
        return true;
      }

      return false;
    }

    /**
     * Checks if the given type is readonly
     */
    function isTypeReadonly(type: ts.Type): boolean {
      if (isUnionType(type)) {
        return unionTypeParts(type).every(t => isTypeReadonly(t));
      }

      // all non-object types are readonly
      if (!isObjectType(type)) {
        return true;
      }

      // pure function types are readonly
      if (
        type.getCallSignatures().length > 0 &&
        type.getProperties().length === 0
      ) {
        return true;
      }

      const isReadonlyArray = isTypeReadonlyArrayOrTuple(type);
      if (isReadonlyArray !== null) {
        return isReadonlyArray;
      }

      const isReadonlyObject = isTypeReadonlyObject(type);
      if (isReadonlyObject !== null) {
        return isReadonlyObject;
      }

      throw new Error('Unhandled type');
    }

    return {
      'ArrowFunctionExpression, FunctionDeclaration, FunctionExpression, TSEmptyBodyFunctionExpression'(
        node:
          | TSESTree.ArrowFunctionExpression
          | TSESTree.FunctionDeclaration
          | TSESTree.FunctionExpression
          | TSESTree.TSEmptyBodyFunctionExpression,
      ): void {
        for (const param of node.params) {
          const actualParam =
            param.type === AST_NODE_TYPES.TSParameterProperty
              ? param.parameter
              : param;
          const tsNode = esTreeNodeToTSNodeMap.get(actualParam);
          const type = checker.getTypeAtLocation(tsNode);
          const isReadOnly = isTypeReadonly(type);

          if (!isReadOnly) {
            return context.report({
              node: actualParam,
              messageId: 'shouldBeReadonly',
            });
          }
        }
      },
    };
  },
});

import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isBuiltinSymbolLike,
} from '../util';
import { getForStatementHeadLoc } from '../util/getForStatementHeadLoc';

export default createRule({
  name: 'no-for-in-array',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow iterating over an array with a for-in loop',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      forInViolation:
        'For-in loops over arrays skips holes, returns indices as strings, and may visit the prototype chain or other enumerable properties. Use a more robust iteration method such as for-of or array.forEach instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ForInStatement(node): void {
        const services = getParserServices(context);
        const checker = services.program.getTypeChecker();

        const type = getConstrainedTypeAtLocation(services, node.right);

        if (
          isArray(checker, type) ||
          isRegExpExecArrayLike(services.program, type) ||
          isArgumentsObjectType(type)
        ) {
          context.report({
            loc: getForStatementHeadLoc(context.sourceCode, node),
            messageId: 'forInViolation',
          });
        }
      },
    };
  },
});

function isArgumentsObjectType(type: ts.Type): boolean {
  return (
    type.getSymbol()?.escapedName === ts.escapeLeadingUnderscores('IArguments')
  );
}

function isRegExpExecArrayLike(program: ts.Program, type: ts.Type): boolean {
  return isTypeRecurser(type, t =>
    isBuiltinSymbolLike(program, t, 'RegExpExecArray'),
  );
}

function isArray(checker: ts.TypeChecker, type: ts.Type): boolean {
  return isTypeRecurser(
    type,
    t => checker.isArrayType(t) || checker.isTupleType(t),
  );
}

function isTypeRecurser(
  type: ts.Type,
  predicate: (t: ts.Type) => boolean,
): boolean {
  if (type.isUnionOrIntersection()) {
    return type.types.some(t => isTypeRecurser(t, predicate));
  }

  return predicate(type);
}

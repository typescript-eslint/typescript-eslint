import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import * as ts from 'typescript';

export default util.createRule({
  name: 'no-unnecessary-generics',
  meta: {
    docs: {
      description: 'Forbids signatures using a generic parameter only once',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      failureString: 'Type parameter {{typeParameter}} is used only once.',
      failureStringNever: 'Type parameter {{typeParameter}} is never used',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      'FunctionDeclaration, FunctionExpression, ArrowFunctionExpression, TSCallSignatureDeclaration, TSMethodSignature, TSFunctionType, TSConstructorType, TSDeclareFunction'(
        node: // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        // | TSESTree.FunctionDeclaration
        // | TSESTree.FunctionExpression
        // | TSESTree.ArrowFunctionExpression
        // | TSESTree.TSCallSignatureDeclaration
        // | TSESTree.TSMethodSignature
        // | TSESTree.TSFunctionType
        // | TSESTree.TSConstructorType
        // | TSESTree.TSDeclareFunction,
      ): void {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        if (tsNode && ts.isFunctionLike(tsNode)) {
          checkSignature(tsNode);
        }

        // copied from https://github.com/microsoft/dtslint/blob/88b6f8975bb3ae9091c7150ddd52a11732324009/src/rules/noUnnecessaryGenericsRule.ts#L42
        function checkSignature(sig: ts.SignatureDeclaration): void {
          if (!sig.typeParameters) {
            return;
          }

          for (const tp of sig.typeParameters) {
            const typeParameter = tp.name.text;
            const res = getSoleUse(
              sig,
              assertDefined(checker.getSymbolAtLocation(tp.name)),
              checker,
            );
            switch (res.type) {
              case 'ok':
                break;
              case 'sole':
                context.report({
                  node: parserServices.tsNodeToESTreeNodeMap.get(res.soleUse),
                  messageId: 'failureString',
                  data: {
                    typeParameter,
                  },
                });
                break;
              case 'never':
                context.report({
                  node: parserServices.tsNodeToESTreeNodeMap.get(tp),
                  messageId: 'failureString',
                  data: {
                    typeParameter,
                  },
                });
                break;
              default:
                assertNever(res);
            }
          }
        }
      },
    };
  },
});

type Result =
  | { type: 'ok' | 'never' }
  | { type: 'sole'; soleUse: ts.Identifier };
function getSoleUse(
  sig: ts.SignatureDeclaration,
  typeParameterSymbol: ts.Symbol,
  checker: ts.TypeChecker,
): Result {
  const exit = {};
  let soleUse: ts.Identifier | undefined;
  const seenTypes = new Set<ts.Type>();

  try {
    if (sig.typeParameters) {
      for (const tp of sig.typeParameters) {
        if (tp.constraint) {
          recur(tp.constraint);
        }
      }
    }
    for (const param of sig.parameters) {
      if (param.type) {
        recur(param.type);
      }
    }
    if (sig.type) {
      recur(sig.type);
    } else if (sig.kind !== ts.SyntaxKind.Constructor && 'body' in sig) {
      // if body is missing, there is no point inferring return type.
      const sigType = checker.getSignatureFromDeclaration(sig);
      if (!sigType) {
        return { type: 'ok' };
      }

      const returnType = checker.getReturnTypeOfSignature(sigType);
      try {
        forEachType(
          returnType,
          type => {
            if (type.getSymbol() === typeParameterSymbol) {
              throw exit;
            }
          },
          checker,
        );
      } catch (error) {
        if (error === exit) {
          return { type: 'ok' };
        } else {
          throw error;
        }
      }
    }
  } catch (err) {
    if (err === exit) {
      return { type: 'ok' };
    }
    throw err;
  }

  return soleUse ? { type: 'sole', soleUse } : { type: 'never' };

  function recur(node: ts.TypeNode): void {
    if (ts.isIdentifier(node)) {
      if (checker.getSymbolAtLocation(node) === typeParameterSymbol) {
        if (soleUse === undefined) {
          soleUse = node;
        } else {
          throw exit;
        }
      }
    } else {
      node.forEachChild(recur as (node: ts.Node) => void);
    }
  }

  function forEachType(
    type: ts.Type,
    cb: (type: ts.Type) => void,
    checker: ts.TypeChecker,
  ): void {
    // prevent infinite recursion
    if (seenTypes.has(type)) {
      return;
    } else {
      seenTypes.add(type);
    }

    cb(type);

    // T | P
    if (type.flags & ts.TypeFlags.UnionOrIntersection) {
      const types = (type as ts.UnionOrIntersectionType).types;
      types.forEach(type => {
        forEachType(type, cb, checker);
      });
      return;
    }

    // a simple type
    if (!(type.flags & ts.TypeFlags.StructuredOrInstantiable)) {
      return;
    }

    // keyof T
    if (type.flags & ts.TypeFlags.Index) {
      forEachType((type as ts.IndexType).type, cb, checker);
      return;
    }

    // Indexed access types (TypeFlags.IndexedAccess)
    // Possible forms are T[xxx], xxx[T], or xxx[keyof T], where T is a type variable
    if (type.flags & ts.TypeFlags.IndexedAccess) {
      forEachType((type as ts.IndexedAccessType).objectType, cb, checker);
      forEachType((type as ts.IndexedAccessType).indexType, cb, checker);
      return;
    }

    // TODO: true type and false type are not exposed. https://github.com/microsoft/TypeScript/issues/45537
    if (type.flags & ts.TypeFlags.Conditional) {
      throw exit;
    }

    // TODO: MappedType is not exposed.
    if (getObjectFlags(type) & ts.ObjectFlags.Mapped) {
      throw exit;
    }

    if (type.flags & ts.TypeFlags.TemplateLiteral) {
      (type as ts.TemplateLiteralType).types.forEach(type =>
        forEachType(type, cb, checker),
      );
      return;
    }

    if (type.flags & ts.TypeFlags.Object) {
      type.aliasTypeArguments?.forEach(arg => {
        forEachType(arg, cb, checker);
      });

      const properties = checker.getPropertiesOfType(type);
      properties.forEach(prop => {
        const declType = checker.getTypeOfSymbolAtLocation(prop, sig);
        forEachType(declType, cb, checker);
      });

      const visitSignature = (signature: ts.Signature): void => {
        signature.parameters.forEach(param => {
          const decl = param.getDeclarations()?.[0];
          if (decl) {
            const declType = checker.getTypeOfSymbolAtLocation(param, decl);
            forEachType(declType, cb, checker);
          }
        });

        signature.getTypeParameters()?.forEach(typeParam => {
          const decl = typeParam.symbol.getDeclarations()?.[0];
          if (decl?.kind === ts.SyntaxKind.TypeParameter) {
            const constrain = (decl as ts.TypeParameterDeclaration).constraint;
            if (constrain) {
              forEachType(checker.getTypeFromTypeNode(constrain), cb, checker);
            }
          }
        });

        forEachType(signature.getReturnType(), cb, checker);

        // const predicate = checker.getTypePredicateOfSignature();
        const decl = signature?.getDeclaration();
        if (decl.type?.kind === ts.SyntaxKind.TypePredicate) {
          const typeNode = (decl.type as ts.TypePredicateNode).type;
          if (typeNode) {
            forEachType(checker.getTypeAtLocation(typeNode), cb, checker);
          }
        }
      };

      const calls = type.getCallSignatures();
      calls.forEach(signature => {
        visitSignature(signature);
      });
      const constructors = type.getConstructSignatures();
      constructors.forEach(signature => {
        visitSignature(signature);
      });

      // TODO: `checker.getIndexInfosOfType()` might be better
      const numberIndexType = type.getNumberIndexType();
      if (numberIndexType) {
        forEachType(numberIndexType, cb, checker);
      }
      const stringIndexType = type.getStringIndexType();
      if (stringIndexType) {
        forEachType(stringIndexType, cb, checker);
      }

      return;
    }

    // TODO: unknown type, abort?
    throw exit;
  }

  // internal of ts compiler

  function getObjectFlags(type: ts.Type): ts.ObjectFlags {
    const ObjectFlagsType =
      ts.TypeFlags.Any |
      ts.TypeFlags.Undefined |
      ts.TypeFlags.Null |
      ts.TypeFlags.Never |
      ts.TypeFlags.Object |
      ts.TypeFlags.Union |
      ts.TypeFlags.Intersection;
    return type.flags & ObjectFlagsType
      ? (type as ts.ObjectType).objectFlags
      : 0;
  }
}

function assertDefined<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error('unreachable');
  }
  return value;
}
function assertNever(_: never): never {
  throw new Error('unreachable');
}

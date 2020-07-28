/* eslint-disable no-fallthrough */

import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as util from '../util';

export type Options = [
  {
    ignoredNamesRegex?: string | boolean;
    ignoreArgsIfArgsAfterAreUsed?: boolean;
  },
];
export type MessageIds =
  | 'unused'
  | 'unusedWithIgnorePattern'
  | 'unusedImport'
  | 'unusedTypeParameters';

type NodeWithTypeParams = ts.Node & {
  typeParameters: ts.NodeArray<ts.TypeParameterDeclaration>;
};

export const DEFAULT_IGNORED_REGEX_STRING = '^_';
export default util.createRule<Options, MessageIds>({
  name: 'no-unused-vars-experimental',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused variables and arguments',
      category: 'Best Practices',
      recommended: false,
    },
    deprecated: true,
    replacedBy: ['no-unused-vars'],
    schema: [
      {
        type: 'object',
        properties: {
          ignoredNamesRegex: {
            oneOf: [
              {
                type: 'string',
              },
              {
                type: 'boolean',
                enum: [false],
              },
            ],
          },
          ignoreArgsIfArgsAfterAreUsed: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unused: "{{type}} '{{name}}' is declared but its value is never read.",
      unusedWithIgnorePattern:
        "{{type}} '{{name}}' is declared but its value is never read. Allowed unused names must match {{pattern}}.",
      unusedImport: 'All imports in import declaration are unused.',
      unusedTypeParameters: 'All type parameters are unused.',
    },
  },
  defaultOptions: [
    {
      ignoredNamesRegex: DEFAULT_IGNORED_REGEX_STRING,
      ignoreArgsIfArgsAfterAreUsed: false,
    },
  ],
  create(context, [userOptions]) {
    const parserServices = util.getParserServices(context, true);
    const tsProgram = parserServices.program;
    const afterAllDiagnosticsCallbacks: (() => void)[] = [];

    const options = {
      ignoredNames:
        userOptions && typeof userOptions.ignoredNamesRegex === 'string'
          ? new RegExp(userOptions.ignoredNamesRegex)
          : null,
      ignoreArgsIfArgsAfterAreUsed:
        userOptions.ignoreArgsIfArgsAfterAreUsed ?? false,
    };

    function handleIdentifier(identifier: ts.Identifier): void {
      function report(type: string): void {
        const node = parserServices.tsNodeToESTreeNodeMap.get(identifier);
        const regex = options.ignoredNames;
        const name = identifier.getText();
        if (regex) {
          if (!regex.test(name)) {
            context.report({
              node,
              messageId: 'unusedWithIgnorePattern',
              data: {
                name,
                type,
                pattern: regex.toString(),
              },
            });
          }
        } else {
          context.report({
            node,
            messageId: 'unused',
            data: {
              name,
              type,
            },
          });
        }
      }

      const parent = identifier.parent;

      // is a single variable diagnostic
      switch (parent.kind) {
        case ts.SyntaxKind.BindingElement:
        case ts.SyntaxKind.ObjectBindingPattern:
          report('Destructured Variable');
          break;

        case ts.SyntaxKind.ClassDeclaration:
          report('Class');
          break;

        case ts.SyntaxKind.EnumDeclaration:
          report('Enum');
          break;

        case ts.SyntaxKind.FunctionDeclaration:
          report('Function');
          break;

        // this won't happen because there are specific nodes that wrap up named/default import identifiers
        // case ts.SyntaxKind.ImportDeclaration:
        // import equals is always treated as a variable
        case ts.SyntaxKind.ImportEqualsDeclaration:
        // the default import is NOT used, but a named import is used
        case ts.SyntaxKind.ImportClause:
        // a named import is NOT used, but either another named import, or the default import is used
        case ts.SyntaxKind.ImportSpecifier:
        // a namespace import is NOT used, but the default import is used
        case ts.SyntaxKind.NamespaceImport:
          // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
          report('Import');
          break;

        case ts.SyntaxKind.InterfaceDeclaration:
          report('Interface');
          break;

        case ts.SyntaxKind.MethodDeclaration:
          report('Method');
          break;

        case ts.SyntaxKind.Parameter:
          handleParameterDeclaration(
            identifier,
            parent as ts.ParameterDeclaration,
          );
          break;

        case ts.SyntaxKind.PropertyDeclaration:
          // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
          report('Property');
          break;

        case ts.SyntaxKind.TypeAliasDeclaration:
          report('Type');
          break;

        case ts.SyntaxKind.TypeParameter:
          handleTypeParam(identifier);
          break;

        case ts.SyntaxKind.VariableDeclaration:
          report('Variable');
          break;

        default:
          throw new Error(`Unknown node with kind ${parent.kind}.`);
        // TODO - should we just handle this gracefully?
        // report('Unknown Node');
        // break;
      }
    }

    const unusedParameters = new Set<ts.BindingName>();
    function handleParameterDeclaration(
      identifier: ts.Identifier,
      parent: ts.ParameterDeclaration,
    ): void {
      const name = identifier.getText();
      // regardless of if the parameter is ignored, track that it had a diagnostic fired on it
      unusedParameters.add(identifier);

      /*
      NOTE - Typescript will automatically ignore parameters that have a
             leading underscore in their name. We cannot do anything about this.
      */

      function report(): void {
        const node = parserServices.tsNodeToESTreeNodeMap.get(identifier);
        context.report({
          node,
          messageId: 'unused',
          data: {
            name,
            type: 'Parameter',
          },
        });
      }

      const isLastParameter =
        parent.parent.parameters.indexOf(parent) ===
        parent.parent.parameters.length - 1;
      if (!isLastParameter && options.ignoreArgsIfArgsAfterAreUsed) {
        // once all diagnostics are processed, we can check if the following args are unused
        afterAllDiagnosticsCallbacks.push(() => {
          for (const param of parent.parent.parameters) {
            if (!unusedParameters.has(param.name)) {
              return;
            }
          }

          // none of the following params were unused, so report
          report();
        });
      } else {
        report();
      }
    }

    function handleImportDeclaration(parent: ts.ImportDeclaration): void {
      // the entire import statement is unused

      /*
      NOTE - Typescript will automatically ignore imports that have a
             leading underscore in their name. We cannot do anything about this.
      */

      context.report({
        messageId: 'unusedImport',
        node: parserServices.tsNodeToESTreeNodeMap.get(parent),
      });
    }

    function handleDestructure(parent: ts.BindingPattern): void {
      // the entire destructure is unused
      // note that this case only ever triggers for simple, single-level destructured objects
      // i.e. these will not trigger it:
      // - const {a:_a, b, c: {d}} = z;
      // - const [a, b] = c;

      parent.elements.forEach(element => {
        if (element.kind === ts.SyntaxKind.BindingElement) {
          const name = element.name;
          if (name.kind === ts.SyntaxKind.Identifier) {
            handleIdentifier(name);
          }
        }
      });
    }

    function handleTypeParamList(node: NodeWithTypeParams): void {
      // the entire generic decl list is unused

      /*
      NOTE - Typescript will automatically ignore generics that have a
             leading underscore in their name. We cannot do anything about this.
      */

      const parent = parserServices.tsNodeToESTreeNodeMap.get(
        node as never,
      ) as {
        typeParameters: TSESTree.TSTypeParameterDeclaration;
      };
      context.report({
        messageId: 'unusedTypeParameters',
        node: parent.typeParameters,
      });
    }
    function handleTypeParam(identifier: ts.Identifier): void {
      context.report({
        node: parserServices.tsNodeToESTreeNodeMap.get(identifier),
        messageId: 'unused',
        data: {
          name: identifier.getText(),
          type: 'Type Parameter',
        },
      });
    }

    return {
      'Program:exit'(program: TSESTree.Program): void {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(program);
        const sourceFile = util.getSourceFileOfNode(tsNode);
        const diagnostics = tsProgram.getSemanticDiagnostics(sourceFile);

        diagnostics.forEach(diag => {
          if (isUnusedDiagnostic(diag.code)) {
            if (diag.start !== undefined) {
              const node = util.getTokenAtPosition(sourceFile, diag.start);
              const parent = node.parent;
              if (isIdentifier(node)) {
                handleIdentifier(node);
              } else if (isImport(parent)) {
                handleImportDeclaration(parent);
              } else if (isDestructure(parent)) {
                handleDestructure(parent);
              } else if (isGeneric(node, parent)) {
                handleTypeParamList(parent);
              }
            }
          }
        });

        // trigger all the checks to be done after all the diagnostics have been evaluated
        afterAllDiagnosticsCallbacks.forEach(cb => cb());
      },
    };
  },
});

/**
 * Checks if the diagnostic code is one of the expected "unused var" codes
 */
function isUnusedDiagnostic(code: number): boolean {
  return [
    6133, // '{0}' is declared but never used.
    6138, // Property '{0}' is declared but its value is never read.
    6192, // All imports in import declaration are unused.
    6196, // '{0}' is declared but its value is never read.
    6198, // All destructured elements are unused.
    6199, // All variables are unused.
    6205, // All type parameters are unused.
  ].includes(code);
}

/**
 * Checks if the given node is a destructuring pattern
 */
function isDestructure(node: ts.Node): node is ts.BindingPattern {
  return (
    node.kind === ts.SyntaxKind.ObjectBindingPattern ||
    node.kind === ts.SyntaxKind.ArrayBindingPattern
  );
}

function isImport(node: ts.Node): node is ts.ImportDeclaration {
  return node.kind === ts.SyntaxKind.ImportDeclaration;
}

function isIdentifier(node: ts.Node): node is ts.Identifier {
  return node.kind === ts.SyntaxKind.Identifier;
}

function isGeneric(
  node: ts.Node,
  parent: ts.Node & Partial<NodeWithTypeParams>,
): parent is NodeWithTypeParams {
  return (
    node.kind === ts.SyntaxKind.LessThanToken &&
    parent.typeParameters !== undefined
  );
}

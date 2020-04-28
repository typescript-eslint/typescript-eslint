import {
  TSESTree,
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as util from '../util';

type Options = [];
export type MessageIds =
  | 'unusedNamedExport'
  | 'unusedDefaultExport'
  | 'unusedExportDeclaration';

const cancellationTokenShim: ts.CancellationToken = {
  isCancellationRequested: /* istanbul ignore next */ () => false,
  throwIfCancellationRequested: () => {},
};

type CheckedExport =
  | TSESTree.ExportSpecifier
  | TSESTree.ExportDefaultDeclaration
  | Exclude<TSESTree.ExportDeclaration, TSESTree.VariableDeclaration>
  | TSESTree.Identifier;

interface ExportName {
  messageId: MessageIds;
  data?: {
    name: string;
    type?: string;
  };
}

interface ExpensivePrepWork {
  readonly sourceFiles: readonly ts.SourceFile[];
  readonly sourceFilesWithoutCurrent: readonly ts.SourceFile[];
  readonly currentSourceFile: ts.SourceFile;
  readonly currentSourceFilename: string;
}

export default util.createRule<Options, MessageIds>({
  name: 'no-unused-exports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows exporting values that are never imported',
      category: 'Possible Errors',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      unusedNamedExport: 'Named export {{name}} is never imported.',
      unusedExportDeclaration: 'Exported {{type}} {{name}} is never imported.',
      unusedDefaultExport: "The module's default export is never imported.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    const { program } = util.getParserServices(context);

    /*
    Interacting with the program like this can trigger some expensive operations.
    This little workaround is so that we avoid doing this work unless the file actually has exports.
    Should save a bunch of time on codebases that have a lot of "leaf" files (like ours, with all our tests)
    */
    let expensivePrepWork: ExpensivePrepWork | null = null;
    function doExpensivePrepWork(): ExpensivePrepWork {
      if (expensivePrepWork) {
        return expensivePrepWork;
      }

      const currentSourceFile = util.nullThrows(
        program.getSourceFile(context.getFilename()),
        util.NullThrowsReasons.MissingToken(
          'source file',
          `file: ${context.getFilename()}`,
        ),
      );
      const currentSourceFilename = currentSourceFile.fileName;
      const sourceFiles = program
        .getSourceFiles()
        .filter(sf => !sf.fileName.includes('node_modules'));
      const sourceFilesWithoutCurrent = sourceFiles.filter(
        sf => sf !== currentSourceFile,
      );
      expensivePrepWork = {
        currentSourceFile,
        currentSourceFilename,
        sourceFiles,
        sourceFilesWithoutCurrent,
      };
      return expensivePrepWork;
    }

    function checkExport(
      node: CheckedExport,
      positionNode: TSESTree.Node | TSESTree.Token = node,
    ): void {
      const {
        sourceFiles,
        sourceFilesWithoutCurrent,
        currentSourceFile,
        currentSourceFilename,
      } = doExpensivePrepWork();

      const references = ts.FindAllReferences.findReferencedSymbols(
        program,
        cancellationTokenShim,
        // named exports require the current sourcefile for some reason
        // haven't dug in enough to figure out why
        // all other exports don't need the current file, so we can exclude it and squeeze more perf
        node.type === AST_NODE_TYPES.Identifier ||
          node.type === AST_NODE_TYPES.ExportSpecifier
          ? sourceFiles
          : sourceFilesWithoutCurrent,
        currentSourceFile,
        positionNode.range[0],
      );

      let isExternallyReferenced = false;
      if (references) {
        for (const reference of references) {
          if (reference.definition.fileName !== currentSourceFilename) {
            isExternallyReferenced = true;
            break;
          }
        }
      }

      if (isExternallyReferenced) {
        return;
      }

      // TODO - additional checks for `export * from 'foo'`; TS does not consider this as a reference to any of the
      //        exports in 'foo'. However, if this module is imported and used, then it does count as a reference
      // Do we want to support this case? Maybe behind an option? For v1 lets just ignore this, as it will require
      // our own implementation logic

      context.report({
        node,
        ...getNameFromExport(node),
      });
    }

    return {
      // export { a };
      // export { a } from 'foo';
      // export * as a from 'foo';
      ExportSpecifier: checkExport,

      // export const a = 1;
      'ExportNamedDeclaration[declaration]'(
        node: TSESTree.ExportNamedDeclaration & {
          declaration: NonNullable<
            TSESTree.ExportNamedDeclaration['declaration']
          >;
        },
      ): void {
        if (node.parent?.type === AST_NODE_TYPES.TSModuleBlock) {
          // namespace exports don't count
          return;
        }

        if (node.declaration.type === AST_NODE_TYPES.VariableDeclaration) {
          for (const declaration of node.declaration.declarations) {
            checkBindingName(declaration.id);
          }
        } else {
          checkExport(node.declaration);
        }
      },

      // export default foo;
      ExportDefaultDeclaration(node): void {
        // the "default" keyword is considered the symbol when finding references
        const defaultKeyword =
          sourceCode.getFirstToken(
            node,
            token =>
              token.type === AST_TOKEN_TYPES.Keyword &&
              token.value === 'default',
          ) ?? undefined;
        checkExport(node, defaultKeyword);
      },
      // export default from 'foo';
      ExportDefaultSpecifier: checkExport,

      // don't check this, because there's no concrete names to check.
      // maybe we want to support this in the future somehow?
      // export * from 'foo';

      // don't check this, because typescript's find references doesn't support it
      // export = foo
    };

    function checkBindingName(node: TSESTree.Node): void {
      switch (node.type) {
        case AST_NODE_TYPES.ArrayPattern:
          for (const element of node.elements) {
            if (!element) {
              continue;
            }

            checkBindingName(element);
          }
          break;

        case AST_NODE_TYPES.AssignmentPattern:
          checkBindingName(node.left);
          break;

        case AST_NODE_TYPES.Identifier:
          checkExport(node);
          break;

        case AST_NODE_TYPES.ObjectPattern:
          for (const property of node.properties) {
            checkBindingName(property);
          }
          break;

        case AST_NODE_TYPES.Property:
          checkBindingName(node.value);
          break;

        case AST_NODE_TYPES.RestElement:
          checkBindingName(node.argument);
          break;

        // this shouldn't happen - it's syntactically invalid
        /* istanbul ignore next */ case AST_NODE_TYPES.MemberExpression:
        /* istanbul ignore next */ default:
          throw new Error(`Unexpected ${node.type}.`);
      }
    }

    function getNameFromExport(node: CheckedExport): ExportName {
      if (node.type === AST_NODE_TYPES.ExportSpecifier) {
        if (
          node.exported.name === 'default' &&
          node.parent?.type === AST_NODE_TYPES.ExportNamedDeclaration &&
          node.parent?.source?.type === AST_NODE_TYPES.Literal
        ) {
          // export { default } from 'foo';
          return {
            messageId: 'unusedDefaultExport',
          };
        } else {
          return {
            messageId: 'unusedNamedExport',
            data: {
              name: node.exported.name,
            },
          };
        }
      }

      if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
        return {
          messageId: 'unusedDefaultExport',
        };
      }

      // it is an export <declaration> (eg export const x = 1)
      let type: string;
      switch (node.type) {
        case AST_NODE_TYPES.ClassDeclaration:
        case AST_NODE_TYPES.ClassExpression:
          type = 'class';
          break;

        case AST_NODE_TYPES.FunctionDeclaration:
        case AST_NODE_TYPES.TSDeclareFunction:
          type = 'function';
          break;

        case AST_NODE_TYPES.Identifier:
          type = 'variable';
          break;

        case AST_NODE_TYPES.TSEnumDeclaration:
          type = 'enum';
          break;

        case AST_NODE_TYPES.TSInterfaceDeclaration:
          type = 'interface';
          break;

        case AST_NODE_TYPES.TSModuleDeclaration: {
          const firstToken = util.nullThrows(
            sourceCode.getFirstToken(
              node,
              token => token.value === 'namespace' || token.value === 'module',
            ),
            util.NullThrowsReasons.MissingToken('type', 'module'),
          );
          type = firstToken.value;
          break;
        }

        case AST_NODE_TYPES.TSTypeAliasDeclaration:
          type = 'type';
          break;
      }

      let name = 'anonymous';
      if (node.type === AST_NODE_TYPES.Identifier) {
        name = node.name;
      } else if (node.id?.type === AST_NODE_TYPES.Identifier) {
        name = node.id.name;
      }

      return {
        messageId: 'unusedExportDeclaration',
        data: {
          name,
          type,
        },
      };
    }
  },
});

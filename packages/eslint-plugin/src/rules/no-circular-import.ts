import * as ts from 'typescript';

import { createRule, getParserServices } from '../util';

type Options = [];
type MessageIds = 'noCircularImport';

interface Edge {
  filename: string;
  specifier: string;
}

class Graph {
  private graph = new Map<
    string,
    {
      filename: string;
      specifier: string;
    }[]
  >();

  addEdge(start: string, edge: Edge): void {
    if (this.graph.has(start)) {
      this.graph.get(start)?.push(edge);
    } else {
      this.graph.set(start, [edge]);
    }
  }

  hasEdge(name: string): boolean {
    return this.graph.has(name);
  }

  getEdges(name: string): Edge[] {
    return this.graph.get(name) ?? [];
  }
}
//  imports “a.ts” and is imported from “b.ts”, resulting in a circular reference.
export default createRule<Options, MessageIds>({
  name: 'no-circular-import',
  meta: {
    docs: {
      description:
        'Disallow the use of import module that result in circular imports',
      requiresTypeChecking: true,
    },
    messages: {
      noCircularImport: 'Circular import dcetected via {{paths}}.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const graph = new Graph();

    function resolveSpecifier(
      containingFile: string,
      specifier: string,
    ): ts.ResolvedModuleWithFailedLookupLocations {
      return ts.resolveModuleName(
        specifier,
        containingFile,
        services.program.getCompilerOptions(),
        ts.sys,
      );
    }

    function isTypeOnlyImport(node: ts.ImportDeclaration): boolean {
      return (
        node.importClause?.isTypeOnly ||
        (!!node.importClause?.namedBindings &&
          ts.isNamedImports(node.importClause.namedBindings) &&
          node.importClause.namedBindings.elements.every(
            elem => elem.isTypeOnly,
          ))
      );
    }

    function addEdgesRecursively(
      graph: Graph,
      containingFile: string,
      importDeclaration: ts.ImportDeclaration,
    ): void {
      if (graph.hasEdge(containingFile)) {
        return;
      }

      if (isTypeOnlyImport(importDeclaration)) {
        return;
      }

      if (!ts.isStringLiteral(importDeclaration.moduleSpecifier)) {
        return;
      }

      const specifier = importDeclaration.moduleSpecifier.text;

      const resolved = resolveSpecifier(containingFile, specifier);

      if (
        !resolved.resolvedModule ||
        resolved.resolvedModule.isExternalLibraryImport
      ) {
        return;
      }

      const resolvedFile = resolved.resolvedModule.resolvedFileName;

      graph.addEdge(containingFile, {
        filename: resolvedFile,
        specifier,
      });

      const sourceCode = services.program.getSourceFile(resolvedFile);
      sourceCode?.statements.forEach(statement => {
        if (ts.isImportDeclaration(statement)) {
          addEdgesRecursively(graph, resolvedFile, statement);
        }
      });
    }

    function detectCycleWorker(
      start: string,
      graph: Graph,
      filename: string,
      visited: Set<string>,
      paths: string[],
    ): string[] {
      visited.add(filename);

      for (const edge of graph.getEdges(filename)) {
        if (visited.has(edge.filename)) {
          if (edge.filename === start) {
            return paths.concat(edge.specifier);
          }
          return [];
        }
        const detected = detectCycleWorker(
          start,
          graph,
          edge.filename,
          visited,
          paths.concat(edge.specifier),
        );
        if (detected.length) {
          return detected;
        }
      }
      return [];
    }

    function detectCycle(graph: Graph, filename: string): string[] {
      const visited = new Set<string>();
      return detectCycleWorker(filename, graph, filename, visited, []);
    }

    return {
      ImportDeclaration(node): void {
        const tsNode = services.esTreeNodeToTSNodeMap.get(node);
        const containingFile = tsNode.parent.getSourceFile().fileName;
        addEdgesRecursively(graph, containingFile, tsNode);

        const cycle = detectCycle(graph, containingFile);
        if (cycle.length > 1) {
          context.report({
            messageId: 'noCircularImport',
            node,
            data: {
              paths:
                cycle.length === 2
                  ? cycle[0]
                  : `${cycle[0]} ... ${cycle[cycle.length - 2]}`,
            },
          });
        }
      },
    };
  },
});

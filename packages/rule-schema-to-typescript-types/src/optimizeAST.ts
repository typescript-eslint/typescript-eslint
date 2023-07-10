import type { AST, UnionAST } from './types';

export function optimizeAST(ast: AST | null): void {
  if (ast == null) {
    return;
  }

  switch (ast.type) {
    case 'array': {
      optimizeAST(ast.elementType);
      return;
    }

    case 'literal':
      return;

    case 'object': {
      for (const property of ast.properties) {
        optimizeAST(property.type);
      }
      optimizeAST(ast.indexSignature);
      return;
    }

    case 'tuple': {
      for (const element of ast.elements) {
        optimizeAST(element);
      }
      optimizeAST(ast.spreadType);
      return;
    }

    case 'type-reference':
      return;

    case 'union': {
      const elements = unwrapUnions(ast);
      for (const element of elements) {
        optimizeAST(element);
      }

      // hacky way to deduplicate union members
      const uniqueElementsMap = new Map<string, AST>();
      for (const element of elements) {
        uniqueElementsMap.set(JSON.stringify(element), element);
      }
      const uniqueElements = Array.from(uniqueElementsMap.values());

      // @ts-expect-error -- purposely overwriting the property with a flattened list
      ast.elements = uniqueElements;
      return;
    }
  }
}

function unwrapUnions(union: UnionAST): AST[] {
  const elements: AST[] = [];
  for (const element of union.elements) {
    if (element.type === 'union') {
      elements.push(...unwrapUnions(element));
    } else {
      elements.push(element);
    }
  }

  if (elements.length > 0) {
    // preserve the union's comment lines by prepending them to the first element's lines
    elements[0].commentLines.unshift(...union.commentLines);
  }

  return elements;
}

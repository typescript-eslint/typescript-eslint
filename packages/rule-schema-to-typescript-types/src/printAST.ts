import naturalCompare from 'natural-compare-lite';

import type { AST, TupleAST } from './types';

export function printTypeAlias(aliasName: string, ast: AST): string {
  return `${printComment(ast)}type ${aliasName} = ${printAST(ast).code}`;
}

export function printASTWithComment(ast: AST): string {
  const result = printAST(ast);
  return `${printComment(result)}${result.code}`;
}

function printComment({
  commentLines: commentLinesIn,
}: {
  readonly commentLines?: string[] | undefined | null;
}): string {
  if (commentLinesIn == null || commentLinesIn.length === 0) {
    return '';
  }

  const commentLines: string[] = [];
  for (const line of commentLinesIn) {
    commentLines.push(...line.split('\n'));
  }

  if (commentLines.length === 1) {
    return `/** ${commentLines[0]} */\n`;
  }

  return ['/**', ...commentLines.map(l => ` * ${l}`), ' */', ''].join('\n');
}

interface CodeWithComments {
  code: string;
  commentLines: string[];
}
function printAST(ast: AST): CodeWithComments {
  switch (ast.type) {
    case 'array': {
      const code = printAndMaybeParenthesise(ast.elementType);
      return {
        code: `${code.code}[]`,
        commentLines: ast.commentLines.concat(code.commentLines),
      };
    }

    case 'literal':
      return {
        code: ast.code,
        commentLines: ast.commentLines,
      };

    case 'object': {
      const properties = [];
      // sort the properties so that we get consistent output regardless
      // of import declaration order
      const sortedPropertyDefs = ast.properties.sort((a, b) =>
        naturalCompare(a.name, b.name),
      );
      for (const property of sortedPropertyDefs) {
        const result = printAST(property.type);
        properties.push(
          `${printComment(result)}${property.name}${
            property.optional ? '?:' : ':'
          } ${result.code}`,
        );
      }

      if (ast.indexSignature) {
        const result = printAST(ast.indexSignature);
        properties.push(`${printComment(result)}[k: string]: ${result.code}`);
      }
      return {
        // force insert a newline so prettier consistently prints all objects as multiline
        code: `{\n${properties.join(';\n')}}`,
        commentLines: ast.commentLines,
      };
    }

    case 'tuple': {
      const elements = [];
      for (const element of ast.elements) {
        elements.push(printASTWithComment(element));
      }
      if (ast.spreadType) {
        const result = printAndMaybeParenthesise(ast.spreadType);
        elements.push(`${printComment(result)}...${result.code}[]`);
      }

      return {
        code: `[${elements.join(',')}]`,
        commentLines: ast.commentLines,
      };
    }

    case 'type-reference':
      return {
        code: ast.typeName,
        commentLines: ast.commentLines,
      };

    case 'union':
      return {
        code: ast.elements
          .map(element => {
            const result = printAST(element);
            const code = `${printComment(result)} | ${result.code}`;
            return {
              code,
              element,
            };
          })
          // sort the union members so that we get consistent output regardless
          // of declaration order
          .sort((a, b) => compareElements(a, b))
          .map(el => el.code)
          .join('\n'),
        commentLines: ast.commentLines,
      };
  }
}

interface Element {
  code: string;
  element: AST;
}
function compareElements(a: Element, b: Element): number {
  if (a.element.type !== b.element.type) {
    return naturalCompare(a.code, b.code);
  }

  switch (a.element.type) {
    case 'array':
    case 'literal':
    case 'type-reference':
    case 'object':
    case 'union':
      return naturalCompare(a.code, b.code);

    case 'tuple': {
      // natural compare will sort longer tuples before shorter ones
      // which is the opposite of what we want, so we sort first by length THEN
      // by code to ensure shorter tuples come first
      const aElement = a.element;
      const bElement = b.element as TupleAST;
      if (aElement.elements.length !== bElement.elements.length) {
        return aElement.elements.length - bElement.elements.length;
      }
      return naturalCompare(a.code, b.code);
    }
  }
}

function printAndMaybeParenthesise(ast: AST): CodeWithComments {
  const printed = printAST(ast);
  if (ast.type === 'union') {
    return {
      code: `(${printed.code})`,
      commentLines: printed.commentLines,
    };
  }
  return {
    code: `${printed.code}`,
    commentLines: printed.commentLines,
  };
}

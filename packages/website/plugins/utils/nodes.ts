import type * as mdast from 'mdast';
import type { MdxFlowExpression } from 'mdast-util-mdx';
import type * as unist from 'unist';

export function nodeIsCode(node: unist.Node): node is mdast.Code {
  return node.type === 'code';
}

export function nodeIsHeading(node: unist.Node): node is mdast.Heading {
  return node.type === 'heading';
}

export function nodeIsParagraph(node: unist.Node): node is mdast.Paragraph {
  return node.type === 'paragraph';
}

export function nodeIsMdxFlowExpression(
  node: unist.Node,
): node is MdxFlowExpression {
  return node.type === 'mdxFlowExpression';
}

export function nodeIsParent(node: unist.Node): node is unist.Parent {
  return 'children' in node;
}

import type { MdxJsxFlowElement } from 'mdast-util-mdx';
import type * as unist from 'unist';

import type { RuleDocsPage } from './RuleDocsPage';
import { convertToPlaygroundHash, nodeIsCode } from './utils';

const optionRegex = /option='(?<option>.*?)'/;

function nodeIsJsxTabs(node: unist.Node): node is MdxJsxFlowElement {
  return (
    node.type === 'mdxJsxFlowElement' && 'name' in node && node.name === 'Tabs'
  );
}

export function addESLintHashToCodeBlocksMeta(
  page: RuleDocsPage,
  eslintrc: string,
): void {
  for (const node of page.children) {
    if (nodeIsJsxTabs(node)) {
      addHashesToChildrenTabs(node);
    } else {
      addHashToNodeIfCode(node);
    }
  }

  function addHashesToChildrenTabs(node: MdxJsxFlowElement): void {
    for (const tabItem of node.children) {
      if ('children' in tabItem) {
        for (const child of tabItem.children) {
          addHashToNodeIfCode(child, true);
        }
      }
    }
  }

  function addHashToNodeIfCode(node: unist.Node, insideTab?: boolean): void {
    if (
      nodeIsCode(node) &&
      (insideTab || node.meta?.includes('showPlaygroundButton')) &&
      !node.meta?.includes('eslintrcHash=')
    ) {
      let playgroundEslintrc = eslintrc;
      const option = node.meta?.match(optionRegex)?.groups?.option;
      if (option) {
        playgroundEslintrc = playgroundEslintrc.replace(
          '"error"',
          `["error", ${option}]`,
        );
        try {
          playgroundEslintrc = JSON.stringify(
            JSON.parse(playgroundEslintrc),
            null,
            2,
          );
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            `Invalid JSON detected in ${page.file.basename}. Check the \`option\` in the meta strings of code blocks.`,
          );
          throw err;
        }
      }

      node.meta = [
        node.meta,
        `eslintrcHash="${convertToPlaygroundHash(playgroundEslintrc)}"`,
      ]
        .filter(Boolean)
        .join(' ');
    }
  }
}

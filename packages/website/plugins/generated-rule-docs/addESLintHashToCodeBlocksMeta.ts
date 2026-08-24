import type { MdxJsxFlowElement } from 'mdast-util-mdx';
import type * as unist from 'unist';

import type { RuleDocsPage } from './RuleDocsPage';

import { nodeIsCode, nodeIsMdxJsxFlowElement } from '../utils/nodes';
import { convertToPlaygroundHash } from '../utils/rules';
import { getSerializedRuleOptionsFromMeta } from './ruleOptions';

function nodeIsJsxTabs(node: unist.Node): node is MdxJsxFlowElement {
  return nodeIsMdxJsxFlowElement(node) && node.name === 'Tabs';
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
      !node.meta?.includes('title="eslint.config.mjs"') &&
      !node.meta?.includes('title=".eslintrc.cjs"') &&
      !node.meta?.includes('eslintrcHash=')
    ) {
      let playgroundEslintrc = eslintrc;
      const serializedOptions = getSerializedRuleOptionsFromMeta(node.meta);
      if (serializedOptions) {
        playgroundEslintrc = playgroundEslintrc.replace(
          '"error"',
          `["error", ${serializedOptions}]`,
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

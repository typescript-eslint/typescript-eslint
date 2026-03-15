import type { Plugin } from 'unified';

import * as acorn from 'acorn';
import { toString } from 'mdast-util-to-string';

import { nodeIsHeading, nodeIsParent } from '../utils/nodes';

const faqPages = [
  'docs/troubleshooting/faqs/',
  'docs/troubleshooting/typed-linting/index.mdx',
];

export const faqData: Plugin = () => (root, file) => {
  if (!nodeIsParent(root) || !faqPages.some(page => file.path.includes(page))) {
    return;
  }
  const allHeadings = root.children.filter(nodeIsHeading);
  // A question is either an H2 (but only if it has no H3 children), or an H3
  const allQs = allHeadings.filter(
    (h, i) =>
      (h.depth === 2 && allHeadings[i + 1]?.depth !== 3) || h.depth === 3,
  );
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allQs.map(q => ({
      '@type': 'Question',
      acceptedAnswer: {
        '@type': 'Answer',
        name: toString(q),
        text: `${toString(root.children[root.children.indexOf(q) + 1])} Read more on our website!`,
      },
    })),
  };
  const dataStr = JSON.stringify(structuredData)
    .replaceAll('\\', '\\\\')
    .replaceAll('`', '\\`')
    .replaceAll('${', '\\${');
  const headElem = {
    attributes: [],
    children: [
      {
        attributes: [
          {
            name: 'type',
            type: 'mdxJsxAttribute',
            value: 'application/ld+json',
          },
        ],
        children: [
          {
            data: {
              estree: acorn.parse(`\`${dataStr}\``, {
                ecmaVersion: 'latest',
                sourceType: 'module',
              }),
            },
            type: 'mdxFlowExpression',
            value: `\`${dataStr}\``,
          },
        ],
        data: {
          _mdxExplicitJsx: true,
        },
        name: 'script',
        type: 'mdxJsxFlowElement',
      },
    ],
    data: {
      _mdxExplicitJsx: true,
    },
    name: 'Head',
    type: 'mdxJsxFlowElement',
  };
  root.children.push(headElem);
};

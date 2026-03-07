import type { Plugin } from 'unified';
import { toString } from 'mdast-util-to-string';
import * as acorn from 'acorn';
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
      name: toString(q),
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          toString(root.children[root.children.indexOf(q) + 1]) +
          '\n\nRead more on our website!',
      },
    })),
  };
  const dataStr = JSON.stringify(structuredData)
    .replaceAll('\\', '\\\\')
    .replaceAll('`', '\\`')
    .replaceAll('${', '\\${');
  const headElem = {
    type: 'mdxJsxFlowElement',
    name: 'Head',
    attributes: [],
    children: [
      {
        type: 'mdxJsxFlowElement',
        name: 'script',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'type',
            value: 'application/ld+json',
          },
        ],
        children: [
          {
            type: 'mdxFlowExpression',
            value: `\`${dataStr}\``,
            data: {
              estree: acorn.parse(`\`${dataStr}\``, {
                ecmaVersion: 'latest',
                sourceType: 'module',
              }),
            },
          },
        ],
        data: {
          _mdxExplicitJsx: true,
        },
      },
    ],
    data: {
      _mdxExplicitJsx: true,
    },
  };
  console.dir(headElem, { depth: null });
  root.children.push(headElem);
};

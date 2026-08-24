import type { MdxJsxFlowElement } from 'mdast-util-mdx';
import type * as unist from 'unist';

import * as path from 'node:path';

import type { RuleDocsPage } from './RuleDocsPage';

import {
  nodeIsCode,
  nodeIsMdxJsxFlowElement,
  nodeIsParent,
} from '../utils/nodes';
import { lintMessagesToDiagnostics } from './codeDiagnostics';
import { isTypeScriptCodeBlock, lintRuleCodeBlock } from './lintRuleCodeBlock';

const tsconfigRootDir = path.resolve(
  __dirname,
  '../../../eslint-plugin/tests/fixtures',
);

function isIncorrectTabItem(node: unist.Node): node is MdxJsxFlowElement {
  if (!nodeIsMdxJsxFlowElement(node) || node.name !== 'TabItem') {
    return false;
  }

  const valueAttribute = node.attributes.find(
    attribute =>
      attribute.type === 'mdxJsxAttribute' && attribute.name === 'value',
  );

  return (
    typeof valueAttribute?.value === 'string' &&
    valueAttribute.value.startsWith('❌ Incorrect')
  );
}

export function addCodeDiagnostics(page: RuleDocsPage): void {
  visit(page.children, false);

  function visit(nodes: readonly unist.Node[], insideIncorrectTab: boolean) {
    for (const node of nodes) {
      const isIncorrect = insideIncorrectTab || isIncorrectTabItem(node);

      if (isIncorrect && nodeIsCode(node) && isTypeScriptCodeBlock(node)) {
        const messages = lintRuleCodeBlock({
          code: node.value,
          language: node.lang,
          meta: node.meta,
          rule: page.rule,
          ruleName: page.file.stem,
          tsconfigRootDir,
        });
        const diagnostics = lintMessagesToDiagnostics(messages);

        if (diagnostics.length > 0) {
          const encodedDiagnostics = Buffer.from(
            JSON.stringify(diagnostics),
          ).toString('base64url');
          node.meta = [node.meta, `eslintDiagnostics="${encodedDiagnostics}"`]
            .filter(Boolean)
            .join(' ');
        }
      }

      if (nodeIsParent(node)) {
        visit(node.children, isIncorrect);
      }
    }
  }
}

import type { MdxJsxFlowElement } from 'mdast-util-mdx';
import type * as mdast from 'mdast';
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
  visit(page.children);

  function visit(nodes: readonly unist.Node[]): void {
    for (const node of nodes) {
      if (isIncorrectTabItem(node)) {
        addDiagnosticsToCodeBlocks(node);
      } else if (nodeIsParent(node)) {
        visit(node.children);
      }
    }
  }

  function addDiagnosticsToCodeBlocks(node: unist.Parent): void {
    for (const child of node.children) {
      if (nodeIsCode(child) && isTypeScriptCodeBlock(child)) {
        addDiagnosticsToCodeBlock(child);
      } else if (nodeIsParent(child)) {
        addDiagnosticsToCodeBlocks(child);
      }
    }
  }

  function addDiagnosticsToCodeBlock(
    node: mdast.Code & { lang: string },
  ): void {
    const messages = lintRuleCodeBlock({
      code: node.value,
      language: node.lang,
      meta: node.meta,
      rule: page.rule,
      ruleName: page.file.stem,
      tsconfigRootDir,
    });
    const diagnostics = lintMessagesToDiagnostics(messages);

    if (diagnostics.length === 0) {
      return;
    }

    // Code block meta only supports strings, so encode the JSON diagnostics as one safe attribute value.
    const encodedDiagnostics = Buffer.from(
      JSON.stringify(diagnostics),
    ).toString('base64url');
    node.meta = [node.meta, `eslintDiagnostics="${encodedDiagnostics}"`]
      .filter(Boolean)
      .join(' ');
  }
}

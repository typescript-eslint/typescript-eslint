import type { RuleDocsPage } from './RuleDocsPage';

/**
 * Removes " 🛑 This file is source code, not the primary documentation location! 🛑".
 */
export function removeSourceCodeNotice(page: RuleDocsPage): void {
  page.spliceChildren(
    page.children.findIndex(v => v.type === 'blockquote'),
    1,
  );
}

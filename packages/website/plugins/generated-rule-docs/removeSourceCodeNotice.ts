import type * as unist from 'unist';

/**
 * Removes " 🛑 This file is source code, not the primary documentation location! 🛑".
 */
export function removeSourceCodeNotice(children: unist.Node[]): void {
  children.splice(
    children.findIndex(v => v.type === 'blockquote'),
    1,
  );
}

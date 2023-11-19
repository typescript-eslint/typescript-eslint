import type * as unist from 'unist';

export function removeSourceCodeNotice(children: unist.Node[]): void {
  // Remove the " 🛑 This file is source code, not the primary documentation location! 🛑"
  children.splice(
    children.findIndex(v => v.type === 'blockquote'),
    1,
  );
}

import type * as unist from 'unist';
import type { RequiredHeadingIndices } from './requiredHeadings';

export function spliceChildrenAndAdjustHeadings(
  children: unist.Node[],
  headingIndices: RequiredHeadingIndices,
  insertIndex: number,
  deleteCount: number,
  ...items: unist.Node[]
): void {
  children.splice(insertIndex, deleteCount, ...items);

  for (const [key, value] of Object.entries(headingIndices)) {
    if (value >= insertIndex) {
      headingIndices[key as keyof typeof headingIndices] += items.length;
    }
  }
}

import * as ts from 'typescript';

export function getTokenAtPosition(
  sourceFile: ts.SourceFile,
  position: number,
): ts.Node {
  const queue: ts.Node[] = [sourceFile];
  let current: ts.Node;
  while (queue.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    current = queue.shift()!;
    // find the child that contains 'position'
    for (const child of current.getChildren(sourceFile)) {
      const start = child.getFullStart();
      if (start > position) {
        // If this child begins after position, then all subsequent children will as well.
        return current;
      }

      const end = child.getEnd();
      if (
        position < end ||
        (position === end && child.kind === ts.SyntaxKind.EndOfFileToken)
      ) {
        queue.push(child);
        break;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return current!;
}

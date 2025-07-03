import { fileURLToPath } from 'node:url';

export function getTsconfigRootDirFromStack(stack: string): string | undefined {
  for (const line of stack.split('\n').map(line => line.trim())) {
    const candidate = /(\S+)eslint\.config\.(c|m)?(j|t)s/.exec(line)?.[1];
    if (!candidate) {
      continue;
    }

    return candidate.startsWith('file://')
      ? fileURLToPath(candidate)
      : candidate;
  }

  return undefined;
}

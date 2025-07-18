import { fileURLToPath } from 'node:url';

export function getTSConfigRootDirFromStack(stack: string): string | undefined {
  for (const line of stack.split('\n').map(line => line.trim())) {
    const candidate = /(.+)eslint\.config\.(c|m)?(j|t)s/
      .exec(line)?.[1]
      ?.replace(/\s*at\s+(async\s+)?/g, '')
      .replaceAll(/^\S+\s+\(/g, '');
    if (!candidate) {
      continue;
    }

    return candidate.startsWith('file://')
      ? fileURLToPath(candidate)
      : candidate;
  }

  return undefined;
}

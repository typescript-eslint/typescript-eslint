import * as path from 'node:path';

export function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}

import * as fs from 'fs/promises';
import * as path from 'path';

export const directory = 'generated';

export async function writeFile(fileName: string, data: string) {
  await fs.writeFile(path.join(directory, fileName), data);
}

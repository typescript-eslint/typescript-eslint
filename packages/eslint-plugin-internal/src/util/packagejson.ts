import fs from 'node:fs';
import path from 'node:path';

const packageJsonPath = path.join(import.meta.dirname, '../../package.json');
const packageJsonContents = fs.readFileSync(packageJsonPath, 'utf-8');
const packageJsonValue = JSON.parse(packageJsonContents) as {
  name: string;
  version: string;
};

// eslint-disable-next-line import/no-default-export
export default packageJsonValue;

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Replace with import.meta.dirname when minimum node version supports it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJsonContents = fs.readFileSync(packageJsonPath, 'utf-8');
const packageJsonValue = JSON.parse(packageJsonContents) as {
  name: string;
  version: string;
};

// eslint-disable-next-line import/no-default-export
export default packageJsonValue;

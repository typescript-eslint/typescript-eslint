import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';

const eslint = new ESLint();
const filePath = fileURLToPath(new URL('src/index.ts', import.meta.url));
const results = [];

for (const text of [
  "import './dependency.js';\ndeclare const value: string;\n-value;",
  "import './dependency.js';\nawait 1;",
]) {
  const [result] = await eslint.lintText(text, { filePath });
  results.push(result.messages.map(message => message.ruleId));
}

process.stderr.write(JSON.stringify(results));

import { ESLint } from 'eslint';
import {
  readNativeMetrics,
  resetNativeMetrics,
} from '@typescript-eslint/typescript-estree/use-at-your-own-risk';
import { fileURLToPath } from 'node:url';

process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING = 'true';
resetNativeMetrics();

const eslint = new ESLint();
const filePath = fileURLToPath(new URL('src/index.ts', import.meta.url));
const diagnostics = [];

try {
  for (const text of [
    "import { deprecatedFunction, takesString } from './dependency.js';\ndeclare const stringValue: string; declare const anyValue: any;\n-stringValue; takesString(anyValue); await 1; deprecatedFunction();",
    "import { deprecatedFunction, takesString } from './dependency.js';\ndeclare const stringValue: string; declare const anyValue: any;\n-stringValue; takesString(anyValue); await 1; deprecatedFunction();",
  ]) {
    const [result] = await eslint.lintText(text, { filePath });
    diagnostics.push(result.messages.map(message => message.ruleId));
  }

  process.stderr.write(
    JSON.stringify({ diagnostics, metrics: readNativeMetrics() }),
  );
} finally {
  resetNativeMetrics();
  delete process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING;
}

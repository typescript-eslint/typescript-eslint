import { ESLint } from 'eslint';
import {
  readNativeMetrics,
  resetNativeMetrics,
} from '@typescript-eslint/typescript-estree/use-at-your-own-risk';
import { fileURLToPath } from 'node:url';

process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING = 'true';
resetNativeMetrics();

const eslint = new ESLint();

try {
  const results = await eslint.lintFiles([
    fileURLToPath(new URL('src/index.ts', import.meta.url)),
    fileURLToPath(new URL('src/second.ts', import.meta.url)),
  ]);
  const diagnostics = results.map(result =>
    result.messages.map(message => message.ruleId),
  );

  process.stderr.write(
    JSON.stringify({
      diagnostics,
      metrics: readNativeMetrics(),
      normalOutput: results,
    }),
  );
} finally {
  resetNativeMetrics();
  delete process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING;
}

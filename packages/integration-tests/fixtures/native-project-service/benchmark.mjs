import { ESLint } from 'eslint';
import {
  readNativeMetrics,
  resetNativeMetrics,
} from '@typescript-eslint/typescript-estree/use-at-your-own-risk';
import tseslint from 'typescript-eslint';

const mode = process.argv[2];
if (!['classic', 'native', 'native-instrumented'].includes(mode)) {
  throw new Error(`Unknown benchmark mode: ${mode}`);
}
const backend = mode === 'classic' ? 'classic' : 'native';
const collectNativeTiming = mode === 'native-instrumented';

delete process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING;
if (collectNativeTiming) {
  process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING = 'true';
}
resetNativeMetrics();

const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ['**/*.ts'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          projectService: backend === 'native' ? { backend } : true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      plugins: { '@typescript-eslint': tseslint.plugin },
      rules: {
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-deprecated': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-unsafe-unary-minus': 'error',
      },
    },
  ],
});

try {
  let diagnostics;
  let peakRss = process.memoryUsage.rss();
  const wallTimeMs = [];
  for (let iteration = 0; iteration < 6; iteration += 1) {
    const start = process.hrtime.bigint();
    const results = await eslint.lintFiles(['src/index.ts']);
    wallTimeMs.push(Number(process.hrtime.bigint() - start) / 1_000_000);
    peakRss = Math.max(peakRss, process.memoryUsage.rss());
    diagnostics ??= results.flatMap(result =>
      result.messages.map(({ column, endColumn, endLine, line, ruleId }) => ({
        column,
        endColumn,
        endLine,
        line,
        ruleId,
      })),
    );
  }
  const nativeMetrics = collectNativeTiming ? readNativeMetrics() : undefined;
  process.stdout.write(
    JSON.stringify({
      diagnostics,
      nativeMetrics,
      peakRss,
      wallTimeMs,
    }),
  );
} finally {
  resetNativeMetrics();
  delete process.env.TYPESCRIPT_ESLINT_NATIVE_TIMING;
}

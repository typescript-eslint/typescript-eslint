import * as fs from 'fs/promises';
import * as path from 'path';

import {
  generateESLintConfig,
  generateJsFile,
  generateTSConfig,
  generateTsFile,
} from './generating.js';
import { directory, writeFile } from './writing.js';

const fileCount = Number(process.env.PERFORMANCE_FILE_COUNT);

await fs.rm(directory, { force: true, recursive: true });
await fs.mkdir(path.join(directory, 'src'), { recursive: true });

// The root-level TSConfig is used for the project service, which intentionally
// uses the default/inferred project for non-included JS files.
await writeFile(`tsconfig.json`, generateTSConfig(false));

// The explicit project allows JS, akin to the common tsconfig.eslint.json.
await writeFile(`tsconfig.project.json`, generateTSConfig(true));

for (const [alias, parserOptions] of [
  ['project', `project: "./tsconfig.project.json"`],
  ['service', `EXPERIMENTAL_useProjectService: true`],
] as const) {
  await writeFile(
    `.eslintrc.${alias}.cjs`,
    generateESLintConfig(parserOptions),
  );
}

for (let i = 0; i < fileCount; i += 1) {
  const [extension, generator] =
    i % 2 ? ['js', generateJsFile] : ['ts', generateTsFile];

  await writeFile(`src/example${i}.${extension}`, generator(i));
}

await writeFile(
  'src/index.ts',
  new Array(fileCount)
    .fill(undefined)
    .map((_, i) => `export { example${i} } from "./example${i}.js";`)
    .join('\n'),
);

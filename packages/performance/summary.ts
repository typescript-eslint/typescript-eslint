import { $ } from 'execa';

const getTiming = ({ stderr }: { stderr: string }) =>
  stderr.trim().replace(/ +/g, ' ');

const counts: Record<string, unknown> = {};

for (const fileCount of [5, 10, 25, 50, 75, 100, 125, 150, 175, 200]) {
  await $({ env: { PERFORMANCE_FILE_COUNT: `${fileCount}` } })`yarn generate`;
  const project = getTiming(await $`yarn test:project`);
  const service = getTiming(await $`yarn test:service`);

  counts[fileCount] = { project, service };
}

console.table(counts);

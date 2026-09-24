import fs from 'node:fs';

import { getTestMatrices } from './ci-test-matrices.mts';

// Reads the affected projects (as JSON) and writes the CI test matrices as GitHub Actions step outputs.
const affected = JSON.parse(process.env.AFFECTED ?? '[]') as string[];

const matrices = getTestMatrices(affected);

const outputs = {
  is_plugin_affected: matrices.isPluginAffected,
  project_service_packages: matrices.projectServicePackages,
  snapshot_packages: matrices.snapshotPackages,
  unit_tests_matrix: matrices.unitTestsMatrix,
};

const lines = Object.entries(outputs)
  .map(([key, value]) => `${key}=${JSON.stringify(value)}\n`)
  .join('');

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, lines);
}

console.log(lines);

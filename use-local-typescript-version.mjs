import * as execa from 'execa';
import * as fs from 'node:fs/promises';

const commit = process.argv[2];

// Clear any existing typescript-local, then clone TypeScript into it
await execa.command(`rm -rf typescript-local`, { stdio: 'inherit' });
await execa.command(
  `git clone https://github.com/Microsoft/TypeScript typescript-local --depth=500`,
  { stdio: 'inherit' },
);

// All within the typescript-local directory...
for (const command of [
  // Reset the TypeScript directory to the desired commit
  `git reset --hard ${commit}`,
  // Install and build up through having lib/
  'npm i',
  'npx hereby',
  'npx hereby local',
  'npx hereby services',
  'cp -r built/local lib',
  // Link it globally
  'yarn link',
]) {
  console.log('\n\nRunning in typescript-local:', command);
  await execa.command(command, {
    cwd: 'typescript-local',
    stdio: 'inherit',
  });
}

// Add an informative log to the top of the local file
const localTypeScript = './typescript-local/lib/typescript.js';
await fs.writeFile(
  localTypeScript,
  [
    `console.log("Local TypeScript updated for commit: ${commit}");`,
    (await fs.readFile(localTypeScript)).toString(),
  ].join('\n\n'),
);

// Link to the typescript-local version of TypeScript
for (const command of [
  'yarn link typescript',
  // TODO: Will this need to install/build? I hope not?
]) {
  console.log('\n\nRunning:', command);
  await execa.command(command, {
    stdio: 'inherit',
  });
}

import * as execa from 'execa';
import * as child_process from 'node:child_process';
import * as util from 'node:util';

const commits = await new Promise(resolve => {
  const spawned = child_process.spawn(
    'git',
    ['rev-list', '74814345ce99e939e21a82e9d311981f80c6de3a..HEAD'],
    {
      cwd: 'typescript-local',
    },
  );
  let result = '';

  spawned.stdout.on('data', data => (result += data));
  spawned.on('exit', () => resolve(result.trim().split(/\n/)));
});

// Iterate through oldest commits first, checking fo
// (in theory, this should bisect... in practice, I'm tired)
for (const commit of commits.reverse()) {
  console.log('\n\nTrying commit:', commit);
  await execa.command(`git reset --hard ${commit}`, {
    cwd: 'typescript-local',
    stdio: 'inherit',
  });
  // ...
}

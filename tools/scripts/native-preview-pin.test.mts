import * as fs from 'node:fs';
import * as path from 'node:path';

const repositoryRoot = path.join(import.meta.dirname, '..', '..');

it('documents the pinned @typescript/native preview as the minimum', () => {
  const workspace = fs.readFileSync(
    path.join(repositoryRoot, 'pnpm-workspace.yaml'),
    'utf8',
  );
  const version = /'@typescript\/native': 'npm:typescript@([^']+)'/.exec(
    workspace,
  )?.[1];
  expect(version).toBeDefined();

  const docs = fs.readFileSync(
    path.join(repositoryRoot, 'docs/packages/Parser.mdx'),
    'utf8',
  );
  expect(docs).toContain(`at least \`${version}\``);
  expect(docs).toContain(`@typescript/native@npm:typescript@${version}`);
});

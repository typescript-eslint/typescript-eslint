import core from '@actions/core';
import github from '@actions/github';

function raiseError(message: string): never {
  throw new Error(message);
}

async function getPullRequest(): Promise<typeof data> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const client = github.getOctokit(process.env.GITHUB_TOKEN!);

  const pr = github.context.payload.pull_request;
  if (!pr) {
    throw new Error(
      "This action can only be invoked in `pull_request_target` or `pull_request` events. Otherwise the pull request can't be inferred.",
    );
  }

  const base = pr.base as { user: { login: string }; repo: { name: string } };
  const owner = base.user.login;
  const repo = base.repo.name;

  const { data } = await client.rest.pulls.get({
    owner,
    repo,
    pull_number: pr.number,
  });

  return data;
}

function checkTitle(title: string): void {
  if (/^[a-z]+(\([a-z-]+\))?!: /.test(title)) {
    raiseError(
      `Do not use exclamation mark ('!') to indicate breaking change in the PR Title.`,
    );
  }
}

function checkDescription(
  body: string,
  labels: (typeof pullRequest)['labels'],
): void {
  if (!labels.some(label => label.name === 'breaking change')) {
    return;
  }
  const [firstLine, secondLine] = body.split(/\r?\n/);

  if (!firstLine.startsWith('BREAKING CHANGE:')) {
    raiseError(
      `Breaking change PR body should start with "BREAKING CHANGE:". See https://typescript-eslint.io/maintenance/releases#2-merging-breaking-changes.`,
    );
  }
  if (!secondLine) {
    raiseError(
      `The description of breaking change is missing. See https://typescript-eslint.io/maintenance/releases#2-merging-breaking-changes.`,
    );
  }
}

const pullRequest = await getPullRequest();
try {
  checkTitle(pullRequest.title);
  checkDescription(pullRequest.body ?? '', pullRequest.labels);
} catch (e) {
  core.setFailed((e as Error).message);
}

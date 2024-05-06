const core = require('@actions/core');
const github = require('@actions/github');

function raiseError(message) {
  throw new Error(message);
}

async function getPullRequest() {
  const client = github.getOctokit(process.env.GITHUB_TOKEN);

  const pr = github.context.payload.pull_request;
  if (!pr) {
    throw new Error(
      "This action can only be invoked in `pull_request_target` or `pull_request` events. Otherwise the pull request can't be inferred.",
    );
  }

  const owner = pr.base.user.login;
  const repo = pr.base.repo.name;

  const { data } = await client.rest.pulls.get({
    owner,
    repo,
    pull_number: pr.number,
  });

  return data;
}

function checkTitle(title) {
  if (/!/.test(title)) {
    raiseError(`Do not use exclamation mark ('!') in your PR Title.`);
  }
}

function checkDescription(body, labels) {
  if (!labels.some(label => label.name === 'breaking change')) {
    return;
  }
  const [firstLine, secondLine] = body.split(/\r?\n/);

  if (!firstLine || !/^BREAKING CHANGE:/.test(firstLine)) {
    raiseError(`Breaking change PR body should start with "BREAKING CHANGE:"`);
  }
  if (!secondLine) {
    raiseError(`The description of breaking change is missing.`);
  }
}

async function run() {
  const pullRequest = await getPullRequest();
  try {
    checkTitle(pullRequest.title);
    checkDescription(pullRequest.body, pullRequest.labels);
  } catch (e) {
    core.setFailed(e.message);
  }
}

run();

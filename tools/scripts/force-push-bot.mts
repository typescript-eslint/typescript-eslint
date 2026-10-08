import type { context, getOctokit } from '@actions/github';

interface Args {
  context: typeof context;
  github: ReturnType<typeof getOctokit>;
}

export async function forcePushBot({ context, github }: Args): Promise<void> {
  const { data: reviews } = await github.rest.pulls.listReviews({
    owner: context.repo.owner,
    per_page: 1,
    pull_number: context.issue.number,
    repo: context.repo.repo,
  });

  if (reviews.length === 0) {
    return;
  }

  const before = process.env.BEFORE_SHA;
  const after = process.env.AFTER_SHA;

  const { data } = await github.rest.repos.compareCommitsWithBasehead({
    basehead: `${before}...${after}`,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  const isForcePush = data.status === 'behind' || data.status === 'diverged';

  if (!isForcePush) {
    return;
  }

  const marker = '<!-- force-push-bot -->';

  const comments = await github.paginate(github.rest.issues.listComments, {
    issue_number: context.issue.number,
    owner: context.repo.owner,
    per_page: 100,
    repo: context.repo.repo,
  });

  if (comments.some(comment => comment.body?.includes(marker))) {
    return;
  }

  const author = process.env.PR_AUTHOR;

  const lines = [
    `${marker}\n\n`,

    `Hi @${author}, thanks for the update!\n\n`,

    'Just a quick heads-up: please try to avoid force-pushing moving forward. ',
    'Rewriting history makes it harder for us to track incremental changes ',
    'between reviews.\n\n',

    'Since we squash merge anyway, there is no need to keep the commit ',
    'history "clean" on this branch. Standard pushes are much preferred!',
  ];

  await github.rest.issues.createComment({
    body: lines.join(''),
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });
}

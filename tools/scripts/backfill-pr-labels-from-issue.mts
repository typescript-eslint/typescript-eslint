/**
 * One-time backfill for `.github/workflows/pr-labels-from-issue.yml`.
 *
 * That workflow only runs on newly opened/edited PRs, so PRs opened before it
 * landed never got the labels of the issues they close. This walks every open
 * PR and adds the allowed labels it's missing.
 *
 *   yarn tsx tools/scripts/backfill-pr-labels-from-issue.mts           # dry run
 *   yarn tsx tools/scripts/backfill-pr-labels-from-issue.mts --apply   # write labels
 *
 * Pass `--limit=N` to stop after N PRs have been (or would have been) labeled,
 * which is handy for trying it out on a handful of PRs first.
 *
 * Auth comes from `GITHUB_TOKEN`, falling back to `gh auth token`. The token
 * needs pull requests: write and issues: read.
 *
 * Adding a label the PR already has is a no-op, so re-running is safe.
 */

import { execFileSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const OWNER = 'typescript-eslint';
const REPO = 'typescript-eslint';
const NAME_WITH_OWNER = `${OWNER}/${REPO}`;

// Keep in sync with .github/workflows/pr-labels-from-issue.yml
const ALLOWED_LABELS = [
  'bug',
  'documentation',
  'enhancement',
  'preset config change',
  'repo maintenance',
];

const ALLOWED_LABEL_PREFIXES = ['package:', 'enhancement:'];

const isAllowed = (name: string): boolean =>
  ALLOWED_LABELS.includes(name) ||
  ALLOWED_LABEL_PREFIXES.some(prefix => name.startsWith(prefix));

const apply = process.argv.includes('--apply');

const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : Infinity;

if (!(limit > 0)) {
  throw new Error(`Expected a positive number, got: ${limitArg}`);
}

const token =
  process.env.GITHUB_TOKEN ??
  execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();

interface RequestOptions {
  body?: unknown;
  method?: string;
}

async function api<T>(
  path: string,
  { body, method = 'GET' }: RequestOptions = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`https://api.github.com${path}`, {
      body: body == null ? undefined : JSON.stringify(body),
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      method,
    });

    if (response.ok) {
      return (await response.json()) as T;
    }

    // Secondary rate limit / abuse detection: back off and retry.
    if ((response.status === 403 || response.status === 429) && attempt < 5) {
      const retryAfter = Number(response.headers.get('retry-after')) || 60;
      console.warn(`  rate limited, sleeping ${retryAfter}s...`);
      await sleep(retryAfter * 1000);
      continue;
    }

    throw new Error(
      `${method} ${path} -> ${response.status} ${await response.text()}`,
    );
  }
}

async function graphql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const { data, errors } = await api<{ data: T; errors?: unknown[] }>(
    '/graphql',
    { body: { query, variables }, method: 'POST' },
  );

  if (errors) {
    throw new Error(JSON.stringify(errors, null, 2));
  }

  return data;
}

interface Labels {
  nodes: { name: string }[];
}

interface PullRequestsQuery {
  repository: {
    pullRequests: {
      nodes: {
        closingIssuesReferences: {
          nodes: {
            labels: Labels;
            repository: { nameWithOwner: string };
          }[];
        };
        labels: Labels;
        number: number;
      }[];
      pageInfo: {
        endCursor: string;
        hasNextPage: boolean;
      };
    };
  };
}

const query = `
  query ($owner: String!, $repo: String!, $cursor: String) {
    repository(owner: $owner, name: $repo) {
      pullRequests(
        first: 50
        after: $cursor
        states: [OPEN]
        orderBy: { field: CREATED_AT, direction: ASC }
      ) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          number
          labels(first: 100) {
            nodes {
              name
            }
          }
          closingIssuesReferences(first: 10) {
            nodes {
              repository {
                nameWithOwner
              }
              labels(first: 100) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

let cursor: string | null = null;
let scanned = 0;
let updated = 0;

for (;;) {
  const data: PullRequestsQuery = await graphql(query, {
    cursor,
    owner: OWNER,
    repo: REPO,
  });

  const { nodes, pageInfo } = data.repository.pullRequests;

  for (const pullRequest of nodes) {
    scanned++;

    // Filter out issue labels from other repositories, for the edge case
    // of a typescript-eslint PR that closes an issue in a different repo.
    const issues = pullRequest.closingIssuesReferences.nodes.filter(
      issue => issue.repository.nameWithOwner === NAME_WITH_OWNER,
    );

    const existing = new Set(pullRequest.labels.nodes.map(label => label.name));

    const missing = [
      ...new Set(
        issues
          .flatMap(issue => issue.labels.nodes.map(label => label.name))
          .filter(name => isAllowed(name) && !existing.has(name)),
      ),
    ];

    if (missing.length === 0) {
      continue;
    }

    updated++;
    console.log(`#${pullRequest.number}: + ${missing.join(', ')}`);

    if (apply) {
      await api(`/repos/${OWNER}/${REPO}/issues/${pullRequest.number}/labels`, {
        body: { labels: missing },
        method: 'POST',
      });

      // Be gentle with the secondary rate limit on writes.
      await sleep(1000);
    }

    if (updated === limit) {
      break;
    }
  }

  console.error(`...scanned ${scanned} PRs`);

  if (updated === limit || !pageInfo.hasNextPage) {
    break;
  }

  cursor = pageInfo.endCursor;
}

console.log(
  `\nScanned ${scanned} PRs, ${updated} ${apply ? 'updated' : 'would be updated'}.`,
);

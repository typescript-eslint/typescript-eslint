import type { SponsorData } from 'website/src/components/home/FinancialContributors/types.ts';

import fetch from 'cross-fetch';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { PACKAGES_WEBSITE } from './paths.mts';

const excludedNames = new Set([
  'Josh Goldberg', // Team member 💖
]);

const filteredTerms = ['casino', 'deepnude', 'tiktok'];

const jsonApiFetch = async <T,>(
  api: string,
  options?: RequestInit,
): Promise<T> => {
  const url = `https://api.${api}`;
  const response = await fetch(url, options);
  if (!response.ok) {
    console.error({
      response: { body: await response.text(), status: response.status },
      url,
    });
    throw new Error('API call failed.');
  }
  return (await response.json()) as T;
};

const openCollectiveSponsorsPromise = jsonApiFetch<{
  data: {
    collective: {
      members: {
        nodes: {
          account: {
            id: string;
            imageUrl: string;
            name: string;
            website: string | null;
          };
          totalDonations: { valueInCents: number };
        }[];
      };
    };
  };
}>('opencollective.com/graphql/v2', {
  body: JSON.stringify({
    query: `
      {
        collective(slug: "typescript-eslint") {
          members(limit: 1000, role: BACKER) {
            nodes {
              account {
                id
                imageUrl
                name
                website
              }
              totalDonations {
                valueInCents
              }
            }
          }
        }
      }
    `,
  }),
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
}).then(({ data }) => {
  // TODO: remove polyfill in Node 22
  const groupBy = <T,>(
    arr: T[],
    fn: (item: T) => string,
  ): Record<string, T[]> => {
    const grouped: Record<string, T[]> = {};
    for (const item of arr) {
      (grouped[fn(item)] ??= []).push(item);
    }
    return grouped;
  };
  return Object.entries(
    groupBy(
      data.collective.members.nodes,
      ({ account }) => account.name || account.id,
    ),
  ).flatMap(([id, members]) => {
    const [
      {
        account: { website, ...account },
      },
    ] = members;
    return website
      ? {
          id,
          image: account.imageUrl,
          name: account.name,
          totalDonations: members.reduce(
            (sum, { totalDonations }) => sum + totalDonations.valueInCents,
            0,
          ),
          website,
        }
      : [];
  });
});

const thanksDevSponsorsPromise = jsonApiFetch<
  Record<'dependers' | 'donors', ['gh' | 'gl', string, number][]>
>('thanks.dev/v1/vip/dependee/gh/typescript-eslint').then(async ({ donors }) =>
  (
    await Promise.all(
      donors
        /* GitLab does not have an API to get a user's profile. At the time of writing, only 13% of donors
             from thanks.dev came from GitLab rather than GitHub, and none of them met the contribution
             threshold. */
        .filter(([site]) => site === 'gh')
        .map(async ([, id, totalDonations]) => {
          const { name, ...github } = await jsonApiFetch<
            Record<'avatar_url' | 'blog', string> & {
              name: string | null;
            }
          >(`github.com/users/${id}`);
          return name
            ? {
                id,
                image: github.avatar_url,
                name,
                totalDonations,
                website: github.blog || `https://github.com/${id}`,
              }
            : [];
        }),
    )
  ).flat(),
);

const sponsors = (
  await Promise.all<SponsorData[]>([
    openCollectiveSponsorsPromise,
    thanksDevSponsorsPromise,
  ])
)
  .flat()
  .filter(
    ({ id, name, totalDonations }) =>
      !(
        filteredTerms.some(filteredTerm =>
          name.toLowerCase().includes(filteredTerm),
        ) ||
        excludedNames.has(id) ||
        totalDonations < 10000
      ),
  )
  .sort((a, b) => b.totalDonations - a.totalDonations);

fs.writeFileSync(
  path.join(PACKAGES_WEBSITE, 'data', 'sponsors.json'),
  `${JSON.stringify(sponsors, null, 2)}\n`,
);

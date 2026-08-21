import type { SponsorData } from '@site/src/components/home/FinancialContributors/types.ts';

import * as fs from 'node:fs';
import * as path from 'node:path';

import { mergeSponsors } from './merge-sponsors.mts';
import { PACKAGES_WEBSITE, TOOLS_DATA } from './paths.mts';

interface OutOfBandDonation {
  image: string;
  name: string;
  source: string;
  totalDonations: number;
  website: string;
}

const gitHubHeaders: HeadersInit = process.env.GITHUB_TOKEN
  ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  : {};

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
          } | null;
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
      ({ account }) => account?.name || account?.id || '',
    ),
  ).flatMap(([id, members]) => {
    const [{ account }] = members;
    return account?.website
      ? {
          id,
          image: account.imageUrl,
          name: account.name,
          totalDonations: members.reduce(
            (sum, { totalDonations }) => sum + totalDonations.valueInCents,
            0,
          ),
          website: account.website,
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
          >(`github.com/users/${id}`, { headers: gitHubHeaders });
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

const outOfBandSponsors = (
  JSON.parse(
    fs.readFileSync(
      path.join(TOOLS_DATA, 'out-of-band-donations.json'),
      'utf8',
    ),
  ) as OutOfBandDonation[]
).map(({ image, name, totalDonations, website }) => ({
  id: name,
  image,
  name,
  totalDonations,
  website,
}));

const sponsors = mergeSponsors([
  ...(await Promise.all<SponsorData[]>([
    openCollectiveSponsorsPromise,
    thanksDevSponsorsPromise,
  ])),
  outOfBandSponsors,
]);

fs.writeFileSync(
  path.join(PACKAGES_WEBSITE, 'data', 'sponsors.json'),
  `${JSON.stringify(sponsors, null, 2)}\n`,
);

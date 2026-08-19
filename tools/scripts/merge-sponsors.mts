import type { SponsorData } from '@site/src/components/home/FinancialContributors/types.ts';

const excludedNames = new Set([
  'Josh Goldberg', // Team member 💖
]);

const filteredTerms = ['casino', 'deepnude', 'tiktok'];

const minimumTotalDonations = 10_000;

/* Sources don't share account identifiers: Open Collective has its own account IDs, thanks.dev
   reports GitHub and GitLab logins, and out-of-band donations have no identifier at all. Names
   normalized down to their alphanumeric characters are the one field every source agrees on. */
const sponsorKey = (name: string): string =>
  name.toLowerCase().replaceAll(/[^a-z0-9]/g, '');

export const mergeSponsors = (sources: SponsorData[][]): SponsorData[] => {
  const merged = new Map<string, SponsorData>();

  for (const sponsor of sources.flat()) {
    const key = sponsorKey(sponsor.name);
    const existing = merged.get(key);

    if (existing) {
      existing.totalDonations += sponsor.totalDonations;
    } else {
      merged.set(key, { ...sponsor });
    }
  }

  return [...merged.values()]
    .filter(
      ({ id, name, totalDonations }) =>
        !(
          filteredTerms.some(filteredTerm =>
            name.toLowerCase().includes(filteredTerm),
          ) ||
          excludedNames.has(id) ||
          totalDonations < minimumTotalDonations
        ),
    )
    .sort((a, b) => b.totalDonations - a.totalDonations);
};

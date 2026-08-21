import type { SponsorData } from '@site/src/components/home/FinancialContributors/types.ts';

const excludedNames = new Set([
  'Josh Goldberg', // Team member 💖
]);

const filteredTerms = ['casino', 'deepnude', 'tiktok'];

const minimumTotalDonations = 10_000;

const preferredNames = new Map([
  ['canonicaljuju', 'Canonical'],
  ['charmedkubernetes', 'Canonical'],
  ['notion', 'Notion'],
]);

const sponsorKey = (name: string): string =>
  name.toLowerCase().replaceAll(/[^a-z0-9]/g, '');

export const mergeSponsors = (sources: SponsorData[][]): SponsorData[] => {
  const merged = new Map<string, SponsorData>();
  const renamed = new Set<string>();

  for (const sponsor of sources.flat()) {
    const sourceKey = sponsorKey(sponsor.name);
    const name = preferredNames.get(sourceKey) ?? sponsor.name;
    const key = sponsorKey(name);
    const isRenamed = key !== sourceKey;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, { ...sponsor, name });
      if (isRenamed) {
        renamed.add(key);
      }
      continue;
    }

    existing.totalDonations += sponsor.totalDonations;

    if (!isRenamed && renamed.has(key)) {
      renamed.delete(key);
      existing.id = sponsor.id;
      existing.image = sponsor.image;
      existing.website = sponsor.website;
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

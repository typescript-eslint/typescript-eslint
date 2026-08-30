import type { SponsorData } from '@site/src/components/home/FinancialContributors/types.ts';

import { mergeSponsors } from './merge-sponsors.mts';

const createSponsor = (sponsor: Partial<SponsorData>): SponsorData => ({
  id: 'sponsor',
  image: 'https://example.com/sponsor.png',
  name: 'Sponsor',
  totalDonations: 100_000,
  website: 'https://example.com',
  ...sponsor,
});

describe('mergeSponsors', () => {
  it('sums total donations when a sponsor appears in multiple sources', () => {
    const actual = mergeSponsors([
      [createSponsor({ name: 'Sentry', totalDonations: 114_800 })],
      [createSponsor({ name: 'Sentry', totalDonations: 15_455 })],
    ]);

    expect(actual).toEqual([
      createSponsor({ name: 'Sentry', totalDonations: 130_255 }),
    ]);
  });

  it('keeps details from the first source when a sponsor appears in multiple sources', () => {
    const actual = mergeSponsors([
      [
        createSponsor({
          id: 'Sentry',
          image: 'https://images.opencollective.com/sentry.png',
          name: 'Sentry',
          website: 'https://sentry.io/welcome/',
        }),
      ],
      [
        createSponsor({
          id: 'getsentry',
          image: 'https://avatars.githubusercontent.com/getsentry.png',
          name: 'Sentry',
          website: 'https://sentry.io',
        }),
      ],
    ]);

    expect(actual).toEqual([
      createSponsor({
        id: 'Sentry',
        image: 'https://images.opencollective.com/sentry.png',
        name: 'Sentry',
        totalDonations: 200_000,
        website: 'https://sentry.io/welcome/',
      }),
    ]);
  });

  it('matches sponsors when their names differ only by casing and punctuation', () => {
    const actual = mergeSponsors([
      [createSponsor({ name: 'Frontend Masters', totalDonations: 10_000 })],
      [createSponsor({ name: 'frontendmasters', totalDonations: 20_000 })],
    ]);

    expect(actual).toEqual([
      createSponsor({ name: 'Frontend Masters', totalDonations: 30_000 }),
    ]);
  });

  it('does not match sponsors when their names differ by more than casing and punctuation', () => {
    const actual = mergeSponsors([
      [createSponsor({ id: 'nx', name: 'Nx (by Nrwl)' })],
      [createSponsor({ id: 'nrwl', name: 'Nrwl' })],
    ]);

    expect(actual).toEqual([
      createSponsor({ id: 'nx', name: 'Nx (by Nrwl)' }),
      createSponsor({ id: 'nrwl', name: 'Nrwl' }),
    ]);
  });

  it('uses the preferred name when a source reports another form of it', () => {
    const actual = mergeSponsors([
      [createSponsor({ id: 'notion', name: 'notion' })],
    ]);

    expect(actual).toEqual([createSponsor({ id: 'notion', name: 'Notion' })]);
  });

  it('merges donations when sponsors share a preferred name', () => {
    const actual = mergeSponsors([
      [
        createSponsor({
          id: 'canonical',
          name: 'Canonical',
          totalDonations: 17_078,
        }),
        createSponsor({
          id: 'juju',
          name: 'Canonical Juju',
          totalDonations: 12_267,
        }),
      ],
      [
        createSponsor({
          id: 'charmed-kubernetes',
          name: 'Charmed Kubernetes',
          totalDonations: 47_342,
        }),
      ],
    ]);

    expect(actual).toEqual([
      createSponsor({
        id: 'canonical',
        name: 'Canonical',
        totalDonations: 76_687,
      }),
    ]);
  });

  it('keeps details from the sponsor named by a preferred name when others merge into it', () => {
    const actual = mergeSponsors([
      [
        createSponsor({
          id: 'juju',
          image: 'https://avatars.githubusercontent.com/juju.png',
          name: 'Canonical Juju',
          website: 'https://discourse.charmhub.io',
        }),
      ],
      [
        createSponsor({
          id: 'canonical',
          image: 'https://avatars.githubusercontent.com/canonical.png',
          name: 'Canonical',
          website: 'https://canonical.com',
        }),
      ],
    ]);

    expect(actual).toEqual([
      createSponsor({
        id: 'canonical',
        image: 'https://avatars.githubusercontent.com/canonical.png',
        name: 'Canonical',
        totalDonations: 200_000,
        website: 'https://canonical.com',
      }),
    ]);
  });

  it('includes a sponsor when only its merged total reaches the threshold', () => {
    const actual = mergeSponsors([
      [createSponsor({ name: 'Codecov', totalDonations: 6_000 })],
      [createSponsor({ name: 'Codecov', totalDonations: 4_000 })],
    ]);

    expect(actual).toEqual([
      createSponsor({ name: 'Codecov', totalDonations: 10_000 }),
    ]);
  });

  it('excludes a sponsor when its merged total is below the threshold', () => {
    const actual = mergeSponsors([
      [createSponsor({ name: 'Codecov', totalDonations: 6_000 })],
      [createSponsor({ name: 'Codecov', totalDonations: 3_000 })],
    ]);

    expect(actual).toEqual([]);
  });

  it('excludes a sponsor when its name contains a filtered term', () => {
    const actual = mergeSponsors([
      [createSponsor({ name: 'Cool Casino Corp' })],
    ]);

    expect(actual).toEqual([]);
  });

  it('excludes a sponsor when its id is an excluded name', () => {
    const actual = mergeSponsors([
      [createSponsor({ id: 'Josh Goldberg', name: 'Josh Goldberg' })],
    ]);

    expect(actual).toEqual([]);
  });

  it('sorts sponsors by total donations descending', () => {
    const actual = mergeSponsors([
      [
        createSponsor({ id: 'a', name: 'A', totalDonations: 20_000 }),
        createSponsor({ id: 'c', name: 'C', totalDonations: 60_000 }),
      ],
      [createSponsor({ id: 'b', name: 'B', totalDonations: 40_000 })],
    ]);

    expect(actual.map(({ name }) => name)).toEqual(['C', 'B', 'A']);
  });

  it('does not modify the provided sponsors when merging them', () => {
    const sponsor = createSponsor({ name: 'Sentry', totalDonations: 100_000 });

    mergeSponsors([[sponsor], [createSponsor({ name: 'Sentry' })]]);

    expect(sponsor.totalDonations).toBe(100_000);
  });
});

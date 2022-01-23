import fetch from 'cross-fetch';
import * as fs from 'fs';
import * as path from 'path';

const graphqlEndpoint = 'https://api.opencollective.com/graphql/v2';

const graphqlQuery = `{
  account(slug: "typescript-eslint") {
    orders(status: ACTIVE, limit: 1000) {
      totalCount
      nodes {
        tier {
          slug
        }
        fromAccount {
          id
          name
          slug
          website
          imageUrl
          description
        }
      }
    }
  }
}`;

const excludedIds = new Set([
  '53kzxy4v-07wlr6mr-o9epmj9n-o8agdbe5', // Josh Goldberg
]);

interface SponsorsData {
  data: {
    account: {
      orders: {
        nodes: SponsorNode[];
      };
    };
  };
}

interface SponsorNode {
  fromAccount: {
    description: string;
    id: string;
    imageUrl: string;
    name: string;
    slug: string;
    twitterHandle: string;
    website: string;
  };
  tier?: {
    slug: string;
  };
}

async function main(): Promise<void> {
  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: graphqlQuery }),
  });
  const data = (await response.json()) as SponsorsData;
  const uniqueIds = new Set<string>(excludedIds);
  const allSponsorsConfig = data.data.account.orders.nodes
    .filter(node => !!node.tier)
    .map(node => ({
      description: node.fromAccount.description,
      id: node.fromAccount.id,
      image: node.fromAccount.imageUrl,
      name: node.fromAccount.name,
      slug: node.fromAccount.slug,
      tier: node.tier.slug,
      twitterHandle: node.fromAccount.twitterHandle,
      website: node.fromAccount.website,
    }))
    .filter(({ id }) => {
      if (uniqueIds.has(id)) {
        return false;
      }

      uniqueIds.add(id);
      return true;
    });

  const rcPath = path.resolve(
    __dirname,
    '../packages/website/data/sponsors.json',
  );
  fs.writeFileSync(rcPath, JSON.stringify(allSponsorsConfig, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

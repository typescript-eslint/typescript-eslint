import * as fs from 'fs';
import fetch from 'node-fetch';
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
  const allSponsorsConfig = data.data.account.orders.nodes
    .filter(node => !!node.tier)
    .map(node => ({
      description: node.fromAccount.description,
      image: node.fromAccount.imageUrl,
      name: node.fromAccount.name,
      slug: node.fromAccount.slug,
      tier: node.tier.slug,
      twitterHandle: node.fromAccount.twitterHandle,
      website: node.fromAccount.website,
    }));

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

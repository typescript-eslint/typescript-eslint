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

async function fetchSponsors(): Promise<void> {
  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: graphqlQuery }),
  });
  const data = await response.json();
  const allSponsorsConfig = data.data.account.orders.nodes
    .filter(node => !!node.tier)
    .map(node => ({
      tier: node.tier.slug,
      name: node.fromAccount.name,
      slug: node.fromAccount.slug,
      website: node.fromAccount.website,
      image: node.fromAccount.imageUrl,
      twitterHandle: node.fromAccount.twitterHandle,
      description: node.fromAccount.description,
    }));

  const rcPath = path.resolve(
    __dirname,
    '../packages/website/data/sponsors.json',
  );
  fs.writeFileSync(rcPath, JSON.stringify(allSponsorsConfig, null, 2));
}

fetchSponsors();

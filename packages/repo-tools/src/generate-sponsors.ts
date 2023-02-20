import fetch from 'cross-fetch';
import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';

const graphqlEndpoint = 'https://api.opencollective.com/graphql/v2';

const queries = {
  account: `{
    account(slug: "typescript-eslint") {
      orders(status: ACTIVE, limit: 1000) {
        totalCount
        nodes {
          tier {
            slug
          }
          fromAccount {
            id
            imageUrl
            name
            website
          }
        }
      }
    }
  }`,
  collective: `{
    collective(slug: "typescript-eslint") {
      members(limit: 1000, role: BACKER) {
        nodes {
          account {
            id
            imageUrl
            name
            website
          }
          tier {
            amount {
              valueInCents
            }
            orders(limit: 100) {
              nodes {
                amount {
                  valueInCents
                }
              }
            }
          }
          totalDonations {
            valueInCents
          }
          updatedAt
        }
      }
    }
  }`,
};

interface AccountData {
  orders: {
    nodes: OrderNode[];
  };
}

interface OrderNode {
  fromAccount: MemberAccount;
  tier?: Tier;
}

interface Tier {
  slug: string;
}

interface CollectiveData {
  members: {
    nodes: MemberNode[];
  };
}

interface MemberNode {
  account: MemberAccount;
  totalDonations: {
    valueInCents: number;
  };
}

interface MemberAccount {
  id: string;
  imageUrl: string;
  name: string;
  twitterHandle: string;
  website: string;
}

const excludedNames = new Set([
  'Guest', // Apparent anonymous donor equivalent without an avatar
  'Josh Goldberg', // Team member 💖
]);

async function requestGraphql<Data>(key: keyof typeof queries): Promise<Data> {
  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: queries[key] }),
  });

  const { data } = (await response.json()) as {
    data: Record<typeof key, unknown>;
  };
  return data[key] as Data;
}

async function main(): Promise<void> {
  const [account, collective] = await Promise.all([
    requestGraphql<AccountData>('account'),
    requestGraphql<CollectiveData>('collective'),
  ]);

  const accountsById = account.orders.nodes.reduce<
    Record<string, MemberAccount>
  >((accumulator, account) => {
    const name = account.fromAccount.name || account.fromAccount.id;
    accumulator[name] = {
      ...accumulator[name],
      ...account.fromAccount,
    };
    return accumulator;
  }, {});

  const totalDonationsById = collective.members.nodes.reduce<
    Record<string, number>
  >((accumulator, member) => {
    const name = member.account.name || member.account.id;
    accumulator[name] ||= 0;
    accumulator[name] += member.totalDonations.valueInCents;
    return accumulator;
  }, {});

  const uniqueNames = new Set<string>(excludedNames);
  const allSponsorsConfig = collective.members.nodes
    .map(member => {
      const name = member.account.name || member.account.id;
      const fromAccount = {
        ...member.account,
        ...accountsById[name],
      };
      const totalDonations = totalDonationsById[name];
      const website = fromAccount.website;

      return {
        id: name,
        image: fromAccount.imageUrl,
        name: fromAccount.name,
        totalDonations,
        twitterHandle: fromAccount.twitterHandle,
        website,
      };
    })
    .filter(({ id, totalDonations, website }) => {
      if (uniqueNames.has(id) || totalDonations < 10000 || !website) {
        return false;
      }

      uniqueNames.add(id);
      return true;
    })
    .sort((a, b) => b.totalDonations - a.totalDonations);

  const rcPath = path.resolve(
    __dirname,
    '../packages/website/data/sponsors.json',
  );
  fs.writeFileSync(rcPath, await stringifyObject(rcPath, allSponsorsConfig));
}

async function stringifyObject(
  filePath: string,
  data: unknown,
): Promise<string> {
  const config = await prettier.resolveConfig(filePath);
  const text = JSON.stringify(
    data,
    (_, value: unknown) => value ?? undefined,
    2,
  );

  return prettier.format(text, {
    ...config,
    parser: 'json',
  });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

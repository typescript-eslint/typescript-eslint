// @ts-check
/** @type {import('@docusaurus/plugin-content-docs/lib/sidebars/types.js').SidebarsConfig} */
module.exports = {
  docs: [
    {
      collapsible: false,
      items: [
        {
          collapsible: false,
          items: ['getting-started/legacy-eslint-setup'],
          label: 'Quickstart',
          link: {
            id: 'getting-started/quickstart',
            type: 'doc',
          },
          type: 'category',
        },
        {
          id: 'getting-started/typed-linting',
          type: 'doc',
        },
      ],
      label: 'Getting Started',
      link: {
        id: 'getting-started/quickstart',
        type: 'doc',
      },
      type: 'category',
    },
    {
      collapsible: false,
      items: [
        {
          collapsed: false,
          collapsible: false,
          items: [
            'troubleshooting/faqs/formatting',
            'troubleshooting/faqs/tslint',
          ],
          label: 'FAQs',
          link: {
            id: 'troubleshooting/faqs',
            type: 'doc',
          },
          type: 'category',
        },
        {
          collapsed: true,
          collapsible: true,
          items: [
            'troubleshooting/typed-linting/monorepos',
            'troubleshooting/typed-linting/performance',
          ],
          label: 'Linting with Type Information',
          link: {
            id: 'troubleshooting/typed-linting',
            type: 'doc',
          },
          type: 'category',
        },
        'troubleshooting/working-with-javascript',
      ],
      label: 'Troubleshooting',
      link: {
        id: 'troubleshooting/faqs',
        type: 'doc',
      },
      type: 'category',
    },
    {
      collapsible: false,
      items: [
        'users/configs',
        'users/dependency-versions',
        'users/releases',
        'users/versioning',
      ],
      label: 'Users',
      link: {
        id: 'users',
        type: 'doc',
      },
      type: 'category',
    },
    {
      collapsible: false,
      items: ['developers/custom-rules'],
      label: 'Developers',
      link: {
        id: 'developers',
        type: 'doc',
      },
      type: 'category',
    },
    {
      collapsed: false,
      collapsible: true,
      items: [
        'packages/eslint-plugin',
        'packages/eslint-plugin-tslint',
        'packages/parser',
        'packages/rule-tester',
        'packages/scope-manager',
        'packages/typescript-estree',
        'packages/typescript-eslint',
        'packages/utils',
      ],
      label: 'Packages',
      link: {
        id: 'packages',
        type: 'doc',
      },
      type: 'category',
    },
    {
      items: [
        'contributing/discussions',
        'contributing/issues',
        {
          collapsible: false,
          items: ['contributing/local-development/local-linking'],
          label: 'Local Development',
          link: {
            id: 'contributing/local-development',
            type: 'doc',
          },
          type: 'category',
        },
        'contributing/pull-requests',
      ],
      label: 'Contributing',
      link: {
        id: 'contributing',
        type: 'doc',
      },
      type: 'category',
    },
    {
      collapsible: true,
      items: [
        'maintenance/branding',
        'maintenance/contributor-tiers',
        {
          collapsible: true,
          items: ['maintenance/issues/rule-deprecations'],
          label: 'Issues',
          link: {
            id: 'maintenance/issues',
            type: 'doc',
          },
          type: 'category',
        },
        'maintenance/releases',
        {
          collapsible: true,
          items: ['maintenance/pull-requests/dependency-version-upgrades'],
          label: 'Pull Requests',
          link: {
            id: 'maintenance/pull-requests',
            type: 'doc',
          },
          type: 'category',
        },
        'maintenance/team',
      ],
      label: 'Maintenance',
      link: {
        id: 'maintenance',
        type: 'doc',
      },
      type: 'category',
    },
  ],
};

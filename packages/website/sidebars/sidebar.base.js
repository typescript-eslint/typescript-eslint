// @ts-check
/** @type {import('@docusaurus/plugin-content-docs/lib/sidebars/types.js').SidebarsConfig} */
module.exports = {
  docs: [
    {
      collapsible: false,
      items: [
        {
          collapsible: false,
          items: ['linting/typed-linting/monorepos'],
          label: 'Linting with Type Information',
          link: {
            id: 'linting/typed-linting',
            type: 'doc',
          },
          type: 'category',
        },
        'linting/configs',
        {
          collapsible: false,
          items: [
            'linting/troubleshooting/performance-troubleshooting',
            'linting/troubleshooting/formatting',
            'linting/troubleshooting/tslint',
          ],
          label: 'Troubleshooting & FAQs',
          link: {
            id: 'linting/troubleshooting',
            type: 'doc',
          },
          type: 'category',
        },
        'linting/legacy-eslint-setup',
      ],
      label: 'Getting Started',
      link: {
        id: 'getting-started',
        type: 'doc',
      },
      type: 'category',
    },
    {
      collapsible: false,
      items: [
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

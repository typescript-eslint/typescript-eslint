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
      collapsible: false,
      items: [
        'packages/eslint-plugin',
        'packages/eslint-plugin-tslint',
        'packages/parser',
        'packages/scope-manager',
        'packages/typescript-estree',
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
        'contributing/local-development',
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
      items: [
        'maintenance/branding',
        'maintenance/dependency-version-upgrades',
        {
          collapsible: false,
          items: ['maintenance/issues/rule-deprecations'],
          label: 'Issues',
          link: {
            id: 'maintenance/issues',
            type: 'doc',
          },
          type: 'category',
        },
        'maintenance/major-release-steps',
        'maintenance/pull-requests',
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

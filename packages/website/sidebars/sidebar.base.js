// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
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
          collapsed: true,
          collapsible: true,
          items: [
            'troubleshooting/faqs/general',
            'troubleshooting/faqs/eslint',
            'troubleshooting/faqs/frameworks',
            'troubleshooting/faqs/javascript',
            'troubleshooting/faqs/typescript',
          ],
          label: 'FAQs',
          link: {
            id: 'troubleshooting/faqs/general',
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
          label: 'Typed Linting',
          link: {
            id: 'troubleshooting/typed-linting/index',
            type: 'doc',
          },
          type: 'category',
        },
      ],
      label: 'Troubleshooting & FAQs',
      link: {
        id: 'troubleshooting/faqs/general',
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
        'users/what-about-formatting',
        'users/what-about-tslint',
      ],
      label: 'Users',
      link: {
        id: 'users/index',
        type: 'doc',
      },
      type: 'category',
    },
    {
      collapsible: false,
      items: ['developers/custom-rules', 'developers/eslint-plugins'],
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
        'packages/project-service',
        'packages/rule-schema-to-typescript-types',
        'packages/rule-tester',
        'packages/scope-manager',
        'packages/tsconfig-utils',
        {
          collapsible: false,
          items: ['packages/type-utils/type-or-value-specifier'],
          label: 'type-utils',
          link: {
            id: 'packages/type-utils',
            type: 'doc',
          },
          type: 'category',
        },
        {
          collapsible: false,
          items: ['packages/typescript-estree/ast-spec'],
          label: 'typescript-estree',
          link: {
            id: 'packages/typescript-estree',
            type: 'doc',
          },
          type: 'category',
        },
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
          items: ['maintenance/issues/rule-deprecations-and-deletions'],
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

module.exports = {
  docs: [
    {
      collapsible: false,
      items: [
        {
          label: 'Linting with Type Information',
          items: ['linting/typed-linting/monorepos'],
          collapsible: false,
          link: {
            id: 'linting/typed-linting',
            type: 'doc',
          },
          type: 'category',
        },
        'linting/configs',
        {
          label: 'Troubleshooting & FAQs',
          link: {
            id: 'linting/troubleshooting',
            type: 'doc',
          },
          collapsible: false,
          type: 'category',
          items: [
            'linting/troubleshooting/performance-troubleshooting',
            'linting/troubleshooting/formatting',
            'linting/troubleshooting/tslint',
          ],
        },
      ],
      link: {
        id: 'getting-started',
        type: 'doc',
      },
      label: 'Getting Started',
      type: 'category',
    },
    'custom-rules',
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
        'architecture/eslint-plugin',
        'architecture/eslint-plugin-tslint',
        'architecture/parser',
        'architecture/scope-manager',
        'architecture/typescript-estree',
        'architecture/utils',
      ],
      label: 'Architecture',
      link: {
        id: 'architecture',
        type: 'doc',
      },
      type: 'category',
    },
    {
      items: [
        'maintenance/branding',
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
        'maintenance/pull-requests',
        'maintenance/releases',
        'maintenance/versioning',
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

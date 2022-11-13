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
      collapsible: false,
      items: ['contributing/development'],
      label: 'Contributing',
      link: {
        id: 'contributing',
        type: 'doc',
      },
      type: 'category',
    },
    {
      collapsible: false,
      items: [
        'architecture/asts',
        'architecture/eslint-plugin',
        'architecture/eslint-plugin-tslint',
        'architecture/parser',
        'architecture/scope-manager',
        'architecture/typescript-estree',
        'architecture/utils',
      ],
      label: 'Architecture',
      type: 'category',
    },
    {
      collapsible: false,
      items: [
        'maintenance/issues',
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

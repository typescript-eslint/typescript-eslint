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
    {
      type: 'category',
      label: 'Development',
      collapsible: false,
      items: [
        {
          label: 'Architecture',
          type: 'category',
          collapsible: false,
          items: [
            'development/architecture/asts',
            'development/architecture/packages',
          ],
        },
        'development/custom-rules',
      ],
    },
    {
      collapsible: false,
      items: ['maintenance/issues', 'maintenance/versioning-and-releases'],
      label: 'Maintenance',
      link: {
        id: 'maintenance',
        type: 'doc',
      },
      type: 'category',
    },
  ],
};

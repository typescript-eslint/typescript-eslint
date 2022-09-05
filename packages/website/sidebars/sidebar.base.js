module.exports = {
  docs: [
    {
      collapsed: false,
      items: [
        {
          label: 'Linting with Type Information',
          items: ['linting/typed-linting/monorepos'],
          collapsed: false,
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
          collapsed: false,
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
      collapsed: false,
      items: [
        {
          label: 'Architecture',
          type: 'category',
          collapsed: false,
          items: [
            'development/architecture/asts',
            'development/architecture/packages',
          ],
        },
        'development/custom-rules',
      ],
    },
  ],
};

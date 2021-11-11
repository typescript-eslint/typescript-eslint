module.exports = {
  docs: {
    Guides: [
      'getting-started/README',
      {
        type: 'category',
        label: 'Linting',
        collapsed: false,
        items: [
          'getting-started/linting/linting',
          'getting-started/linting/type-linting',
          'getting-started/linting/monorepo',
          'getting-started/linting/troubleshooting',
          'getting-started/linting/tslint',
        ],
      },
      {
        type: 'category',
        label: 'Plugins',
        collapsed: false,
        items: ['getting-started/plugin-development/plugins'],
      },
    ],
  },
};

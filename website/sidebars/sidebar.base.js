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
        ],
      },
      'getting-started/tslint-migration',
      {
        type: 'category',
        label: 'Plugins',
        collapsed: false,
        items: ['getting-started/plugin-development/plugins'],
      },
      {
        type: 'category',
        label: 'Packages',
        collapsed: false,
        items: ['eslint-plugin-tslint'],
      },
    ],
  },
};

module.exports = {
  docs: {
    Guides: [
      'getting-started/README',
      {
        type: 'category',
        label: 'Linting',
        collapsed: false,
        items: [
          'getting-started/linting/README',
          'getting-started/linting/TYPED_LINTING',
          'getting-started/linting/MONOREPO',
          'getting-started/linting/FAQ',
        ],
      },
      'getting-started/MIGRATION_TSLINT',
      {
        type: 'category',
        label: 'Plugins',
        collapsed: false,
        items: ['getting-started/plugin-development/README'],
      },
      'ESLINT_PLUGIN_TSLINT',
    ],
  },
};

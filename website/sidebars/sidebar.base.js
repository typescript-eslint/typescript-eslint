module.exports = {
  docs: {
    Guides: [
      'README',
      {
        type: 'category',
        label: 'Linting',
        collapsed: false,
        items: [
          'linting/README',
          'linting/TYPED_LINTING',
          'linting/MONOREPO',
          'linting/FAQ',
          'linting/ESLINT_PLUGIN_TSLINT',
        ],
      },
      {
        type: 'category',
        label: 'Plugins',
        collapsed: false,
        items: ['plugin-development/README'],
      },
      'MIGRATION_TSLINT',
    ],
  },
};

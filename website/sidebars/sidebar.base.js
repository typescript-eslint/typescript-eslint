module.exports = {
  docs: {
    Guides: [
      'README',
      {
        type: 'category',
        label: 'Linting',
        collapsed: false,
        items: [
          'linting/MONOREPO',
          'linting/README',
          'linting/TYPED_LINTING',
          'linting/FAQ',
        ],
      },
      {
        type: 'category',
        label: 'Plugins',
        collapsed: false,
        items: ['plugin-development/README'],
      },
    ],
  },
};

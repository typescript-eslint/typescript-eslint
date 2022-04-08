module.exports = {
  docs: [
    'README',
    {
      type: 'category',
      label: 'Linting',
      collapsed: false,
      items: [
        'linting/linting',
        'linting/type-linting',
        'linting/presets',
        'linting/monorepo',
        'linting/troubleshooting',
        'linting/tslint',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      collapsed: false,
      items: [
        {
          label: 'Architecture',
          type: 'category',
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

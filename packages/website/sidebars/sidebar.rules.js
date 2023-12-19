const plugin = require('@typescript-eslint/eslint-plugin');

const rules = Object.entries(plugin.rules).map(([name, rule]) => {
  return {
    name: name,
    meta: { ...rule.meta },
  };
});

function createCategory(label, rules, additionalItems = []) {
  return {
    items: [
      ...rules.map(rule => {
        return {
          type: 'doc',
          id: rule.name,
          label: rule.name,
        };
      }),
      ...additionalItems,
    ],
    label,
    type: 'category',
  };
}

module.exports = {
  someSidebar: [
    'README',
    {
      ...createCategory('Rules', rules),
      collapsed: false,
    },
  ],
};

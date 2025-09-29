// eslint-disable-next-line @typescript-eslint/no-require-imports
const plugin = require('@typescript-eslint/eslint-plugin');

const rules = Object.entries(plugin.rules).map(([name, rule]) => {
  return {
    meta: { ...rule.meta },
    name,
  };
});

function createCategory(label, rules, additionalItems = []) {
  return {
    items: [
      ...rules.map(rule => {
        return {
          id: rule.name,
          label: rule.name,
          type: 'doc',
        };
      }),
      ...additionalItems,
    ],
    label,
    type: 'category',
  };
}

module.exports = {
  rulesSidebar: [
    'README',
    {
      ...createCategory('Rules', rules),
      collapsed: false,
    },
  ],
};

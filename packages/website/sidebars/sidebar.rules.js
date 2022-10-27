const globby = require('globby');
const path = require('path');

const plugin = require('@typescript-eslint/eslint-plugin');

const rules = Object.entries(plugin.rules).map(([name, rule]) => {
  return {
    name: name,
    meta: { ...rule.meta },
  };
});

const deprecatedRules = new Set(rules.filter(rule => rule.meta.deprecated));

const formattingRules = new Set(
  rules.filter(rule => !rule.meta.deprecated && rule.meta.type === 'layout'),
);

const extensionRules = new Set(
  rules.filter(
    rule => rule.meta.docs?.extendsBaseRule && !formattingRules.has(rule),
  ),
);

const typescriptRules = rules.filter(
  rule =>
    !rule.meta.deprecated &&
    !extensionRules.has(rule) &&
    !deprecatedRules.has(rule) &&
    !formattingRules.has(rule),
);

const paths = globby
  .sync('*.md', {
    cwd: path.join(__dirname, '../../eslint-plugin/docs/rules'),
  })
  .map(item => {
    return {
      name: path.basename(item, '.md'),
    };
  })
  .filter(item => {
    return (
      item.name !== 'README' &&
      item.name !== 'TEMPLATE' &&
      !rules.some(a => a.name === item.name)
    );
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
      ...createCategory('TypeScript Rules', Array.from(typescriptRules)),
      collapsed: false,
    },
    {
      ...createCategory('Extension Rules', Array.from(extensionRules)),
      collapsed: false,
    },
    createCategory('Formatting Rules', Array.from(formattingRules)),
    createCategory('Deprecated Rules', [
      ...Array.from(deprecatedRules),
      ...paths,
    ]),
  ],
};

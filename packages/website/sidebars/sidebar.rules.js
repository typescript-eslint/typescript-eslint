const globby = require('globby');
const path = require('path');

const plugin = require('@typescript-eslint/eslint-plugin');

const rules = Object.entries(plugin.rules).map(([name, rule]) => {
  return {
    name: name,
    meta: { ...rule.meta },
  };
});

const notDeprecatedRules = rules.filter(rule => !rule.meta.deprecated);

const deprecatedRules = rules.filter(rule => rule.meta.deprecated);

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

module.exports = {
  someSidebar: [
    'README',
    {
      type: 'category',
      label: 'Rules',
      collapsible: true,
      collapsed: false,
      items: notDeprecatedRules.map(item => {
        return {
          type: 'doc',
          id: item.name,
          label: item.name,
        };
      }),
    },
    {
      type: 'category',
      label: 'Deprecated',
      collapsible: true,
      collapsed: false,
      items: [...deprecatedRules, ...paths].map(item => {
        return {
          type: 'doc',
          id: item.name,
          label: item.name,
        };
      }),
    },
  ],
};

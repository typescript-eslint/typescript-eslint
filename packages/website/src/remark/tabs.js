const toString = require('mdast-util-to-string');
const visit = require('unist-util-visit');

function renderTabs(tabs, nodes) {
  let tabNodes = [];

  tabNodes.push({
    type: 'jsx',
    value: `<Tabs>`,
  });

  tabs.forEach((tab, id) => {
    const node = nodes[tab.start];
    const label = toString(node);

    tabNodes.push({
      type: 'jsx',
      value: `<TabItem label="${label}" value="tab${id + 1}">`,
    });

    tabNodes.push(...nodes.slice(tab.start + 1, tab.end));

    tabNodes.push({
      type: 'jsx',
      value: `</TabItem>`,
    });
  });

  tabNodes.push({
    type: 'jsx',
    value: `</Tabs>`,
  });

  return tabNodes;
}

function findTabs(node, index, parent) {
  const tabs = [];

  let depth = null;

  let tab;
  const { children } = parent;

  while (++index < children.length) {
    const child = children[index];

    if (child.type === 'heading') {
      if (depth == null) {
        depth = child.depth;
      }

      if (child.depth < depth) {
        tab.end = index;
        break;
      }

      if (child.depth === depth) {
        if (tab) {
          tab.end = index;
        }

        tab = {};
        tab.start = index;
        tab.end = children.length;
        tabs.push(tab);
      }
    }

    if (child.type === 'comment' && child.value.trim() === '/tabs') {
      if (tab) {
        tab.end = index;
      }
      break;
    }
  }

  return tabs;
}

function tabs() {
  return root => {
    let foundTabs = false;
    let alreadyImported = false;

    visit(root, (node, index, parent) => {
      if (node.type === 'import') {
        if (node.value.includes('@theme/Tabs')) {
          alreadyImported = true;
        }
      } else if (node.type === 'comment') {
        if (node.value.trim() === 'tabs') {
          const tabs = findTabs(node, index, parent);

          if (tabs.length > 0) {
            const start = tabs[0].start;
            const end = tabs[tabs.length - 1].end;

            foundTabs = true;
            const newChildren = renderTabs(tabs, parent.children);
            parent.children.splice(start, end - start, ...newChildren);

            return index + newChildren.length;
          }
        }
      }
    });

    if (foundTabs && !alreadyImported) {
      root.children.unshift({
        type: 'import',
        value: "import TabItem from '@theme/TabItem';",
      });

      root.children.unshift({
        type: 'import',
        value: "import Tabs from '@theme/Tabs';",
      });
    }
  };
}

module.exports = tabs;

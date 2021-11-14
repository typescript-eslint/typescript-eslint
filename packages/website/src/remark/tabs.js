/*
 * original code https://github.com/mccleanp/remark-docusaurus-tabs
 *
 * MIT License
 *
 * Copyright (c) 2020 Paul McClean
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
function tabs() {
  function renderTabs(tabs, nodes) {
    function getLabel(root) {
      return root.children
        .map(item => {
          switch (item.type) {
            case 'text':
            case 'inlineCode':
              return item.value;
            case 'strong':
            case 'emphasis':
            case 'delete':
              return getLabel(item);
            default:
              console.error(item);
              throw new Error(`[TABS] unsupported type ${item.type}`);
          }
        })
        .join('')
        .trim();
    }

    let tabNodes = [];

    tabNodes.push({
      type: 'jsx',
      value: `<Tabs>`,
    });

    tabs.forEach(tab => {
      const node = nodes[tab.start];
      const label = getLabel(node);
      const id = node.data.id;

      tabNodes.push({
        type: 'jsx',
        value: `<TabItem label="${label}" value="${id}">`,
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

    let depth;

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
        tab.end = index;
        break;
      }
    }

    return tabs;
  }

  return tree => {
    let foundTabs = false;

    const { children } = tree;
    let index = -1;
    while (++index < children.length) {
      const child = children[index];
      if (child.type === 'comment' && child.value.trim() === 'tabs') {
        const tabs = findTabs(child, index, tree);
        const start = tabs[0].start;
        const end = tabs[tabs.length - 1].end;

        if (tabs.length > 0) {
          foundTabs = true;
          const nodes = renderTabs(tabs, children);
          children.splice(start, end - start, ...nodes);
          index += nodes.length;
        }
      }
    }

    if (foundTabs) {
      children.unshift({
        type: 'import',
        value: "import TabItem from '@theme/TabItem';",
      });

      children.unshift({
        type: 'import',
        value: "import Tabs from '@theme/Tabs';",
      });
    }
  };
}

module.exports = tabs;

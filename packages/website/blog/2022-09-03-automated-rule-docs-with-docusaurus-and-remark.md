---
authors:
  - image_url: https://www.joshuakgoldberg.com/img/josh.jpg
    name: Josh Goldberg
    title: TypeScript ESLint Maintainer
    url: https://github.com/JoshuaKGoldberg
description: How TypeScript ESLint generates much of the docs pages for each of its lint rules.
slug: automated-rule-docs-with-docusaurus-and-remark
tags: [documentation, docusaurus, remark]
title: Automated Rule Docs With Docusaurus and Remark
---

The TypeScript ESLint website at https://typescript-eslint.io is the canonical location for documentation on how to use ESLint on TypeScript code.
The site includes a documentation page for each of the over 100 ESLint rules exposed by its ESLint plugin.
Each of those rule docs pages includes a description of the rule, any options it allows, links to its source code, and other important information about its usage.

Until recently, keeping descriptions of rules consistent between their source code and docs pages was a cumbersome manual chore.
We'd written a suite of Jest tests to verify they matched -- but those tests didn't capture everything, often failed with cryptic messages, and were missed by less experienced contributors.

We're happy to say that now, we've overhauled rule docs pages to automatically generate metadata information from rule source code.
That means the pages always display up-to-date information without developers needing to manually rewrite docs on rule changes.
Hooray! 🎉

This blog post gives an overview of the [chore to generate rule docs options automatically](https://github.com/typescript-eslint/typescript-eslint/pull/5386).

<!--truncate-->

## Tools in Play

https://typescript-eslint.io is built on [Docusaurus](https://docusaurus.io), a powerful static site generator tailored to documentation websites and blogs.
Docusaurus comes with sensible defaults, extensive configuration options, and thoroughly fleshed out documentation.
We're big fans.
❤️

[Docusaurus blogs](https://docusaurus.io/docs/blog) support writing blog posts in [MDX](https://mdxjs.com), a rich superset of Markdown that allows inserting JSX components.
Docusaurus supports MDX using [remark](https://remark.js.org), a Markdown processor powered by plugins.
Remark plugins take in Markdown files in a format known as an Abstract Syntax Tree (or AST), and output modified versions of those ASTs.

You can see what Remark's AST equivalent of a Markdown document looks like by visiting [AST Explorer](https://astexplorer.net) and selecting the Markdown language.

![A screenshot of the astexplorer.net interface. The left pane shows a snippet of Markdown source with one paragraph highlighted. The right pane shows its AST structure in a collapsible JSON format, with the paragraph's corresponding AST node automatically highlighted.](./ast-explorer-remark.png)

> _astexplorer.net showing the default snippet with the paragraph highlighted_

Lastly, Remark and several other packages around parsing and modifying ASTs are built on the [`unified` project](https://github.com/unifiedjs/unified).
The unified AST format adheres to the [`unist` specification](https://github.com/syntax-tree/unist).

### Custom Remark Plugins

Remark allows projects to register any number of custom Remark plugins for transforming Markdown contents.
For example, typescript-eslint.io already uses [`remark-docusaurus-tabs`](https://www.npmjs.com/package/remark-docusaurus-tabs)

The relevant parts of [typescript-eslint.io's Docusaurus config](https://github.com/typescript-eslint/typescript-eslint/blob/39829c01906f326fec94e9b3a5fdb1730eb02002/packages/website/docusaurusConfig.ts) specify the `remark-docusaurus-tabs` plugin and the custom `./plugins/generated-rule-docs` plugin:

```ts
import tabsPlugin from 'remark-docusaurus-tabs';

import { generatedRuleDocs } from './plugins/generated-rule-docs';

export = {
  presets: [
    [
      'classic',
      {
        beforeDefaultRemarkPlugins: [tabsPlugin, generatedRuleDocs],
      },
    ],
  ],
};
```

Those plugins are specified inside the [`beforeDefaultRemarkPlugins`](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog#beforeDefaultRemarkPlugins) option, so they run before the Docusaurus internal Remark plugin generates the tables of contents for the docs pages. This allows the headings that our custom plugin inserts to be present in the table of contents.

## Automated Changes

The typescript-eslint.io website's documentation contents are all stored as `.md`, or Markdown files.
Most of those `.md` files correspond to a lint rule under the same name.
The [`@typescript-eslint/no-for-in-array` rule](https://typescript-eslint.io/rules/no-for-in-array), for example, is documented in the [`no-for-in-array.md` file](https://github.com/typescript-eslint/typescript-eslint/blob/39829c01906f326fec94e9b3a5fdb1730eb02002/packages/eslint-plugin/docs/rules/no-for-in-array.md).

Our Remark plugin:

1. Takes in the AST and metadata of a documentation file
2. Tries to find the corresponding TypeScript ESLint rule for the file's name
3. If one was found, applies a set of modifications to the AST

The rest of this section of the blog post will give a high-level overview of what kinds of AST modifications take place.
You can dive into [the source code of our plugin](https://github.com/typescript-eslint/typescript-eslint/blob/39829c01906f326fec94e9b3a5fdb1730eb02002/packages/website/plugins/generated-rule-docs.ts) for more details if you're curious.

### Matching Docs to Rules

The [`@typescript-eslint/eslint-plugin` package](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin) exports an object with a `rules` property containing all the TypeScript ESLint lint rules.
Properties have names like `"array-type"` that map to the rule object exported by files like [`array-type.ts`](https://github.com/typescript-eslint/typescript-eslint/blob/39829c01906f326fec94e9b3a5fdb1730eb02002/packages/eslint-plugin/src/rules/array-type.ts#L86).

Remark plugins are able to access the name of the file they're modifying by accessing `file.stem`, as in the following code snippet.
Names of rule docs files can then be matched up with rules exported by the ESLint plugin object.
Docs files that don't correspond to a rule don't have any AST modifications done in this plugin:

```ts
import * as eslintPlugin from '@typescript-eslint/eslint-plugin';
import type { Plugin } from 'unified';

export const generatedRuleDocs: Plugin = () => {
  return async (root, file) => {
    if (file.stem == null) {
      return;
    }

    const rule = eslintPlugin.rules[file.stem];
    const meta = rule?.meta;
    if (!meta?.docs) {
      return;
    }

    // ... (rest of the plugin here!) ...
  };
};
```

### Removing an AST Node

The first AST modification our plugin does is to remove a node that exists in `.md` docs files but doesn't need to exist in the typescript-eslint.io website.
The `.md` source files start with a callout to let people know to go to the website:

```md
> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/adjacent-overload-signatures** for documentation.
```

That blockquote and other root-level nodes are stored as an array under the `children` property of the AST root node:

```ts
root.children.splice(
  root.children.findIndex(v => v.type === 'blockquote'),
  1,
);
```

:::info Historical context
Before typescript-eslint.io existed, the canonical documentation URL for TypeScript ESLint's lint rules was the GitHub link to their corresponding `.md` file.
Now that we have a rich documentation site and have automated much of what used to be in those `.md` files, they're no longer a good place to look for documentation.
:::

### Adding an AST Node

Most of the modifications in our plugin are to add more nodes to the AST.
The rule's `meta.docs` property contains a plethora of information about the rule.

For example, `meta.docs.description` is a plain-text description of what the rule does.
We add a blockquote containing the rule's description as text.
Inline code (text surrounded by `` ` `` backticks) is rendered as a Markdown `inlineCode` node:

```ts
root.children.unshift({
  children: [
    {
      children: meta.docs.description
        .split(/`(.+?)`/)
        .map((value, index, array) => ({
          type: index % 2 === 0 ? 'text' : 'inlineCode',
          value: index === array.length - 1 ? `${value}.` : value,
        })),
      type: 'paragraph',
    },
  ],
  type: 'blockquote',
});
```

For example, [typescript-eslint.io/rules/array-type](https://typescript-eslint.io/rules/array-type) has the equivalent of this blockquote added now:

```md
> Require using either `T[]` or `Array<T>` for arrays.
```

Quite a few other modifications to the AST involve adding AST nodes that are expected to exist on the page.
It ensures expected headings such as _`## How to Use`_ and _`## Options`_ exist, inserting them if not.

### Adding a JSX AST Node

Remember when the concept of MDX files including JSX tags was mentioned earlier in this blog post, and then never referenced again?
We did end up injecting one React component as a JSX tag in the plugin.

In our [MDX component configuration](https://github.com/typescript-eslint/typescript-eslint/blob/39829c01906f326fec94e9b3a5fdb1730eb02002/packages/website/src/theme/MDXComponents/index.tsx#L2), `'rule-attributes'` maps to a [`RulesAttribute` React component](https://github.com/typescript-eslint/typescript-eslint/blob/39829c01906f326fec94e9b3a5fdb1730eb02002/packages/website/src/theme/MDXComponents/RuleAttributes.tsx#L7) that renders a list of rule metadata.
That list is a little too complex to easily render directly in Markdown.

MDX builds on Remark and additionally supports nodes of type `'jsx'` that include raw JSX syntax:

```ts
const attributesH2Index = root.children.findIndex(
  child => nodeIsHeading(child) && child.depth === 2,
);

root.children.splice(attributesH2Index, 0, {
  type: 'jsx',
  value: `<rule-attributes name="${file.stem}" />`,
});

function nodeIsHeading(node: unist.Node): node is mdast.Heading {
  return node.type === 'heading';
}
```

## What's Next

We're relieved that we no longer have to manually update scores of documentation on every code change.
This plugin's automation frees up our documentation time to focus on improving the contents of the pages themselves.
You can query our [issue tracker](https://github.com/typescript-eslint/typescript-eslint/issues) for [issues with the `documentation` label](https://github.com/typescript-eslint/typescript-eslint/issues?q=is%3Aopen+is%3Aissue+label%3Adocumentation) to see what's coming up next.
I'm excited to focus in particular on [Docs: Proofread rule docs for clarity (#4861)](https://github.com/typescript-eslint/typescript-eslint/issues/4861).

## Appreciation and Thanks

We'd like to extend thanks to [Joshua Chen](https://github.com/Josh-Cena), one of the Docusaurus maintainers who also has been helping us with Docusaurus — and helped proofread [this blog post's PR](https://github.com/typescript-eslint/typescript-eslint/pull/5593).
Without Josh, this change would have taken us a great deal longer (if we'd have been able to tackle it at all).
Thanks Josh! 🤗

## Supporting TypeScript ESLint

If you enjoyed this blog post and/or or use TypeScript ESLint, please consider [supporting us on Open Collective](https://opencollective.com/typescript-eslint).
We're a small volunteer team and could use your support to make the ESLint experience on TypeScript great.
Thanks! 💖

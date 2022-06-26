import type { MDXPlugin } from '@docusaurus/mdx-loader';
import type { Options as PluginContentDocsOptions } from '@docusaurus/plugin-content-docs';
import type { Options as PresetClassicOptions } from '@docusaurus/preset-classic';
import type { UserThemeConfig as ThemeCommonConfig } from '@docusaurus/theme-common';
import type { UserThemeConfig as AlgoliaThemeConfig } from '@docusaurus/theme-search-algolia';
import type { Config } from '@docusaurus/types';

import { rulesMeta } from './rulesMeta';
import npm2yarnPlugin from '@docusaurus/remark-plugin-npm2yarn';
import tabsPlugin from 'remark-docusaurus-tabs';
import { addRuleAttributesList } from './plugins/add-rule-attributes-list';

const remarkPlugins: MDXPlugin[] = [[npm2yarnPlugin, { sync: true }]];

const beforeDefaultRemarkPlugins: MDXPlugin[] = [[tabsPlugin, {}]];

const githubUrl = 'https://github.com/typescript-eslint/typescript-eslint';

const presetClassicOptions: PresetClassicOptions = {
  docs: {
    id: 'rules-docs',
    path: '../eslint-plugin/docs/rules',
    sidebarPath: require.resolve('./sidebars/sidebar.rules.js'),
    routeBasePath: 'rules',
    editUrl: `${githubUrl}/edit/main/packages/website/`,
    beforeDefaultRemarkPlugins,
    remarkPlugins: [...remarkPlugins, [addRuleAttributesList, {}]],
    exclude: ['TEMPLATE.md'],
    breadcrumbs: false,
  },
  // TODO enable this
  blog: false,
  pages: {
    beforeDefaultRemarkPlugins,
    remarkPlugins,
  },
  theme: {
    customCss: require.resolve('./src/css/custom.css'),
  },
};

const pluginContentDocsOptions: PluginContentDocsOptions = {
  id: 'base-docs',
  path: '../../docs',
  routeBasePath: 'docs',
  sidebarPath: require.resolve('./sidebars/sidebar.base.js'),
  editUrl: `${githubUrl}/edit/main/packages/website/`,
  beforeDefaultRemarkPlugins,
  remarkPlugins,
  breadcrumbs: false,
};

const themeConfig: ThemeCommonConfig & AlgoliaThemeConfig = {
  algolia: {
    appId: 'BH4D9OD16A',
    apiKey: '1ad6b47d4e742c4c0653877b5511c602',
    indexName: 'typescript-eslint',
  },
  metadata: [
    { name: 'msapplication-TileColor', content: '#443fd4' },
    { name: 'theme-color', content: '#443fd4' },
    { name: 'twitter:image:alt', content: 'Typescript-eslint logo' },
  ],
  image: 'img/logo-twitter-card.png',
  navbar: {
    title: 'TypeScript ESLint',
    // hideOnScroll: true,
    logo: {
      alt: 'TypeScript ESLint logo',
      height: '32px',
      src: 'img/logo.svg',
      width: '32px',
    },
    // style: 'primary',
    items: [
      {
        to: 'docs/',
        activeBasePath: 'docs',
        label: 'Getting started',
        position: 'left',
      },
      {
        to: 'rules/',
        activeBasePath: 'rules',
        label: 'Rules',
        position: 'left',
      },
      {
        to: 'play',
        activeBasePath: 'play',
        position: 'right',
        label: 'Playground',
      },
      {
        href: githubUrl,
        position: 'right',
        className: 'header-github-link',
        'aria-label': 'GitHub repository',
      },
    ],
  },
  footer: {
    logo: {
      alt: 'Deploys by Netlify',
      src: 'https://www.netlify.com/img/global/badges/netlify-dark.svg',
      href: 'https://www.netlify.com',
    },
    links: [
      {
        title: 'Community',
        items: [
          {
            label: 'Stack Overflow',
            href: 'https://stackoverflow.com/questions/tagged/typescript-eslint',
          },
          {
            label: 'Twitter',
            href: 'https://twitter.com/tseslint',
          },
        ],
      },
      {
        title: 'More',
        items: [
          {
            label: 'GitHub',
            href: 'https://github.com/typescript-eslint/typescript-eslint',
          },
          {
            label: 'Report issue',
            href: 'https://github.com/typescript-eslint/typescript-eslint/issues/new/choose',
          },
        ],
      },
    ],
    // style: 'primary',
    copyright: `Copyright © ${new Date().getFullYear()} TypeScript ESLint, Inc. Built with Docusaurus.`,
  },
  prism: {
    theme: {
      plain: {},
      styles: [],
    },
    additionalLanguages: ['ignore'],
    magicComments: [
      {
        className: 'theme-code-block-highlighted-line',
        line: 'highlight-next-line',
        block: { start: 'highlight-start', end: 'highlight-end' },
      },
      {
        className: 'code-block-removed-line',
        line: 'Remove this line',
        block: { start: 'Removed lines start', end: 'Removed lines end' },
      },
      {
        className: 'code-block-added-line',
        line: 'Add this line',
        block: { start: 'Added lines start', end: 'Added lines end' },
      },
    ],
  },
  tableOfContents: {
    maxHeadingLevel: 4,
    minHeadingLevel: 2,
  },
};

const config: Config = {
  title: 'TypeScript ESLint',
  tagline: 'Tooling which enables ESLint to support TypeScript',
  url: 'https://typescript-eslint.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn', // If Markdown link resolution fails, it will result in a broken link anyways
  favicon: 'img/favicon.ico',
  organizationName: 'typescript-eslint',
  projectName: 'typescript-eslint',
  clientModules: [require.resolve('./src/clientModules.js')],
  presets: [['classic', presetClassicOptions]],
  customFields: {
    rules: rulesMeta,
  },
  plugins: [
    require.resolve('./webpack.plugin'),
    ['@docusaurus/plugin-content-docs', pluginContentDocsOptions],
  ],
  themeConfig,
  // Misleading API name, but these are just <link> tags
  stylesheets: [
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/img/favicon/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/img/favicon/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/img/favicon/favicon-16x16.png',
    },
    {
      rel: 'manifest',
      href: '/img/favicon/site.webmanifest',
    },
  ],
};

export = config;

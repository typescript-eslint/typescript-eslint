import type { MDXPlugin } from '@docusaurus/mdx-loader';
import type { Options as PluginRedirectOptions } from '@docusaurus/plugin-client-redirects';
import type { Options as PluginContentDocsOptions } from '@docusaurus/plugin-content-docs';
import type { Options as PluginPwaOptions } from '@docusaurus/plugin-pwa';
import type { Options as PresetClassicOptions } from '@docusaurus/preset-classic';
import type { UserThemeConfig as ThemeCommonConfig } from '@docusaurus/theme-common';
import type { UserThemeConfig as AlgoliaThemeConfig } from '@docusaurus/theme-search-algolia';
import type { Config } from '@docusaurus/types';

import npm2yarnPlugin from '@docusaurus/remark-plugin-npm2yarn';
import { version } from '@typescript-eslint/parser/package.json';

import { blogFooter } from './plugins/blog-footer';
import { generatedRuleDocs } from './plugins/generated-rule-docs';
import { rulesMeta } from './rulesMeta';

const remarkPlugins: MDXPlugin[] = [[npm2yarnPlugin, { sync: true }]];

const githubUrl = 'https://github.com/typescript-eslint/typescript-eslint';

const currentMajorVersion =
  process.env.CURRENT_MAJOR_VERSION &&
  Number(process.env.CURRENT_MAJOR_VERSION);

const presetClassicOptions: PresetClassicOptions = {
  blog: {
    blogSidebarCount: 'ALL',
    // Allow Docusaurus TOC remark plugin to pick up the injected H2
    beforeDefaultRemarkPlugins: [blogFooter],
    remarkPlugins,
  },
  docs: {
    beforeDefaultRemarkPlugins: [generatedRuleDocs],
    breadcrumbs: false,
    editUrl: `${githubUrl}/edit/main/packages/website/`,
    exclude: ['TEMPLATE.md'],
    id: 'rules-docs',
    path: '../eslint-plugin/docs/rules',
    remarkPlugins,
    routeBasePath: 'rules',
    sidebarPath: require.resolve('./sidebars/sidebar.rules.js'),
  },
  pages: {
    remarkPlugins,
  },
  theme: {
    customCss: require.resolve('./src/css/custom.css'),
  },
};

const pluginContentDocsOptions: PluginContentDocsOptions = {
  breadcrumbs: false,
  editUrl: `${githubUrl}/edit/main/packages/website/`,
  id: 'base-docs',
  path: '../../docs',
  remarkPlugins,
  routeBasePath: '/',
  sidebarPath: require.resolve('./sidebars/sidebar.base.js'),
};

const themeConfig: AlgoliaThemeConfig & ThemeCommonConfig = {
  algolia: {
    apiKey: '74d42ed10d0f7b327d74d774570035c7',
    appId: 'N1HUB2TU6A',
    indexName: 'typescript-eslint',
  },
  announcementBar:
    currentMajorVersion &&
    Number(version[0].split('.')[0]) < currentMajorVersion
      ? {
          content: [
            'This documentation is for an older major version of typescript-eslint.',
            '<br />',
            'It is no longer maintained or supported. It may crash with the latest versions of TypeScript.',
            '<hr />',
            'Using the latest version of typescript-eslint is strongly recommended for',
            'getting the latest rule features and fixes, ',
            'supporting the latest TypeScript features and syntax, and',
            'continuous performance and stability improvements.',
            '<hr />',
            'Please visit <a href="https://typescript-eslint.io">typescript-eslint.io</a> for the latest version\'s documentation.',
          ].join('\n'),
          id: 'old-version-announcement',
          isCloseable: false,
        }
      : undefined,
  colorMode: {
    respectPrefersColorScheme: true,
  },
  footer: {
    copyright: `Copyright © ${new Date().getFullYear()} typescript-eslint, Inc. Built with Docusaurus.`,
    links: [
      {
        items: [
          {
            className: 'image-link bluesky-link social-link-icon',
            href: 'https://bsky.app/profile/typescript-eslint.io',
            label: 'Bluesky',
            rel: 'me noopener',
          },
          {
            className: 'image-link discord-link social-link-icon',
            href: 'https://discord.gg/FSxKq8Tdyg',
            label: 'Discord',
            rel: 'noopener',
          },
          {
            className: 'image-link mastodon-link social-link-icon',
            href: 'https://fosstodon.org/@tseslint',
            label: 'Mastodon',
            rel: 'me noopener',
          },
          {
            className: 'image-link stack-overflow-link social-link-icon',
            href: 'https://stackoverflow.com/questions/tagged/typescript-eslint',
            label: 'Stack Overflow',
          },
        ],
        title: 'Community',
      },
      {
        items: [
          {
            className: 'github-link image-link social-link-icon',
            href: githubUrl,
            label: 'GitHub',
            rel: 'me noopener',
          },
          {
            className: 'bug-report-link image-link social-link-icon',
            href: `${githubUrl}/issues/new/choose`,
            label: 'Report issue',
          },
          {
            className: 'open-collective-link image-link social-link-icon',
            href: 'https://opencollective.com/typescript-eslint/contribute',
            label: 'Open Collective',
          },
        ],
        title: 'More',
      },
    ],
    logo: {
      alt: 'Deploys by Netlify',
      href: 'https://www.netlify.com',
      src: 'https://www.netlify.com/img/global/badges/netlify-dark.svg',
    },
  },
  image: 'img/logo-twitter-card.png',
  metadata: [
    { content: '#443fd4', name: 'msapplication-TileColor' },
    { content: '#443fd4', name: 'theme-color' },
    { content: 'Typescript-eslint logo', name: 'twitter:image:alt' },
  ],
  navbar: {
    items: [
      {
        label: 'Docs',
        position: 'left',
        to: 'getting-started/',
      },
      {
        label: 'Rules',
        position: 'left',
        to: 'rules/',
      },
      {
        label: 'Blog',
        position: 'left',
        to: 'blog/',
      },
      {
        href: `https://github.com/typescript-eslint/typescript-eslint/releases/tag/v${version}`,
        label: `v${version}`,
        position: 'right',
      },
      {
        activeBasePath: 'play',
        label: 'Playground',
        position: 'right',
        to: 'play',
      },
      {
        'aria-label': 'GitHub repository',
        className: 'github-link image-link header-image-link',
        href: githubUrl,
        position: 'right',
      },
      {
        'aria-label': 'Discord',
        className: 'discord-link image-link header-image-link',
        href: 'https://discord.com/invite/FSxKq8Tdyg',
        position: 'right',
      },
    ],
    logo: {
      alt: '',
      height: '32px',
      src: 'img/logo.svg',
      width: '32px',
    },
    title: 'typescript-eslint',
  },
  prism: {
    additionalLanguages: ['bash', 'diff', 'ignore'],
    magicComments: [
      {
        block: { end: 'highlight-end', start: 'highlight-start' },
        className: 'theme-code-block-highlighted-line',
        line: 'highlight-next-line',
      },
      {
        block: { end: 'Removed lines end', start: 'Removed lines start' },
        className: 'code-block-removed-line',
        line: 'Remove this line',
      },
      {
        block: { end: 'Added lines end', start: 'Added lines start' },
        className: 'code-block-added-line',
        line: 'Add this line',
      },
    ],
    theme: {
      plain: {},
      styles: [],
    },
  },
  tableOfContents: {
    maxHeadingLevel: 4,
    minHeadingLevel: 2,
  },
};

const pluginPwaOptions: PluginPwaOptions = {
  debug: true,
  offlineModeActivationStrategies: [
    'appInstalled',
    'queryString',
    'standalone',
  ],
  pwaHead: [
    {
      href: '/img/logo.svg',
      rel: 'icon',
      tagName: 'link',
    },
    {
      href: '/manifest.json',
      rel: 'manifest',
      tagName: 'link',
    },
    {
      content: '#443FD4',
      name: 'theme-color',
      tagName: 'meta',
    },
    {
      content: 'yes',
      name: 'apple-mobile-web-app-capable',
      tagName: 'meta',
    },
    {
      content: '#443FD4',
      name: 'apple-mobile-web-app-status-bar-style',
      tagName: 'meta',
    },
    {
      href: '/img/logo.png',
      rel: 'apple-touch-icon',
      tagName: 'link',
    },
    {
      color: '#443FD4',
      href: '/img/logo.png',
      rel: 'mask-icon',
      tagName: 'link',
    },
    {
      content: '/img/logo.png',
      name: 'msapplication-TileImage',
      tagName: 'meta',
    },
    {
      content: '#443FD4',
      name: 'msapplication-TileColor',
      tagName: 'meta',
    },
  ],
};

const redirects: PluginRedirectOptions = {
  redirects: [
    {
      from: '/getting-started/typed-linting/monorepos',
      to: '/troubleshooting/typed-linting/monorepos',
    },
    {
      from: '/linting/configs',
      to: '/users/configs',
    },
    {
      from: '/linting/troubleshooting',
      to: '/troubleshooting/faqs/general',
    },
    {
      from: '/linting/troubleshooting/formatting',
      to: '/users/what-about-formatting',
    },
    {
      from: '/linting/troubleshooting/typed-linting/Performance-troubleshooting',
      to: '/troubleshooting/typed-linting/performance',
    },
    {
      from: '/linting/troubleshooting/tslint',
      to: '/users/what-about-tslint',
    },
    {
      from: '/linting/typed-linting',
      to: '/getting-started/typed-linting',
    },
    {
      from: '/troubleshooting',
      to: '/troubleshooting/faqs/general',
    },
    {
      from: '/troubleshooting/faqs',
      to: '/troubleshooting/faqs/general',
    },
    {
      from: '/troubleshooting/formatting',
      to: '/users/what-about-formatting',
    },
    {
      from: '/troubleshooting/tslint',
      to: '/users/what-about-tslint',
    },
    {
      from: '/troubleshooting/performance-troubleshooting',
      to: '/troubleshooting/typed-linting/performance',
    },
    {
      from: '/linting/troubleshooting/typed-linting/Monorepos',
      to: '/troubleshooting/typed-linting/monorepos',
    },
    {
      from: '/maintenance/issues/rule-deprecations',
      to: '/maintenance/issues/rule-deprecations-and-deletions',
    },
  ],
};

const config: Config = {
  baseUrl: '/',
  future: {
    experimental_faster: true,
  },
  tagline: 'Powerful static analysis for JavaScript and TypeScript.',
  title: 'typescript-eslint',
  url: 'https://typescript-eslint.io',

  // See https://github.com/typescript-eslint/typescript-eslint/pull/8209#discussion_r1444033533
  clientModules: [require.resolve('./src/clientModules.js')],

  customFields: {
    rules: rulesMeta,
  },
  favicon: 'img/favicon.ico',
  onBrokenAnchors: 'ignore',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  organizationName: 'typescript-eslint',
  plugins: [
    './plugins/recent-blog-posts/index.ts',
    ...[
      'ast-spec',
      'project-service',
      'rule-schema-to-typescript-types',
      'tsconfig-utils',
      'type-utils',
    ].map(packageName => [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: [`../${packageName}/src/index.ts`],
        enumMembersFormat: 'table',
        exclude: '**/*.d.ts',
        excludeExternals: true,
        groupOrder: ['Functions', 'Variables', '*'],
        hidePageTitle: true,
        id: `typedoc-generated-${packageName}`,
        indexFormat: 'table',
        out: `../../docs/packages/${packageName}/generated`,
        outputFileStrategy: 'modules',
        parametersFormat: 'table',
        plugin: [require.resolve('./tools/typedoc-plugin-no-inherit-fork.mjs')],
        propertiesFormat: 'table',
        readme: 'none',
        tsconfig: `../${packageName}/tsconfig.json`,
        typeDeclarationFormat: 'table',
        useCodeBlocks: true,
      },
    ]),
    require.resolve('./webpack.plugin'),
    ['@docusaurus/plugin-content-docs', pluginContentDocsOptions],
    ['@docusaurus/plugin-pwa', pluginPwaOptions],
    ['@docusaurus/plugin-client-redirects', redirects],
  ],
  presets: [['classic', presetClassicOptions]],
  projectName: 'typescript-eslint',
  themeConfig,
  // Misleading API name, but these are just <link> tags
  stylesheets: [
    {
      href: '/img/favicon/apple-touch-icon.png',
      rel: 'apple-touch-icon',
      sizes: '180x180',
    },
    {
      href: '/img/favicon/favicon-32x32.png',
      rel: 'icon',
      sizes: '32x32',
      type: 'image/png',
    },
    {
      href: '/img/favicon/favicon-16x16.png',
      rel: 'icon',
      sizes: '16x16',
      type: 'image/png',
    },
    {
      href: '/img/favicon/site.webmanifest',
      rel: 'manifest',
    },
    {
      color: '#2656c7',
      href: '/img/favicon/safari-pinned-tab.svg',
      rel: 'mask-icon',
    },
  ],
};

export default config;

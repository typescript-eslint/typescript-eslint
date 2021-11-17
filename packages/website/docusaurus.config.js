// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const remarkPlugins = [
  [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
];

const githubUrl = 'https://github.com/typescript-eslint/typescript-eslint';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'TypeScript ESLint',
  tagline: 'Tooling which enables ESLint to support TypeScript',
  url: 'https://typescript-eslint.io',
  baseUrl: '/',
  onBrokenLinks: 'warn', // TODO: 'throw'
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'typescript-eslint',
  projectName: 'typescript-eslint',
  clientModules: [require.resolve('./src/clientModules.js')],
  plugins: [
    '@docusaurus/plugin-debug',
    [
      '@docusaurus/theme-classic',
      {
        customCss: require.resolve('./src/css/custom.css'),
      },
    ],
    ['@docusaurus/plugin-content-pages', { remarkPlugins }],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'rules-docs',
        path: '../eslint-plugin/docs/rules',
        sidebarPath: require.resolve('./sidebars/sidebar.rules.js'),
        routeBasePath: 'rules',
        editUrl: `${githubUrl}/edit/master/packages/website/`,
        remarkPlugins,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'base-docs',
        path: '../../docs',
        routeBasePath: 'docs',
        sidebarPath: require.resolve('./sidebars/sidebar.base.js'),
        editUrl: `${githubUrl}/edit/master/packages/website/`,
        remarkPlugins,
      },
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/theme-common').UserThemeConfig} */
    ({
      // sidebarCollapsible: false,
      metadatas: [
        { name: 'msapplication-TileColor', content: '#443fd4' },
        { name: 'theme-color', content: '#443fd4' },
      ],
      navbar: {
        title: 'TypeScript ESLint',
        // hideOnScroll: true,
        logo: {
          alt: 'TypeScript ESLint',
          src: 'img/logo.svg',
          // srcDark: 'img/logo-dark.svg',
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
        // style: 'primary',
        copyright: `Copyright © ${new Date().getFullYear()} TypeScript ESLint, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['ignore'],
      },
      tableOfContents: {
        maxHeadingLevel: 4,
        minHeadingLevel: 2,
      },
    }),
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

module.exports = config;

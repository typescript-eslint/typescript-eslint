// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const remarkPlugins = [
  [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
];

const beforeDefaultRemarkPlugins = [[require('remark-docusaurus-tabs'), {}]];

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
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          id: 'rules-docs',
          path: '../eslint-plugin/docs/rules',
          sidebarPath: require.resolve('./sidebars/sidebar.rules.js'),
          routeBasePath: 'rules',
          editUrl: `${githubUrl}/edit/main/packages/website/`,
          beforeDefaultRemarkPlugins,
          remarkPlugins,
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
      }),
    ],
  ],
  plugins: [
    require.resolve('./webpack.plugin'),
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'base-docs',
        path: '../../docs',
        routeBasePath: 'docs',
        sidebarPath: require.resolve('./sidebars/sidebar.base.js'),
        editUrl: `${githubUrl}/edit/main/packages/website/`,
        beforeDefaultRemarkPlugins,
        remarkPlugins,
        breadcrumbs: false,
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/theme-common').UserThemeConfig} */
    ({
      algolia: {
        appId: 'BH4D9OD16A',
        apiKey: '1ad6b47d4e742c4c0653877b5511c602',
        indexName: 'typescript-eslint',
      },
      metadata: [
        { name: 'msapplication-TileColor', content: '#443fd4' },
        { name: 'theme-color', content: '#443fd4' },
      ],
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

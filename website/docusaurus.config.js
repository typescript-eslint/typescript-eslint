const sponsors = require('./data/sponsors.json');

const remarkPlugins = [
  [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
];

const githubUrl = 'https://github.com/armano2/typescript-eslint';

module.exports = {
  title: 'TypeScript ESLint ',
  tagline: 'Tooling which enables ESLint to support TypeScript',
  url: 'https://typescript-eslint.io',
  baseUrl: '/',
  onBrokenLinks: 'warn', // TODO: 'throw'
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'typescript-eslint',
  projectName: 'typescript-eslint',
  customFields: {
    sponsors,
  },
  plugins: [
    require.resolve('./webpack.plugin'),
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
        path: '../packages/eslint-plugin/docs/rules',
        sidebarPath: require.resolve('./sidebars/sidebar.rules.js'),
        routeBasePath: 'rules',
        editUrl: `${githubUrl}/edit/master/docs/`,
        remarkPlugins,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'base-docs',
        path: '../docs',
        routeBasePath: 'docs',
        sidebarPath: require.resolve('./sidebars/sidebar.base.js'),
        editUrl: `${githubUrl}/edit/master/docs/`,
        remarkPlugins,
      },
    ],
  ],
  themeConfig: {
    // sidebarCollapsible: false,
    navbar: {
      title: 'TypeScript ESLint',
      // hideOnScroll: true,
      logo: {
        alt: 'TypeScript ESLint',
        src: 'img/logo.svg',
        // srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Getting started',
          position: 'left',
        },
        {
          to: 'rules/ban-types',
          activeBasePath: 'rules',
          label: 'Rules',
          position: 'left',
        },
        {
          to: 'repl',
          activeBasePath: 'repl',
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
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} TypeScript ESLint, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
    },
  },
};

/*
<link rel="apple-touch-icon" sizes="180x180" href="img/favicon/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="img/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="img/favicon/favicon-16x16.png">
<link rel="manifest" href="img/favicon/site.webmanifest">
<meta name="msapplication-TileColor" content="#443fd4">
<meta name="theme-color" content="#443fd4">
*/

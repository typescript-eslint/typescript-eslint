const sponsors = require('./data/sponsors.json');

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
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'rules-docs',
        path: '../packages/eslint-plugin/docs/rules',
        sidebarPath: require.resolve('./sidebars/sidebar.rules.js'),
        routeBasePath: 'rules',
        editUrl:
          'https://github.com/typescript-eslint/typescript-eslint/edit/master/docs/',
        remarkPlugins: [
          [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
        ],
      },
    ],
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          id: 'getting-started-docs',
          path: '../docs/getting-started',
          routeBasePath: 'getting-started',
          sidebarPath: require.resolve('./sidebars/sidebar.base.js'),
          editUrl:
            'https://github.com/typescript-eslint/typescript-eslint/edit/master/docs/',
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
        pages: {
          include: ['**/*.{js,jsx,ts,tsx,md,mdx}'],
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
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
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          to: 'getting-started/',
          activeBasePath: 'getting-started',
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
          href: 'https://github.com/typescript-eslint/typescript-eslint',
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

/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const darkCodeTheme = require('prism-react-renderer/themes/dracula')
const lightCodeTheme = require('prism-react-renderer/themes/github')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'nodecode-docs',
  tagline: 'Low-code platform based on node graph architecture',
  url: 'https://TODO.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'bischoff-m', // Usually your GitHub org/user name.
  projectName: 'nodecode-docs', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'nodecode-docs',
        logo: {
          alt: 'Nodecode Logo',
          src: 'img/logo-dark.svg',
          srcDark: 'img/logo-light.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Guide',
          },
          {
            href: 'https://github.com/bischoff-m/nodecode',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      // footer: {
      //   style: 'dark',
      //   copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      // },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      // Plugin / TypeDoc options
      {
        entryPoints: [
          '../nodecode-ui/src',
        ],
        entryPointStrategy: 'expand',
        tsconfig: '../nodecode-ui/tsconfig.json',
        watch: process.env.NODE_ENV === 'development',
        plugin: [
          'typedoc-plugin-not-exported',
          'typedoc-plugin-mark-react-functional-components',
          'typedoc-plugin-rename-defaults',
        ],
        out: 'internal-reference',
        sidebar: {
          categoryLabel: 'Internal Reference',
          position: 5,
          fullNames: false,
        },
      },
    ],
  ],
}

module.exports = config

module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
        'node': true,
    },
    'extends': [
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:css/standard',
        'plugin:mdx/recommended',
    ],
    'overrides': [
        {
            'files': ['*.md', '*.mdx'],
            'extends': 'plugin:mdx/recommended',
        }
    ],
    'settings': {
        'mdx/code-blocks': false,
        'react': {
            'version': 'detect',
        },
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx']
        },
        'import/resolver': {
            'typescript': {
                'alwaysTryTypes': true,
                'project': [
                    'packages/nodecode-ui/tsconfig.json',
                    'packages/nodecode-docs/tsconfig.json',
                ]
            }
        },
    },
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module',
        'ecmaFeatures': {
            'jsx': true
        },
        'jsxPragma': null // for @typescript/eslint-parser
    },
    'plugins': [
        'react',
        'react-hooks',
        '@typescript-eslint',
        'css',
        'eslint-plugin-import-helpers',
        'import',
    ],
    'rules': {
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'never'
        ],
        'react/react-in-jsx-scope': 'off',
        'react/jsx-uses-react': 'off',
        'react-hooks/exhaustive-deps': 'off', // TODO: turn back on and test if quick fix works with redux
        'import-helpers/order-imports': [
            'warn',
            {
                'newlinesBetween': 'never',
                'groups': [
                    'module',
                    // eslint-disable-next-line no-useless-escape
                    '/^@\//',
                    ['parent', 'sibling', 'index'],
                ],
                'alphabetize': {
                    'order': 'asc',
                    'ignoreCase': true,
                },
            },
        ],
        'import/no-unresolved': [
            'error',
            {
                // Eslint throws an error because these imports used by docusaurus are
                // aliases and not actual paths
                'ignore': [
                    '^@theme',
                    '^@docusaurus',
                    '^@site']
            }
        ],
    },
}

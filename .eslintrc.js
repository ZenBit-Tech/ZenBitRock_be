module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    parser: "@typescript-eslint/parser",
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'typesafe',
    'import',
  ],
  extends: [
      'airbnb-base',
      'airbnb-typescript',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    "import/extensions": [
      "error",
      "always",
      {
        ts: "never",
      },
    ],
    "import/prefer-default-export": "off",
    'no-useless-constructor': 'off',
    'no-empty-function': 'off',
    'no-unused-vars': 'off',
    'consistent-return': 'off',
    'no-useless-catch': 'off',
    'typesafe/no-throw-sync-func': 'error',
    'typesafe/no-await-without-trycatch': 'warn',
    'typesafe/promise-catch': 'error',
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'pathGroups': [
        {
          'pattern': '@nestjs/**',
          'group': 'external',
          'position': 'before',
        },
      ],
      'pathGroupsExcludedImportTypes': ['builtin'],
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true,
      },
    }],
    'react/jsx-filename-extension': 'off',
    '@typescript-eslint/indent': 'off',
    'object-curly-newline': 'off',
    'implicit-arrow-linebreak': 'off'
  },
};

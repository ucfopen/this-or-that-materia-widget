import stylistic from '@stylistic/eslint-plugin'
import parserTs from '@typescript-eslint/parser'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js'
import reactHooks from 'eslint-plugin-react-hooks/cjs/eslint-plugin-react-hooks.development.js'
import globals from 'globals'

export default [
  /* Browser environment */
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  /* Default flat configs */
  {
    ...reactRecommended,
    ...reactJsxRuntime,
    // ...js.configs.recommended,
  },

  /* React hooks config */
  {
    plugins: { 'react-hooks': reactHooks }, // react hooks' config are not yet flat config ready
    rules: reactHooks.configs.recommended.rules,
  },

  /* Stylistic flat config factory */
  {
    ...stylistic.configs.customize({
      semi: false,
      quotes: 'single',
      arrowParens: true,
      braceStyle: '1tbs',
    }),
    languageOptions: {
      parser: parserTs,
    },
    files: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
  },

  /* Stylistic overrides */
  {
    plugins: { '@stylistic': stylistic },
    languageOptions: {
      parser: parserTs,
    },
    files: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
    rules: {
      '@stylistic/jsx-closing-bracket-location': 'off', // makes writing with clsx cleaner
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'comma',
            requireLast: true,
          },
          singleline: {
            delimiter: 'comma',
            requireLast: false,
          },
          multilineDetection: 'brackets',
        },
      ],
    },
  },

  /* Ignore build folders */
  {
    ignores: ['ts-out/*', 'build/*', 'node_modules/*'],
  },
]

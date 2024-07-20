import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js'
import { fixupConfigRules } from '@eslint/compat'
import prettierConfig from 'eslint-config-prettier'
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended'
import importPlugin from 'eslint-plugin-import'

const config = [
  { languageOptions: { globals: globals.browser } },
  prettierConfig,
  prettierPluginRecommended,
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...fixupConfigRules(pluginReactConfig),
  {
    files: ['src/**/*.{js,ts,tsx}'],
    plugins: { import: importPlugin },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      'import/no-namespace': 'error',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', 'internal', 'unknown', ['parent', 'sibling', 'index']],
          pathGroupsExcludedImportTypes: ['builtin'],
          pathGroups: [
            {
              pattern: '{services,hooks,utils}/**',
              group: 'external',
              position: 'after',
            },
          ],
        },
      ],
    },
    settings: {
      version: 'detect',
      'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
      'import/resolver': {
        node: {
          extensions: ['.ts', '.tsx'],
        },
        typescript: {
          project: 'packages/**/tsconfig.json',
        },
      },
      'import/extensions': ['.ts', '.tsx'],
    },
  },
  { ignores: ['dist/*'] },
]

export default config

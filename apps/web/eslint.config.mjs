import { base, tseslint } from '@boilerplate/eslint-config';
import importPlugin from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', 'src/app/routeTree.gen.ts', 'eslint.config.mjs'],
  },
  ...base,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.browser,
    },
    plugins: {
      import: importPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      'import-x/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import-x/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'func-style': ['error', 'declaration', { allowArrowFunctions: false }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            { pattern: '@app/**', group: 'internal', position: 'before' },
            { pattern: '@core/**', group: 'internal' },
            { pattern: '@shared/**', group: 'internal' },
            { pattern: '@features/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          distinctGroup: true,
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // Architectural boundaries between app/core/shared/features. Barrel-only
      // access between features is deferred to whichever PR adds the second
      // feature — nothing exists yet to validate that rule against.
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/core',
              from: './src/features',
              message: 'core/ is cross-cutting infrastructure — it cannot depend on features/.',
            },
            {
              target: './src/core',
              from: './src/app',
              message: 'core/ cannot depend on app/.',
            },
            {
              target: './src/shared',
              from: './src/features',
              message: 'shared/ is domain-agnostic — it cannot depend on features/.',
            },
            {
              target: './src/shared',
              from: './src/core',
              message: 'shared/ is domain-agnostic — it cannot depend on core/.',
            },
            {
              target: './src/shared',
              from: './src/app',
              message: 'shared/ cannot depend on app/.',
            },
            {
              target: './src/features',
              from: './src/app',
              message: 'features/ cannot depend on app/.',
            },
          ],
        },
      ],
    },
  },
  {
    // Every route file exports `Route` (TanStack Router config, not a
    // component) alongside the page component — the official file-based
    // routing pattern, always flagged as a false positive by this rule.
    files: ['src/app/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);

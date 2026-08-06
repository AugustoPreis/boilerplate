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
      // Fronteiras arquiteturais do §4.2 do plano: app/core/shared/features.
      // O acesso entre features (só via barrel index.ts) fica para quando a
      // 2ª feature existir e houver algo real para validar a regra contra.
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/core',
              from: './src/features',
              message: 'core/ é infraestrutura cross-cutting — não pode depender de features/.',
            },
            {
              target: './src/core',
              from: './src/app',
              message: 'core/ não pode depender de app/.',
            },
            {
              target: './src/shared',
              from: './src/features',
              message: 'shared/ é agnóstico de domínio — não pode depender de features/.',
            },
            {
              target: './src/shared',
              from: './src/core',
              message: 'shared/ é agnóstico de domínio — não pode depender de core/.',
            },
            {
              target: './src/shared',
              from: './src/app',
              message: 'shared/ não pode depender de app/.',
            },
            {
              target: './src/features',
              from: './src/app',
              message: 'features/ não pode depender de app/.',
            },
          ],
        },
      ],
    },
  },
  {
    // Toda rota exporta `Route` (config do TanStack Router, não um
    // componente) ao lado do componente da página — padrão oficial do
    // file-based routing, sempre reportado como falso-positivo por esta regra.
    files: ['src/app/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);

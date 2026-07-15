import { base, tseslint } from '@boilerplate/eslint-config';

export default tseslint.config(
  { ignores: ['dist/**', 'tsup.config.ts', 'eslint.config.mjs'] },
  ...base,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);

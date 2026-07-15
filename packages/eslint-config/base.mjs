import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

// Blocos comuns entre api e web: recomendado do ESLint/typescript-eslint com
// verificação de tipos, mais a desativação de regras de estilo que conflitam
// com o Prettier. Cada app aplica isso por cima com tseslint.config(...base, ...)
// e mantém suas próprias regras/plugins específicos (import order, React, etc.).
//
// explicit-function-return-type/explicit-module-boundary-types: toda função
// declarada e todo limite de módulo exportado precisa anotar o tipo de retorno.
// Isso importa em particular para os controllers do Nest, cuja assinatura
// alimenta a geração do Swagger consumida pelo Orval no frontend.
export const base = [
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
];

export { eslint, prettierConfig, tseslint };

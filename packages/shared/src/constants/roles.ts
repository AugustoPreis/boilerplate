/**
 * Único papel reservado pela plataforma. Qualquer outro papel é dado (RBAC
 * dirigido a dados via Role/Permission), nunca um enum fixo no código.
 * Consumido pelo seed do backend e pelas rotas protegidas do frontend —
 * mudar o valor aqui é a única mudança necessária nos dois lados.
 */
export const ROLE_ADMIN = 'admin';

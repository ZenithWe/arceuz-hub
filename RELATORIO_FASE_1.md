# Relatório técnico — Arceuz Hub v0.2 (Neon Free)

Data: 09/10/2026 (horário de Brasília). Banco PostgreSQL Neon criado e estruturado pelo conector Neon, separado de todos os demais projetos.

## Implementado nesta iteração

1. Banco criado: Neon PostgreSQL 17, região São Paulo, projeto `round-silence-70412821`, organização `CONTA` no plano Free, sem Supabase. Conexão via `@neondatabase/serverless` 1.2.0 e variável `DATABASE_URL` somente no servidor.
2. Atualização da autenticação: slots privados `mateus` e `roberto`, provisionamento administrativo, senha scrypt com salt, sessão aleatória armazenada apenas como SHA-256 no banco e cookie HttpOnly, SameSite=Lax, Secure em produção. Sem cadastro público.
3. Proteção de consultas e ações do servidor; bloqueio temporário de tentativas falhas; logout com revogação da sessão e revogação das demais sessões após mudança de senha.
4. Scripts de migração inicial, provisionamento, verificação e redefinição administrativa de senha.
5. Dashboard adaptado para consultas SQL parametrizadas ao Neon, com dados reais ou estados vazios e aviso de indisponibilidade.
6. README e `.env.example` atualizados com variáveis exigidas e procedimentos de configuração.
7. A identidade visual anterior e páginas previstas para fases 2–6 foram preservadas.

## Verificação nesta conversa

- `npm run test:logic`: **17 testes aprovados**.
- `npm run check:syntax`: **30 arquivos TS/TSX, zero erros sintáticos**.
- `npm install`: indisponível no ambiente (`EAI_AGAIN` para registry.npmjs.org).
- `npm run typecheck` e `npm run build`: **não executados com sucesso** porque as dependências não estavam instaladas.
- Migração real e consultas PostgreSQL: **validadas** no projeto recém-criado. 8 tabelas inspecionadas, `001_foundation` registrada, zero registros de membros/projetos/repositórios/finanças/tarefas/sessões.
- Login de Mateus e Roberto, proteção das sessões em navegador e interface no navegador: **não validados**; ainda faltam configurar a conexão da aplicação e provisionar os dois acessos.
- Nenhum deploy efetuado.

## Arquivos principais criados/alterados

- `lib/db.ts`, `lib/config.ts`, `lib/auth.ts`, `lib/password.mjs`, `lib/password.d.mts`, `lib/dashboard.ts`.
- `db/001_foundation.sql`.
- `scripts/migrate.mjs`, `scripts/provision-users.mjs`, `scripts/reset-password.mjs`, `scripts/verify-setup.mjs`.
- `app/login/{actions,page}.tsx`, `app/(private)/actions.ts`, `app/(private)/settings/actions.ts`, `app/(private)/settings/page.tsx`.
- `README.md`, `.env.example`, `package.json`, `tests/*.test.mjs`.
- Eliminados arquivos antigos de cliente Supabase, proxy SSR e paginação PostgREST.

## Estrutura de banco prevista

`hub_members`, `hub_sessions`, `hub_login_guards`, `hub_projects`, `hub_repositories`, `hub_financial_entries`, `hub_tasks`, `hub_schema_migrations`.

As oito tabelas foram criadas remotamente no Neon. A migração registrada tem SHA-256 `0db69a244916f43b0c87963372f88e5f6d21f5796b8d40c5a0e6faa6fb0fbe8b` e coincide com `db/001_foundation.sql`.

## Bloqueio atual

Não há bloqueio para acesso ao Neon. A aplicação precisa das suas próprias variáveis privadas `DATABASE_URL` e `AUTH_SECRET` e do provisionamento das contas de Mateus e Roberto. Não enviar senhas ou strings de conexão por chat. Compilação com dependências e deploy ainda pendentes.

## Próximos passos

1. Obter a URL privada pelo Neon Console, configurar a aplicação local, criar `AUTH_SECRET` e provisionar as duas contas com os e-mails e senhas definidos com segurança.
2. Testar sessões, logins e isolamento de perfil em banco real.
3. Gerar e versionar `package-lock.json`, passar no `typecheck` e no `build`, testar mobile e controles de acesso.
4. Hospedar somente em um plano cuja política permita o uso pretendido, e iniciar Fase 2 depois da validação completa da Fase 1.

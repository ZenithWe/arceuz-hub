# ARCEUZ HUB — Fases 1 e 2 (Neon gratuito)

Versão 0.3 do painel de acesso privado para Mateus e Roberto. O código-fonte pode estar em um repositório público; o banco e as credenciais nunca devem ser publicados. **O banco Neon já foi criado e a migração inicial foi aplicada e verificada. A aplicação Next.js ainda não está conectada/configurada para execução nem implantada.** O site e os bancos existentes da Arceuz e Rose Freitas não foram modificados.

## Hospedagem 100% gratuita dentro dos limites dos planos

- Banco: [Neon PostgreSQL — Free](https://neon.com/pricing) (plano gratuito). Em outubro de 2026, 1 GB de dados e 100 CU-horas por mês para cada projeto são as cotas anunciadas pelo provedor.
- Aplicação para **homologação/testes**: [Render Free](https://render.com/docs/free), usando o `render.yaml` incluído. O serviço suspende após inatividade e **não é recomendado como hospedagem de produção confiável**. O Vercel Hobby não deve hospedar uso comercial da empresa. Mais detalhes em [DEPLOY_RENDER.md](./DEPLOY_RENDER.md).
- Autenticação: implementada no servidor, sem terceiros nem cobranças por usuário; somente duas contas criadas administrativamente, cookies `HttpOnly` e `SameSite=Lax`, sessões armazenadas apenas como hashes no banco, limites persistentes para tentativas de login, scrypt para senhas e revogação de sessões.
- Layout: Next.js 16, React 19, Tailwind 4, identidade preto/branco/laranja. Não usa Supabase.

## Passo 1 — Banco Neon já criado

**Não crie outro banco:** já existe `arceuz-hub`, projeto ID `round-silence-70412821`, PostgreSQL 17 na região AWS São Paulo (`aws-sa-east-1`) na organização Neon `CONTA` (plano Free).

O Neon está conectado ao ChatGPT e foram criadas as oito tabelas de fundação, com a migração `001_foundation` registrada (checksum `0db69a244916f43b0c87963372f88e5f6d21f5796b8d40c5a0e6faa6fb0fbe8b`). Mateus e Roberto já estão cadastrados com os e-mails autorizados. As contas estão pendentes, sem senha e sem sessão. Projetos, repositórios, finanças e tarefas permanecem vazios.

Para usar o código local, abra [console.neon.tech](https://console.neon.tech), selecione `arceuz-hub` e acesse **Connect**. Copie a string privada de conexão **pooled** (hostname com `-pooler`). Nunca coloque a `DATABASE_URL` em mensagens, prints ou GitHub.

## Passo 2 — Configuração local

Instale Node.js 22 ou posterior e npm. Depois, nesta pasta:

```bash
cp .env.example .env.local
npm install
```

Edite `.env.local` apenas no seu computador:

```env
DATABASE_URL="postgresql://...host-pooler...neon.tech/neondb?sslmode=require"
AUTH_SECRET="um-segredo-aleatorio-de-pelo-menos-32-caracteres"
HUB_BASE_URL="https://dominio-do-hub-apos-a-publicacao"
```

Gere o AUTH_SECRET pelo terminal sem compartilhá-lo:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

A string `DATABASE_URL` e o `AUTH_SECRET` são **segredos exclusivos do servidor**. Nunca publique `.env.local` no GitHub; mantenha também as senhas fora do Vercel.

## Passo 3 — Verificar as contas pendentes e testar a aplicação

As duas vagas de membros **já foram criadas diretamente no Neon**, com `password_hash` nulo e `activated_at` nulo:

- Mateus: `[e-mail autorizado, mantido somente no banco]`
- Roberto: `[e-mail autorizado, mantido somente no banco]`

Não execute o antigo provisionamento de usuários com senhas provisórias. As contas devem ser ativadas por convite individual. O esquema `002_invitation.sql` já foi aplicado no banco.

```bash
npm run db:migrate
npm run verify:setup
npm run test:logic
npm run check:syntax
npm run typecheck
npm run build
npm run dev
```

Após publicar em hospedagem HTTPS compatível com o uso da empresa, configure `HUB_BASE_URL` só no ambiente privado de administração e emita dois convites (um de cada vez):

```bash
npm run invite -- mateus
npm run invite -- roberto
```

Cada comando gera um link **confidencial** exclusivo, válido por 24 horas; encaminhe-o SOMENTE ao destinatário indicado via canal privado ou serviço de e-mail autenticado. Não compartilhe links de ativação neste chat, logs públicos ou GitHub. O titular cria a senha na página `/ativar` e depois entra normalmente em `/login`. **Os convites ainda não foram emitidos nem enviados.**

Se alguém perder a senha depois de ativar, use um procedimento administrativo de redefinição com autenticação e canal de entrega seguros. A ferramenta `reset:password` permanece disponível apenas para execução local privada com acesso ao banco. Não há cadastro público.

## Funcionalidades entregues

- Login privado com duas vagas fixas, senha criptograficamente derivada com salt aleatório (scrypt) e cookies seguros em produção.
- Dashboard com totais reais ou estado vazio; saldo financeiro distingue recebimentos e pagamentos confirmados de pendências.
- Configuração de nome, cargo, biografia, foto via URL HTTPS, tema claro/escuro e alteração de senha.
- Projetos & Sites (Fase 2): cadastro, edição, status, cliente, responsável, datas, descrições, tecnologias, links HTTPS, valores previstos, busca, filtros, paginação e arquivamento sem exclusão dos dados.
- Layout responsivo. Repositórios GitHub, financeiro, clientes, tarefas e ferramentas de IA ainda são módulos planejados, sem CRUD funcional.
- Sem API pública de banco: leitura e modificações são realizadas no Next.js com validação de sessão no servidor.

## Testes e limitações

O ambiente de execução desta conversa não teve acesso ao registro npm (`EAI_AGAIN`), por isso não foi possível instalar pacotes, gerar `package-lock.json` nem executar `npm run typecheck` / `npm run build` neste ambiente. Os testes Node e a análise sintática funcionam localmente sem baixar dependências, mas não substituem o build e os testes E2E.

Para ativar a aplicação em produção, o Vercel precisa de `DATABASE_URL` e `AUTH_SECRET` configurados como variáveis de ambiente **criptografadas**, no projeto privado do Hub, nunca no navegador. Não envie as variáveis usadas somente no provisionamento (`*_PASSWORD`). O desenvolvedor deve validar termos e limites do plano de hospedagem antes de publicar um produto comercial.

## Segurança operacional

- O acesso ao Neon tem privilégios no servidor. `DATABASE_URL` **não** deve estar presente em códigos do navegador, respostas HTTP ou logs.
- O banco Neon não utiliza automaticamente as políticas RLS do Supabase; a aplicação checa o membro e a sessão em cada ação. Antes de oferecer interfaces externas, revise permissões das novas APIs e use um usuário PostgreSQL com privilégios mínimos.
- Senhas não são exibidas ou recuperáveis e não são armazenadas em texto puro no banco.
- No primeiro deploy, teste autenticação de ambos os usuários, senha inválida, logout, proteção de rotas, alterações de perfil, sessão expirada e isolamento entre perfis.
- Execute novas alterações no esquema com migrations versionadas. Nunca rode `db/001_foundation.sql` nos outros bancos.

## Publicação de homologação (ainda pendente)

O código já inclui `render.yaml` para construir o Next.js em uma instância Free do Render, com `DATABASE_URL` pedida no painel do provedor e `AUTH_SECRET` gerado automaticamente. É necessário **criar um novo repositório GitHub privado**, subir o projeto e vinculá-lo ao Render. A conexão atual com GitHub não disponibiliza criação de repositórios. Nenhum serviço novo foi publicado, e nenhum segredo foi entregue a uma aplicação hospedada. Veja [DEPLOY_RENDER.md](./DEPLOY_RENDER.md).

## Verificação

`npm run test:logic`: 24 testes lógicos/estruturais; `npm run check:syntax`: 38 arquivos TS/TSX sem erros de sintaxe. A compilação `npm run build`, testes integrados e testes no navegador continuam pendentes porque o registro npm não está acessível neste ambiente.

## Próxima fase

Fase 3: relacionar e acompanhar repositórios GitHub cadastrados, com sincronização de status e últimos commits. Antes disso, efetivar o teste de login e a publicação de homologação.


## Etapa atual: repositório GitHub

O repositório `ZenithWe/arceuz-hub` foi encontrado, mas está **público**. Antes de publicar qualquer arquivo privado, altere a visibilidade para **Private** em `https://github.com/ZenithWe/arceuz-hub/settings` > Danger Zone > Change repository visibility. Nenhum segredo deve ser enviado ao repositório, mesmo após a mudança. O pacote contém `.github/workflows/ci.yml` para validar o build em GitHub Actions sem variáveis de ambiente confidenciais.

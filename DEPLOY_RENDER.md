# Arceuz Hub — publicação gratuita para HOMOLOGAÇÃO no Render

Este procedimento é para **ambiente de testes**: o Render Free pode desligar a instância após 15 minutos sem tráfego e não é recomendado para produção. A aplicação é privada, mas a rota `/login` será pública para quem tiver o link. Não compartilhe os convites de ativação publicamente.

## Antes de publicar

1. Crie um **novo repositório PRIVADO** `arceuz-hub` na conta GitHub correta. Não utilize nem sobrescreva os repositórios de outros sites.
2. Envie os arquivos do ZIP para esse repositório. Não envie `.env.local`, tokens, URLs com senhas ou arquivos locais de configuração.
3. Em [Render](https://dashboard.render.com), use **New > Blueprint** e escolha esse repositório (contém `render.yaml`). O serviço de testes será `arceuz-hub-staging` no plano Free.
4. Quando o Render solicitar `DATABASE_URL`, abra o projeto **arceuz-hub** em [Neon](https://console.neon.tech), copie a string de conexão **pooled** e forneça **somente no formulário privado do Render**, nunca no GitHub ou no chat. O `AUTH_SECRET` será gerado automaticamente pelo Render.
5. Verifique o deploy no Render. O build deve completar com `npm install` e `next build` sem erros. Confirme o acesso a `/login` e que `/dashboard` redireciona pessoas sem sessão para `/login`.
6. Para gerar convites, em um **terminal privado**, com acesso ao banco e o `AUTH_SECRET` guardados localmente, configure `HUB_BASE_URL` com a URL HTTPS efetiva do Render e execute `npm run invite -- mateus` e depois `npm run invite -- roberto`. Os links de uso único devem ser enviados somente ao e-mail confirmado de cada pessoa, por canal privado. **Ainda não há e-mail automático.**
7. Teste os dois logins e logout, perfil, criação e edição de projetos, filtros e dashboard antes de colocar dados reais.

## Situação atual

- Banco Neon `round-silence-70412821` criado na região São Paulo com nove tabelas de serviço e duas contas pendentes.
- Projeto no GitHub e serviço no Render: **ainda não criados**.
- Compilação completa e testes de navegador: **pendentes**, pois o ambiente local não alcança `registry.npmjs.org`.
- A Fase 2 do módulo Projetos & Sites está implementada no código-fonte, ainda não validada ao vivo.

**Atenção:** O uso empresarial definitivo merece um plano/serviço cuja disponibilidade e condições sejam adequadas à sua operação. Não trate Render Free como solução de produção garantida.

## Atualização — repositório confirmado

O repositório `https://github.com/ZenithWe/arceuz-hub` **já existe**, mas a API do GitHub o indicou como **público**. Antes de qualquer upload, abra `https://github.com/ZenithWe/arceuz-hub/settings`, vá à seção **Danger Zone > Change repository visibility**, selecione **Make private** e confirme a alteração. O conector GitHub disponível nesta sessão não oferece a mudança de visibilidade.

O pacote agora inclui `.github/workflows/ci.yml` para testar automaticamente testes lógicos, sintaxe, TypeScript e compilação do Next.js sem carregar segredos. Um CI bem-sucedido é necessário antes de liberar o serviço Render para testes de login. A criação de deployment ainda depende de garantir o repositório privado e preparar credenciais exclusivamente no gerenciador de segredos da hospedagem.

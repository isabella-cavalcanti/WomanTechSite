# 💜 WomanTech — Impulsionando Mulheres na Tecnologia

Site do **WomanTech**, projeto de extensão da Faculdade de Computação e Informática (FCI) do Mackenzie, parceiro do Programa Meninas Digitais (SBC).

## Páginas

| Página | Arquivo | O que tem |
| --- | --- | --- |
| Início | `index.html` | Apresentação do projeto, números, o que fazemos, parceiros |
| Sobre | `sobre.html` | História, missão, visão, público-alvo e trajetória |
| Equipe | `equipe.html` | Coordenação, professoras, bolsistas/voluntárias e ex-integrantes |
| Projetos & Eventos | `projetos.html` | Tudo o que já foi feito, por semestre e por tipo |
| Materiais | `materiais.html` | E-books para baixar |
| Contato | `contato.html` | Formulário "Leve o Woman Tech até você" (quem é, público e local, como ajudar) |
| Entrar | `login.html` | Login único, criar conta (aluna) e recuperar senha |
| Minha área | `area.html` | Mostra só o que o papel e as permissões da pessoa liberam |
| Usuários | `usuarios.html` | (admin) Define papel, grupo e permissões de cada pessoa |
| Publicar projetos | `admin.html` | (permissão) Publica em Projetos & Eventos |

## Como atualizar (sem mexer no HTML)

- **Adicionar alguém na equipe:** edite `js/dados-equipe.js` e copie um bloco `{ ... }`.
  Quando a pessoa sair do projeto, troque `categoria` para `"ex-integrante"`.
- **Adicionar um projeto ou evento:** use o painel em **Entrar** (`admin.html`) — não precisa mexer no código.
  Os projetos antigos (até 2025/2) continuam em `js/dados-projetos.js`.
- **Fotos:** salve em `assets/image/` e use o caminho no campo `foto`.

O menu e o rodapé ficam em `partials/header.html` e `partials/footer.html` e valem para todas as páginas.

## Logins, papéis e permissões

Um login só para todo mundo. Cada pessoa tem **um papel**, e cada papel inclui tudo do anterior:

| | Aluna | Integrante | Team líder | Admin |
|---|:-:|:-:|:-:|:-:|
| Cursos e Carreira | ✅ | ✅ | ✅ | ✅ |
| Portal das integrantes | | ✅ | ✅ | ✅ |
| Meu grupo (tarefas e entregas) | | | ✅ | ✅ |
| Usuários e tudo o mais | | | | ✅ |

Além do papel, a admin pode dar **permissões extras** a qualquer pessoa (sem torná-la admin):
`Publicar projetos e eventos`, `Mentora de carreira`, `Aprovar vagas` e `Postar aulas`.

**Toda conta nova começa como aluna.** Integrantes, team líderes e admins são definidas pela página **Usuários**.

### Segurança

Esconder botões é só a parte visual. Quem bloqueia de verdade é o **banco de dados** (regras em `supabase/setup.sql`):
uma aluna não consegue se promover, dar permissões a si mesma, ver dados de outras pessoas nem publicar — nem
mexendo no código pelo navegador. O site também nunca fica sem pelo menos uma admin.

### Configurar o Supabase (uma vez só)

1. Crie uma conta e um projeto gratuito no [Supabase](https://supabase.com).
2. Em **SQL Editor → New query**, cole o conteúdo de `supabase/setup.sql` e clique em **Run**.
3. Em **Authentication → Sign In / Providers → Email**, deixe **Enable email** e **Confirm email** ligados
   (as alunas criam a própria conta e confirmam pelo e-mail).
4. Em **Authentication → URL Configuration**:
   - **Site URL:** `https://isabella-cavalcanti.github.io/WomanTechSite/login.html`
   - **Redirect URLs:** adicione `https://isabella-cavalcanti.github.io/WomanTechSite/**`
5. Em **Project Settings → API**, copie a **Project URL** e a **anon public key** para `js/config.js`
   (nunca a `service_role`).
6. Crie sua conta pelo site (**Entrar → Criar conta**) e confirme o e-mail.
7. No SQL Editor, rode (com o seu e-mail): `update public.perfis set papel = 'admin' where email = 'seu@email.com';`

Pronto: a partir daí, tudo é feito pela página **Usuários**.

## Formulário de contato

O formulário envia para **womantech.fci@gmail.com** pelo [FormSubmit](https://formsubmit.co), sem servidor.
**Na primeira mensagem enviada**, o FormSubmit manda um e-mail de ativação para essa caixa: é só clicar em
"Activate Form" uma vez. Depois disso, as mensagens chegam normalmente.

## Pendência: pasta `assets/`

As imagens, logos e PDFs ainda estão no site antigo (womantech-iota.vercel.app). Enquanto a pasta `assets/`
não estiver neste repositório, o site busca esses arquivos de lá automaticamente (`ASSETS_FALLBACK` em `js/script.js`).
Quando copiar a pasta `assets/` do projeto antigo para cá, tudo passa a carregar daqui.

## Rodar no computador

O menu e o rodapé são carregados com `fetch`, então abra com um servidor local (não clicando direto no arquivo):

```bash
python -m http.server 8000
# depois acesse http://localhost:8000
```

## Tecnologias

HTML · Tailwind CSS (CDN) · JavaScript · Font Awesome · GitHub Pages

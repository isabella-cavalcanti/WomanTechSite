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
| Área administrativa | `admin.html` | Login de admin para publicar em Projetos & Eventos |

## Como atualizar (sem mexer no HTML)

- **Adicionar alguém na equipe:** edite `js/dados-equipe.js` e copie um bloco `{ ... }`.
  Quando a pessoa sair do projeto, troque `categoria` para `"ex-integrante"`.
- **Adicionar um projeto ou evento:** use o painel em **Entrar** (`admin.html`) — não precisa mexer no código.
  Os projetos antigos (até 2025/2) continuam em `js/dados-projetos.js`.
- **Fotos:** salve em `assets/image/` e use o caminho no campo `foto`.

O menu e o rodapé ficam em `partials/header.html` e `partials/footer.html` e valem para todas as páginas.

## Painel de admin (Projetos & Eventos)

O painel usa o [Supabase](https://supabase.com) (plano gratuito) para login, banco de dados e fotos.
Configuração (uma vez só):

1. Crie uma conta e um projeto no Supabase.
2. Em **SQL Editor → New query**, cole o conteúdo de `supabase/setup.sql` e clique em **Run**.
   Isso cria as tabelas, a pasta de fotos e as regras de segurança: qualquer pessoa **lê** os projetos publicados,
   e só quem está na tabela `admins` **cria, edita ou apaga**.
3. Em **Authentication → Sign In / Providers**, desligue **Allow new users to sign up** (só a coordenação cria contas).
4. Em **Authentication → Users → Add user**, crie o usuário de cada administradora (e-mail + senha).
5. No SQL Editor, rode a linha do final do `setup.sql` com o e-mail de cada administradora.
6. Em **Project Settings → API**, copie a **Project URL** e a **anon public key** para `js/config.js`.
7. Em **Authentication → URL Configuration**, coloque o endereço do site em **Site URL**
   (ex.: `https://isabella-cavalcanti.github.io/WomanTechSite/admin.html`) para o "Esqueci minha senha" funcionar.

No painel dá para publicar (com foto, que é reduzida automaticamente), salvar rascunho, editar, ocultar e apagar.
Nunca coloque a chave `service_role` no site.

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

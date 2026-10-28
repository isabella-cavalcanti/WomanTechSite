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
| Contato | `contato.html` | Formulário (perfil, público-alvo, cidade/estado) |

## Como atualizar (sem mexer no HTML)

- **Adicionar alguém na equipe:** edite `js/dados-equipe.js` e copie um bloco `{ ... }`.
  Quando a pessoa sair do projeto, troque `categoria` para `"ex-integrante"`.
- **Adicionar um projeto ou evento:** edite `js/dados-projetos.js` e coloque o novo bloco **no topo** da lista.
- **Fotos:** salve em `assets/image/` e use o caminho no campo `foto`.

O menu e o rodapé ficam em `partials/header.html` e `partials/footer.html` e valem para todas as páginas.

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

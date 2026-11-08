# Resfriar BV — Prévia do site

Prévia do novo site da Resfriar BV: ar-condicionado, refrigeração comercial e PMOC na Bela Vista, em São Paulo.
Preview of the new website for Resfriar BV, an air-conditioning, commercial refrigeration and HVAC maintenance plan (PMOC) company in Bela Vista, São Paulo.

[🇧🇷 Português](#-português) · [🇺🇸 English](#-english)

---

## 🇧🇷 Português

Página única para a Resfriar BV (ar-condicionado, refrigeração comercial e PMOC — Bela Vista, São Paulo), feita como demonstração para prospecção. Foco em levar o visitante ao WhatsApp da empresa.

- Site estático: `index.html`, `assets/css/style.css`, `assets/js/main.js`. Sem build e sem dependências.
- Animações e efeitos ficam à parte, em `assets/css/animacoes.css` e `assets/js/animacoes.js` (topo em tela cheia, abertura com fluxo de ar ligado ao termostato, títulos palavra por palavra, fotos com véu, trilho do "Como trabalhamos", cartões com inclinação 3D, botões magnéticos). Para desligar tudo, basta tirar as duas linhas do `index.html`. Quem pede menos movimento no sistema vê a página parada.
- Para ver: abrir `index.html` no navegador, ou rodar `python -m http.server` nesta pasta.
- **Ainda não publicado.** É demonstração; só publicar com o aceite do cliente.

### De onde veio cada informação

| Dado | Fonte | Situação |
|---|---|---|
| WhatsApp 11 94743-2601 | Ficha da empresa copiada pelo Gabriel em 09/10/2026 (substitui o 94038-4914 do perfil no Google) | **confirmar que o número recebe WhatsApp** |
| E-mail contato@resfriarbv.com.br, horário (seg.–sex. 8h–17h30, sáb. 8h–14h, dom. fechado), "mais de 10 anos", CEP 01325-001 | Mesma ficha de 09/10/2026 | informado pelo Gabriel |
| Telefone 11 3106-4633 | Arte do logo enviada (o Cylex mostra o mesmo início) | confirmar com o cliente |
| Endereço, CEP | Perfil no Google | confirmado |
| 44 avaliações no Google | Perfil no Google, lido em 07/10/2026 | a página mostra só a quantidade; a nota média (4,0) não é exibida, por decisão do Gabriel |
| Seis avaliações com nome | Lista do perfil no Google, copiada pelo Gabriel em 07/10/2026 | texto literal; **sem estrelas individuais** (a cópia não trazia a nota de cada uma) |
| 2.650 aparelhos, 38 bairros, 240 clientes | Página "Quem somos" do site atual | números antigos; confirmar |
| Serviços, marcas, slogan, missão | Site atual (resfriarbv.com.br) | confirmado |
| Foto do técnico | Site atual da empresa | real, baixa resolução |
| Texto do PMOC (Lei nº 13.589/2018, art. 1º) | planalto.gov.br, lido em 07/10/2026 | conferido |
| Fotos em `assets/img/gerado/` | Geradas por IA (prompts em `PROMPTS-IMAGENS.md`) | ilustrativas — não são fotos da equipe |

O site atual (`resfriarbv.com.br`) mostra 3288-9207 e 94743-2601. Em 09/10/2026 o Gabriel passou a ficha mais recente, com o 94743-2601, e ela passou a valer; o 94038-4914 do perfil do Google saiu da página. O fixo 3106-4633 continua (veio da arte do logo e segue sem confirmação).

### O que trocar

- WhatsApp e mensagem padrão: topo de `assets/js/main.js`.
- Imagens: ver `PROMPTS-IMAGENS.md`. Basta salvar em `assets/img/gerado/` com o nome indicado.
- Avaliações: seção `#avaliacoes` do `index.html`. Só entra avaliação real, sem alterar o sentido.

---

## 🇺🇸 English

A single-page demo website for Resfriar BV, built for prospecting. Its goal is to bring visitors to the company's WhatsApp.

- Static site: `index.html`, `assets/css/style.css`, `assets/js/main.js`. No build step, no dependencies.
- Animations live separately in `assets/css/animacoes.css` and `assets/js/animacoes.js` (full-screen hero, an airflow intro tied to a thermostat, word-by-word headlines, veiled photos, a "how we work" track, 3D tilt cards and magnetic buttons). Remove those two lines from `index.html` to turn them all off. Users who prefer reduced motion see a static page.
- To preview: open `index.html` in a browser, or run `python -m http.server` in this folder.
- **Not published yet.** It's a demo and should only go live once the client approves it.

### Where the information came from

The Portuguese section above has a full table of sources (company record, Google profile, current website, PMOC law text) and what still needs to be confirmed with the client. Images in `assets/img/gerado/` are AI-generated and illustrative, not photos of the team.

### What to change

- WhatsApp number and default message: top of `assets/js/main.js`.
- Images: see `PROMPTS-IMAGENS.md`; save them in `assets/img/gerado/` with the given name.
- Reviews: the `#avaliacoes` section of `index.html`. Only real reviews, without changing their meaning.

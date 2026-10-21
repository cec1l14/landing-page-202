# Pink Floyd · Landing Page

Landing page de fã do Pink Floyd, com a estética do álbum *The Dark Side of the Moon*: fundo preto, prisma e o arco-íris da capa. Projeto acadêmico em HTML, CSS e JavaScript puros.

**Objetivo:** levar o visitante a **ouvir *The Dark Side of the Moon* no Spotify**. A página apresenta a banda, a história, os álbuns e a linha do tempo e, no fim, chama para a ação.

## Seções

| # | Seção | O que mostra |
|---|-------|--------------|
| 1 | **Início** | Prisma 3D, feixe de luz e arco-íris gerados aos poucos, sobre um céu de estrelas. |
| 2 | **Pink Floyd** | O nome da banda, a frase de impacto e o botão "Conhecer a banda". |
| 3 | **A banda** | Cards deslizantes com os cinco integrantes. |
| 4 | **História** | O texto sobre a banda e um vinil giratório com a capa do prisma. |
| 5 | **Álbum** | Os 11 álbuns de estúdio, um por vez, com história, músicas, duração e faixas. |
| 6 | **Linha do tempo** | Uma lua em fases percorre 15 marcos, de 1965 a 2014. |
| 7 | **Ouça agora** | O botão que leva ao álbum no Spotify. |
| 8 | **Encerramento** | Prisma e luzes invertidos; a página volta sozinha ao topo e o ciclo recomeça. |

## Tecnologias

HTML, CSS e JavaScript sem frameworks nem etapa de build. O prisma usa [Three.js](https://threejs.org/) 0.160 (carregado por CDN); estrelas e brilhos usam Canvas 2D; capas e vinil são SVG.

```
index.html   # estrutura, conteúdo e a cena 3D
style.css    # estilos e animações
script.js    # estrelas, rolagem, carrosséis, linha do tempo e retorno ao topo
```

## Personalização

| O que | Onde |
|-------|------|
| Link do Spotify | Botão `btn-cta`, seção `#ouvir` do `index.html` |
| Frase de impacto | Seção `#nome` do `index.html` |
| Citações que seguem o mouse | Lista `quotes` do `script.js` |

## Decisões e limitações

- **Sem imagens nem letras oficiais:** capas, prisma e vinil são ilustrações próprias, e as citações que seguem o mouse são títulos de músicas.
- **Conteúdo:** os textos foram escritos a partir de fatos conhecidos, e as durações são aproximadas. Vale revisar antes de reutilizar.
- **Internet:** o Three.js vem de um CDN. Sem ele, após cerca de 6 segundos o topo mostra uma versão estática do prisma.
- **Acessibilidade:** a preferência "reduzir movimento" desliga as animações contínuas. No celular, a rolagem é livre e as seções se empilham.

## Aviso

Site de fã, sem fins lucrativos e sem vínculo oficial com o Pink Floyd. Marcas, músicas e obras pertencem aos seus detentores. O botão do Spotify leva à página do álbum na plataforma.

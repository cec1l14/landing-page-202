# Pink Floyd · Landing Page

Landing page de fã dedicada ao Pink Floyd, com a estética do álbum *The Dark Side of the Moon*: fundo preto, prisma e o arco-íris da capa. Projeto acadêmico, feito em HTML, CSS e JavaScript puros.

## Objetivo

Uma landing page tem um objetivo único. Aqui, toda a navegação conduz o visitante a **ouvir *The Dark Side of the Moon* no Spotify**. A página apresenta a banda, a história, os álbuns e a linha do tempo e, depois, chama para a ação.

## O que a página tem

As seções aparecem nesta ordem:

| # | Seção | O que mostra |
|---|-------|--------------|
| 1 | **Início** | Prisma 3D com um feixe de luz e o arco-íris, gerados aos poucos ao entrar na página, sobre um céu de estrelas. |
| 2 | **Pink Floyd** | O nome da banda, a frase de impacto e o botão "Conhecer a banda". |
| 3 | **A banda** | Cards deslizantes com os cinco integrantes. |
| 4 | **História** | O texto sobre a trajetória da banda e um vinil giratório, com a capa do prisma no centro. |
| 5 | **Álbum** | Os 11 álbuns de estúdio, um por vez, com história, características, principais músicas, duração e número de faixas. |
| 6 | **Linha do tempo** | Uma lua que percorre uma trilha pelo universo e passa pelas quatro fases a cada marco. São 15 marcos, de 1965 a 2014. |
| 7 | **Ouça agora** | Chamada para ação com o botão que leva ao álbum no Spotify. |
| 8 | **Encerramento** | O prisma e as luzes invertidos. Depois de alguns segundos, a página volta sozinha ao topo e o ciclo recomeça. |

O menu do topo tem os itens **Banda**, **História**, **Álbum**, **Linha do tempo** e **Ouça agora**.

## Interações

- **Prisma:** gera-se aos poucos ao carregar a página, com as arestas sendo traçadas, depois o feixe e as cores do arco-íris, uma a uma. Um clique na seção do prisma faz surgir um brilho, e o movimento do mouse deixa faíscas coloridas.
- **Rolagem a partir do prisma:** leva automaticamente ao nome da banda.
- **Botão "Conhecer a banda":** uma cortina com as cores do arco-íris atravessa a tela antes de levar à seção seguinte.
- **A banda:** os cards passam por arrasto com o mouse, deslize no celular, setas na tela, pontinhos ou setas ← → do teclado. O card ativo ganha um brilho.
- **Álbum e Linha do tempo:** em telas grandes, cada rolagem avança um álbum ou um marco, e nas pontas a página segue normalmente. A capa do álbum se inclina conforme o mouse. As setas do teclado e os botões também funcionam.
- **Encerramento:** o prisma gira no lugar até a cena ficar idêntica à do topo, e a página volta ao início com um salto instantâneo.

## Tecnologias

- **HTML, CSS e JavaScript** sem frameworks e sem etapa de build.
- **[Three.js](https://threejs.org/) 0.160**, carregado por CDN (jsDelivr) com `importmap`, para o prisma 3D.
- **Canvas 2D** para as estrelas, as faíscas e o brilho dos cliques.
- **SVG** para as capas dos álbuns, o selo do vinil e o disco da trilha.

## Estrutura do projeto

```
.
├── index.html   # estrutura, conteúdo e a cena 3D do prisma (script em módulo)
├── style.css    # estilos de todas as seções e animações
├── script.js    # estrelas, rolagem, carrosséis, linha do tempo e retorno ao topo
└── README.md
```

## Como executar

A página é estática. Basta abrir o `index.html` em um navegador moderno. **É preciso estar conectado à internet**, porque o Three.js vem de um CDN.

Para servir por um servidor local, que é o jeito mais próximo de como o site funcionará publicado:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Como personalizar

| O que | Onde |
|-------|------|
| Link do Spotify | O botão `btn-cta`, na seção `#ouvir` do `index.html` |
| Frase de impacto e textos da página inicial | A seção `#nome` do `index.html` |
| Citações que seguem o mouse na seção do nome | A lista `quotes` do `script.js` |
| Textos dos integrantes | Os cards `.mcard`, na seção `#integrantes` |
| Textos e capas dos álbuns | A seção `#albuns` do `index.html` |
| Marcos da linha do tempo | Os cartões `.tl-card`, na seção `#timeline` |
| Tempos da animação de entrada do prisma | As constantes `T0`, `D1` e `D2` no script do final do `index.html` |

## Acessibilidade e responsividade

- Para quem usa a preferência do sistema **"reduzir movimento"**, as animações contínuas ficam desligadas ou paradas, e os elementos aparecem já prontos.
- Os botões e controles têm rótulos para leitores de tela, e os carrosséis funcionam pelo teclado.
- O layout se adapta ao celular. Nessa tela, a rolagem fica livre, sem troca de álbum ou marco a cada gesto, e as seções se empilham.
- Foi pensada para navegadores atuais com suporte a WebGL.

## Decisões e limitações

- **Imagens e letras:** o projeto não usa as capas oficiais nem trechos de letras. As capas dos álbuns, o prisma e o vinil são ilustrações próprias, inspiradas nos discos. As citações que seguem o mouse são títulos de músicas.
- **Conteúdo:** os textos sobre a banda e os álbuns foram escritos a partir de fatos conhecidos. As durações são aproximadas. Vale revisar as datas e os detalhes antes de usar o conteúdo em outro lugar.
- **Dependência de internet:** sem acesso ao CDN do Three.js, a cena 3D não carrega. No topo, a página mostra uma versão estática do prisma.
- **Rolagem guiada:** em telas grandes, algumas seções conduzem a rolagem, como a que sai do prisma e as de álbuns e linha do tempo. É uma escolha de design para o efeito de viagem.

## Publicação

Por ser estática, a página pode ser publicada no **GitHub Pages**: em *Settings → Pages*, escolha a branch `main` e a pasta raiz.

## Aviso

Este é um site de fã, sem fins lucrativos e sem vínculo oficial com o Pink Floyd. Todas as marcas, músicas e obras pertencem aos seus respectivos detentores. O botão "Ouvir no Spotify" leva à página oficial do álbum na plataforma.

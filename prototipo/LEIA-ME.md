# GCG · Gestão de Contratos — protótipo em HTML + CSS

Versão 1.6 · 10/11/2026 · gerado do protótipo navegável (sislog-prototipo.vercel.app).
Todos os dados são fictícios.

## Novidades desta versão

- **Importar documentos (HU032).** Pasta nova `telas/importar-hu032-importar-documentos/`, 21 telas: o botão Novo documento e a gaveta lateral (Origem do Documento, Tipo do Documento, Descrição, Arquivo Externo e Sigiloso?), o aviso do Documento Interno, que leva à tela onde ele é emitido, as recusas do arquivo (extensão, tamanho, nome com caractere especial e arquivo corrompido), os campos obrigatórios, a falha ao salvar, o acesso sem permissão e a melhoria de UX em proposta de ajustar o nome do arquivo sozinho (enquanto não for aceita, vale a recusa da HU).
- **Ordens de Serviço e de Fornecimento (HU019 a HU030).** 12 pastas novas, 113 telas: `hu027-consultar-os-of/` (8), `hu028-consultar-saldo-os-of/` (6), `hu030-tramitar-os-of/` (8), `hu019-emitir-os/` (14), `hu020-emitir-of/` (14), `hu021-emitir-trd/` (8), `hu022-documentos-os-of/` (10), `hu023-despacho-pagamento/` (9), `hu024-editar-os-of/` (10), `hu025-excluir-os-of/` (7), `hu026-cancelar-os-of/` (9) e `hu029-ateste-os-of/` (10). Gerir OS/OF no menu, a aba OS/OF no contrato, a página da ordem, emitir, editar, excluir, cancelar, documentos, saldo, TRD, despacho de pagamento, ateste e a linha do tempo da ordem. CSS de composição novos: `telas/css/gcg-osof-*.css`.
- **Exportar documentos (HU033).** Pasta nova `telas/exportar-hu033-exportar-documentos/`, 9 telas: Baixar no menu da linha e no preview (o arquivo original), a seleção de vários documentos com a barra flutuante e o ZIP, o documento sigiloso e o cancelado com a caixa desabilitada para quem não tem permissão, a falha ao obter o arquivo e o Exportar lista nos seis formatos.
- **Cancelar documentos (HU034).** Pasta nova `telas/cancelar-hu034-cancelar-documentos/`, 12 telas: Cancelar documento no menu da linha, a gaveta com a primeira página do documento à vista e o Motivo ou observação obrigatório, Voltar sem cancelar, a falha ao cancelar, o documento cancelado na lista e no preview e o menu sem a ação para quem não tem permissão.
- **Telas da Documentação que mudaram** (Consumir templates, 19 telas; Assinatura HU001, 23; Assinatura HU002, 6): a barra com Exportar lista e Novo documento acima dos filtros; a coluna de seleção, com a caixa no cabeçalho e na faixa de cada grupo; no menu da linha, o nome do documento no cabeçalho, Baixar no lugar de Exportar e Cancelar documento por último; no rodapé do preview, Baixar. Três telas de Consumir templates (`l6-1-menu-exportar-aberto.html`, `l6-2-documento-exportado.html` e `l9-2-falha-ao-exportar.html`) mostravam o Exportar do documento, que a HU033 trocou pelo Baixar: já têm o menu novo, mas o aviso ainda fala em exportar. Para baixar um documento, valem as telas da HU033.
- **Painel do Analista Financeiro, L3 · 2:** faltavam desde a v1.4 os moldes do menu Exportar da lista e do seletor Exibir por página; agora os dois abrem.
- **Biblioteca:** o `gcg-table.css` ganhou a caixa antes do botão da faixa do grupo e a célula de cabeçalho com conteúdo próprio (a caixa de selecionar todos); o `gcg-demo-states.css`, o hover forçado do link "abrir o documento inteiro". Composição nova: `telas/css/gcg-tpl-gaveta.css` (gavetas, barra de seleção, rádio e área de arrastar).
- **Celular:** até 600 px de largura, a gaveta lateral e o preview viram um painel que sobe da parte de baixo da tela (bottom sheet), em `telas/css/gcg-tpl-preview.css`; a barra de seleção em duas linhas e a primeira página menor do Cancelar estão no `gcg-tpl-gaveta.css`.
- **Comportamento:** o `gcg-behavior.js` ganhou a seleção na tabela (evento `gcg:selectionchange` e `GcgBehavior.clearSelection`), o grupo que recolhe guardando a marcação e o Voltar que fecha a gaveta lateral; a gaveta Novo documento abre pelo molde, como o preview. Detalhes na seção "Comportamento".
- **Pacote inteiro:** tudo o que foi feito da v1.0 à v1.6. Quem não tem nenhuma versão descompacta e abre o `index.html`. Quem já tem a v1.5 pode descompactar por cima, substituindo os arquivos: desde a v1.5 entraram 162 arquivos e mudaram 56 (os listados acima e no `CHANGELOG-v1.6.md`); os outros 334 são os mesmos.

## Como ler este pacote (economize leitura)

1. Este arquivo.
2. A tela que você vai construir, em `telas/<hu>/`. O comentário no topo de cada tela diz a
   linha e o frame do Figma e lista os componentes que ela usa.
3. Só o CSS desses componentes, em `biblioteca/css/components/`, e o da composição, em
   `telas/css/`. Não é preciso ler a biblioteca inteira.
4. A fundação (`biblioteca/css/gcg-*.css`) só quando precisar de um token ou de uma regra
   geral.

Cada HU tem vários estados (um arquivo por frame do Figma). O HTML de um estado para o outro
muda pouco: leia um estado inteiro e, dos outros, só o que muda.

O `manifesto.json` traz o mesmo em formato de máquina: cada tela, a linha e o frame do Figma,
os componentes e os ícones que ela usa.

## Estrutura

```
LEIA-ME.md          este arquivo
index.html          a lista das telas, para abrir no navegador (dois cliques, sem servidor)
manifesto.json      telas × componentes × ícones
biblioteca/
  css/              a fundação (gcg-*.css)
  css/gcg-demo-states.css   SÓ DEMONSTRAÇÃO: os estados parados dos frames (ver abaixo)
  css/components/   um arquivo por componente (42 nesta versão)
  js/gcg-icons.js   põe o sprite dos ícones na página
  js/gcg-motion.js  a camada básica de movimento (contagem, saída, reentrada)
  js/gcg-behavior.js  o comportamento: abrir e fechar, teclado, foco e as animações (ver "Comportamento")
  icons/sprite.svg  os 68 ícones (Material Symbols Rounded, os mesmos do Figma)
  fonts/            Public Sans 400 a 700, local
telas/
  css/              composição de tela (39 arquivos): lista, detalhe, abas, painéis
  <hu>/             uma pasta por HU, um arquivo por estado
```

| Tela | Pasta | Estados |
|---|---|---|
| Assinatura HU001 · Realizar assinatura documento | `telas/assinatura-hu001-realizar-assinatura/` | 23 |
| Assinatura HU002 · Visualizar documento assinado | `telas/assinatura-hu002-visualizar-documento-assinado/` | 6 |
| Cancelar HU034 · Cancelar documentos | `telas/cancelar-hu034-cancelar-documentos/` | 12 |
| Exportar HU033 · Exportar documentos | `telas/exportar-hu033-exportar-documentos/` | 9 |
| HU-001 · Listar contratos | `telas/hu001-listar-contratos/` | 35 |
| HU-002 · Consultar saldos | `telas/hu002-consultar-saldos/` | 14 |
| HU-003 · Consultar aditivos | `telas/hu003-consultar-aditivos/` | 13 |
| HU-004 · Consultar apostilamentos | `telas/hu004-consultar-apostilamentos/` | 13 |
| HU-005 · Consultar equipe | `telas/hu005-consultar-equipe/` | 14 |
| HU-006 · Consultar documentos | `telas/hu006-consultar-documentos/` | 17 |
| HU-007 · Consultar tramitações | `telas/hu007-consultar-tramitacoes/` | 10 |
| HU-008 · Consultar ocorrências | `telas/hu008-consultar-ocorrencias/` | 10 |
| HU-009 · Consultar dados gerais | `telas/hu009-consultar-dados-gerais/` | 14 |
| HU-010 · Exportar lista de contratos | `telas/hu010-exportar-lista/` | 10 |
| HU-011 · Enviar avisos/comunicação | `telas/hu011-enviar-avisos/` | 20 |
| HU-012 · Painel do Gestor e do Fiscal | `telas/hu012-painel-gestor-e-fiscal/` | 19 |
| HU-013 · Painel do Fornecedor | `telas/hu013-painel-fornecedor/` | 11 |
| HU-014 · Painel do Procurador Setorial | `telas/hu014-painel-procurador-setorial/` | 7 |
| HU-015 · Painel do Analista Financeiro | `telas/hu015-painel-analista-financeiro/` | 16 |
| HU-016 · Painel do Coordenador de Contratos | `telas/hu016-painel-coordenador-de-contratos/` | 22 |
| HU019 · Emitir Ordem de Serviço | `telas/hu019-emitir-os/` | 14 |
| HU020 · Emitir Ordem de Fornecimento | `telas/hu020-emitir-of/` | 14 |
| HU021 · Emitir Termo de Recebimento Definitivo da OS/OF | `telas/hu021-emitir-trd/` | 8 |
| HU022 · Documentos OS/OF | `telas/hu022-documentos-os-of/` | 10 |
| HU023 · Emitir Despacho de Ordem de Pagamento | `telas/hu023-despacho-pagamento/` | 9 |
| HU024 · Editar Ordem de Serviço e Ordem de Fornecimento | `telas/hu024-editar-os-of/` | 10 |
| HU025 · Excluir Ordem de Serviço e Ordem de Fornecimento | `telas/hu025-excluir-os-of/` | 7 |
| HU026 · Cancelar Ordem de Serviço e Ordem de Fornecimento | `telas/hu026-cancelar-os-of/` | 9 |
| HU027 · Consultar Ordem de Serviço e Fornecimento | `telas/hu027-consultar-os-of/` | 8 |
| HU028 · Consultar Saldo de Ordem de Serviço e Ordem de Fornecimento | `telas/hu028-consultar-saldo-os-of/` | 6 |
| HU029 · Ateste de Ordem de Serviço e Ordem de Fornecimento | `telas/hu029-ateste-os-of/` | 10 |
| HU030 · Tramitar Ordem de Serviço e Ordem de Fornecimento | `telas/hu030-tramitar-os-of/` | 8 |
| Importar HU032 · Importar documentos | `telas/importar-hu032-importar-documentos/` | 21 |
| Templates · Consumir templates · Documentos do contrato | `telas/templates-consumir-documentos/` | 19 |

## Biblioteca × composição local

A regra do projeto (vale para o Figma e para o código):

- **Componente de biblioteca** (`biblioteca/css/components/`) só quando a peça se repete em
  três lugares ou mais, ou é um padrão geral do sistema. Nome em inglês, propriedades iguais às do
  Figma (página 05). Ex.: `gcg-panel-link`, que aparece nos cinco painéis.
- **Composição local (snowflake)** (`telas/css/`): a peça que aparece numa tela só, ou em
  duas. Tem arquivo e CSS próprios, com o nome da peça em português, como as telas da v1.0
  (`gcg-execucao-financeira.css`), e é montada com componentes e tokens da biblioteca,
  sem cor nem medida solta. Não é código solto dentro da página.
- **Promoção:** no terceiro uso, a composição vira componente da biblioteca, no Figma e no código.
  Até lá, não generalize: construa a peça como está na tela.

## Ordem de carga no layout

```html
<!-- 1. o Bootstrap 3 do SISLOG, como já é hoje -->
<link rel="stylesheet" href=".../bootstrap.css">
<!-- 2. a fundação, nesta ordem -->
<link rel="stylesheet" href="biblioteca/css/gcg-bootstrap3.css">
<link rel="stylesheet" href="biblioteca/css/gcg-fonts.css">
<link rel="stylesheet" href="biblioteca/css/gcg-tokens.css">
<link rel="stylesheet" href="biblioteca/css/gcg-layers.css">
<link rel="stylesheet" href="biblioteca/css/gcg-motion.css">
<link rel="stylesheet" href="biblioteca/css/gcg-base.css">
<!-- 3. os componentes que a página usa -->
<link rel="stylesheet" href="biblioteca/css/components/gcg-<componente>.css">
<!-- 4. a composição da tela, se houver (telas/css/) -->
<!-- 5. por último: a barra de acessibilidade troca os tokens -->
<link rel="stylesheet" href="biblioteca/css/gcg-emag.css">
<!-- no fim do <body> -->
<script src="biblioteca/js/gcg-icons.js"></script>
<script src="biblioteca/js/gcg-motion.js"></script>
<script src="biblioteca/js/gcg-behavior.js"></script>
```

## Movimento

As animações estão no CSS: os tokens de duração e de curva em `gcg-motion.css` e cada animação no
arquivo do componente. Com `prefers-reduced-motion: reduce`, nada anima: o estado final aparece
na hora. O `gcg-motion.js` faz só o que o CSS não faz sozinho:

- **Contagem do dado que chega:** os valores de `gcg-value-tile`, `gcg-indicator-card` e
  `gcg-consumption-meter` (e o que levar `data-gcg-count`) contam de 0 até o número final
  em `--gcg-motion-data`, junto com a barra que enche. Roda sozinho quando a página abre. Para um
  valor que mudou depois: `GcgMotion.countUp(el, valorAnterior)`.
- **Saída:** `GcgMotion.leave(el, 'gcg-filter-chip--leaving')` põe a classe de saída, espera a
  animação e devolve uma Promise; depois, tire o elemento ou feche o estado.
- **Entrada de novo:** `GcgMotion.replay(el)` roda de novo as animações de entrada de um bloco
  cujo conteúdo foi trocado sem recarregar a página (lista filtrada, aba trocada).

O texto final fica sempre no DOM: o leitor de tela lê só ele; a contagem é uma cópia por cima, com
`aria-hidden`.

| Componente | Onde | Animação | Duração | Curva | Quando |
|---|---|---|---|---|---|
| `gcg-action-menu` | `.gcg-action-menu__surface--bottom, .gcg-action-menu__surf…` | `gcg-motion-scale-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-alert` | `.gcg-alert` | `gcg-motion-drop-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-app-shell` | `.gcg-app-shell__main` | `gcg-app-shell-enter` | `--gcg-motion-slow` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-button` | `.gcg-button__spinner` | `gcg-motion-fade-in` | `--gcg-motion-fast` | `--gcg-ease-standard` | contínua, enquanto carrega |
| `gcg-consumption-meter` | `.gcg-consumption-meter__fill` | `gcg-consumption-meter-fill` | `--gcg-motion-data` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-consumption-meter` | `.gcg-consumption-meter__figures` | `gcg-motion-fade-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-consumption-meter` | `.gcg-consumption-meter__skeleton-bar` | `gcg-consumption-meter-pulse` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-consumption-meter` | `.gcg-consumption-meter--loading .gcg-consumption-meter__t…` | `gcg-consumption-meter-pulse` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-contract-header` | `.gcg-contract-header__skeleton` | `gcg-contract-header-pulse` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-contract-header` | `.gcg-contract-header:not(.gcg-contract-header--loading) .…` | `gcg-motion-fade-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-empty-state` | `.gcg-empty-state__medallion` | `gcg-motion-pop-in` | `--gcg-motion-base` | `--gcg-ease-spring` | entrada: quando o elemento aparece |
| `gcg-empty-state` | `.gcg-empty-state__message` | `gcg-motion-rise-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-empty-state` | `.gcg-empty-state > .gcg-button` | `gcg-motion-rise-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-field` | `.gcg-field__clear` | `gcg-motion-pop-in` | `--gcg-motion-fast` | `--gcg-ease-spring` | entrada: quando o elemento aparece |
| `gcg-field` | `.gcg-field__error` | `gcg-motion-drop-in` | `--gcg-motion-fast` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-file-upload` | `.gcg-file-item` | `gcg-motion-rise-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-file-upload` | `.gcg-file-item__progress[data-gcg-indeterminate] .gcg-fil…` | `gcg-file-item-pulse` | `--gcg-motion-pulse` | `--gcg-ease-standard` | contínua, enquanto carrega |
| `gcg-filter-chip` | `.gcg-filter-chip` | `gcg-filter-chip-in` | `--gcg-motion-base` | `--gcg-ease-spring` | entrada: quando o elemento aparece |
| `gcg-filter-chip` | `.gcg-filter-chip.gcg-filter-chip--leaving` | `gcg-filter-chip-out` | `--gcg-motion-fast` | `--gcg-ease-exit` | saída: com a classe ou o estado de saída (GcgMotion.leave) |
| `gcg-filter-drawer` | `.gcg-filter-drawer--overlay .gcg-filter-drawer__panel` | `gcg-filter-drawer-slide-in` | `--gcg-motion-slow` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-filter-drawer` | `.gcg-filter-drawer[data-gcg-state='closing'] .gcg-filter-…` | `gcg-filter-drawer-slide-out` | `--gcg-motion-base` | `--gcg-ease-exit` | saída: com a classe ou o estado de saída (GcgMotion.leave) |
| `gcg-indicator-card` | `.gcg-indicator-card__progress-fill` | `gcg-indicator-card-fill` | `--gcg-motion-data` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-modal` | `.gcg-modal-layer--leaving .gcg-scrim` | `gcg-motion-fade-out` | `--gcg-motion-fast` | `--gcg-ease-exit` | saída: com a classe ou o estado de saída (GcgMotion.leave) |
| `gcg-modal` | `.gcg-modal` | `gcg-motion-scale-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-modal` | `.gcg-modal-layer--leaving .gcg-modal` | `gcg-motion-scale-out` | `--gcg-motion-fast` | `--gcg-ease-exit` | saída: com a classe ou o estado de saída (GcgMotion.leave) |
| `gcg-page-header` | `.gcg-page-header__counter` | `gcg-motion-pop-in` | `--gcg-motion-base` | `--gcg-ease-spring` | entrada: quando o elemento aparece |
| `gcg-pagination` | `.gcg-pagination__number--range` | `gcg-motion-rise-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-popover` | `.gcg-popover--bottom` | `gcg-motion-scale-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-popover` | `.gcg-popover--top` | `gcg-motion-scale-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-popover` | `.gcg-popover--inline` | `gcg-motion-scale-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-scrim` | `.gcg-scrim` | `gcg-motion-fade-in` | `--gcg-scrim-in-duration` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-scrim` | `.gcg-scrim--leaving` | `gcg-motion-fade-out` | `--gcg-motion-base` | `--gcg-ease-exit` | saída: com a classe ou o estado de saída (GcgMotion.leave) |
| `gcg-search-field` | `.gcg-search-loading__icon` | `gcg-search-spin` | `1s` | linear | contínua, enquanto carrega |
| `gcg-sidebar` | `.gcg-sidebar__list--nested.gcg-sidebar__list--toggled:not…` | `gcg-motion-drop-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-switch` | `.gcg-switch__value` | `gcg-motion-fade-in` | `--gcg-motion-fast` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-table` | `.gcg-data-table__skeleton-bar` | `gcg-data-table-pulse` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-table` | `.gcg-data-table__row:not(.gcg-data-table__row--skeleton)` | `gcg-motion-rise-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-table` | `.gcg-data-table__row--skeleton` | `gcg-motion-fade-in` | `--gcg-motion-fast` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-table` | `.gcg-data-table__footer` | `gcg-motion-fade-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-timeline` | `.gcg-timeline-item` | `gcg-motion-rise-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-timeline` | `.gcg-timeline-item__skeleton-bar` | `gcg-timeline-pulse` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-toast` | `.gcg-toast--live` | `gcg-toast-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-toast` | `.gcg-toast--leaving` | `gcg-toast-out` | `--gcg-motion-fast` | `--gcg-ease-exit` | saída: com a classe ou o estado de saída (GcgMotion.leave) |
| `gcg-toast` | `.gcg-toast__timer` | `gcg-toast-timer` | `8s` | linear | o tempo até o aviso sumir |
| `gcg-tooltip` | `.gcg-tooltip-bubble--floating` | `gcg-motion-scale-in` | `--gcg-motion-fast` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-tooltip` | `.gcg-tooltip-bubble--floating.gcg-tooltip-bubble--leaving` | `gcg-motion-scale-out` | `--gcg-motion-instant` | `--gcg-ease-exit` | saída: com a classe ou o estado de saída (GcgMotion.leave) |
| `gcg-value-tile` | `.gcg-value-tile__value` | `gcg-motion-fade-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-value-tile` | `.gcg-value-tile__note` | `gcg-motion-fade-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-value-tile` | `.gcg-value-tile__skeleton-bar` | `gcg-value-tile-pulse` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-aba-avisos` | `.gcg-aba-avisos__opcoes:not(.gcg-aba-avisos__opcoes--carr…` | `gcg-motion-fade-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-aba-avisos` | `.gcg-aba-avisos__barra` | `gcg-aba-avisos-pulso` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-aba-dados-gerais` | `.gcg-aba-dados-gerais__barra` | `gcg-aba-dados-gerais-pulso` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-consumo-da-linha` | `.gcg-consumo-da-linha__fill` | `gcg-consumo-da-linha-encher` | `--gcg-motion-data` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-estados-do-painel` | `.gcg-painel-esqueleto__barra` | `gcg-painel-pulso` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-fila` | `.gcg-fila__linha` | `gcg-motion-rise-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-fila` | `.gcg-fila-esqueleto__cartao` | `gcg-painel-pulso` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-fila` | `.gcg-fila-esqueleto__bloco` | `gcg-painel-pulso` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-osof-aba` | `.gcg-osof-aba__selecao` | `gcg-motion-fade-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-osof-form` | `.gcg-osof-form__itens-linha--nova` | `gcg-motion-rise-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-osof-ordem` | `.gcg-osof-grafico__barra` | `gcg-osof-barra-sobe` | `--gcg-motion-data` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-osof-ordem` | `.gcg-osof-rosca__svg` | `gcg-osof-rosca-entra` | `--gcg-motion-data` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-queue-row` | `.gcg-queue-group` | `gcg-motion-rise-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-queue-row` | `.gcg-queue-group__sub > .gcg-fila__linha` | `gcg-motion-drop-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-term-timeline` | `.gcg-term-timeline__record` | `gcg-motion-rise-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-term-timeline` | `.gcg-term-timeline--loading .gcg-term-timeline__record` | `gcg-motion-fade-in` | `--gcg-motion-fast` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-term-timeline` | `.gcg-term-timeline__skeleton` | `gcg-term-timeline-pulse` | `--gcg-motion-pulse` | ease-in-out | contínua, enquanto carrega |
| `gcg-tpl-gaveta` | `.gcg-tpl-gaveta .gcg-doc-radio__erro` | `gcg-motion-drop-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-tpl-gaveta` | `.gcg-tpl-gaveta .gcg-doc-novo__lista > li` | `gcg-motion-rise-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-tpl-gaveta` | `.gcg-tpl-aba .gcg-doc-selecao__barra` | `gcg-doc-selecao-in` | `--gcg-motion-base` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-tpl-gaveta` | `.gcg-tpl-aba .gcg-doc-selecao[data-gcg-state='closing'] .…` | `gcg-doc-selecao-out` | `--gcg-motion-fast` | `--gcg-ease-exit` | saída: com a classe ou o estado de saída (GcgMotion.leave) |
| `gcg-tpl-preview` | `.gcg-tpl-preview__panel` | `gcg-tpl-preview-in` | `--gcg-motion-slow` | `--gcg-ease-standard` | entrada: quando o elemento aparece |
| `gcg-tpl-preview` | `.gcg-tpl-preview[data-gcg-state='closing'] .gcg-tpl-previ…` | `gcg-tpl-preview-out` | `--gcg-motion-base` | `--gcg-ease-exit` | saída: com a classe ou o estado de saída (GcgMotion.leave) |

## Comportamento

O `biblioteca/js/gcg-behavior.js` faz abrir e fechar, o teclado, o foco e liga as animações que já estão
no CSS. É JavaScript puro, sem dependência: não usa o jQuery nem o JavaScript do Bootstrap, e convive
com os dois. Ligue uma vez no layout, no fim do `<body>`, depois do `gcg-icons.js` e do
`gcg-motion.js` (ver "Ordem de carga"). Não precisa chamar nada por componente: o script escuta o
`document` e reconhece cada componente pelas classes `gcg-*` e pelos atributos `aria-*` e
`data-gcg-*` que já estão no HTML. O que o servidor trocar na página continua funcionando.

Com `prefers-reduced-motion: reduce`, nada anima: abre e fecha na hora.

| Componente | O que faz | Teclado | Como ligar | Animação |
|---|---|---|---|---|
| ActionMenu (`gcg-action-menu`) e menu do perfil (`gcg-topbar__menu-perfil`) | Abre e fecha o menu; clique fora fecha; item com `aria-disabled` não aciona; o item escolhido dispara `gcg:menuselect` (`detail.item` = `data-gcg-menu-item`) | Enter, Espaço ou ↓ abrem no primeiro item, ↑ no último; ↑ ↓ andam e dão a volta; Home, End; uma letra vai ao item que começa com ela; Esc fecha e devolve o foco ao botão; Tab fecha e segue | Botão com `aria-haspopup="menu"` e `data-gcg-popup="<id do template>"` | Entra com `gcg-motion-scale-in` (`--gcg-motion-base`) a partir do canto do botão; sai encolhendo (`--gcg-motion-fast`); no botão com rótulo, a seta troca e gira 180° |
| Modal (`gcg-modal-layer`) | Abre sobre o véu; o foco vai ao campo, ao conteúdo ou a Cancelar; ×, Cancelar e Esc fecham sem confirmar; o botão principal dispara `gcg:confirm` (cancelável) e fecha | Tab e Shift+Tab presos na janela; Esc fecha; o foco volta a quem abriu | Gatilho com `aria-haspopup="dialog"` e `data-gcg-popup`; um item de menu também pode levar `data-gcg-popup` | `gcg-motion-scale-in` e o véu em fade; a saída é a classe `gcg-modal-layer--leaving` |
| Gaveta de filtros (`gcg-filter-drawer`) | Abre da direita, com o foco no primeiro campo; ×, véu e Esc fecham sem aplicar; Filtrar dispara `gcg:submit` (cancelável) e fecha; Limpar dispara `gcg:clear`; marca `data-gcg-drawer-open` no `<html>` (o toast estreita) | Tab preso na gaveta; Esc fecha (com uma lista ou o calendário aberto dentro, o Esc fecha só ele) | Botão Filtros com `aria-haspopup="dialog"` e `data-gcg-popup` | `gcg-filter-drawer-slide-in` (`--gcg-motion-slow`); a saída é `data-gcg-state="closing"` e o véu `gcg-scrim--leaving` |
| Preview lateral (`gcg-tpl-preview`) | Visualizar abre o documento ao lado da lista; × do preview, véu e Esc fecham | Como a gaveta | Link Visualizar com `aria-haspopup="dialog"` e `data-gcg-popup` | `gcg-tpl-preview-in`; a saída é `data-gcg-state="closing"` (`gcg-tpl-preview-out`) |
| Gaveta lateral (`gcg-tpl-preview gcg-tpl-gaveta`): Novo documento e Cancelar documento | Abre da direita sobre o véu, com o foco no painel; ×, Cancelar, Voltar, véu e Esc fecham sem salvar nem cancelar; abaixo de 600 px de largura vira folha de baixo, só pelo CSS | Como a gaveta de filtros | Botão Novo documento com `aria-haspopup="dialog"` e `data-gcg-popup`. A gaveta do Cancelar documento abre pelo item do menu: ponha `data-gcg-popup` no item, apontando para o `<template>` da gaveta (o conteúdo está nas telas da HU034) | `gcg-tpl-preview-in` (`--gcg-motion-slow`); na folha de baixo, `gcg-tpl-folha-in`; a saída é `data-gcg-state="closing"` |
| Seleção na tabela (`gcg-checkbox` na coluna de seleção, na faixa do grupo e no cabeçalho) | A caixa do cabeçalho marca as linhas da página; a da faixa, as do grupo, mesmo recolhido; a da linha, só ela; a desabilitada fica de fora; a linha marcada ganha `gcg-data-table__row--selected`; recolher o grupo guarda a marcação; quando a seleção muda, dispara `gcg:selectionchange`; Limpar seleção (`gcg-doc-selecao__limpar`) e `GcgBehavior.clearSelection(tabela)` desmarcam tudo | Espaço marca e desmarca (é um `<input type="checkbox">`) | Nada: a caixa `gcg-checkbox__input` na primeira célula da linha, dentro da `gcg-data-table` | A barra de seleção (`gcg-doc-selecao`) sobe com `gcg-doc-selecao-in` ao entrar na página e desce com `data-gcg-state="closing"`; quem constrói põe e tira a barra |
| Abas (`gcg-tabs`) | Ativação manual: clique, Enter ou Espaço abrem a aba (`aria-selected`, `gcg-tabs__tab--selected`, `tabindex`); mostra o painel se ele já estiver na página (o id da aba com `-panel-` no lugar de `-tab-`); senão dispara `gcg:tabchange` para o servidor trazer o painel | ← → movem o foco e dão a volta; Home, End; só a aba aberta entra no Tab | Nada: `role="tablist"` e `role="tab"` | O indicador desliza da aba anterior (só transform, `--gcg-motion-base`); o painel entra com fade e 8 px vindo do lado da aba |
| Select (`gcg-select`) | Abre no clique do campo; a escolha simples fecha, a múltipla (`aria-multiselectable`) continua aberta; atualiza o texto do campo, o check e `aria-selected`; dispara `gcg:change`; o × limpa | ↓ ↑ Enter Espaço Home End abrem; setas, PageUp, PageDown, Home, End andam; Enter ou Espaço escolhem; letras saltam; Esc fecha; Tab escolhe a ativa e segue; Alt+↑ escolhe e fecha | `role="combobox"` com `aria-haspopup="listbox"` e `data-gcg-popup` | `gcg-motion-scale-in` a partir do campo (`gcg-popover--bottom` ou `--top`, conforme o espaço); sai encolhendo |
| DatePicker (`gcg-date-picker`) | Máscara DD/MM/AAAA; clicar no campo ou no ícone abre o calendário, montado pelo script; Hoje e Limpar; dia fora do intervalo riscado; a escolha vai para o campo e dispara `input`, `change` e `gcg:change` | ↓ no campo vai ao calendário; setas movem o dia; Home e End, a semana; PageUp e PageDown, o mês (com Shift, o ano); Esc fecha; Tab circula no calendário | Nada além do `gcg-field--date` com o `gcg-datepicker__trigger`. Intervalo opcional: `data-gcg-min-date="DD/MM/AAAA"` e `data-gcg-max-date` no `.gcg-field` | Entra como a lista; trocar de mês desliza as semanas 8 px no sentido da troca, e o nome do mês troca com fade |
| Tooltip (`gcg-tooltip`) | Abre no hover (300 ms) e no foco pelo teclado; fica aberta com o ponteiro em cima dela; o clique no alvo fecha | Esc fecha sem mexer no foco | O alvo dentro de `<span class="gcg-tooltip">`, com `aria-describedby` apontando para a dica (`role="tooltip"`, `hidden`) | `gcg-motion-scale-in` (`--gcg-motion-fast`); sai com `gcg-tooltip-bubble--leaving` |
| Toast (`gcg-toast`) | `GcgBehavior.toast({ type, message })`; success e info somem em 8 s (pausa no hover e no foco), error e warning ficam até fechar; até 3; a mesma mensagem substitui a anterior; o texto vai para a região viva; × fecha | Esc com o foco no aviso fecha só ele e devolve o foco | Chamada em JavaScript. O `gcg-toaster` e as regiões vivas, se não estiverem na página, o script cria. O aviso que já vem no HTML fica parado; o × fecha | `gcg-toast-in`; sai com `gcg-toast--leaving`; a barra `gcg-toast__timer` mostra o tempo que falta |
| Cabeçalho de grupo da tabela (`gcg-data-table__group-button`) | Recolhe e abre o grupo (`aria-expanded`); as linhas vêm do molde, ou do servidor pelo `gcg:grouptoggle` | Enter e Espaço (é um `<button>`) | `data-gcg-popup` no botão do grupo recolhido; o aberto não precisa | O chevron troca e gira um quarto de volta (`--gcg-motion-base`); as linhas entram com a animação do CSS |
| Seção recolhível (`gcg-section-card--collapsible`) | Abre e recolhe (`aria-expanded`, `hidden`, `gcg-section-card--expanded` / `--collapsed`); dispara `gcg:toggle` | Enter e Espaço | Nada: o `gcg-section-card__toggle` | A altura anima (`data-gcg-animating`, `--gcg-motion-slow`); o chevron troca e gira |
| Confirmação da casinha (`gcg-start-screen-button`) | Abre presa ao botão; Cancelar, clique fora e Esc fecham; Definir dispara `gcg:confirm` | Esc fecha | `data-gcg-popup` no botão da casinha | Como a lista |
| Janela dos signatários (`gcg-tpl-signatarios`) | + Adicionar signatário acrescenta uma linha em branco (cópia da última); a lixeira remove a linha e renumera; com uma linha só, a lixeira fica desabilitada | O foco vai ao primeiro campo da linha nova | Nada: dentro do Modal | A linha nova entra com fade e 4 px |
| Barra de acessibilidade (eMAG, `gcg-topbar__emag`) | Diminuir, padrão e aumentar o texto (100 a 200%), negrito, relevo, alto contraste e inverter cores (um desliga o outro); `aria-pressed` e `aria-disabled` nos limites; anuncia o tamanho; lembra na próxima página (`localStorage`, chave `gcg-a11y`) | ← → Home End entre os botões; um só ponto de Tab | `data-gcg-emag` nos botões | Nenhuma |

### A parte que abre: os moldes

Numa tela fechada, a parte que abre (as opções do menu, a lista do Select, a gaveta, o Modal, o preview, as
linhas de um grupo recolhido) não está no HTML. Ela vem num `<template>` no fim do `<body>`, e o
gatilho aponta para ele com `data-gcg-popup="<id>"`. O `<template>` não aparece na tela; ao abrir, o
script copia o conteúdo para a página, e ao fechar, tira.

```html
<template id="gcg-molde-3">
  <div data-gcg-part data-gcg-mount="body">   <!-- onde entra: no fim do <body> (menu, lista, Modal) -->
    …a marcação aberta, igual à da tela em que o componente aparece aberto…
  </div>
</template>
```

- `data-gcg-mount`: `body` (as camadas que flutuam), `up:N` (o ancestral N níveis acima do
  gatilho: a gaveta, as linhas do grupo) ou `#id` com `data-gcg-path` (o caminho de índices a partir
  desse elemento). `data-gcg-index` é a posição entre os irmãos. Linhas de tabela vêm num
  `<tbody data-gcg-part>`, porque o navegador descarta o `<tr>` dentro de um `<div>`.
- Dentro de uma janela, os gatilhos também apontam para os seus moldes (os Selects da gaveta, o Visualizar das
  linhas de um grupo).
- **Na aplicação:** o mais simples é o servidor imprimir a marcação do menu, da lista ou da janela (o partial
  do Razor) dentro de um `<template id="…">` e pôr `data-gcg-popup` no gatilho. A parte que já vem
  aberta no HTML também funciona: o script a adota e, ao fechar, guarda para a próxima abertura.
- O calendário do DatePicker não precisa de molde: o script monta o mês.

### Eventos

O script não tem regra de negócio. Ele avisa e quem constrói decide (`CustomEvent`, com `bubbles`):

| Evento | Em quem | Quando | `detail` |
|---|---|---|---|
| `gcg:open` · `gcg:close` | o gatilho | abriu ou fechou (menu, lista, calendário, janela) | `kind`; `empty: true` quando não havia o que abrir |
| `gcg:menuselect` | o item | escolheu um item do menu | `item` (o `data-gcg-menu-item`), `trigger` |
| `gcg:change` | o campo | escolheu no Select ou no calendário | `value`, `values` |
| `gcg:tabchange` | a aba | abriu uma aba | `tab`, `previous`, `panel` (`null` se o painel não está na página) |
| `gcg:submit` | o `<form>` da gaveta | Filtrar (ou Enter num campo) | cancelável: com `preventDefault()`, a gaveta não fecha |
| `gcg:clear` | a gaveta | Limpar | — |
| `gcg:confirm` | a janela | o botão principal do Modal, Definir da casinha | cancelável: com `preventDefault()`, a janela não fecha |
| `gcg:grouptoggle` · `gcg:toggle` | o botão | abriu ou recolheu o grupo ou a seção | `expanded` |
| `gcg:selectionchange` | a tabela | marcou ou desmarcou uma caixa de seleção | `count`, `rows` (as linhas marcadas) |

O `<form>` da gaveta com o atributo `action` é enviado pelo navegador, como sempre.

```html
<script>
  // o item Editar do menu de ações de uma linha
  document.addEventListener('gcg:menuselect', function (e) {
    if (e.detail.item === 'editar') window.location.href = '/contratos/418-2026/editar';
  });
  // Filtrar: a busca é do servidor; a gaveta fecha sozinha
  document.addEventListener('gcg:submit', function (e) {
    var dados = new FormData(e.target);
    // … buscar e trocar a lista; depois, GcgMotion.replay(lista) roda de novo a entrada das linhas
  });
  // um aviso
  GcgBehavior.toast({ type: 'success', message: 'Filtro salvo.' });
</script>
```

Também dá para comandar pelo JavaScript: `GcgBehavior.open(gatilho)`, `GcgBehavior.close(gatilho)` (sem
argumento, fecha a janela de cima), `GcgBehavior.selectTab(aba)` e `GcgBehavior.toast({ type, message })`.

### Nas telas deste pacote

Cada tela já liga o script e traz os moldes: dá para abrir no navegador e testar. O desenho parado não
mudou (ver "Como foi conferido"). Os gatilhos que no protótipo levam para outra tela (ex.: o `open_in_new`
da lista) não abrem nada aqui. As abas mostram a troca e o indicador; o painel de outra aba está no arquivo
da tela dessa aba.

## Convenções

- **Prefixo `gcg-` em tudo:** classes, ids, atributos `data-gcg-*`, variáveis CSS
  (`--gcg-*`) e animações (`@keyframes gcg-*`). Nada colide com o Bootstrap.
- **Classes BEM em inglês:** `gcg-bloco`, `gcg-bloco__elemento`,
  `gcg-bloco--modificador`. Cada bloco é um componente e mora no arquivo de mesmo nome.
- **Tokens com o nome do Figma:** `color/green/600` é `--gcg-color-green-600`;
  `Text/MD/Regular` é `--gcg-font-text-md-regular`. Os componentes não têm cor nem
  medida solta.
- **Texto em rem, sobre 16px.** O Bootstrap 3 põe `html { font-size: 10px }`; o
  `gcg-base.css` volta para 100%. O Bootstrap 3 não usa rem, então não é afetado.
- **Convivência com o Bootstrap 3:** o `gcg-bootstrap3.css` devolve ao padrão do navegador
  as tags que o Bootstrap estiliza (label, listas, títulos, th, a:hover…), só dentro dos
  componentes gcg-. O comentário do arquivo explica cada regra. Sem o Bootstrap, ele pode sair.
- **Ícones:** `<svg aria-hidden="true" focusable="false" fill="currentColor"><use href="#gcg-icon-<nome>"></use></svg>`
  dentro de `<span class="gcg-icon gcg-icon--sm">` (16px) ou `gcg-icon--md` (20px).
  O `gcg-icons.js` põe o sprite na página; na aplicação, dá para imprimir o
  `sprite.svg` no layout no lugar do script.
- **Acessibilidade:** os atributos `aria-*`, os rótulos e as regiões vivas
  (`gcg-sr-only`) fazem parte do componente. Manter.
- **Barra de acessibilidade (eMAG):** liga atributos no `<html>`:
  `data-gcg-text-scale` (125, 150, 175, 200), `data-gcg-bold`,
  `data-gcg-relief`, `data-gcg-contrast="high"` e `data-gcg-invert`. O
  `gcg-emag.css` faz o resto.
- **Estados parados (só demonstração):** alguns frames do Figma mostram um controle com o cursor
  em cima ou com o foco (o clique do passo seguinte). Nesses arquivos, o elemento leva
  `data-gcg-force-state="hover"` ou `"focus"`, e a tela liga o
  `gcg-demo-states.css`. Na aplicação, tire os dois: o hover e o foco de verdade já estão no
  CSS de cada componente (`:hover`, `:focus-visible`).
- **Rolagem:** quando o frame do Figma mostra a página ou a gaveta rolada, o comentário no topo
  da tela diz onde. O arquivo abre no topo.

## Telas

### Assinatura HU001 · Realizar assinatura documento — `telas/assinatura-hu001-realizar-assinatura/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-ordem-de-servico-fechada-nao-enviada.html` | L1 · Enviar p/ o AssinaGO — fluxo básico, parte 1 | L1 · 1 · Ordem de Serviço fechada, não enviada |
| `l1-2-menu-de-acoes-da-linha.html` | L1 · Enviar p/ o AssinaGO — fluxo básico, parte 1 | L1 · 2 · Menu de ações da linha |
| `l1-3-confirmar-o-envio.html` | L1 · Enviar p/ o AssinaGO — fluxo básico, parte 1 | L1 · 3 · Confirmar o envio |
| `l1-4-documento-integrado.html` | L1 · Enviar p/ o AssinaGO — fluxo básico, parte 1 | L1 · 4 · Documento integrado |
| `l2-1-acao-liberada-apos-a-integracao.html` | L2 · Enviar p/ Assinatura AssinaGO — fluxo básico, parte 2 | L2 · 1 · Ação liberada após a integração |
| `l2-2-indicar-os-signatarios.html` | L2 · Enviar p/ Assinatura AssinaGO — fluxo básico, parte 2 | L2 · 2 · Indicar os signatários |
| `l2-3-signatarios-preenchidos.html` | L2 · Enviar p/ Assinatura AssinaGO — fluxo básico, parte 2 | L2 · 3 · Signatários preenchidos |
| `l2-4-confirmar-o-encaminhamento.html` | L2 · Enviar p/ Assinatura AssinaGO — fluxo básico, parte 2 | L2 · 4 · Confirmar o encaminhamento |
| `l2-5-encaminhado-em-andamento.html` | L2 · Enviar p/ Assinatura AssinaGO — fluxo básico, parte 2 | L2 · 5 · Encaminhado: em andamento |
| `l3-1-ainda-em-andamento.html` | L3 · Verificar Assinaturas AssinaGO | L3 · 1 · Ainda em andamento |
| `l3-2-concluido.html` | L3 · Verificar Assinaturas AssinaGO | L3 · 2 · Concluído |
| `l4-1-os-assinada-na-lista.html` | L4 · Documento assinado disponível | L4 · 1 · OS assinada na lista |
| `l5-1-acao-desabilitada-com-o-motivo.html` | L5 · FE001 · Sem permissão | L5 · 1 · Ação desabilitada com o motivo |
| `l6-1-os-em-digitacao.html` | L6 · FE008 · Documento não está fechado | L6 · 1 · OS em digitação |
| `l7-1-arquivo-acima-do-limite.html` | L7 · FE002 · Fora dos requisitos de integração | L7 · 1 · Arquivo acima do limite |
| `l8-1-cancelar-na-confirmacao.html` | L8 · FE007 · Cancela a confirmação | L8 · 1 · Cancelar na confirmação |
| `l8-2-nada-mudou.html` | L8 · FE007 · Cancela a confirmação | L8 · 2 · Nada mudou |
| `l9-1-integracao-nao-confirmada.html` | L9 · FE003 · Falha na comunicação com o AssinaGO | L9 · 1 · Integração não confirmada |
| `l10-1-encaminhar-antes-de-integrar.html` | L10 · FE009 · Documento não integrado | L10 · 1 · Encaminhar antes de integrar |
| `l11-1-signatario-sem-e-mail.html` | L11 · Signatários incompletos | L11 · 1 · Signatário sem e-mail |
| `l12-1-recusada-por-um-signatario.html` | L12 · FE004 · Assinatura recusada | L12 · 1 · Recusada por um signatário |
| `l13-1-prazo-expirado.html` | L13 · FE005 · Prazo de assinatura expirado | L13 · 1 · Prazo expirado |
| `l14-1-situacao-nao-atualizada.html` | L14 · FE006 · Falha ao verificar as assinaturas | L14 · 1 · Situação não atualizada |

Composição de tela: `gcg-tpl-preview.css`, `gcg-tpl-gaveta.css`, `gcg-detalhe.css`.

### Assinatura HU002 · Visualizar documento assinado — `telas/assinatura-hu002-visualizar-documento-assinado/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-visualizar-no-assinago-no-menu.html` | L1 · Visualizar no AssinaGO — fluxo básico | L1 · 1 · Visualizar no AssinaGO no menu |
| `l1-2-proposta-conferir-sem-sair-do-sistema.html` | L1 · Visualizar no AssinaGO — fluxo básico | L1 · 2 · Proposta: conferir sem sair do sistema |
| `l2-1-sem-permissao-para-visualizar.html` | L2 · FE001 · Sem permissão | L2 · 1 · Sem permissão para visualizar |
| `l3-1-os-nao-enviada-ao-assinago.html` | L3 · FE002 · Documento não integrado | L3 · 1 · OS não enviada ao AssinaGO |
| `l4-1-ainda-em-andamento.html` | L4 · FE003 · Assinado ainda não disponível | L4 · 1 · Ainda em andamento |
| `l5-1-assinago-fora-do-ar.html` | L5 · FE004 · Falha ao acessar o AssinaGO | L5 · 1 · AssinaGO fora do ar |

Composição de tela: `gcg-tpl-preview.css`, `gcg-tpl-gaveta.css`, `gcg-detalhe.css`.

### Cancelar HU034 · Cancelar documentos — `telas/cancelar-hu034-cancelar-documentos/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-menu-da-linha-com-cancelar-documento.html` | L1 · Cancelar documento · fluxo básico | L1 · 1 · Menu da linha com Cancelar documento |
| `l1-2-gaveta-aberta.html` | L1 · Cancelar documento · fluxo básico | L1 · 2 · Gaveta aberta |
| `l1-3-motivo-preenchido.html` | L1 · Cancelar documento · fluxo básico | L1 · 3 · Motivo preenchido |
| `l1-4-documento-cancelado.html` | L1 · Cancelar documento · fluxo básico | L1 · 4 · Documento cancelado |
| `l2-1-confirmar-sem-motivo.html` | L2 · Motivo não informado | L2 · 1 · Confirmar sem motivo |
| `l2-2-motivo-informado.html` | L2 · Motivo não informado | L2 · 2 · Motivo informado |
| `l3-1-voltar.html` | L3 · Desistir do cancelamento | L3 · 1 · Voltar |
| `l3-2-lista-sem-mudanca.html` | L3 · Desistir do cancelamento | L3 · 2 · Lista sem mudança |
| `l4-1-menu-do-documento-cancelado.html` | L4 · Documento cancelado | L4 · 1 · Menu do documento cancelado |
| `l4-2-documento-cancelado-aberto.html` | L4 · Documento cancelado | L4 · 2 · Documento cancelado aberto |
| `l5-1-erro-gaveta-mantida.html` | L5 · Falha no cancelamento | L5 · 1 · Erro, gaveta mantida |
| `l6-1-menu-sem-cancelar-documento.html` | L6 · Sem permissão para cancelar | L6 · 1 · Menu sem Cancelar documento |

Composição de tela: `gcg-tpl-preview.css`, `gcg-tpl-gaveta.css`, `gcg-detalhe.css`.

### Exportar HU033 · Exportar documentos — `telas/exportar-hu033-exportar-documentos/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-menu-da-linha-com-baixar.html` | L1 · Baixar um documento | L1 · 1 · Menu da linha com Baixar |
| `l2-1-um-documento-marcado-a-barra-aparece.html` | L2 · Baixar vários documentos | L2 · 1 · Um documento marcado, a barra aparece |
| `l2-2-tres-marcados-o-sigiloso-de-fora.html` | L2 · Baixar vários documentos | L2 · 2 · Três marcados, o sigiloso de fora |
| `l2-3-zip-baixado.html` | L2 · Baixar vários documentos | L2 · 3 · ZIP baixado |
| `l3-1-documento-sigiloso.html` | L3 · Sem permissão para baixar | L3 · 1 · Documento sigiloso |
| `l3-2-documento-cancelado.html` | L3 · Sem permissão para baixar | L3 · 2 · Documento cancelado |
| `l4-1-erro-lista-preservada.html` | L4 · Falha ao obter o arquivo | L4 · 1 · Erro, lista preservada |
| `l5-1-formatos-da-exportacao.html` | L5 · Exportar a lista | L5 · 1 · Formatos da exportação |
| `l5-2-lista-exportada.html` | L5 · Exportar a lista | L5 · 2 · Lista exportada |

Composição de tela: `gcg-tpl-preview.css`, `gcg-tpl-gaveta.css`, `gcg-detalhe.css`.

### HU-001 · Listar contratos — `telas/hu001-listar-contratos/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-primeiro-acesso.html` | L1 · Consultar contratos — fluxo básico | L1 · 1 · Primeiro acesso |
| `l1-2-gaveta-aberta-filtros-preenchidos.html` | L1 · Consultar contratos — fluxo básico | L1 · 2 · Gaveta aberta, filtros preenchidos |
| `l1-3-carregando.html` | L1 · Consultar contratos — fluxo básico | L1 · 3 · Carregando |
| `l1-4-resultados.html` | L1 · Consultar contratos — fluxo básico | L1 · 4 · Resultados |
| `l2-1-fornecedor-do-contrato-por-cpf.html` | L2 · Campos da gaveta — máscara, pesquisa dinâmica e calendário | L2 · 1 · Fornecedor do Contrato por CPF |
| `l2-2-fornecedor-do-contrato-por-cnpj.html` | L2 · Campos da gaveta — máscara, pesquisa dinâmica e calendário | L2 · 2 · Fornecedor do Contrato por CNPJ |
| `l2-3-gestor-do-contrato-por-nome.html` | L2 · Campos da gaveta — máscara, pesquisa dinâmica e calendário | L2 · 3 · Gestor do Contrato por nome |
| `l2-4-calendario-aberto.html` | L2 · Campos da gaveta — máscara, pesquisa dinâmica e calendário | L2 · 4 · Calendário aberto |
| `l3-1-inicio-vigencia-depois-de-fim-vigencia.html` | L3 · FE02 · Dado de pesquisa inválido | L3 · 1 · Início Vigência depois de Fim Vigência |
| `l3-2-campo-corrigido.html` | L3 · FE02 · Dado de pesquisa inválido | L3 · 2 · Campo corrigido |
| `l3-3-resultados.html` | L3 · FE02 · Dado de pesquisa inválido | L3 · 3 · Resultados |
| `l4-1-gaveta-com-os-filtros.html` | L4 · FE01 · Nenhum contrato encontrado | L4 · 1 · Gaveta com os filtros |
| `l4-2-sem-registros-encontrados.html` | L4 · FE01 · Nenhum contrato encontrado | L4 · 2 · Sem registros encontrados |
| `l5-1-gaveta-preenchida.html` | L5 · Salvar filtro | L5 · 1 · Gaveta preenchida |
| `l5-2-nome-do-filtro.html` | L5 · Salvar filtro | L5 · 2 · Nome do filtro |
| `l5-3-filtro-salvo.html` | L5 · Salvar filtro | L5 · 3 · Filtro salvo |
| `l6-1-nome-nao-informado.html` | L6 · FE03 · FE04 · Nome do filtro | L6 · 1 · Nome não informado |
| `l6-2-nome-ja-existente.html` | L6 · FE03 · FE04 · Nome do filtro | L6 · 2 · Nome já existente |
| `l7-1-lista-dos-filtros-salvos.html` | L7 · Filtros salvos — selecionar ou excluir | L7 · 1 · Lista dos filtros salvos |
| `l7-2-filtro-selecionado.html` | L7 · Filtros salvos — selecionar ou excluir | L7 · 2 · Filtro selecionado |
| `l7-3-confirmar-exclusao.html` | L7 · Filtros salvos — selecionar ou excluir | L7 · 3 · Confirmar exclusão |
| `l7-4-filtro-excluido.html` | L7 · Filtros salvos — selecionar ou excluir | L7 · 4 · Filtro excluído |
| `l8-1-em-sim.html` | L8 · Filtro Automático? | L8 · 1 · Em Sim |
| `l8-2-sai-e-volta-campos-preenchidos.html` | L8 · Filtro Automático? | L8 · 2 · Sai e volta: campos preenchidos |
| `l8-3-em-nao-campos-vazios.html` | L8 · Filtro Automático? | L8 · 3 · Em Não: campos vazios |
| `l9-1-ordenar-pela-coluna.html` | L9 · Trabalhar os resultados | L9 · 1 · Ordenar pela coluna |
| `l9-2-remover-um-criterio.html` | L9 · Trabalhar os resultados | L9 · 2 · Remover um critério |
| `l9-3-outra-pagina-e-quantidade-por-pagina.html` | L9 · Trabalhar os resultados | L9 · 3 · Outra página e quantidade por página |
| `l9-4-agrupar-por-coluna.html` | L9 · Trabalhar os resultados | L9 · 4 · Agrupar por coluna |
| `l10-1-linha-selecionada.html` | L10 · Abrir um contrato | L10 · 1 · Linha selecionada |
| `l10-2-erro-ao-acessar-o-contrato.html` | L10 · Abrir um contrato | L10 · 2 · Erro ao acessar o contrato |
| `l11-1-consulta-com-erro.html` | L11 · Erro ao consultar | L11 · 1 · Consulta com erro |
| `l11-2-tentar-novamente.html` | L11 · Erro ao consultar | L11 · 2 · Tentar novamente |
| `l11-3-resultados.html` | L11 · Erro ao consultar | L11 · 3 · Resultados |
| `l12-1-vence-em-escolher-as-faixas.html` | L12 · Vence em — faixa de vencimento (melhoria de UX) | L12 · 1 · Vence em: escolher as faixas |

Composição de tela: `gcg-consult-page.css`.

### HU-002 · Consultar saldos — `telas/hu002-consultar-saldos/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-contrato-escolhido-na-lista.html` | L1 · Consultar saldos — fluxo básico | L1 · 1 · Contrato escolhido na lista |
| `l1-2-detalhe-aberto-em-dados-gerais.html` | L1 · Consultar saldos — fluxo básico | L1 · 2 · Detalhe aberto em Dados gerais |
| `l1-3-clique-em-saldos-carregando.html` | L1 · Consultar saldos — fluxo básico | L1 · 3 · Clique em Saldos: carregando |
| `l1-4-saldos-e-percentual-de-consumo.html` | L1 · Consultar saldos — fluxo básico | L1 · 4 · Saldos e Percentual de Consumo |
| `l2-1-contrato-escolhido-na-lista.html` | L2 · FE01 · Contrato sem informações de saldo | L2 · 1 · Contrato escolhido na lista |
| `l2-2-detalhe-aberto-em-dados-gerais.html` | L2 · FE01 · Contrato sem informações de saldo | L2 · 2 · Detalhe aberto em Dados gerais |
| `l2-3-clique-em-saldos-carregando.html` | L2 · FE01 · Contrato sem informações de saldo | L2 · 3 · Clique em Saldos: carregando |
| `l2-4-sem-informacoes-de-saldo.html` | L2 · FE01 · Contrato sem informações de saldo | L2 · 4 · Sem informações de saldo |
| `l3-1-aba-saldos-carregando.html` | L3 · FE04 · Falha na recuperação dos saldos | L3 · 1 · Aba Saldos carregando |
| `l3-2-falha-na-recuperacao.html` | L3 · FE04 · Falha na recuperação dos saldos | L3 · 2 · Falha na recuperação |
| `l3-3-tentar-novamente-carregando.html` | L3 · FE04 · Falha na recuperação dos saldos | L3 · 3 · Tentar novamente: carregando |
| `l3-4-saldos-apresentados.html` | L3 · FE04 · Falha na recuperação dos saldos | L3 · 4 · Saldos apresentados |
| `l4-1-mensal-o-consumido-contra-o-esperado-de-cada-mes.html` | L4 · Consumo do Contrato | L4 · 1 · Mensal: o consumido contra o esperado de cada mês |
| `l4-2-anual-a-soma-de-cada-ano-da-vigencia.html` | L4 · Consumo do Contrato | L4 · 2 · Anual: a soma de cada ano da vigência |

Composição de tela: `gcg-consult-page.css`, `gcg-aba-dados-gerais.css`, `gcg-detalhe.css`, `gcg-aba-saldos.css`, `gcg-ver-como-tabela.css`, `gcg-evolucao-do-consumo.css`, `gcg-consumo-contrato.css`.

### HU-003 · Consultar aditivos — `telas/hu003-consultar-aditivos/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-contrato-escolhido-na-lista.html` | L1 · Consultar aditivos — fluxo básico | L1 · 1 · Contrato escolhido na lista |
| `l1-2-detalhe-aberto-em-dados-gerais.html` | L1 · Consultar aditivos — fluxo básico | L1 · 2 · Detalhe aberto em Dados gerais |
| `l1-3-clique-em-aditivos-carregando.html` | L1 · Consultar aditivos — fluxo básico | L1 · 3 · Clique em Aditivos: carregando |
| `l1-4-historico-dos-aditivos.html` | L1 · Consultar aditivos — fluxo básico | L1 · 4 · Histórico dos aditivos |
| `l2-1-visualizar-do-aditivo-1-com-a-dica.html` | L2 · Visualizar no PNCP | L2 · 1 · Visualizar do aditivo 1 com a dica |
| `l3-1-menu-de-acoes-aberto-no-aditivo-1.html` | L3 · Ações do aditivo | L3 · 1 · Menu de ações aberto no aditivo 1 |
| `l4-1-clique-em-aditivos-carregando.html` | L4 · FE01 · Contrato sem aditivos | L4 · 1 · Clique em Aditivos: carregando |
| `l4-2-listagem-sem-registros.html` | L4 · FE01 · Contrato sem aditivos | L4 · 2 · Listagem sem registros |
| `l5-1-aba-aditivos-carregando.html` | L5 · FE02 · Falha ao consultar os aditivos | L5 · 1 · Aba Aditivos carregando |
| `l5-2-falha-ao-consultar.html` | L5 · FE02 · Falha ao consultar os aditivos | L5 · 2 · Falha ao consultar |
| `l5-3-tentar-novamente-historico-apresentado.html` | L5 · FE02 · Falha ao consultar os aditivos | L5 · 3 · Tentar novamente: histórico apresentado |
| `l6-1-visualizar-acionado-no-aditivo-1.html` | L6 · FE03 · Falha ao acessar o PNCP | L6 · 1 · Visualizar acionado no aditivo 1 |
| `l6-2-falha-ao-acessar-o-pncp.html` | L6 · FE03 · Falha ao acessar o PNCP | L6 · 2 · Falha ao acessar o PNCP |

Composição de tela: `gcg-consult-page.css`, `gcg-aba-dados-gerais.css`, `gcg-detalhe.css`, `gcg-term-timeline.css`, `gcg-filtro-periodo.css`.

### HU-004 · Consultar apostilamentos — `telas/hu004-consultar-apostilamentos/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-contrato-escolhido-na-lista.html` | L1 · Consultar apostilamentos — fluxo básico | L1 · 1 · Contrato escolhido na lista |
| `l1-2-detalhe-aberto-em-dados-gerais.html` | L1 · Consultar apostilamentos — fluxo básico | L1 · 2 · Detalhe aberto em Dados gerais |
| `l1-3-clique-em-apostilamentos-carregando.html` | L1 · Consultar apostilamentos — fluxo básico | L1 · 3 · Clique em Apostilamentos: carregando |
| `l1-4-historico-dos-apostilamentos.html` | L1 · Consultar apostilamentos — fluxo básico | L1 · 4 · Histórico dos apostilamentos |
| `l2-1-visualizar-do-apostilamento-1-com-a-dica.html` | L2 · Visualizar no PNCP | L2 · 1 · Visualizar do apostilamento 1 com a dica |
| `l3-1-menu-de-acoes-aberto-no-apostilamento-1.html` | L3 · Ações do apostilamento | L3 · 1 · Menu de ações aberto no apostilamento 1 |
| `l4-1-clique-em-apostilamentos-carregando.html` | L4 · FE01 · Contrato sem apostilamentos | L4 · 1 · Clique em Apostilamentos: carregando |
| `l4-2-listagem-sem-registros.html` | L4 · FE01 · Contrato sem apostilamentos | L4 · 2 · Listagem sem registros |
| `l5-1-aba-apostilamentos-carregando.html` | L5 · FE02 · Falha ao consultar os apostilamentos | L5 · 1 · Aba Apostilamentos carregando |
| `l5-2-falha-ao-consultar.html` | L5 · FE02 · Falha ao consultar os apostilamentos | L5 · 2 · Falha ao consultar |
| `l5-3-tentar-novamente-historico-apresentado.html` | L5 · FE02 · Falha ao consultar os apostilamentos | L5 · 3 · Tentar novamente: histórico apresentado |
| `l6-1-visualizar-acionado-no-apostilamento-1.html` | L6 · FE03 · Falha ao acessar o PNCP | L6 · 1 · Visualizar acionado no apostilamento 1 |
| `l6-2-falha-ao-acessar-o-pncp.html` | L6 · FE03 · Falha ao acessar o PNCP | L6 · 2 · Falha ao acessar o PNCP |

Composição de tela: `gcg-consult-page.css`, `gcg-aba-dados-gerais.css`, `gcg-detalhe.css`, `gcg-term-timeline.css`, `gcg-filtro-periodo.css`.

### HU-005 · Consultar equipe — `telas/hu005-consultar-equipe/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-contrato-escolhido-na-lista.html` | L1 · Consultar equipe — fluxo básico | L1 · 1 · Contrato escolhido na lista |
| `l1-2-detalhe-aberto-em-dados-gerais.html` | L1 · Consultar equipe — fluxo básico | L1 · 2 · Detalhe aberto em Dados gerais |
| `l1-3-clique-em-equipe-carregando.html` | L1 · Consultar equipe — fluxo básico | L1 · 3 · Clique em Equipe: carregando |
| `l1-4-aba-equipe-a-equipe-do-contrato.html` | L1 · Consultar equipe — fluxo básico | L1 · 4 · Aba Equipe: a equipe do contrato |
| `l2-1-lista-de-funcoes-aberta.html` | L2 · Filtrar por função | L2 · 1 · Lista de funções aberta |
| `l2-2-so-os-fiscais.html` | L2 · Filtrar por função | L2 · 2 · Só os fiscais |
| `l2-3-funcao-limpa-no-todos-de-novo.html` | L2 · Filtrar por função | L2 · 3 · Função limpa no ×: todos de novo |
| `l4-1-clique-em-equipe-carregando.html` | L4 · FE01 · Contrato sem equipe | L4 · 1 · Clique em Equipe: carregando |
| `l4-2-sem-integrantes.html` | L4 · FE01 · Contrato sem equipe | L4 · 2 · Sem integrantes |
| `l5-1-interveniente-escolhido-na-lista.html` | L5 · FE02 · Nenhum integrante para a função | L5 · 1 · Interveniente escolhido na lista |
| `l5-2-nenhum-integrante-para-a-funcao.html` | L5 · FE02 · Nenhum integrante para a função | L5 · 2 · Nenhum integrante para a função |
| `l6-1-clique-em-equipe-carregando.html` | L6 · FE03 · Falha ao consultar a equipe | L6 · 1 · Clique em Equipe: carregando |
| `l6-2-falha.html` | L6 · FE03 · Falha ao consultar a equipe | L6 · 2 · Falha |
| `l6-3-tentar-novamente-equipe-apresentada.html` | L6 · FE03 · Falha ao consultar a equipe | L6 · 3 · Tentar novamente: equipe apresentada |

Composição de tela: `gcg-consult-page.css`, `gcg-aba-dados-gerais.css`, `gcg-detalhe.css`, `gcg-aba-equipe.css`.

### HU-006 · Consultar documentos — `telas/hu006-consultar-documentos/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-contrato-escolhido-na-lista.html` | L1 · Consultar documentos — fluxo básico | L1 · 1 · Contrato escolhido na lista |
| `l1-2-detalhe-aberto-em-dados-gerais.html` | L1 · Consultar documentos — fluxo básico | L1 · 2 · Detalhe aberto em Dados gerais |
| `l1-3-clique-em-documentacao-carregando.html` | L1 · Consultar documentos — fluxo básico | L1 · 3 · Clique em Documentação: carregando |
| `l1-4-documentos-por-tipo.html` | L1 · Consultar documentos — fluxo básico | L1 · 4 · Documentos por tipo |
| `l2-1-anexos-do-contrato-abertos.html` | L2 · Expandir e recolher a árvore | L2 · 1 · Anexos do contrato abertos |
| `l2-2-grupo-recolhido.html` | L2 · Expandir e recolher a árvore | L2 · 2 · Grupo recolhido |
| `l3-1-cancelado-no-sei-marcado.html` | L3 · Consultar por status | L3 · 1 · Cancelado no SEI marcado |
| `l3-2-mostrar-todos-de-novo.html` | L3 · Consultar por status | L3 · 2 · Mostrar Todos de novo |
| `l4-1-visualizar-em-hover-com-a-dica.html` | L4 · Visualizar | L4 · 1 · Visualizar em hover, com a dica |
| `l5-1-carregando.html` | L5 · FE01 · Contrato sem documentos | L5 · 1 · Carregando |
| `l5-2-sem-documentos.html` | L5 · FE01 · Contrato sem documentos | L5 · 2 · Sem documentos |
| `l6-1-arquivo-excluido-no-sei-marcado.html` | L6 · FE02 · Nenhum documento para o status | L6 · 1 · Arquivo Excluído no SEI marcado |
| `l7-1-carregando.html` | L7 · FE03 · Falha ao consultar os documentos | L7 · 1 · Carregando |
| `l7-2-falha.html` | L7 · FE03 · Falha ao consultar os documentos | L7 · 2 · Falha |
| `l7-3-tentar-novamente-documentos-apresentados.html` | L7 · FE03 · Falha ao consultar os documentos | L7 · 3 · Tentar novamente: documentos apresentados |
| `l8-1-visualizar-acionado.html` | L8 · FE04 · Falha ao visualizar | L8 · 1 · Visualizar acionado |
| `l8-2-falha-ao-visualizar.html` | L8 · FE04 · Falha ao visualizar | L8 · 2 · Falha ao visualizar |

Composição de tela: `gcg-consult-page.css`, `gcg-aba-dados-gerais.css`, `gcg-detalhe.css`, `gcg-filtro-periodo.css`, `gcg-aba-documentos.css`.

### HU-007 · Consultar tramitações — `telas/hu007-consultar-tramitacoes/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-contrato-escolhido-na-lista.html` | L1 · Consultar tramitações — fluxo básico | L1 · 1 · Contrato escolhido na lista |
| `l1-2-detalhe-aberto-em-dados-gerais.html` | L1 · Consultar tramitações — fluxo básico | L1 · 2 · Detalhe aberto em Dados gerais |
| `l1-3-clique-em-status-tramites-carregando.html` | L1 · Consultar tramitações — fluxo básico | L1 · 3 · Clique em Status/Trâmites: carregando |
| `l1-4-historico-de-tramitacoes.html` | L1 · Consultar tramitações — fluxo básico | L1 · 4 · Histórico de tramitações |
| `l2-1-o-historico-com-as-partes-que-faltam.html` | L2 · FE03 · Informação complementar não disponível | L2 · 1 · O histórico com as partes que faltam |
| `l3-1-carregando.html` | L3 · FE01 · Contrato sem tramitações | L3 · 1 · Carregando |
| `l3-2-sem-tramitacoes.html` | L3 · FE01 · Contrato sem tramitações | L3 · 2 · Sem tramitações |
| `l4-1-carregando.html` | L4 · FE02 · Falha ao consultar as tramitações | L4 · 1 · Carregando |
| `l4-2-falha.html` | L4 · FE02 · Falha ao consultar as tramitações | L4 · 2 · Falha |
| `l4-3-tentar-novamente-historico-apresentado.html` | L4 · FE02 · Falha ao consultar as tramitações | L4 · 3 · Tentar novamente: histórico apresentado |

Composição de tela: `gcg-consult-page.css`, `gcg-aba-dados-gerais.css`, `gcg-detalhe.css`, `gcg-filtro-periodo.css`, `gcg-aba-historico.css`.

### HU-008 · Consultar ocorrências — `telas/hu008-consultar-ocorrencias/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-contrato-escolhido-na-lista.html` | L1 · Consultar ocorrências — fluxo básico | L1 · 1 · Contrato escolhido na lista |
| `l1-2-detalhe-aberto-em-dados-gerais.html` | L1 · Consultar ocorrências — fluxo básico | L1 · 2 · Detalhe aberto em Dados gerais |
| `l1-3-clique-em-ocorrencias-carregando.html` | L1 · Consultar ocorrências — fluxo básico | L1 · 3 · Clique em Ocorrências: carregando |
| `l1-4-historico-de-ocorrencias.html` | L1 · Consultar ocorrências — fluxo básico | L1 · 4 · Histórico de ocorrências |
| `l2-1-o-historico-com-a-anotacao-no-registro-3.html` | L2 · FE03 · Ocorrência sem descrição | L2 · 1 · O histórico com a anotação no registro 3 |
| `l3-1-carregando.html` | L3 · FE01 · Contrato sem ocorrências | L3 · 1 · Carregando |
| `l3-2-sem-registros.html` | L3 · FE01 · Contrato sem ocorrências | L3 · 2 · Sem registros |
| `l4-1-carregando.html` | L4 · FE02 · Falha ao consultar as ocorrências | L4 · 1 · Carregando |
| `l4-2-falha.html` | L4 · FE02 · Falha ao consultar as ocorrências | L4 · 2 · Falha |
| `l4-3-tentar-novamente-historico-apresentado.html` | L4 · FE02 · Falha ao consultar as ocorrências | L4 · 3 · Tentar novamente: histórico apresentado |

Composição de tela: `gcg-consult-page.css`, `gcg-aba-dados-gerais.css`, `gcg-detalhe.css`, `gcg-filtro-periodo.css`, `gcg-aba-historico.css`.

### HU-009 · Consultar dados gerais — `telas/hu009-consultar-dados-gerais/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-contrato-escolhido-na-lista.html` | L1 · Consultar dados gerais — fluxo básico | L1 · 1 · Contrato escolhido na lista |
| `l1-2-dados-gerais-carregando.html` | L1 · Consultar dados gerais — fluxo básico | L1 · 2 · Dados gerais carregando |
| `l1-3-dados-do-contrato-topo-da-aba.html` | L1 · Consultar dados gerais — fluxo básico | L1 · 3 · Dados do Contrato (topo da aba) |
| `l1-4-scrollada-dados-da-contratacao.html` | L1 · Consultar dados gerais — fluxo básico | L1 · 4 · Scrollada: Dados da Contratação |
| `l1-5-scrollada-produto-contratado-e-pncp.html` | L1 · Consultar dados gerais — fluxo básico | L1 · 5 · Scrollada: Produto Contratado e PNCP |
| `l2-1-link-pncp-em-hover-com-a-dica.html` | L2 · Link do PNCP | L2 · 1 · Link PNCP em hover, com a dica |
| `l3-1-mensal-do-contrato-e-prazo-para-pagamento-dias-em-branco.html` | L3 · FE02 · Informação não disponível | L3 · 1 · Mensal do Contrato e Prazo para Pagamento (dias) em branco |
| `l3-2-scrollada-pncp-sem-integracao.html` | L3 · FE02 · Informação não disponível | L3 · 2 · Scrollada: PNCP sem integração |
| `l4-1-produto-contratado-sem-registros.html` | L4 · FE03 · Contrato sem produtos | L4 · 1 · Produto Contratado sem registros |
| `l5-1-carregando.html` | L5 · FE01 · Falha ao consultar os dados | L5 · 1 · Carregando |
| `l5-2-falha.html` | L5 · FE01 · Falha ao consultar os dados | L5 · 2 · Falha |
| `l5-3-tentar-novamente-dados-apresentados.html` | L5 · FE01 · Falha ao consultar os dados | L5 · 3 · Tentar novamente: dados apresentados |
| `l6-1-link-pncp-acionado.html` | L6 · FE04 · Falha ao acessar o PNCP | L6 · 1 · Link PNCP acionado |
| `l6-2-toast-de-erro-com-a-msg003.html` | L6 · FE04 · Falha ao acessar o PNCP | L6 · 2 · Toast de erro com a MSG003 |

Composição de tela: `gcg-consult-page.css`, `gcg-aba-dados-gerais.css`, `gcg-detalhe.css`.

### HU-010 · Exportar lista de contratos — `telas/hu010-exportar-lista/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-lista-com-resultado-e-filtros-aplicados.html` | L1 · Exportar a lista — fluxo básico | L1 · 1 · Lista com resultado e filtros aplicados |
| `l1-2-menu-de-formatos-aberto.html` | L1 · Exportar a lista — fluxo básico | L1 · 2 · Menu de formatos aberto |
| `l1-3-exportando.html` | L1 · Exportar a lista — fluxo básico | L1 · 3 · Exportando |
| `l1-4-arquivo-pronto-toast-com-o-nome-do-arquivo.html` | L1 · Exportar a lista — fluxo básico | L1 · 4 · Arquivo pronto: toast com o nome do arquivo |
| `l2-1-sem-registros-encontrados.html` | L2 · FE01 · Consulta sem registros | L2 · 1 · Sem registros encontrados |
| `l3-1-formato-escolhido-csv.html` | L3 · FE02 · Falha na recuperação dos dados | L3 · 1 · Formato escolhido (CSV) |
| `l3-2-toast-com-a-msg002-lista-e-filtros-mantidos.html` | L3 · FE02 · Falha na recuperação dos dados | L3 · 2 · Toast com a MSG002; lista e filtros mantidos |
| `l4-1-exportando.html` | L4 · FE03 · Falha na geração do arquivo | L4 · 1 · Exportando |
| `l4-2-toast-com-a-msg003.html` | L4 · FE03 · Falha na geração do arquivo | L4 · 2 · Toast com a MSG003 |
| `l5-1-toast-com-a-msg004.html` | L5 · FE04 · Falha na disponibilização | L5 · 1 · Toast com a MSG004 |

Composição de tela: `gcg-consult-page.css`.

### HU-011 · Enviar avisos/comunicação — `telas/hu011-enviar-avisos/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-contrato-escolhido-na-lista.html` | L1 · Enviar comunicação — fluxo básico | L1 · 1 · Contrato escolhido na lista |
| `l1-2-detalhe-aberto-em-dados-gerais.html` | L1 · Enviar comunicação — fluxo básico | L1 · 2 · Detalhe aberto em Dados gerais |
| `l1-3-clique-em-avisos-carregando.html` | L1 · Enviar comunicação — fluxo básico | L1 · 3 · Clique em Avisos: carregando |
| `l1-4-aba-avisos-nova-comunicacao-recolhida-e-o-historico.html` | L1 · Enviar comunicação — fluxo básico | L1 · 4 · Aba Avisos: Nova comunicação recolhida e o histórico |
| `l1-5-nova-comunicacao-aberta.html` | L1 · Enviar comunicação — fluxo básico | L1 · 5 · Nova comunicação aberta |
| `l1-6-formulario-preenchido.html` | L1 · Enviar comunicação — fluxo básico | L1 · 6 · Formulário preenchido |
| `l1-7-confirmacao-com-a-msg007.html` | L1 · Enviar comunicação — fluxo básico | L1 · 7 · Confirmação com a MSG007 |
| `l1-8-comunicacao-enviada.html` | L1 · Enviar comunicação — fluxo básico | L1 · 8 · Comunicação enviada |
| `l2-1-visualizar-em-hover-com-a-dica.html` | L2 · Visualizar uma comunicação | L2 · 1 · Visualizar em hover, com a dica |
| `l2-2-modal-somente-leitura-com-a-mensagem-completa-e-o-anexo.html` | L2 · Visualizar uma comunicação | L2 · 2 · Modal somente leitura com a mensagem completa e o anexo |
| `l3-1-enviar-com-os-obrigatorios-em-branco-msg008.html` | L3 · Campos obrigatórios | L3 · 1 · Enviar com os obrigatórios em branco → MSG008 |
| `l4-1-arquivo-fora-das-regras-msg006.html` | L4 · FE04 · Anexo inválido | L4 · 1 · Arquivo fora das regras → MSG006 |
| `l4-2-arquivo-trocado-por-um-valido.html` | L4 · FE04 · Anexo inválido | L4 · 2 · Arquivo trocado por um válido |
| `l5-1-modal-da-msg007-com-cancelar-em-foco.html` | L5 · FE05 · Envio não confirmado | L5 · 1 · Modal da MSG007 com Cancelar em foco |
| `l5-2-modal-fechado-a-secao-continua-aberta-com-os-dados.html` | L5 · FE05 · Envio não confirmado | L5 · 2 · Modal fechado: a seção continua aberta, com os dados |
| `l6-1-aba-com-a-secao-recolhida-e-o-historico-vazio.html` | L6 · FE01 · Nenhum destinatário disponível | L6 · 1 · Aba com a seção recolhida e o histórico vazio |
| `l6-2-secao-aberta-msg002-enviar-desabilitado.html` | L6 · FE01 · Nenhum destinatário disponível | L6 · 2 · Seção aberta: MSG002, Enviar desabilitado |
| `l7-1-sem-permissao-para-enviar-msg004.html` | L7 · FE02 · Usuário sem permissão para envio | L7 · 1 · Sem permissão para enviar → MSG004 |
| `l8-1-secao-aberta-carregando-os-destinatarios.html` | L8 · FE03 · Falha ao recuperar os destinatários | L8 · 1 · Seção aberta: carregando os destinatários |
| `l8-2-falha-msg005-e-tentar-novamente.html` | L8 · FE03 · Falha ao recuperar os destinatários | L8 · 2 · Falha → MSG005 e Tentar novamente |

Composição de tela: `gcg-consult-page.css`, `gcg-aba-dados-gerais.css`, `gcg-detalhe.css`, `gcg-aba-avisos.css`, `gcg-filtro-periodo.css`.

### HU-012 · Painel do Gestor e do Fiscal — `telas/hu012-painel-gestor-e-fiscal/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-abrir-o-painel.html` | L1 · Abrir o painel | L1 · 1 · Abrir o painel |
| `l1-2-pagina-2-os-contratos-em-dia.html` | L1 · Abrir o painel | L1 · 2 · Página 2: os contratos em dia |
| `l1-3-exibir-20-a-relacao-inteira.html` | L1 · Abrir o painel | L1 · 3 · Exibir 20: a relação inteira |
| `l2-1-escolher-a-ordenacao.html` | L2 · Ordenar a relação | L2 · 1 · Escolher a ordenação |
| `l2-2-ordenado-pelo-saldo-mais-critico.html` | L2 · Ordenar a relação | L2 · 2 · Ordenado pelo saldo mais crítico |
| `l2-3-ordenado-por-mais-assinaturas-pendentes.html` | L2 · Ordenar a relação | L2 · 3 · Ordenado por mais assinaturas pendentes |
| `l3-1-filtrar-por-uma-faixa-de-vencimento.html` | L3 · Filtrar pelos indicadores | L3 · 1 · Filtrar por uma faixa de vencimento |
| `l3-2-filtrar-por-assinatura-pendente.html` | L3 · Filtrar pelos indicadores | L3 · 2 · Filtrar por Assinatura pendente |
| `l3-3-filtrar-por-saldo-critico.html` | L3 · Filtrar pelos indicadores | L3 · 3 · Filtrar por Saldo crítico |
| `l4-1-pesquisar-pelo-numero.html` | L4 · Pesquisar por número ou fornecedor | L4 · 1 · Pesquisar pelo número |
| `l4-2-pesquisar-pelo-fornecedor.html` | L4 · Pesquisar por número ou fornecedor | L4 · 2 · Pesquisar pelo fornecedor |
| `l4-3-nenhum-contrato-encontrado.html` | L4 · Pesquisar por número ou fornecedor | L4 · 3 · Nenhum contrato encontrado |
| `l5-1-passar-o-mouse-na-linha.html` | L5 · Do painel ao contrato | L5 · 1 · Passar o mouse na linha |
| `l5-2-o-contrato-abre-em-saldos.html` | L5 · Do painel ao contrato | L5 · 2 · O contrato abre em Saldos |
| `l6-1-painel-do-paulo-fiscal.html` | L6 · Painel do Fiscal | L6 · 1 · Painel do Paulo, fiscal |
| `l6-2-recolher-os-contratos-em-dia.html` | L6 · Painel do Fiscal | L6 · 2 · Recolher os contratos em dia |
| `l7-1-tudo-em-dia.html` | L7 · Sem contratos que demandam atenção | L7 · 1 · Tudo em dia |
| `l8-1-carregando.html` | L8 · Carregando e falha ao carregar | L8 · 1 · Carregando |
| `l8-2-falha-ao-carregar.html` | L8 · Carregando e falha ao carregar | L8 · 2 · Falha ao carregar |

Composição de tela: `gcg-painel-base.css`, `gcg-recentes.css`, `gcg-fila.css`, `gcg-ver-como-tabela.css`, `gcg-evolucao-do-consumo.css`, `gcg-consumo-contrato.css`, `gcg-aba-saldos.css`, `gcg-detalhe.css`, `gcg-estados-do-painel.css`.

### HU-013 · Painel do Fornecedor — `telas/hu013-painel-fornecedor/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-abrir-o-painel.html` | L1 · Abrir o painel | L1 · 1 · Abrir o painel |
| `l2-1-filtrar-pela-faixa-de-ate-30-dias.html` | L2 · Filtrar pela faixa de vencimento | L2 · 1 · Filtrar pela faixa de até 30 dias |
| `l3-1-orgao-contratante-ses.html` | L3 · Filtrar por órgão e por número | L3 · 1 · Órgão contratante: SES |
| `l3-2-nenhum-contrato-encontrado.html` | L3 · Filtrar por órgão e por número | L3 · 2 · Nenhum contrato encontrado |
| `l4-1-passar-o-mouse-na-linha.html` | L4 · Do painel ao contrato | L4 · 1 · Passar o mouse na linha |
| `l4-2-o-contrato-abre-em-dados-gerais.html` | L4 · Do painel ao contrato | L4 · 2 · O contrato abre em Dados gerais |
| `l5-1-ordenado-por-maior-consumo.html` | L5 · Ordenar por maior consumo | L5 · 1 · Ordenado por maior consumo |
| `l5-2-o-contrato-abre-em-saldos.html` | L5 · Ordenar por maior consumo | L5 · 2 · O contrato abre em Saldos |
| `l6-1-sem-contratos-em-execucao.html` | L6 · Sem contratos em execução | L6 · 1 · Sem contratos em execução |
| `l7-1-carregando.html` | L7 · Carregando e falha ao carregar | L7 · 1 · Carregando |
| `l7-2-falha-ao-carregar.html` | L7 · Carregando e falha ao carregar | L7 · 2 · Falha ao carregar |

Composição de tela: `gcg-painel-base.css`, `gcg-recentes.css`, `gcg-fila.css`, `gcg-queue-row.css`, `gcg-consumo-da-linha.css`, `gcg-fornecedor-esqueleto.css`, `gcg-aba-dados-gerais.css`, `gcg-detalhe.css`, `gcg-ver-como-tabela.css`, `gcg-evolucao-do-consumo.css`, `gcg-consumo-contrato.css`, `gcg-aba-saldos.css`, `gcg-estados-do-painel.css`.

### HU-014 · Painel do Procurador Setorial — `telas/hu014-painel-procurador-setorial/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-abrir-o-painel.html` | L1 · Abrir o painel | L1 · 1 · Abrir o painel |
| `l2-1-as-3-demandas-do-347-2026.html` | L2 · Ver as demandas de um contrato | L2 · 1 · As 3 demandas do 347/2026 |
| `l3-1-filtrar-por-aditivos-pendentes-de-analise.html` | L3 · Filtrar pelo tipo de demanda | L3 · 1 · Filtrar por Aditivos pendentes de análise |
| `l4-1-passar-o-mouse-na-demanda.html` | L4 · Do painel ao item | L4 · 1 · Passar o mouse na demanda |
| `l5-1-sem-demandas-pendentes.html` | L5 · Sem demandas pendentes | L5 · 1 · Sem demandas pendentes |
| `l6-1-carregando.html` | L6 · Carregando e falha ao carregar | L6 · 1 · Carregando |
| `l6-2-falha-ao-carregar.html` | L6 · Carregando e falha ao carregar | L6 · 2 · Falha ao carregar |

Composição de tela: `gcg-painel-base.css`, `gcg-recentes.css`, `gcg-fila.css`, `gcg-queue-row.css`, `gcg-type-chip.css`, `gcg-fila-procurador.css`, `gcg-estados-do-painel.css`.

### HU-015 · Painel do Analista Financeiro — `telas/hu015-painel-analista-financeiro/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-painel-consolidado-do-orgao.html` | L1 · Abrir o painel | L1 · 1 · Painel consolidado do órgão |
| `l2-1-natureza-de-despesa-aberta.html` | L2 · Filtrar por Natureza de Despesa | L2 · 1 · Natureza de Despesa aberta |
| `l2-2-resultado-com-a-ficha.html` | L2 · Filtrar por Natureza de Despesa | L2 · 2 · Resultado com a ficha |
| `l3-1-foco-no-cartao-saldo-a-liquidar.html` | L3 · Do indicador para Gerir contratos | L3 · 1 · Foco no cartão Saldo a Liquidar |
| `l3-2-gerir-contratos-com-a-ficha-do-dashboard.html` | L3 · Do indicador para Gerir contratos | L3 · 2 · Gerir contratos com a ficha do Dashboard |
| `l4-1-filtros-sem-resultado.html` | L4 · Nenhum contrato encontrado | L4 · 1 · Filtros sem resultado |
| `l5-1-menu-do-perfil-aberto.html` | L5 · Configurar tela inicial | L5 · 1 · Menu do perfil aberto |
| `l5-2-dialogo-tela-inicial.html` | L5 · Configurar tela inicial | L5 · 2 · Diálogo Tela inicial |
| `l6-1-mouse-em-valor-pago-liquidado.html` | L6 · Régua interativa | L6 · 1 · Mouse em Valor Pago/Liquidado |
| `l6-2-mouse-na-chave-saldo-empenhado.html` | L6 · Régua interativa | L6 · 2 · Mouse na chave Saldo Empenhado |
| `l8-1-carregando.html` | L8 · Carregando e falha ao carregar | L8 · 1 · Carregando |
| `l8-2-falha-ao-carregar.html` | L8 · Carregando e falha ao carregar | L8 · 2 · Falha ao carregar |
| `l9-1-visao-anual.html` | L9 · Evolução anual | L9 · 1 · Visão Anual |
| `l10-1-lista-aberta.html` | L10 · Vigência dos Contratos em intervalos | L10 · 1 · Lista aberta |
| `l10-2-61-a-90-dias.html` | L10 · Vigência dos Contratos em intervalos | L10 · 2 · 61 a 90 dias |
| `l11-1-dica-do-saldo-de-anulacao.html` | L11 · O que é o Saldo de Anulação | L11 · 1 · Dica do Saldo de Anulação |

Composição de tela: `gcg-barra-de-filtros.css`, `gcg-data-do-siafic.css`, `gcg-regua-da-execucao.css`, `gcg-cartao-de-saldo.css`, `gcg-execucao-financeira.css`, `gcg-cobertura-do-empenho.css`, `gcg-ver-como-tabela.css`, `gcg-evolucao-do-consumo.css`, `gcg-vigencia-dos-contratos.css`, `gcg-painel-base.css`, `gcg-natureza-de-despesa.css`, `gcg-consult-page.css`, `gcg-estados-do-painel.css`.

### HU-016 · Painel do Coordenador de Contratos — `telas/hu016-painel-coordenador-de-contratos/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-painel-do-orgao.html` | L1 · Abrir o painel | L1 · 1 · Painel do órgão |
| `l2-1-unidade-gestora-aberta.html` | L2 · Filtrar por Unidade gestora | L2 · 1 · Unidade gestora aberta |
| `l2-2-resultado-com-a-ficha.html` | L2 · Filtrar por Unidade gestora | L2 · 2 · Resultado com a ficha |
| `l3-1-dica-na-faixa-61-a-90-dias.html` | L3 · Próximos do vencimento | L3 · 1 · Dica na faixa 61 a 90 dias |
| `l3-2-gerir-contratos-vencem-em-61-a-90-dias.html` | L3 · Próximos do vencimento | L3 · 2 · Gerir contratos: vencem em 61 a 90 dias |
| `l4-1-nenhum-contrato-encontrado.html` | L4 · Nenhum contrato encontrado | L4 · 1 · Nenhum contrato encontrado |
| `l5-1-menu-do-perfil-aberto.html` | L5 · Configurar tela inicial | L5 · 1 · Menu do perfil aberto |
| `l5-2-dialogo-tela-inicial.html` | L5 · Configurar tela inicial | L5 · 2 · Diálogo Tela inicial |
| `l5-3-tela-inicial-salva.html` | L5 · Configurar tela inicial | L5 · 3 · Tela inicial salva |
| `l6-1-ver-na-equipe-sem-suplente.html` | L6 · Equipe de gestão e fiscalização | L6 · 1 · Ver na equipe: sem suplente |
| `l6-2-equipe-todos-os-contratos-vigentes.html` | L6 · Equipe de gestão e fiscalização | L6 · 2 · Equipe: todos os contratos vigentes |
| `l7-1-dashboard-esta-e-a-tela-inicial.html` | L7 · Tela inicial pela casinha | L7 · 1 · Dashboard: esta é a tela inicial |
| `l7-2-gerir-contratos-definir-como-tela-inicial.html` | L7 · Tela inicial pela casinha | L7 · 2 · Gerir contratos: definir como tela inicial |
| `l7-3-tela-inicial-definida.html` | L7 · Tela inicial pela casinha | L7 · 3 · Tela inicial definida |
| `l8-1-carregando.html` | L8 · Carregando e falha ao carregar | L8 · 1 · Carregando |
| `l8-2-falha-ao-carregar.html` | L8 · Carregando e falha ao carregar | L8 · 2 · Falha ao carregar |
| `l9-1-buscar-chave-mestra.html` | L9 · Buscar enquanto digita | L9 · 1 · Buscar "Chave Mestra" |
| `l10-1-dica-na-coluna-de-mai-27.html` | L10 · Vencimentos por mês | L10 · 1 · Dica na coluna de mai/27 |
| `l10-2-ver-como-tabela.html` | L10 · Vencimentos por mês | L10 · 2 · Ver como tabela |
| `l11-1-aba-avisos.html` | L11 · Últimos 15 dias: avisos e lista vazia | L11 · 1 · Aba Avisos |
| `l11-2-sem-ocorrencias-nos-ultimos-15-dias.html` | L11 · Últimos 15 dias: avisos e lista vazia | L11 · 2 · Sem ocorrências nos últimos 15 dias |
| `l12-1-panorama-recolhido.html` | L12 · Panorama recolhido | L12 · 1 · Panorama recolhido |

Composição de tela: `gcg-barra-de-filtros.css`, `gcg-ver-como-tabela.css`, `gcg-painel-base.css`, `gcg-recentes.css`, `gcg-paineis-ajustes.css`, `gcg-consult-page.css`, `gcg-estados-do-painel.css`.

### HU019 · Emitir Ordem de Serviço — `telas/hu019-emitir-os/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-aba-os-of-do-contrato.html` | L1 · Emitir pela aba OS/OF do contrato | L1 · 1 · Aba OS/OF do contrato |
| `l1-2-nova-ordem-de-servico.html` | L1 · Emitir pela aba OS/OF do contrato | L1 · 2 · Nova Ordem de Serviço |
| `l1-3-preenchida-com-os-calculos.html` | L1 · Emitir pela aba OS/OF do contrato | L1 · 3 · Preenchida, com os cálculos |
| `l1-4-salva-com-o-numero-gerado.html` | L1 · Emitir pela aba OS/OF do contrato | L1 · 4 · Salva, com o número gerado |
| `l1-5-enviar-fornecedor.html` | L1 · Emitir pela aba OS/OF do contrato | L1 · 5 · Enviar Fornecedor |
| `l2-1-encaminhada-para-assinatura.html` | L2 · Depois do envio ao fornecedor | L2 · 1 · Encaminhada para assinatura |
| `l3-1-escolher-o-contrato.html` | L3 · Emitir pela Gerir OS/OF | L3 · 1 · Escolher o contrato |
| `l4-1-obrigatorios-sem-preencher.html` | L4 · Quando os dados não fecham | L4 · 1 · Obrigatórios sem preencher |
| `l4-2-inicio-antes-da-emissao.html` | L4 · Quando os dados não fecham | L4 · 2 · Início antes da emissão |
| `l4-3-valor-acima-do-saldo-do-empenho.html` | L4 · Quando os dados não fecham | L4 · 3 · Valor acima do saldo do empenho |
| `l5-1-sem-permissao-de-emissao.html` | L5 · Quando não se pode emitir | L5 · 1 · Sem permissão de emissão |
| `l5-2-contrato-com-vigencia-encerrada.html` | L5 · Quando não se pode emitir | L5 · 2 · Contrato com vigência encerrada |
| `l5-3-dados-do-contrato-indisponiveis.html` | L5 · Quando não se pode emitir | L5 · 3 · Dados do contrato indisponíveis |
| `l5-4-erro-ao-salvar-ou-enviar.html` | L5 · Quando não se pode emitir | L5 · 4 · Erro ao salvar ou enviar |

Composição de tela: `gcg-osof-acoes.css`, `gcg-osof-aba.css`, `gcg-detalhe.css`, `gcg-osof-form.css`, `gcg-osof-ordem.css`, `gcg-osof-gerir.css`.

### HU020 · Emitir Ordem de Fornecimento — `telas/hu020-emitir-of/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-aba-os-of-do-contrato-de-aquisicao.html` | L1 · Emitir pela aba OS/OF do contrato de aquisição | L1 · 1 · Aba OS/OF do contrato de aquisição |
| `l1-2-nova-ordem-de-fornecimento.html` | L1 · Emitir pela aba OS/OF do contrato de aquisição | L1 · 2 · Nova Ordem de Fornecimento |
| `l1-3-preenchida-com-os-calculos.html` | L1 · Emitir pela aba OS/OF do contrato de aquisição | L1 · 3 · Preenchida, com os cálculos |
| `l1-4-salva-com-o-numero-gerado.html` | L1 · Emitir pela aba OS/OF do contrato de aquisição | L1 · 4 · Salva, com o número gerado |
| `l2-1-enviar-fornecedor.html` | L2 · Depois do envio ao fornecedor | L2 · 1 · Enviar Fornecedor |
| `l2-2-of-enviada-so-para-visualizacao.html` | L2 · Depois do envio ao fornecedor | L2 · 2 · OF enviada, só para visualização |
| `l3-1-obrigatorios-sem-preencher.html` | L3 · Quando os dados não fecham | L3 · 1 · Obrigatórios sem preencher |
| `l3-2-sem-itens.html` | L3 · Quando os dados não fecham | L3 · 2 · Sem itens |
| `l3-3-prazo-de-entrega-invalido.html` | L3 · Quando os dados não fecham | L3 · 3 · Prazo de entrega inválido |
| `l3-4-cep-ou-e-mail-invalidos.html` | L3 · Quando os dados não fecham | L3 · 4 · CEP ou e-mail inválidos |
| `l3-5-item-com-valor-invalido.html` | L3 · Quando os dados não fecham | L3 · 5 · Item com valor inválido |
| `l4-1-sem-permissao-de-emissao.html` | L4 · Quando não se pode emitir | L4 · 1 · Sem permissão de emissão |
| `l4-2-dados-vinculados-indisponiveis.html` | L4 · Quando não se pode emitir | L4 · 2 · Dados vinculados indisponíveis |
| `l4-3-falha-ao-salvar-ou-enviar.html` | L4 · Quando não se pode emitir | L4 · 3 · Falha ao salvar ou enviar |

Composição de tela: `gcg-osof-acoes.css`, `gcg-osof-aba.css`, `gcg-detalhe.css`, `gcg-osof-form.css`, `gcg-osof-ordem.css`.

### HU021 · Emitir Termo de Recebimento Definitivo da OS/OF — `telas/hu021-emitir-trd/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-ordens-marcadas-na-aba-os-of.html` | L1 · Emitir o termo a partir das ordens concluídas | L1 · 1 · Ordens marcadas na aba OS/OF |
| `l1-2-termo-de-recebimento-definitivo.html` | L1 · Emitir o termo a partir das ordens concluídas | L1 · 2 · Termo de Recebimento Definitivo |
| `l1-3-termo-salvo.html` | L1 · Emitir o termo a partir das ordens concluídas | L1 · 3 · Termo salvo |
| `l2-1-sem-ordem-e-sem-descricao.html` | L2 · Quando o termo não fecha | L2 · 1 · Sem ordem e sem descrição |
| `l2-2-periodo-invalido.html` | L2 · Quando o termo não fecha | L2 · 2 · Período inválido |
| `l2-3-nenhum-registro-encontrado.html` | L2 · Quando o termo não fecha | L2 · 3 · Nenhum registro encontrado |
| `l2-4-falha-ao-salvar.html` | L2 · Quando o termo não fecha | L2 · 4 · Falha ao salvar |
| `l2-5-sem-permissao.html` | L2 · Quando o termo não fecha | L2 · 5 · Sem permissão |

Composição de tela: `gcg-osof-acoes.css`, `gcg-osof-aba.css`, `gcg-detalhe.css`, `gcg-osof-ciclo.css`.

### HU022 · Documentos OS/OF — `telas/hu022-documentos-os-of/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-documentacao-da-ordem.html` | L1 · Consultar e anexar os documentos da ordem | L1 · 1 · Documentação da ordem |
| `l1-2-incluir-aberto-com-as-cinco-categorias.html` | L1 · Consultar e anexar os documentos da ordem | L1 · 2 · Incluir aberto, com as cinco categorias |
| `l1-3-arquivos-escolhidos-antes-de-salvar.html` | L1 · Consultar e anexar os documentos da ordem | L1 · 3 · Arquivos escolhidos, antes de salvar |
| `l1-4-documentos-salvos.html` | L1 · Consultar e anexar os documentos da ordem | L1 · 4 · Documentos salvos |
| `l2-1-nenhum-arquivo-selecionado.html` | L2 · Quando o arquivo não entra | L2 · 1 · Nenhum arquivo selecionado |
| `l2-2-formato-nao-permitido.html` | L2 · Quando o arquivo não entra | L2 · 2 · Formato não permitido |
| `l2-3-arquivo-acima-do-limite.html` | L2 · Quando o arquivo não entra | L2 · 3 · Arquivo acima do limite |
| `l2-4-limite-por-categoria.html` | L2 · Quando o arquivo não entra | L2 · 4 · Limite por categoria |
| `l2-5-falha-ao-salvar.html` | L2 · Quando o arquivo não entra | L2 · 5 · Falha ao salvar |
| `l3-1-sem-permissao.html` | L3 · Sem permissão para anexar | L3 · 1 · Sem permissão |

Composição de tela: `gcg-osof-acoes.css`, `gcg-detalhe.css`, `gcg-osof-ordem.css`.

### HU023 · Emitir Despacho de Ordem de Pagamento — `telas/hu023-despacho-pagamento/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-emitir-documento.html` | L1 · Emitir o despacho a partir do contrato | L1 · 1 · Emitir documento |
| `l1-2-despacho-de-pagamento.html` | L1 · Emitir o despacho a partir do contrato | L1 · 2 · Despacho de Pagamento |
| `l1-3-despacho-gerado-so-para-consulta.html` | L1 · Emitir o despacho a partir do contrato | L1 · 3 · Despacho gerado, só para consulta |
| `l2-1-sem-nota-atestada-no-periodo.html` | L2 · Quando o despacho não pode ser gerado | L2 · 1 · Sem nota atestada no período |
| `l2-2-certidao-ausente-ou-vencida.html` | L2 · Quando o despacho não pode ser gerado | L2 · 2 · Certidão ausente ou vencida |
| `l2-3-nota-sem-ateste.html` | L2 · Quando o despacho não pode ser gerado | L2 · 3 · Nota sem ateste |
| `l2-4-divergencia-nos-totais.html` | L2 · Quando o despacho não pode ser gerado | L2 · 4 · Divergência nos totais |
| `l2-5-documento-indisponivel.html` | L2 · Quando o despacho não pode ser gerado | L2 · 5 · Documento indisponível |
| `l3-1-falha-na-geracao.html` | L3 · Falha ao gerar | L3 · 1 · Falha na geração |

Composição de tela: `gcg-osof-acoes.css`, `gcg-osof-aba.css`, `gcg-detalhe.css`, `gcg-osof-ciclo.css`.

### HU024 · Editar Ordem de Serviço e Ordem de Fornecimento — `telas/hu024-editar-os-of/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-mais-acoes-da-linha.html` | L1 · Editar a ordem pela lista | L1 · 1 · Mais ações da linha |
| `l1-2-editar-ordem-de-servico.html` | L1 · Editar a ordem pela lista | L1 · 2 · Editar Ordem de Serviço |
| `l1-3-alteracao-salva.html` | L1 · Editar a ordem pela lista | L1 · 3 · Alteração salva |
| `l1-4-registro-da-alteracao.html` | L1 · Editar a ordem pela lista | L1 · 4 · Registro da alteração |
| `l2-1-editar-ordem-de-fornecimento.html` | L2 · Editar a Ordem de Fornecimento | L2 · 1 · Editar Ordem de Fornecimento |
| `l3-1-ordem-que-nao-pode-ser-editada.html` | L3 · Quando a edição não acontece | L3 · 1 · Ordem que não pode ser editada |
| `l3-2-obrigatorios-ausentes.html` | L3 · Quando a edição não acontece | L3 · 2 · Obrigatórios ausentes |
| `l3-3-valor-acima-do-saldo.html` | L3 · Quando a edição não acontece | L3 · 3 · Valor acima do saldo |
| `l3-4-falha-ao-salvar.html` | L3 · Quando a edição não acontece | L3 · 4 · Falha ao salvar |
| `l3-5-sem-permissao-de-edicao.html` | L3 · Quando a edição não acontece | L3 · 5 · Sem permissão de edição |

Composição de tela: `gcg-osof-acoes.css`, `gcg-osof-gerir.css`, `gcg-osof-form.css`, `gcg-detalhe.css`, `gcg-osof-ordem.css`.

### HU025 · Excluir Ordem de Serviço e Ordem de Fornecimento — `telas/hu025-excluir-os-of/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-confirmar-a-exclusao.html` | L1 · Excluir a ordem emitida por engano | L1 · 1 · Confirmar a exclusão |
| `l1-2-justificativa-sem-preencher.html` | L1 · Excluir a ordem emitida por engano | L1 · 2 · Justificativa sem preencher |
| `l1-3-ordem-excluida.html` | L1 · Excluir a ordem emitida por engano | L1 · 3 · Ordem excluída |
| `l2-1-ordem-com-ateste-ou-despacho.html` | L2 · Quando não se pode excluir | L2 · 1 · Ordem com ateste ou despacho |
| `l2-2-excluir-a-ordem-de-fornecimento.html` | L2 · Quando não se pode excluir | L2 · 2 · Excluir a Ordem de Fornecimento |
| `l2-3-falha-de-gravacao.html` | L2 · Quando não se pode excluir | L2 · 3 · Falha de gravação |
| `l2-4-sem-permissao-de-exclusao.html` | L2 · Quando não se pode excluir | L2 · 4 · Sem permissão de exclusão |

Composição de tela: `gcg-osof-acoes.css`, `gcg-osof-gerir.css`.

### HU026 · Cancelar Ordem de Serviço e Ordem de Fornecimento — `telas/hu026-cancelar-os-of/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-confirmar-o-cancelamento.html` | L1 · Cancelar a ordem que não será executada | L1 · 1 · Confirmar o cancelamento |
| `l1-2-justificativa-sem-preencher.html` | L1 · Cancelar a ordem que não será executada | L1 · 2 · Justificativa sem preencher |
| `l1-3-ordem-cancelada-na-lista.html` | L1 · Cancelar a ordem que não será executada | L1 · 3 · Ordem cancelada na lista |
| `l1-4-cancelar-a-ordem-de-fornecimento.html` | L1 · Cancelar a ordem que não será executada | L1 · 4 · Cancelar a Ordem de Fornecimento |
| `l2-1-ordem-cancelada-por-dentro.html` | L2 · Depois do cancelamento e quando não se pode cancelar | L2 · 1 · Ordem cancelada por dentro |
| `l2-2-acao-desabilitada.html` | L2 · Depois do cancelamento e quando não se pode cancelar | L2 · 2 · Ação desabilitada |
| `l2-3-ordem-ja-cancelada-ao-confirmar.html` | L2 · Depois do cancelamento e quando não se pode cancelar | L2 · 3 · Ordem já cancelada ao confirmar |
| `l2-4-falha-de-gravacao.html` | L2 · Depois do cancelamento e quando não se pode cancelar | L2 · 4 · Falha de gravação |
| `l2-5-sem-permissao-de-cancelamento.html` | L2 · Depois do cancelamento e quando não se pode cancelar | L2 · 5 · Sem permissão de cancelamento |

Composição de tela: `gcg-osof-acoes.css`, `gcg-osof-gerir.css`, `gcg-detalhe.css`, `gcg-osof-ordem.css`.

### HU027 · Consultar Ordem de Serviço e Fornecimento — `telas/hu027-consultar-os-of/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-gerir-os-of.html` | L1 · Achar a ordem no órgão | L1 · 1 · Gerir OS/OF |
| `l1-2-filtros-aplicados.html` | L1 · Achar a ordem no órgão | L1 · 2 · Filtros aplicados |
| `l1-3-vigencia-em-ordem-decrescente.html` | L1 · Achar a ordem no órgão | L1 · 3 · Vigência em ordem decrescente |
| `l2-1-nenhum-registro-encontrado.html` | L2 · Grade sem resultados | L2 · 1 · Nenhum registro encontrado |
| `l3-1-ordem-em-dados-gerais.html` | L3 · Abrir a ordem | L3 · 1 · Ordem em Dados gerais |
| `l4-1-sem-permissao.html` | L4 · Quando a consulta não acontece | L4 · 1 · Sem permissão |
| `l4-2-ordem-nao-encontrada.html` | L4 · Quando a consulta não acontece | L4 · 2 · Ordem não encontrada |
| `l4-3-falha-no-carregamento.html` | L4 · Quando a consulta não acontece | L4 · 3 · Falha no carregamento |

Composição de tela: `gcg-osof-acoes.css`, `gcg-osof-gerir.css`, `gcg-detalhe.css`, `gcg-osof-ordem.css`.

### HU028 · Consultar Saldo de Ordem de Serviço e Ordem de Fornecimento — `telas/hu028-consultar-saldo-os-of/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-aba-saldos-da-ordem.html` | L1 · Consultar os saldos da ordem | L1 · 1 · Aba Saldos da ordem |
| `l2-1-periodo-invalido.html` | L2 · Quando os saldos não aparecem | L2 · 1 · Período inválido |
| `l2-2-periodo-sem-registros.html` | L2 · Quando os saldos não aparecem | L2 · 2 · Período sem registros |
| `l2-3-indicadores-indisponiveis.html` | L2 · Quando os saldos não aparecem | L2 · 3 · Indicadores indisponíveis |
| `l2-4-falha-ao-carregar-os-itens.html` | L2 · Quando os saldos não aparecem | L2 · 4 · Falha ao carregar os itens |
| `l2-5-sem-permissao.html` | L2 · Quando os saldos não aparecem | L2 · 5 · Sem permissão |

Composição de tela: `gcg-osof-acoes.css`, `gcg-detalhe.css`, `gcg-osof-ordem.css`.

### HU029 · Ateste de Ordem de Serviço e Ordem de Fornecimento — `telas/hu029-ateste-os-of/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-emitir-documento.html` | L1 · Atestar a nota fiscal | L1 · 1 · Emitir documento |
| `l1-2-ateste-preenchido-pelo-fiscal.html` | L1 · Atestar a nota fiscal | L1 · 2 · Ateste preenchido pelo fiscal |
| `l1-3-ratificacao-do-gestor.html` | L1 · Atestar a nota fiscal | L1 · 3 · Ratificação do gestor |
| `l1-4-ateste-salvo.html` | L1 · Atestar a nota fiscal | L1 · 4 · Ateste salvo |
| `l2-1-valor-da-nota-diferente-das-ordens.html` | L2 · Quando o ateste não fecha | L2 · 1 · Valor da nota diferente das ordens |
| `l2-2-falta-o-termo-de-recebimento.html` | L2 · Quando o ateste não fecha | L2 · 2 · Falta o termo de recebimento |
| `l2-3-campo-obrigatorio-vazio.html` | L2 · Quando o ateste não fecha | L2 · 3 · Campo obrigatório vazio |
| `l2-4-texto-no-limite.html` | L2 · Quando o ateste não fecha | L2 · 4 · Texto no limite |
| `l2-5-falha-ao-salvar.html` | L2 · Quando o ateste não fecha | L2 · 5 · Falha ao salvar |
| `l3-1-dados-indisponiveis.html` | L3 · Dados vinculados indisponíveis | L3 · 1 · Dados indisponíveis |

Composição de tela: `gcg-osof-acoes.css`, `gcg-osof-aba.css`, `gcg-detalhe.css`, `gcg-osof-ciclo.css`.

### HU030 · Tramitar Ordem de Serviço e Ordem de Fornecimento — `telas/hu030-tramitar-os-of/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-status-tramites.html` | L1 · Acompanhar a ordem pela linha do tempo | L1 · 1 · Status/Trâmites |
| `l1-2-periodo-e-ordem-invertida.html` | L1 · Acompanhar a ordem pela linha do tempo | L1 · 2 · Período e ordem invertida |
| `l1-3-ordem-com-todas-as-etapas.html` | L1 · Acompanhar a ordem pela linha do tempo | L1 · 3 · Ordem com todas as etapas |
| `l2-1-data-invertida.html` | L2 · Quando não há trâmite para mostrar | L2 · 1 · Data invertida |
| `l2-2-sem-tramitacoes.html` | L2 · Quando não há trâmite para mostrar | L2 · 2 · Sem tramitações |
| `l2-3-falha-na-consulta.html` | L2 · Quando não há trâmite para mostrar | L2 · 3 · Falha na consulta |
| `l2-4-acesso-nao-autorizado.html` | L2 · Quando não há trâmite para mostrar | L2 · 4 · Acesso não autorizado |
| `l3-1-etapa-pendente.html` | L3 · Sequência das etapas | L3 · 1 · Etapa pendente |

Composição de tela: `gcg-osof-acoes.css`, `gcg-detalhe.css`, `gcg-osof-ordem.css`, `gcg-osof-aba.css`.

### Importar HU032 · Importar documentos — `telas/importar-hu032-importar-documentos/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-aba-documentacao-com-novo-documento.html` | L1 · Anexar documento externo · fluxo básico | L1 · 1 · Aba Documentação com Novo documento |
| `l1-2-gaveta-aberta-ainda-vazia.html` | L1 · Anexar documento externo · fluxo básico | L1 · 2 · Gaveta aberta, ainda vazia |
| `l1-3-documento-externo-tipo-e-descricao.html` | L1 · Anexar documento externo · fluxo básico | L1 · 3 · Documento Externo, tipo e descrição |
| `l1-4-arquivo-na-lista-pronto-para-salvar.html` | L1 · Anexar documento externo · fluxo básico | L1 · 4 · Arquivo na lista, pronto para salvar |
| `l1-5-documento-salvo-na-lista.html` | L1 · Anexar documento externo · fluxo básico | L1 · 5 · Documento salvo na lista |
| `l2-1-tipo-emitido-em-tela-especifica.html` | L2 · Documento interno: encaminhar para a tela que emite | L2 · 1 · Tipo emitido em tela específica |
| `l2-2-tipo-dos-documentos-padrao.html` | L2 · Documento interno: encaminhar para a tela que emite | L2 · 2 · Tipo dos documentos padrão |
| `l3-1-salvar-sem-tipo-e-descricao.html` | L3 · Campos obrigatórios | L3 · 1 · Salvar sem tipo e descrição |
| `l3-2-campos-corrigidos.html` | L3 · Campos obrigatórios | L3 · 2 · Campos corrigidos |
| `l4-1-extensao-nao-permitida.html` | L4 · Arquivo recusado | L4 · 1 · Extensão não permitida |
| `l4-2-arquivo-acima-de-15-000-kb.html` | L4 · Arquivo recusado | L4 · 2 · Arquivo acima de 15.000 KB |
| `l4-3-nome-com-caractere-especial.html` | L4 · Arquivo recusado | L4 · 3 · Nome com caractere especial |
| `l4-4-arquivo-corrompido.html` | L4 · Arquivo recusado | L4 · 4 · Arquivo corrompido |
| `l4-5-arquivo-trocado-por-um-valido.html` | L4 · Arquivo recusado | L4 · 5 · Arquivo trocado por um válido |
| `l5-1-dois-arquivos-na-lista.html` | L5 · Remover arquivo antes de salvar | L5 · 1 · Dois arquivos na lista |
| `l5-2-lista-vazia-salvar-arquivo-desabilitado.html` | L5 · Remover arquivo antes de salvar | L5 · 2 · Lista vazia, Salvar arquivo desabilitado |
| `l6-1-salvando.html` | L6 · Falha ao salvar | L6 · 1 · Salvando |
| `l6-2-erro-dados-mantidos.html` | L6 · Falha ao salvar | L6 · 2 · Erro, dados mantidos |
| `l7-1-aba-sem-novo-documento.html` | L7 · Sem permissão de inclusão | L7 · 1 · Aba sem Novo documento |
| `l7-2-acesso-pela-url.html` | L7 · Sem permissão de inclusão | L7 · 2 · Acesso pela URL |
| `l8-1-arquivo-aceito-com-o-nome-ajustado.html` | L8 · Melhoria de UX: nome ajustado sozinho | L8 · 1 · Arquivo aceito com o nome ajustado |

Composição de tela: `gcg-tpl-preview.css`, `gcg-tpl-gaveta.css`, `gcg-detalhe.css`.

### Templates · Consumir templates · Documentos do contrato — `telas/templates-consumir-documentos/`

| Arquivo | Linha do Figma | Frame |
|---|---|---|
| `l1-1-aba-documentacao-carregando.html` | L1 · Consultar os documentos — fluxo básico | L1 · 1 · Aba Documentação carregando |
| `l1-2-documentos-agrupados-por-tipo.html` | L1 · Consultar os documentos — fluxo básico | L1 · 2 · Documentos agrupados por tipo |
| `l1-3-grupos-recolhidos-um-aberto.html` | L1 · Consultar os documentos — fluxo básico | L1 · 3 · Grupos recolhidos, um aberto |
| `l2-1-filtros-preenchidos.html` | L2 · Pesquisar pelos filtros gerais | L2 · 1 · Filtros preenchidos |
| `l2-2-resultado-com-os-criterios-aplicados.html` | L2 · Pesquisar pelos filtros gerais | L2 · 2 · Resultado com os critérios aplicados |
| `l3-1-tipo-ateste-de-nota-fiscal.html` | L3 · Filtros específicos por tipo de documento | L3 · 1 · Tipo Ateste de Nota Fiscal |
| `l3-2-tipo-termo-de-recebimento.html` | L3 · Filtros específicos por tipo de documento | L3 · 2 · Tipo Termo de Recebimento |
| `l3-3-tipo-ordem-de-servico.html` | L3 · Filtros específicos por tipo de documento | L3 · 3 · Tipo Ordem de Serviço |
| `l4-1-ateste-sem-dados-de-nota-fiscal.html` | L4 · Documento sem dados específicos | L4 · 1 · Ateste sem dados de nota fiscal |
| `l5-1-preview-do-parecer-tecnico-03-2026.html` | L5 · Visualizar o documento (preview) | L5 · 1 · Preview do Parecer Técnico 03/2026 |
| `l6-1-menu-exportar-aberto.html` | L6 · Exportar | L6 · 1 · Menu Exportar aberto |
| `l6-2-documento-exportado.html` | L6 · Exportar | L6 · 2 · Documento exportado |
| `l7-1-contrato-sem-documentos.html` | L7 · FE01 · Nenhum documento | L7 · 1 · Contrato sem documentos |
| `l7-2-tipo-sem-documentos.html` | L7 · FE01 · Nenhum documento | L7 · 2 · Tipo sem documentos |
| `l8-1-data-final-antes-da-inicial.html` | L8 · FE02 · Filtros inválidos | L8 · 1 · Data final antes da inicial |
| `l8-2-corrigido-e-pesquisado.html` | L8 · FE02 · Filtros inválidos | L8 · 2 · Corrigido e pesquisado |
| `l9-1-falha-ao-consultar.html` | L9 · FE03 · Falha de dependência ou exportação | L9 · 1 · Falha ao consultar |
| `l9-2-falha-ao-exportar.html` | L9 · FE03 · Falha de dependência ou exportação | L9 · 2 · Falha ao exportar |
| `l10-1-parecer-sigiloso-para-quem-nao-tem-acesso.html` | L10 · Documento sigiloso sem permissão | L10 · 1 · Parecer sigiloso para quem não tem acesso |

Composição de tela: `gcg-tpl-preview.css`, `gcg-tpl-gaveta.css`, `gcg-detalhe.css`.

## O que este pacote não traz

- **Regra de negócio:** filtrar, ordenar, paginar, buscar pessoa e fornecedor, salvar filtro,
  enviar comunicação. Está no documento de requisitos de cada HU (RF, FE, MSG) e é do servidor.
- **O comportamento que depende do servidor:** a pesquisa dinâmica de pessoa e fornecedor (os
  resultados enquanto se digita), ordenar e paginar a tabela, o anexo de arquivo, salvar e excluir
  filtro, enviar comunicação, as ações dos menus. O `gcg-behavior.js` avisa por evento (ver
  "Comportamento") e quem constrói liga a chamada.
- **Recolher a barra lateral** pelo botão Menu: o estilo está no `gcg-sidebar.css`
  (`gcg-sidebar--collapsed`), mas o rótulo de cada item sai do HTML no recolhido, e isso é do
  layout da aplicação.

## Como foi conferido

<!-- conferencia:inicio -->
Cada uma das 448 telas foi comparada com o mesmo estado no protótipo, pixel a pixel, em
1440 × 1024: sozinha e com o Bootstrap 3.3.1 carregado antes. Quando o frame do Figma mostra a
página rolada, a conferência rola o arquivo até o mesmo ponto.

- Maior diferença: 0,328% dos pixels sozinha; 0,328% com o Bootstrap.
- Acima de 0,05%:
  - `assinatura-hu001-realizar-assinatura/l2-2-indicar-os-signatarios.html`: 0,323%, no protótipo, o foco que a janela põe no campo Signatário seleciona o texto (a faixa azul); o HTML mostra o mesmo texto sem seleção, como o frame do Figma;
  - `assinatura-hu001-realizar-assinatura/l2-3-signatarios-preenchidos.html`: 0,323%, no protótipo, o foco que a janela põe no campo Signatário seleciona o texto (a faixa azul); o HTML mostra o mesmo texto sem seleção, como o frame do Figma;
  - `assinatura-hu001-realizar-assinatura/l11-1-signatario-sem-e-mail.html`: 0,328%, no protótipo, o foco que a janela põe no campo Signatário seleciona o texto (a faixa azul); o HTML mostra o mesmo texto sem seleção, como o frame do Figma;
  - `hu012-painel-gestor-e-fiscal/l1-3-exibir-20-a-relacao-inteira.html`: 0,062%, suavização de letras soltas dos nomes; ampliadas, as capturas são iguais;
  - `hu012-painel-gestor-e-fiscal/l2-3-ordenado-por-mais-assinaturas-pendentes.html`: 0,051%, suavização de letras soltas dos nomes; ampliadas, as capturas são iguais;
  - `hu012-painel-gestor-e-fiscal/l3-2-filtrar-por-assinatura-pendente.html`: 0,051%, suavização de letras soltas dos nomes; ampliadas, as capturas são iguais;
  - `hu012-painel-gestor-e-fiscal/l5-1-passar-o-mouse-na-linha.html`: 0,059%, suavização de letras soltas dos nomes; a linha em hover e a dica batem;
  - `hu012-painel-gestor-e-fiscal/l6-1-painel-do-paulo-fiscal.html`: 0,054%, suavização de letras soltas dos nomes; ampliadas, as capturas são iguais;
  - `hu012-painel-gestor-e-fiscal/l7-1-tudo-em-dia.html`: 0,058%, suavização de letras soltas dos nomes; ampliadas, as capturas são iguais.
- Hover e foco de cada botão, link e campo, com e sem o Bootstrap, em 34 telas (uma por pasta): 0 diferenças.
- Erro no console ou arquivo que não carregou: 0.
<!-- conferencia:fim -->

<!-- comportamento:inicio -->
O comportamento foi conferido num Chromium (Playwright), com o movimento ligado:

- As 448 telas abrem com o `gcg-behavior.js`, sem erro de console e sem arquivo que falhe: 0 com erro. 3776 moldes; gatilho apontando para molde que não existe: 0.
- 17 roteiros, 92 checagens: 92 certas. Menu de ações da linha (ActionMenu), Menu com rótulo (Exportar), Gaveta de filtros, Select e calendário, Modal aberto de um botão, Modal já aberto na tela (adotado), Abas, Dica (Tooltip), Confirmação da casinha, Toast, Grupo da tabela e preview lateral, Seção recolhível, Janela dos signatários, Gaveta Novo documento, Gaveta Cancelar documento (Voltar), Seleção na tabela, Seleção com grupo recolhido, Barra de acessibilidade (eMAG).
- Erro de console nos roteiros: 0.
<!-- comportamento:fim -->

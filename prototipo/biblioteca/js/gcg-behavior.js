/* gcg-behavior.js — o comportamento dos componentes do GCG: abrir e fechar, teclado, foco e as animações
   de entrada e saída. JavaScript puro, sem dependência (não precisa do jQuery nem do JavaScript do
   Bootstrap). Ligue uma vez no layout, no fim do <body>, depois do gcg-icons.js e do gcg-motion.js.

   Como se pendura na página: por delegação no document, a partir das classes gcg-* e dos atributos
   aria-* e data-gcg-* que já estão no HTML de cada componente. Não precisa chamar nada por componente,
   e o que o servidor trocar na página (lista nova, aba nova) continua funcionando.

   A parte que abre (o menu, a lista do Select, a janela, a gaveta, as linhas de um grupo recolhido) pode
   estar na página de três jeitos, nesta ordem:
   1. Num <template id="..."> apontado pelo gatilho com data-gcg-popup="id". Ao abrir, o script copia o
      conteúdo para o lugar de cada <div data-gcg-part> (data-gcg-mount: "body", "up:N" = N níveis acima
      do gatilho, ou "#id" + data-gcg-path) e, ao fechar, tira. É o que as telas do pacote trazem.
   2. Já aberta no HTML (o estado "aberto" de uma tela). O script adota: ao fechar, guarda os nós e os
      devolve na próxima abertura.
   3. O calendário do DatePicker não precisa de nada: o script monta a grade do mês.

   O CSS já traz o desenho de cada estado e as animações (@keyframes gcg-*); o script liga e desliga as
   classes e os atributos. Com prefers-reduced-motion: reduce, nada anima.

   Regra de negócio (filtrar, salvar, enviar, paginar) não está aqui. O script avisa com eventos
   (CustomEvent com bubbles), e quem constrói decide: gcg:open, gcg:close, gcg:menuselect, gcg:change,
   gcg:tabchange, gcg:submit, gcg:clear, gcg:confirm, gcg:grouptoggle, gcg:toggle, gcg:selectionchange. Os de envio
   (gcg:submit, gcg:confirm) são canceláveis: com preventDefault(), a janela não fecha. */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------
  var reduz = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function semMovimento() { return !!(reduz && reduz.matches); }

  /* a duração de um token de movimento (ex.: --gcg-motion-base), em ms */
  function duracao(token, padrao) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    var n = parseFloat(v);
    if (isNaN(n)) return padrao;
    return /ms$/.test(v) ? n : n * 1000;
  }
  var CURVA = { standard: 'cubic-bezier(0.2, 0, 0, 1)', exit: 'cubic-bezier(0.3, 0, 1, 1)' };

  /* animação pelo Web Animations API; resolve na hora sem movimento */
  function animar(el, quadros, opcoes) {
    if (!el || semMovimento() || typeof el.animate !== 'function') return Promise.resolve();
    try {
      var a = el.animate(quadros, opcoes);
      return new Promise(function (ok) {
        a.onfinish = ok; a.oncancel = ok;
        setTimeout(ok, (opcoes.duration || 0) + 80);
      });
    } catch (e) { return Promise.resolve(); }
  }
  /* põe a classe ou o estado de saída e espera a animação do CSS acabar (como GcgMotion.leave) */
  function esperarAnimacao(el, limite) {
    return new Promise(function (ok) {
      if (!el || semMovimento()) { ok(); return; }
      var feito = false;
      function fim(e) { if (e && e.target !== el) return; if (feito) return; feito = true; el.removeEventListener('animationend', fim); ok(); }
      el.addEventListener('animationend', fim);
      setTimeout(function () { fim(); }, limite || duracao('--gcg-motion-slow', 280) + 80);
    });
  }
  var SAIDA = [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.96)' }];

  function emitir(el, nome, detalhe, cancelavel) {
    var ev;
    try { ev = new CustomEvent(nome, { bubbles: true, cancelable: !!cancelavel, detail: detalhe || {} }); }
    catch (e) { ev = document.createEvent('CustomEvent'); ev.initCustomEvent(nome, true, !!cancelavel, detalhe || {}); }
    return el.dispatchEvent(ev);
  }
  function arr(lista) { return Array.prototype.slice.call(lista || []); }
  function semAcento(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function texto(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function inativo(el) {
    return !el || el.disabled || el.getAttribute('aria-disabled') === 'true' || el.classList.contains('gcg-button--loading');
  }
  function focar(el) { if (el && el.focus) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } } }

  var FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function focaveis(raiz) {
    if (!raiz) return [];
    return arr(raiz.querySelectorAll(FOCAVEIS)).filter(function (el) {
      return el.getClientRects().length > 0 && !el.closest('[inert]') && el.getAttribute('aria-hidden') !== 'true';
    });
  }

  /* o ícone de um <span class="gcg-icon">: troca o <use href="#gcg-icon-..."> */
  function trocarIcone(span, nome) {
    var use = span && span.querySelector('use');
    if (!use) return;
    use.setAttribute('href', '#gcg-icon-' + nome);
  }
  function icone(nome, classe, tamanho) {
    return '<span class="gcg-icon gcg-icon--' + (tamanho || 'sm') + (classe ? ' ' + classe : '') + '"><svg aria-hidden="true" focusable="false" fill="currentColor"><use href="#gcg-icon-' + nome + '"></use></svg></span>';
  }
  /* o chevron que gira: o ícone novo nasce com o desenho do anterior e vai ao lugar */
  function girar(span, graus, token) {
    animar(span, [{ transform: 'rotate(' + graus + 'deg)' }, { transform: 'none' }], { duration: duracao(token || '--gcg-motion-base', 200), easing: CURVA.standard });
  }

  /* o estado parado da demonstração (data-gcg-force-state) não serve depois da primeira interação */
  function limparDemo(el) {
    if (!el) return;
    if (el.removeAttribute) el.removeAttribute('data-gcg-force-state');
    arr(el.querySelectorAll ? el.querySelectorAll('[data-gcg-force-state]') : []).forEach(function (n) { n.removeAttribute('data-gcg-force-state'); });
  }

  var serial = 0;
  function novoId(base) { serial += 1; return (base || 'gcg-b') + '-' + serial; }

  // ---------------------------------------------------------------------------
  // Posição da camada flutuante (menu, dica, lista, calendário): fixa na janela, presa ao controle
  // ---------------------------------------------------------------------------
  var MARGEM = 8;
  function paisQueRolam(el) {
    var lista = [], p = el && el.parentElement;
    while (p && p !== document.body) {
      var s = getComputedStyle(p);
      if (/(auto|scroll|hidden)/.test(s.overflowY + s.overflowX)) lista.push(p);
      p = p.parentElement;
    }
    return lista;
  }
  function ancoraVisivel(ancora) {
    var r = ancora.getBoundingClientRect();
    if (!(r.bottom > 0 && r.top < window.innerHeight)) return false;
    return paisQueRolam(ancora).every(function (p) {
      var c = p.getBoundingClientRect();
      return r.bottom > c.top && r.top < c.bottom && r.right > c.left && r.left < c.right;
    });
  }
  /* menu e dica: abaixo ou acima, alinhado pelo início, pelo fim ou pelo centro do alvo */
  function posicaoFlutuante(ancora, el, o) {
    var a = ancora.getBoundingClientRect();
    var w = el.offsetWidth, h = el.offsetHeight;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var left = o.align === 'start' ? a.left : o.align === 'end' ? a.right - w : a.left + a.width / 2 - w / 2;
    if (o.align === 'end' && left < MARGEM) left = a.left;
    else if (o.align === 'start' && left + w > vw - MARGEM) left = a.right - w;
    left = Math.max(MARGEM, Math.min(left, vw - MARGEM - w));
    var abaixo = a.bottom + o.gap, acima = a.top - o.gap - h;
    var cabeAbaixo = abaixo + h <= vh - MARGEM, cabeAcima = acima >= MARGEM;
    var lado = o.placement;
    if (lado === 'bottom' && !cabeAbaixo && cabeAcima) lado = 'top';
    else if (lado === 'top' && !cabeAcima && cabeAbaixo) lado = 'bottom';
    var top = lado === 'bottom' ? abaixo : acima;
    if (!cabeAbaixo && !cabeAcima) top = Math.max(MARGEM, Math.min(top, vh - MARGEM - h));
    return { top: top, left: left, lado: lado, setaX: a.left + a.width / 2 - left };
  }
  /* lista e calendário: 8 px abaixo do controle; perto da borda direita, alinha pela direita */
  function posicaoPopover(ancora, el, larguraDoControle) {
    var r = ancora.getBoundingClientRect();
    var w = larguraDoControle ? r.width : el.offsetWidth, h = el.offsetHeight;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var left = r.left;
    if (r.left + w > vw - MARGEM) left = r.right - w;
    left = Math.max(MARGEM, Math.min(left, vw - MARGEM - w));
    var top = r.bottom + 8, lado = 'bottom';
    if (top + h > vh - MARGEM) {
      if (r.top - 8 - h >= MARGEM) { top = r.top - 8 - h; lado = 'top'; }
      else top = Math.max(MARGEM, vh - MARGEM - h);
    }
    return { top: top, left: left, width: larguraDoControle ? w : null, lado: lado };
  }
  function trocarLado(el, base, lado) {
    el.classList.remove(base + '--bottom', base + '--top');
    el.classList.add(base + '--' + lado);
  }

  // ---------------------------------------------------------------------------
  // Moldes: a parte que abre, guardada num <template> (ver o comentário do topo)
  // ---------------------------------------------------------------------------
  function filhosUteis(el) {
    return arr(el.children).filter(function (c) {
      return !/^(SCRIPT|TEMPLATE)$/.test(c.tagName) && !c.hasAttribute('data-gcg-sprite') &&
        !(el === document.body && c.tagName.toLowerCase() === 'svg' && c.style.position === 'absolute') &&
        !c.hasAttribute('data-gcg-mounted');
    });
  }
  function destino(parte, gatilho) {
    var m = parte.getAttribute('data-gcg-mount') || 'body';
    var pai = null;
    if (m === 'body') pai = document.body;
    else if (m.indexOf('up:') === 0) {
      pai = gatilho;
      for (var n = +m.slice(3); pai && n > 0; n--) pai = pai.parentElement;
    } else pai = document.querySelector(m);
    var caminho = parte.getAttribute('data-gcg-path');
    if (pai && caminho) caminho.split('.').forEach(function (i) { pai = pai && filhosUteis(pai)[+i]; });
    return pai || document.body;
  }
  function inserir(pai, nos, indice) {
    var irmaos = filhosUteis(pai);
    var antes = indice != null && indice !== '' && +indice < irmaos.length ? irmaos[+indice] : null;
    if (!antes && pai === document.body) {
      // no <body>, antes dos <template> e dos <script> do fim
      antes = arr(pai.children).filter(function (c) { return /^(SCRIPT|TEMPLATE)$/.test(c.tagName); })[0] || null;
    }
    nos.forEach(function (n) { pai.insertBefore(n, antes); });
  }
  /* devolve os nós postos na página (a parte aberta), ou null se não há o que abrir */
  function montar(gatilho) {
    if (gatilho._gcgGuardado) {
      var g = gatilho._gcgGuardado; gatilho._gcgGuardado = null;
      g.forEach(function (p) { inserir(p.pai.isConnected ? p.pai : document.body, p.nos, p.indice); });
      return g.reduce(function (t, p) { return t.concat(p.nos); }, []);
    }
    var id = gatilho.getAttribute('data-gcg-popup');
    var molde = id && document.getElementById(id);
    if (!molde || !molde.content) return null;
    var todos = [];
    arr(molde.content.children).forEach(function (parte) {
      var pai = destino(parte, gatilho);
      var nos = arr(parte.cloneNode(true).childNodes).filter(function (n) { return n.nodeType === 1; });
      inserir(pai, nos, parte.getAttribute('data-gcg-index'));
      todos = todos.concat(nos);
    });
    return todos;
  }
  /* tira da página; o que não veio de molde fica guardado no gatilho para a próxima abertura (com guardarSempre,
     o que veio de molde também: o grupo recolhido guarda as linhas com a marcação das caixas) */
  function desmontar(gatilho, nos, guardarSempre) {
    var guardar = gatilho && (guardarSempre || !gatilho.getAttribute('data-gcg-popup'));
    var partes = [];
    nos.forEach(function (n) {
      if (!n.parentNode) return;
      limparDemo(n);
      if (guardar) {
        var pai = n.parentNode;
        var p = partes.filter(function (x) { return x.pai === pai; })[0];
        if (!p) { p = { pai: pai, nos: [], indice: filhosUteis(pai).indexOf(n) }; partes.push(p); }
        p.nos.push(n);
      }
    });
    nos.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    if (guardar) gatilho._gcgGuardado = partes;
  }

  // ---------------------------------------------------------------------------
  // Camadas flutuantes abertas (menu, lista, calendário, confirmação): clique fora fecha; rolar e
  // redimensionar reposicionam; o controle que sai da vista fecha
  // ---------------------------------------------------------------------------
  var flutuantes = []; // { el, gatilho, ancora, fechar(devolverFoco), posicionar(), tipo }
  function registrar(f) { flutuantes.push(f); return f; }
  function retirar(f) { flutuantes = flutuantes.filter(function (x) { return x !== f; }); }
  function flutuanteDe(el) {
    for (var i = flutuantes.length - 1; i >= 0; i--) {
      var f = flutuantes[i];
      if (f.el.contains(el) || f.gatilho === el || (f.gatilho && f.gatilho.contains(el))) return f;
    }
    return null;
  }
  function reposicionarTudo() {
    flutuantes.slice().forEach(function (f) {
      if (!f.movel || !f.posicionar) return;
      if (f.ancora && !ancoraVisivel(f.ancora)) { f.fechar(false); return; }
      f.posicionar();
    });
    dicas.forEach(function (d) { if (d.aberta && d.movel) posicionarDica(d); });
  }

  // ---------------------------------------------------------------------------
  // ActionMenu e menu do perfil (padrão Menu Button da WAI-ARIA)
  // ---------------------------------------------------------------------------
  function itensDoMenu(menu) { return arr(menu.querySelectorAll('[role="menuitem"]')); }
  function setaDoBotao(gatilho) {
    var spans = gatilho.querySelectorAll('.gcg-button__icon, .gcg-topbar__menu-seta');
    var ultimo = spans[spans.length - 1];
    if (!ultimo) return null;
    var use = ultimo.querySelector('use');
    return use && /expand_(more|less)/.test(use.getAttribute('href')) ? ultimo : null;
  }
  function abrirMenu(gatilho, foco) {
    var aberto = flutuanteDe(gatilho);
    if (aberto && aberto.tipo === 'menu' && aberto.gatilho === gatilho) {
      focarItem(aberto, foco === 'last' ? -1 : 0);
      return;
    }
    var nos = montar(gatilho);
    if (!nos) { emitir(gatilho, 'gcg:open', { kind: 'menu', empty: true }); return; }
    var sup = nos.filter(function (n) { return n.querySelector && (n.matches('[role="menu"]') || n.querySelector('[role="menu"]')); })[0] || nos[0];
    var menu = sup.matches('[role="menu"]') ? sup : sup.querySelector('[role="menu"]');
    var f = registrar({ tipo: 'menu', el: sup, nos: nos, menu: menu, gatilho: gatilho, ancora: gatilho, movel: sup.classList.contains('gcg-action-menu__surface--floating') });
    f.posicionar = function () {
      if (!f.movel) return;
      var alinhar = sup.classList.contains('gcg-action-menu__surface--align-start') ? 'start' : 'end';
      var p = posicaoFlutuante(gatilho, sup, { placement: 'bottom', align: alinhar, gap: 4 });
      sup.style.top = p.top + 'px'; sup.style.left = p.left + 'px'; sup.style.opacity = ''; sup.style.pointerEvents = '';
      trocarLado(sup, 'gcg-action-menu__surface', p.lado);
    };
    f.fechar = function (devolver) { fecharMenu(f, devolver); };
    f.posicionar();
    gatilho.setAttribute('aria-expanded', 'true');
    if (menu.id) gatilho.setAttribute('aria-controls', menu.id);
    if (gatilho.classList.contains('gcg-topbar__menu-perfil')) gatilho.setAttribute('data-gcg-open', 'true');
    var seta = setaDoBotao(gatilho);
    if (seta) { trocarIcone(seta, 'expand_less'); girar(seta, 180); }
    requestAnimationFrame(function () { focarItem(f, foco === 'last' ? -1 : 0); });
    emitir(gatilho, 'gcg:open', { kind: 'menu' });
  }
  function focarItem(f, i) {
    var itens = itensDoMenu(f.menu);
    if (!itens.length) return;
    var n = itens.length;
    focar(itens[((i % n) + n) % n]);
  }
  function fecharMenu(f, devolver) {
    retirar(f);
    var g = f.gatilho;
    g.setAttribute('aria-expanded', 'false');
    g.removeAttribute('aria-controls');
    g.removeAttribute('data-gcg-open');
    limparDemo(g);
    var seta = setaDoBotao(g);
    if (seta) { trocarIcone(seta, 'expand_more'); girar(seta, 180); }
    if (devolver) focar(g);
    var sair = f.movel ? animar(f.el, SAIDA, { duration: duracao('--gcg-motion-fast', 120), easing: CURVA.exit, fill: 'forwards' }) : Promise.resolve();
    f.el.style.pointerEvents = 'none';
    sair.then(function () { f.el.style.pointerEvents = ''; desmontar(g, f.nos); });
    emitir(g, 'gcg:close', { kind: 'menu' });
  }
  function teclaNoMenu(f, e) {
    var itens = itensDoMenu(f.menu);
    var atual = itens.indexOf(document.activeElement);
    var n = itens.length;
    function ir(i) { e.preventDefault(); focarItem(f, i); }
    switch (e.key) {
      case 'ArrowDown': ir(atual + 1); break;
      case 'ArrowUp': ir(atual < 0 ? n - 1 : atual - 1); break;
      case 'Home': case 'PageUp': ir(0); break;
      case 'End': case 'PageDown': ir(n - 1); break;
      case 'Escape': e.preventDefault(); fecharMenu(f, true); break;
      case 'Tab': fecharMenu(f, true); break; // o Tab segue a partir do botão
      case 'Enter': case ' ':
        if (atual >= 0) { e.preventDefault(); escolherItem(f, itens[atual]); }
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          var letra = semAcento(e.key);
          for (var k = 1; k <= n; k++) {
            var i = (Math.max(atual, 0) + k) % n;
            if (semAcento(texto(itens[i])).indexOf(letra) === 0) { ir(i); break; }
          }
        }
    }
  }
  function escolherItem(f, item) {
    if (inativo(item)) return;
    var g = f.gatilho;
    var popup = item.getAttribute('data-gcg-popup');
    fecharMenu(f, true);
    emitir(item, 'gcg:menuselect', { item: item.getAttribute('data-gcg-menu-item') || texto(item), trigger: g });
    // item que abre uma janela (data-gcg-popup no item): a janela volta o foco ao botão do menu
    if (popup) abrirJanela(g, popup);
  }

  // ---------------------------------------------------------------------------
  // Janelas: Modal, gaveta de filtros, preview lateral e a confirmação ancorada (tela inicial)
  // ---------------------------------------------------------------------------
  var janelas = []; // pilha: a de cima recebe Esc e prende o Tab
  function tipoDaJanela(raiz) {
    if (raiz.classList.contains('gcg-modal-layer')) return 'modal';
    if (raiz.classList.contains('gcg-popover')) return 'ancorada';
    if (raiz.hasAttribute('data-gcg-state') || raiz.classList.contains('gcg-filter-drawer')) return 'gaveta';
    return 'modal';
  }
  function dialogoDe(raiz) { return raiz.matches('[role="dialog"], [role="alertdialog"]') ? raiz : raiz.querySelector('[role="dialog"], [role="alertdialog"]'); }
  function focoInicial(j) {
    var d = j.dialogo;
    if (d.querySelector('[data-gcg-autofocus]')) return d.querySelector('[data-gcg-autofocus]');
    if (j.tipo === 'modal') {
      return d.querySelector('.gcg-modal__field input, .gcg-modal__field textarea') ||
        focaveis(d.querySelector('.gcg-modal__content')).filter(function (el) { return !el.closest('.gcg-modal__body'); })[0] ||
        d.querySelector('.gcg-modal__footer button') || d;
    }
    if (j.tipo === 'gaveta' && d.querySelector('.gcg-filter-drawer__body')) return focaveis(d.querySelector('.gcg-filter-drawer__body'))[0] || d;
    if (j.tipo === 'ancorada') return focaveis(d)[0] || d;
    return d;
  }
  function abrirJanela(gatilho, idMolde) {
    if (idMolde && !gatilho.getAttribute('data-gcg-popup')) gatilho.setAttribute('data-gcg-popup', idMolde);
    var nos = montar(gatilho);
    if (!nos) { emitir(gatilho, 'gcg:open', { kind: 'dialog', empty: true }); return null; }
    var raiz = nos.filter(function (n) { return dialogoDe(n); })[0];
    if (!raiz) return null;
    var j = adotarJanela(raiz, gatilho, nos);
    if (gatilho.hasAttribute('aria-expanded')) gatilho.setAttribute('aria-expanded', 'true');
    if (gatilho.classList.contains('gcg-start-screen-button')) gatilho.classList.add('gcg-is-open');
    if (j.tipo === 'ancorada') { j.f.movel = true; j.f.posicionar(); }
    requestAnimationFrame(function () { focar(focoInicial(j)); });
    emitir(gatilho, 'gcg:open', { kind: 'dialog' });
    return j;
  }
  function adotarJanela(raiz, gatilho, nos) {
    var j = { raiz: raiz, dialogo: dialogoDe(raiz), gatilho: gatilho, nos: nos || [raiz], tipo: tipoDaJanela(raiz) };
    if (raiz.classList.contains('gcg-filter-drawer')) document.documentElement.setAttribute('data-gcg-drawer-open', '');
    if (j.tipo === 'ancorada') {
      // a confirmação da casinha: presa ao botão, fecha no clique fora (como os menus)
      j.f = registrar({ tipo: 'janela', el: raiz, gatilho: gatilho, ancora: gatilho, movel: false });
      j.f.posicionar = function () {
        if (!gatilho) return;
        var p = posicaoPopover(gatilho, raiz, false);
        raiz.style.top = p.top + 'px'; raiz.style.left = p.left + 'px';
        trocarLado(raiz, 'gcg-popover', p.lado);
      };
      j.f.fechar = function (devolver) { fecharJanela(j, devolver); };
    }
    janelas.push(j);
    return j;
  }
  function fecharJanela(j, devolver) {
    if (janelas.indexOf(j) < 0) return;
    janelas = janelas.filter(function (x) { return x !== j; });
    if (j.f) retirar(j.f);
    var g = j.gatilho;
    var focoDentro = j.raiz.contains(document.activeElement) || document.activeElement === document.body;
    var fim;
    if (j.tipo === 'modal') {
      j.raiz.classList.add('gcg-modal-layer--leaving');
      fim = esperarAnimacao(j.raiz.querySelector('.gcg-modal') || j.raiz, duracao('--gcg-motion-fast', 120) + 80);
    } else if (j.tipo === 'gaveta') {
      j.raiz.setAttribute('data-gcg-state', 'closing');
      j.raiz.setAttribute('inert', '');
      var veu = j.raiz.querySelector('.gcg-scrim');
      if (veu) { veu.classList.add('gcg-scrim--leaving'); veu.setAttribute('data-gcg-state', 'closed'); }
      fim = esperarAnimacao(j.dialogo, duracao('--gcg-motion-base', 200) + 80);
    } else {
      fim = animar(j.raiz, SAIDA, { duration: duracao('--gcg-motion-fast', 120), easing: CURVA.exit, fill: 'forwards' });
    }
    fim.then(function () {
      if (j.tipo === 'modal') j.raiz.classList.remove('gcg-modal-layer--leaving');
      if (j.tipo === 'gaveta') {
        j.raiz.setAttribute('data-gcg-state', 'open');
        j.raiz.removeAttribute('inert');
        var v = j.raiz.querySelector('.gcg-scrim');
        if (v) { v.classList.remove('gcg-scrim--leaving'); v.setAttribute('data-gcg-state', 'open'); }
      }
      desmontar(g, j.nos);
      if (!janelas.some(function (x) { return x.raiz.classList.contains('gcg-filter-drawer'); })) document.documentElement.removeAttribute('data-gcg-drawer-open');
    });
    if (g) {
      if (g.hasAttribute('aria-expanded')) g.setAttribute('aria-expanded', 'false');
      g.classList.remove('gcg-is-open');
      limparDemo(g);
      if (devolver !== false && focoDentro) focar(g);
      emitir(g, 'gcg:close', { kind: 'dialog' });
    } else if (devolver !== false && focoDentro) {
      // a janela que veio aberta no HTML não sabe quem a abriu: o foco vai para a janela de baixo, ou para o conteúdo
      var baixo = janelas[janelas.length - 1];
      focar(baixo ? baixo.dialogo : document.getElementById('gcg-conteudo') || document.body);
    }
  }
  function janelaDe(el) {
    for (var i = janelas.length - 1; i >= 0; i--) if (janelas[i].raiz.contains(el)) return janelas[i];
    return null;
  }
  function ehFechar(botao) {
    if (botao.hasAttribute('data-gcg-close') || botao.classList.contains('gcg-modal__close')) return true;
    if (/^Fechar\b/.test(botao.getAttribute('aria-label') || '')) return true;
    // Voltar: na gaveta lateral (Cancelar documento), desiste sem cancelar (v1.6)
    if (texto(botao) === 'Voltar' && botao.closest('.gcg-tpl-gaveta')) return true;
    return texto(botao) === 'Cancelar';
  }
  function prenderTab(j, e) {
    if (j.dialogo.getAttribute('aria-modal') !== 'true') return;
    var itens = focaveis(j.dialogo);
    if (!itens.length) { e.preventDefault(); focar(j.dialogo); return; }
    var primeiro = itens[0], ultimo = itens[itens.length - 1], ativo = document.activeElement;
    if (!j.dialogo.contains(ativo)) { e.preventDefault(); focar(e.shiftKey ? ultimo : primeiro); return; }
    if (e.shiftKey && (ativo === primeiro || ativo === j.dialogo)) { e.preventDefault(); focar(ultimo); }
    else if (!e.shiftKey && ativo === ultimo) { e.preventDefault(); focar(primeiro); }
  }

  // ---------------------------------------------------------------------------
  // Abas (padrão Tabs da WAI-ARIA, ativação manual: a seta move o foco; Enter ou Espaço abrem)
  // ---------------------------------------------------------------------------
  function abasDe(lista) { return arr(lista.querySelectorAll('[role="tab"]')).filter(function (t) { return !inativo(t); }); }
  function painelDa(aba) {
    var id = aba.getAttribute('aria-controls') || (aba.id ? aba.id.replace('-tab-', '-panel-') : '');
    return id ? document.getElementById(id) : null;
  }
  function selecionarAba(aba) {
    var lista = aba.closest('[role="tablist"]');
    if (!lista || inativo(aba)) return;
    var anterior = arr(lista.querySelectorAll('[role="tab"]')).filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
    if (anterior === aba) return;
    var pAntes = anterior && painelDa(anterior);
    arr(lista.querySelectorAll('[role="tab"]')).forEach(function (t) {
      var sim = t === aba;
      t.setAttribute('aria-selected', sim ? 'true' : 'false');
      t.classList.toggle('gcg-tabs__tab--selected', sim);
      t.setAttribute('tabindex', sim ? '0' : '-1');
      limparDemo(t);
      if (!sim) t.removeAttribute('aria-controls');
    });
    var pDepois = painelDa(aba);
    if (pDepois) aba.setAttribute('aria-controls', pDepois.id);
    // o indicador desliza da aba anterior até a escolhida (FLIP, só transform)
    if (anterior && aba.offsetWidth) {
      var dx = anterior.offsetLeft - aba.offsetLeft, escala = anterior.offsetWidth / aba.offsetWidth;
      animar(aba.querySelector('.gcg-tabs__indicator'), [{ transform: 'translateX(' + dx + 'px) scaleX(' + escala + ')' }, { transform: 'none' }], { duration: duracao('--gcg-motion-base', 200), easing: CURVA.standard });
    }
    if (aba.scrollIntoView) { try { aba.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* navegador antigo */ } }
    // o painel da aba escolhida, se já estiver na página: entra com fade, vindo do lado da aba
    if (pDepois && pDepois !== pAntes) {
      if (pAntes) pAntes.hidden = true;
      pDepois.hidden = false;
      var abas = arr(lista.querySelectorAll('[role="tab"]'));
      var lado = anterior ? Math.sign(abas.indexOf(aba) - abas.indexOf(anterior)) : 0;
      animar(pDepois, [{ opacity: 0, transform: 'translateX(' + (lado * 8) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: duracao('--gcg-motion-base', 200), easing: CURVA.standard });
    }
    emitir(aba, 'gcg:tabchange', { tab: aba.id, previous: anterior ? anterior.id : null, panel: pDepois ? pDepois.id : null });
  }
  function teclaNasAbas(lista, e) {
    var abas = abasDe(lista);
    var atual = abas.indexOf(document.activeElement);
    if (atual < 0) return false;
    var n = abas.length, proximo = -1;
    if (e.key === 'ArrowRight') proximo = (atual + 1) % n;
    else if (e.key === 'ArrowLeft') proximo = (atual - 1 + n) % n;
    else if (e.key === 'Home') proximo = 0;
    else if (e.key === 'End') proximo = n - 1;
    if (proximo < 0) return false;
    e.preventDefault();
    limparDemo(lista);
    focar(abas[proximo]);
    try { abas[proximo].scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (x) { /* navegador antigo */ }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Select (padrão select-only combobox: o foco fica no campo; a opção ativa vai no aria-activedescendant)
  // ---------------------------------------------------------------------------
  function campoDo(gatilho) { return gatilho.closest('.gcg-field'); }
  function controleDo(gatilho) { return gatilho.closest('.gcg-field__control') || gatilho; }
  function opcoesDe(lista) { return arr(lista.querySelectorAll('[role="option"]')); }
  function rotuloDa(op) { return texto(op.querySelector('.gcg-select-option__label') || op); }
  function placeholderDo(gatilho) {
    if (gatilho.getAttribute('data-gcg-placeholder')) return gatilho.getAttribute('data-gcg-placeholder');
    if (gatilho._gcgVazio == null) {
      var v = gatilho.querySelector('.gcg-select__value');
      gatilho._gcgVazio = v && v.classList.contains('gcg-select__value--placeholder') ? texto(v) : '';
    }
    return gatilho._gcgVazio;
  }
  function ehVazia(gatilho, op, i) {
    var ph = placeholderDo(gatilho);
    return ph ? rotuloDa(op) === ph : (i === 0 && /^Tod[oa]s\b/.test(rotuloDa(op)));
  }
  function marcarOpcao(op, sim) {
    op.setAttribute('aria-selected', sim ? 'true' : 'false');
    if (sim) op.setAttribute('data-gcg-selected', 'true'); else op.removeAttribute('data-gcg-selected');
    var chk = op.querySelector('.gcg-select-option__check');
    if (sim && !chk) {
      var rot = op.querySelector('.gcg-select-option__label');
      if (rot) rot.insertAdjacentHTML('afterend', icone('check', 'gcg-select-option__check'));
    } else if (!sim && chk) chk.parentNode.removeChild(chk);
  }
  function abrirSelect(gatilho, ativo) {
    if (inativo(gatilho) || flutuanteDe(gatilho)) return;
    var nos = montar(gatilho);
    if (!nos) { emitir(gatilho, 'gcg:open', { kind: 'listbox', empty: true }); return; }
    var pop = nos.filter(function (n) { return n.querySelector('[role="listbox"]') || n.matches('[role="listbox"]'); })[0] || nos[0];
    var lista = pop.matches('[role="listbox"]') ? pop : pop.querySelector('[role="listbox"]');
    var f = registrar({ tipo: 'select', el: pop, nos: nos, lista: lista, gatilho: gatilho, ancora: controleDo(gatilho), movel: true, ativo: -1 });
    // a escolha feita antes (a lista vem do molde, com o estado de quando foi gerada)
    if (gatilho._gcgEscolha) opcoesDe(lista).forEach(function (op) { marcarOpcao(op, gatilho._gcgEscolha.indexOf(rotuloDa(op)) >= 0); });
    opcoesDe(lista).forEach(function (op) { op.removeAttribute('data-gcg-active'); });
    f.posicionar = function () {
      var p = posicaoPopover(f.ancora, pop, true);
      pop.style.top = p.top + 'px'; pop.style.left = p.left + 'px'; pop.style.width = p.width + 'px';
      trocarLado(pop, 'gcg-popover', p.lado);
    };
    f.fechar = function (devolver) { fecharSelect(f, devolver); };
    f.posicionar();
    gatilho.setAttribute('aria-expanded', 'true');
    if (lista.id) gatilho.setAttribute('aria-controls', lista.id);
    var campo = campoDo(gatilho);
    if (campo) campo.setAttribute('data-gcg-open', 'true');
    if (ativo != null) ativarOpcao(f, ativo);
    emitir(gatilho, 'gcg:open', { kind: 'listbox' });
  }
  function indiceEscolhido(f) {
    var ops = opcoesDe(f.lista);
    for (var i = 0; i < ops.length; i++) if (ops[i].getAttribute('aria-selected') === 'true') return i;
    return -1;
  }
  function ativarOpcao(f, i) {
    var ops = opcoesDe(f.lista);
    if (!ops.length) return;
    i = Math.max(0, Math.min(ops.length - 1, i));
    ops.forEach(function (op, k) { if (k === i) op.setAttribute('data-gcg-active', 'true'); else op.removeAttribute('data-gcg-active'); limparDemo(op); });
    f.ativo = i;
    if (ops[i].id) f.gatilho.setAttribute('aria-activedescendant', ops[i].id);
    // a opção ativa fica à vista
    var l = f.lista, el = ops[i];
    if (el.offsetTop < l.scrollTop) l.scrollTop = el.offsetTop;
    else if (el.offsetTop + el.offsetHeight > l.scrollTop + l.clientHeight) l.scrollTop = el.offsetTop + el.offsetHeight - l.clientHeight;
  }
  function escreverValor(gatilho, rotulos) {
    var v = gatilho.querySelector('.gcg-select__value');
    if (!v) return;
    var ph = placeholderDo(gatilho);
    v.textContent = rotulos.length ? rotulos.join(', ') : ph;
    v.classList.toggle('gcg-select__value--placeholder', !rotulos.length);
  }
  function escolherOpcao(f, i) {
    var ops = opcoesDe(f.lista), op = ops[i];
    if (!op) return;
    var g = f.gatilho;
    var multi = f.lista.getAttribute('aria-multiselectable') === 'true';
    if (multi) {
      if (ehVazia(g, op, i)) ops.forEach(function (o) { marcarOpcao(o, false); });
      else marcarOpcao(op, op.getAttribute('aria-selected') !== 'true');
    } else ops.forEach(function (o, k) { marcarOpcao(o, k === i && !ehVazia(g, o, k)); });
    var escolha = ops.filter(function (o) { return o.getAttribute('aria-selected') === 'true'; }).map(rotuloDa);
    g._gcgEscolha = escolha;
    escreverValor(g, escolha);
    emitir(g, 'gcg:change', { value: escolha[0] || null, values: escolha });
    if (multi) ativarOpcao(f, i);
    else { fecharSelect(f, false); focar(g); }
  }
  function fecharSelect(f, devolver) {
    retirar(f);
    var g = f.gatilho;
    g.setAttribute('aria-expanded', 'false');
    g.removeAttribute('aria-activedescendant');
    var campo = campoDo(g);
    if (campo) { campo.removeAttribute('data-gcg-open'); limparDemo(campo); }
    if (devolver) focar(g);
    f.el.style.pointerEvents = 'none';
    animar(f.el, SAIDA, { duration: duracao('--gcg-motion-fast', 120), easing: CURVA.exit, fill: 'forwards' })
      .then(function () { f.el.style.pointerEvents = ''; desmontar(g, f.nos); });
    emitir(g, 'gcg:close', { kind: 'listbox' });
  }
  var busca = { texto: '', ate: 0 };
  function saltarPorLetra(f, gatilho, tecla) {
    var agora = Date.now();
    busca.texto = (agora < busca.ate ? busca.texto : '') + semAcento(tecla);
    busca.ate = agora + 700;
    if (!f) { abrirSelect(gatilho); f = flutuanteDe(gatilho); if (!f || f.tipo !== 'select') return; }
    var ops = opcoesDe(f.lista), n = ops.length;
    var inicio = f.ativo >= 0 ? f.ativo : indiceEscolhido(f);
    for (var k = 0; k < n; k++) {
      var i = (k + Math.max(inicio, 0) + (busca.texto.length === 1 ? 1 : 0)) % n;
      if (semAcento(rotuloDa(ops[i])).indexOf(busca.texto) === 0) { ativarOpcao(f, i); return; }
    }
  }
  /* devolve true quando tratou a tecla (o resto segue para a janela em volta: Esc, Tab) */
  function teclaNoSelect(gatilho, e) {
    if (inativo(gatilho)) return false;
    var f = flutuanteDe(gatilho);
    if (f && f.tipo !== 'select') f = null;
    if (!f) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].indexOf(e.key) >= 0) {
        e.preventDefault();
        abrirSelect(gatilho);
        var g = flutuanteDe(gatilho);
        if (!g) return true;
        var base = indiceEscolhido(g);
        ativarOpcao(g, e.key === 'Home' ? 0 : e.key === 'End' ? opcoesDe(g.lista).length - 1 : (base >= 0 ? base : 0));
        return true;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); saltarPorLetra(null, gatilho, e.key); return true; }
      return false;
    }
    var ultimo = opcoesDe(f.lista).length - 1;
    var b = f.ativo >= 0 ? f.ativo : indiceEscolhido(f);
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); if (!e.altKey) ativarOpcao(f, Math.min(ultimo, b + 1)); break;
      case 'ArrowUp':
        e.preventDefault();
        if (e.altKey) { if (f.ativo >= 0) escolherOpcao(f, f.ativo); else fecharSelect(f, false); break; }
        ativarOpcao(f, Math.max(0, b < 0 ? 0 : b - 1));
        break;
      case 'Home': e.preventDefault(); ativarOpcao(f, 0); break;
      case 'End': e.preventDefault(); ativarOpcao(f, ultimo); break;
      case 'PageDown': e.preventDefault(); ativarOpcao(f, Math.min(ultimo, Math.max(b, 0) + 8)); break;
      case 'PageUp': e.preventDefault(); ativarOpcao(f, Math.max(0, b - 8)); break;
      case 'Enter': case ' ':
        e.preventDefault();
        if (b >= 0) escolherOpcao(f, b); else fecharSelect(f, false);
        break;
      case 'Escape': e.preventDefault(); fecharSelect(f, false); break;
      case 'Tab':
        if (f.ativo >= 0 && f.lista.getAttribute('aria-multiselectable') !== 'true') escolherOpcao(f, f.ativo);
        else fecharSelect(f, false);
        return false;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); saltarPorLetra(f, gatilho, e.key); }
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // DatePicker: máscara DD/MM/AAAA e o calendário (montado aqui; não precisa de molde)
  // ---------------------------------------------------------------------------
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var SEMANA = [['D', 'domingo'], ['S', 'segunda-feira'], ['T', 'terça-feira'], ['Q', 'quarta-feira'], ['Q', 'quinta-feira'], ['S', 'sexta-feira'], ['S', 'sábado']];
  function d0(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function hoje() { return d0(new Date()); }
  function lerData(v) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(v || '').trim());
    if (!m) return null;
    var d = new Date(+m[3], +m[2] - 1, +m[1]);
    return d.getDate() === +m[1] && d.getMonth() === +m[2] - 1 ? d : null;
  }
  function escreverData(d) { return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear(); }
  function somarDias(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function somarMeses(d, n) {
    var alvo = new Date(d.getFullYear(), d.getMonth() + n, 1);
    var ultimo = new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0).getDate();
    return new Date(alvo.getFullYear(), alvo.getMonth(), Math.min(d.getDate(), ultimo));
  }
  function mesmoDia(a, b) { return !!a && !!b && a.getTime() === b.getTime(); }
  function mascara(v) {
    var n = v.replace(/\D/g, '').slice(0, 8);
    if (n.length > 4) return n.slice(0, 2) + '/' + n.slice(2, 4) + '/' + n.slice(4);
    if (n.length > 2) return n.slice(0, 2) + '/' + n.slice(2) + (n.length === 4 ? '/' : '');
    return n.length === 2 ? n + '/' : n;
  }
  function limitesDo(campo) {
    return { min: lerData(campo.getAttribute('data-gcg-min-date')), max: lerData(campo.getAttribute('data-gcg-max-date')) };
  }
  function semanasHtml(c) {
    var primeiro = new Date(c.mes.getFullYear(), c.mes.getMonth(), 1);
    var inicio = somarDias(primeiro, -primeiro.getDay());
    var lim = limitesDo(c.campo), h = hoje();
    var dentro = c.foco && c.foco.getMonth() === c.mes.getMonth() && c.foco.getFullYear() === c.mes.getFullYear() ? c.foco : primeiro;
    var html = '';
    for (var s = 0; s < 6; s++) {
      html += '<div class="gcg-calendar__week" role="row">';
      for (var k = 0; k < 7; k++) {
        var d = somarDias(inicio, s * 7 + k);
        var escolhido = mesmoDia(d, c.escolhido), ehHoje = mesmoDia(d, h);
        var fora = d.getMonth() !== c.mes.getMonth();
        var bloqueado = (lim.min && d < lim.min) || (lim.max && d > lim.max);
        html += '<div class="gcg-calendar__cell" role="gridcell" aria-selected="' + escolhido + '">' +
          '<button type="button" class="gcg-calendar-day" tabindex="' + (mesmoDia(d, dentro) ? '0' : '-1') + '" aria-label="' +
          SEMANA[d.getDay()][1] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear() + '"' +
          (ehHoje ? ' aria-current="date"' : '') + (bloqueado ? ' aria-disabled="true"' : '') +
          (escolhido ? ' data-gcg-selected="true"' : '') + (ehHoje ? ' data-gcg-today="true"' : '') +
          (fora ? ' data-gcg-outside="true"' : '') + (bloqueado ? ' data-gcg-disabled="true"' : '') +
          ' data-gcg-date="' + escreverData(d) + '"><span class="gcg-calendar-day__number">' + d.getDate() + '</span>' +
          (ehHoje ? '<span class="gcg-calendar-day__dot" aria-hidden="true"></span>' : '') +
          (bloqueado ? '<span class="gcg-calendar-day__strike" aria-hidden="true"></span>' : '') + '</button></div>';
      }
      html += '</div>';
    }
    return html;
  }
  function botaoIcone(nome, rotulo) {
    return '<button type="button" class="gcg-icon-button gcg-icon-button--ghost gcg-icon-button--neutral gcg-icon-button--sm" aria-label="' + rotulo + '" title="' + rotulo + '">' + icone(nome, 'gcg-icon-button__icon') + '</button>';
  }
  function calendarioHtml(c) {
    var lim = limitesDo(c.campo), h = hoje();
    var hojeFora = (lim.min && h < lim.min) || (lim.max && h > lim.max);
    return '<div class="gcg-calendar__header">' + botaoIcone('chevron_left', 'Mês anterior') +
      '<p class="gcg-calendar__month" id="' + c.id + '-mes" aria-live="polite">' + MESES[c.mes.getMonth()] + ' de ' + c.mes.getFullYear() + '</p>' +
      botaoIcone('chevron_right', 'Próximo mês') + '</div>' +
      '<div class="gcg-calendar__grid" role="grid" aria-labelledby="' + c.id + '-mes"><div class="gcg-calendar__weekdays" role="row">' +
      SEMANA.map(function (d) { return '<div class="gcg-calendar__weekday" role="columnheader" aria-label="' + d[1] + '"><abbr title="' + d[1] + '">' + d[0] + '</abbr></div>'; }).join('') +
      '</div>' + semanasHtml(c) + '</div>' +
      '<div class="gcg-calendar__footer">' +
      '<button type="button" class="gcg-button gcg-button--ghost gcg-button--primary gcg-button--sm' + (hojeFora ? ' gcg-button--disabled' : '') + '"' + (hojeFora ? ' disabled' : '') + ' data-gcg-calendar="today"><span class="gcg-button__label">Hoje</span></button>' +
      '<button type="button" class="gcg-button gcg-button--ghost gcg-button--neutral gcg-button--sm" data-gcg-calendar="clear"><span class="gcg-button__label">Limpar</span></button></div>';
  }
  function trocarMes(c, novo, moverFoco) {
    var lado = novo > c.mes ? 1 : novo < c.mes ? -1 : 0;
    c.mes = new Date(novo.getFullYear(), novo.getMonth(), 1);
    var cal = c.el.querySelector('.gcg-calendar');
    var grade = cal.querySelector('.gcg-calendar__grid');
    arr(grade.querySelectorAll('.gcg-calendar__week')).forEach(function (w) { w.parentNode.removeChild(w); });
    grade.insertAdjacentHTML('beforeend', semanasHtml(c));
    cal.querySelector('.gcg-calendar__month').textContent = MESES[c.mes.getMonth()] + ' de ' + c.mes.getFullYear();
    if (lado) {
      var op = { duration: duracao('--gcg-motion-base', 200), easing: CURVA.standard };
      arr(grade.querySelectorAll('.gcg-calendar__week')).forEach(function (w) { animar(w, [{ opacity: 0, transform: 'translateX(' + (lado * 8) + 'px)' }, { opacity: 1, transform: 'none' }], op); });
      animar(cal.querySelector('.gcg-calendar__month'), [{ opacity: 0 }, { opacity: 1 }], op);
    }
    if (moverFoco) focar(grade.querySelector('[tabindex="0"]'));
  }
  function abrirCalendario(campo, focarGrade) {
    var input = campo.querySelector('input');
    var botao = campo.querySelector('.gcg-datepicker__trigger');
    var ja = botao && flutuanteDe(botao);
    if (ja) { if (focarGrade) focar(ja.el.querySelector('.gcg-calendar__grid [tabindex="0"]')); return; }
    if (input && (input.disabled || input.readOnly)) return;
    var escolhido = lerData(input && input.value);
    var rotulo = texto(campo.querySelector('.gcg-field__label'));
    var c = { campo: campo, input: input, escolhido: escolhido, mes: escolhido || hoje(), foco: escolhido || hoje(), id: (input && input.id ? input.id : novoId('gcg-calendario')) + '-popup' };
    c.mes = new Date(c.mes.getFullYear(), c.mes.getMonth(), 1);
    var pop = document.createElement('div');
    pop.className = 'gcg-popover gcg-popover--bottom';
    pop.innerHTML = '<div id="' + c.id + '" class="gcg-calendar" role="dialog" aria-modal="false" aria-label="Calendário' + (rotulo ? ' de ' + rotulo : '') + '">' + calendarioHtml(c) + '</div>';
    c.el = pop;
    inserir(document.body, [pop]);
    ligarCalendario(c, botao, focarGrade);
  }
  function ligarCalendario(c, botao, focarGrade) {
    var pop = c.el;
    var f = registrar({ tipo: 'calendario', el: pop, nos: [pop], gatilho: botao || c.input, ancora: c.campo.querySelector('.gcg-field__control') || c.campo, movel: true, cal: c });
    f.posicionar = function () {
      var p = posicaoPopover(f.ancora, pop, false);
      pop.style.top = p.top + 'px'; pop.style.left = p.left + 'px';
      trocarLado(pop, 'gcg-popover', p.lado);
    };
    f.fechar = function (devolver) { fecharCalendario(f, devolver); };
    if (!c.adotado) f.posicionar();
    c.campo.setAttribute('data-gcg-open', 'true');
    if (botao) { botao.setAttribute('aria-expanded', 'true'); botao.setAttribute('aria-controls', c.id); }
    var cal = pop.querySelector('.gcg-calendar');
    cal.addEventListener('mousedown', function (e) { if (!e.target.closest('button')) e.preventDefault(); });
    cal.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      ativarCalendario(c);
      if (b.classList.contains('gcg-calendar-day')) {
        if (b.getAttribute('aria-disabled') === 'true') return;
        escolherDia(f, lerData(b.getAttribute('data-gcg-date')));
      } else if (b.getAttribute('aria-label') === 'Mês anterior') trocarMes(c, somarMeses(c.mes, -1));
      else if (b.getAttribute('aria-label') === 'Próximo mês') trocarMes(c, somarMeses(c.mes, 1));
      else if (b.getAttribute('data-gcg-calendar') === 'today' || texto(b) === 'Hoje') escolherDia(f, hoje());
      else if (b.getAttribute('data-gcg-calendar') === 'clear' || texto(b) === 'Limpar') escolherDia(f, null);
    });
    cal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.gcgTratado = true; fecharCalendario(f, true); return; }
      if (e.key === 'Tab') {
        var bs = arr(cal.querySelectorAll('button:not([disabled])')).filter(function (b) { return b.tabIndex >= 0; });
        var i = bs.indexOf(document.activeElement);
        e.preventDefault();
        focar(bs[e.shiftKey ? (i <= 0 ? bs.length - 1 : i - 1) : (i === bs.length - 1 ? 0 : i + 1)]);
        return;
      }
      var dia = e.target.closest('.gcg-calendar-day');
      if (!dia) return;
      ativarCalendario(c);
      var base = lerData(dia.getAttribute('data-gcg-date')), novo = null;
      switch (e.key) {
        case 'ArrowLeft': novo = somarDias(base, -1); break;
        case 'ArrowRight': novo = somarDias(base, 1); break;
        case 'ArrowUp': novo = somarDias(base, -7); break;
        case 'ArrowDown': novo = somarDias(base, 7); break;
        case 'Home': novo = somarDias(base, -base.getDay()); break;
        case 'End': novo = somarDias(base, 6 - base.getDay()); break;
        case 'PageUp': novo = somarMeses(base, e.shiftKey ? -12 : -1); break;
        case 'PageDown': novo = somarMeses(base, e.shiftKey ? 12 : 1); break;
        default: return;
      }
      e.preventDefault();
      c.foco = novo;
      var naGrade = cal.querySelector('[data-gcg-date="' + escreverData(novo) + '"]');
      if (naGrade && naGrade.getAttribute('data-gcg-outside') !== 'true') {
        arr(cal.querySelectorAll('.gcg-calendar-day')).forEach(function (b) { b.tabIndex = b === naGrade ? 0 : -1; });
        focar(naGrade);
      } else trocarMes(c, novo, true);
    });
    if (focarGrade) requestAnimationFrame(function () { focar(cal.querySelector('.gcg-calendar__grid [tabindex="0"]')); });
    if (!c.adotado) emitir(f.gatilho, 'gcg:open', { kind: 'calendar' });
  }
  /* o calendário que já veio aberto no HTML: na primeira interação, refeito com o mês que mostrava */
  function ativarCalendario(c) {
    if (!c.adotado) return;
    c.adotado = false;
    var cal = c.el.querySelector('.gcg-calendar');
    cal.innerHTML = calendarioHtml(c);
  }
  function escolherDia(f, d) {
    var c = f.cal;
    if (c.input) {
      c.input.value = d ? escreverData(d) : '';
      c.input.dispatchEvent(new Event('input', { bubbles: true }));
      c.input.dispatchEvent(new Event('change', { bubbles: true }));
      emitir(c.input, 'gcg:change', { value: c.input.value || null });
    }
    fecharCalendario(f, true);
  }
  function fecharCalendario(f, devolver) {
    retirar(f);
    var c = f.cal;
    c.campo.removeAttribute('data-gcg-open');
    limparDemo(c.campo);
    var b = c.campo.querySelector('.gcg-datepicker__trigger');
    if (b) { b.setAttribute('aria-expanded', 'false'); b.removeAttribute('aria-controls'); }
    if (devolver && c.input) focar(c.input);
    f.el.style.pointerEvents = 'none';
    animar(f.el, SAIDA, { duration: duracao('--gcg-motion-fast', 120), easing: CURVA.exit, fill: 'forwards' })
      .then(function () { if (f.el.parentNode) f.el.parentNode.removeChild(f.el); });
    emitir(f.gatilho, 'gcg:close', { kind: 'calendar' });
  }

  // ---------------------------------------------------------------------------
  // Tooltip (WCAG 1.4.13): abre no hover com atraso e no foco pelo teclado; fica aberta com o ponteiro
  // em cima; Esc fecha sem mexer no foco; o clique no alvo fecha
  // ---------------------------------------------------------------------------
  var dicas = [];
  function dicaDo(ancora) {
    if (ancora._gcgDica) return ancora._gcgDica;
    var alvo = ancora.querySelector('[aria-describedby]') || ancora;
    var ids = (alvo.getAttribute('aria-describedby') || '').split(/\s+/);
    var bolha = null;
    ids.forEach(function (id) { var b = id && document.getElementById(id); if (b && b.getAttribute('role') === 'tooltip' && b.classList.contains('gcg-tooltip-bubble--floating')) bolha = b; });
    if (!bolha) return null;
    var d = { ancora: ancora, bolha: bolha, aberta: !bolha.hidden, movel: false, hover: false, foco: false };
    ancora._gcgDica = d; bolha._gcgDica = d;
    dicas.push(d);
    return d;
  }
  function posicionarDica(d) {
    var lado = d.bolha.classList.contains('gcg-tooltip-bubble--bottom') ? 'bottom' : 'top';
    var p = posicaoFlutuante(d.ancora, d.bolha, { placement: d.lado || lado, align: 'center', gap: 4 });
    d.lado = d.lado || lado;
    d.bolha.style.top = p.top + 'px'; d.bolha.style.left = p.left + 'px';
    var w = d.bolha.offsetWidth;
    d.bolha.style.setProperty('--gcg-tooltip-arrow-x', Math.max(12, Math.min(p.setaX, w - 12)) + 'px');
    trocarLado(d.bolha, 'gcg-tooltip-bubble', p.lado);
  }
  function mostrarDica(d) {
    clearTimeout(d.timer);
    if (d.aberta && !d.saindo) return;
    d.saindo = false;
    d.bolha.classList.remove('gcg-tooltip-bubble--leaving');
    d.bolha.hidden = false;
    d.bolha.style.opacity = '';
    d.aberta = true; d.movel = true;
    posicionarDica(d);
  }
  function esconderDica(d) {
    clearTimeout(d.timer);
    if (!d.aberta) return;
    d.aberta = false; d.saindo = true;
    d.bolha.classList.add('gcg-tooltip-bubble--leaving');
    esperarAnimacao(d.bolha, duracao('--gcg-motion-instant', 80) + 80).then(function () {
      if (!d.saindo) return;
      d.saindo = false;
      d.bolha.hidden = true;
      d.bolha.classList.remove('gcg-tooltip-bubble--leaving');
    });
  }
  function agendarDica(d, abrir, ms) {
    clearTimeout(d.timer);
    d.timer = setTimeout(function () { if (abrir) mostrarDica(d); else if (!d.hover && !d.foco) esconderDica(d); }, ms);
  }

  // ---------------------------------------------------------------------------
  // Toast: canto inferior esquerdo; success e info somem em 8 s (pausa no hover e no foco)
  // ---------------------------------------------------------------------------
  var ICONE_DO_AVISO = { info: 'info', success: 'check', warning: 'warning', error: 'error' };
  var serieToast = 0;
  function regiaoViva(erro) {
    var sel = erro ? '.gcg-sr-only[role="alert"]' : '.gcg-sr-only[role="status"]:not(#gcg-emag-status)';
    var el = arr(document.querySelectorAll(sel)).filter(function (r) { return r.parentNode === document.body; })[0];
    if (!el) {
      el = document.createElement('div');
      el.className = 'gcg-sr-only';
      el.setAttribute('role', erro ? 'alert' : 'status');
      el.setAttribute('aria-live', erro ? 'assertive' : 'polite');
      inserir(document.body, [el]);
    }
    return el;
  }
  function toaster() {
    var t = document.querySelector('.gcg-toaster');
    if (!t) { t = document.createElement('div'); t.className = 'gcg-toaster'; inserir(document.body, [t]); }
    return t;
  }
  function contarToasts(t) { t.setAttribute('data-gcg-count', String(t.querySelectorAll('.gcg-toast:not(.gcg-toast--leaving)').length)); }
  function toast(o) {
    o = o || {};
    var tipo = ICONE_DO_AVISO[o.type] ? o.type : 'info';
    var ms = o.duration !== undefined ? o.duration : (tipo === 'success' || tipo === 'info' ? 8000 : null);
    var t = toaster();
    // a mesma mensagem de novo substitui a anterior e reinicia o tempo; até 3 na pilha
    arr(t.querySelectorAll('.gcg-toast')).forEach(function (x) { if (x._gcgMsg === o.message && x.classList.contains('gcg-toast--' + tipo)) fecharToast(x, true); });
    serieToast += 1;
    var el = document.createElement('div');
    el.className = 'gcg-toast gcg-toast--' + tipo + ' gcg-toast--live';
    el.setAttribute('data-gcg-toast-id', 'b' + serieToast);
    el._gcgMsg = o.message;
    el.innerHTML = icone(ICONE_DO_AVISO[tipo], 'gcg-toast__icon', 'md') + '<p class="gcg-toast__message"></p>' +
      '<span class="gcg-toast__close">' + botaoIcone('close', 'Fechar aviso') + '</span>' +
      (ms ? '<span class="gcg-toast__timer" aria-hidden="true" style="--gcg-toast-timer-duration: ' + ms + 'ms;"></span>' : '');
    el.querySelector('.gcg-toast__message').textContent = o.message || '';
    t.appendChild(el);
    var vivos = arr(t.querySelectorAll('.gcg-toast:not(.gcg-toast--leaving)'));
    if (vivos.length > 3) fecharToast(vivos[0]);
    contarToasts(t);
    // o texto vai para a região viva (o toast visual com o × fica fora dela)
    var reg = regiaoViva(tipo === 'error');
    reg.textContent = '';
    setTimeout(function () { var p = document.createElement('p'); p.textContent = o.message || ''; reg.appendChild(p); }, 50);
    if (ms) relogio(el, ms);
    return el;
  }
  function relogio(el, ms) {
    el._gcgResta = ms; el._gcgDesde = Date.now();
    el._gcgTimer = setTimeout(function () { fecharToast(el); }, ms);
  }
  function pausarToast(el, pausar) {
    if (!el._gcgResta) return;
    var barra = el.querySelector('.gcg-toast__timer');
    if (pausar && el._gcgTimer) {
      clearTimeout(el._gcgTimer); el._gcgTimer = null;
      el._gcgResta -= Date.now() - el._gcgDesde;
      if (barra) barra.setAttribute('data-gcg-paused', '');
    } else if (!pausar && !el._gcgTimer) {
      if (barra) barra.removeAttribute('data-gcg-paused');
      relogio(el, Math.max(0, el._gcgResta));
    }
  }
  function fecharToast(el, naHora) {
    if (!el || el.classList.contains('gcg-toast--leaving')) return;
    clearTimeout(el._gcgTimer);
    var t = el.parentNode;
    var tinhaFoco = el.contains(document.activeElement);
    el.classList.add('gcg-toast--leaving');
    if (t) contarToasts(t);
    (naHora ? Promise.resolve() : esperarAnimacao(el, duracao('--gcg-motion-fast', 120) + 80)).then(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      if (t) contarToasts(t);
    });
    if (tinhaFoco) focar(focoAntesDoToast && focoAntesDoToast.isConnected ? focoAntesDoToast : document.body);
  }
  var focoAntesDoToast = null;

  // ---------------------------------------------------------------------------
  // Tabela: o cabeçalho de grupo recolhe e abre (aria-expanded); o chevron gira um quarto de volta
  // ---------------------------------------------------------------------------
  function alternarGrupo(botao) {
    var aberto = botao.getAttribute('aria-expanded') === 'true';
    var linha = botao.closest('tr');
    var corpo = linha && linha.parentNode;
    if (!corpo) return;
    var chevron = botao.querySelector('.gcg-data-table__group-chevron');
    if (aberto) {
      var linhas = [], n = linha.nextElementSibling;
      while (n && !n.classList.contains('gcg-data-table__group-row')) { linhas.push(n); n = n.nextElementSibling; }
      desmontar(botao, linhas, true);
      botao.setAttribute('aria-expanded', 'false');
      if (chevron) { trocarIcone(chevron, 'chevron_right'); girar(chevron, 90); }
    } else {
      var nos = montar(botao);
      if (nos && nos[0] && nos[0].parentNode !== corpo) nos.forEach(function (x) { corpo.appendChild(x); });
      botao.setAttribute('aria-expanded', 'true');
      if (chevron) { trocarIcone(chevron, 'expand_more'); girar(chevron, -90); }
    }
    limparDemo(linha);
    emitir(botao, 'gcg:grouptoggle', { expanded: !aberto, empty: !aberto && !botao._gcgGuardado && !botao.getAttribute('data-gcg-popup') });
    // a seleção acompanha o grupo que abre ou recolhe (as caixas da faixa e do cabeçalho, e a contagem)
    var tabSel = tabelaDaSelecao(corpo);
    if (tabSel && tabSel.querySelector('.gcg-checkbox__input')) sincronizarSelecao(tabSel);
  }

  // ---------------------------------------------------------------------------
  // SectionCard recolhível (padrão Disclosure): a altura anima; o chevron gira
  // ---------------------------------------------------------------------------
  function alternarSecao(botao) {
    var secao = botao.closest('.gcg-section-card');
    if (!secao) return;
    var abrir = botao.getAttribute('aria-expanded') !== 'true';
    var conteudo = document.getElementById(botao.getAttribute('aria-controls')) || secao.querySelector('.gcg-section-card__content');
    var dobra = secao.querySelector('.gcg-section-card__collapse');
    botao.setAttribute('aria-expanded', String(abrir));
    secao.classList.toggle('gcg-section-card--expanded', abrir);
    secao.classList.toggle('gcg-section-card--collapsed', !abrir);
    if (conteudo) conteudo.hidden = !abrir;
    if (dobra && !semMovimento()) {
      dobra.setAttribute('data-gcg-animating', '');
      clearTimeout(dobra._gcgT);
      dobra._gcgT = setTimeout(function () { dobra.removeAttribute('data-gcg-animating'); }, duracao('--gcg-motion-slow', 280) + 150);
    }
    var chevron = secao.querySelector('.gcg-section-card__chevron');
    if (chevron) { trocarIcone(chevron, abrir ? 'expand_less' : 'expand_more'); girar(chevron, 180, '--gcg-motion-slow'); }
    limparDemo(secao.querySelector('.gcg-section-card__header'));
    emitir(botao, 'gcg:toggle', { expanded: abrir });
  }

  // ---------------------------------------------------------------------------
  // Barra de acessibilidade (eMAG): tamanho do texto, negrito, relevo, alto contraste, inverter cores
  // ---------------------------------------------------------------------------
  var ESCALAS = [100, 125, 150, 175, 200];
  var CHAVE_EMAG = 'gcg-a11y';
  function lerEmag() {
    var h = document.documentElement;
    return {
      scale: +(h.getAttribute('data-gcg-text-scale') || 100),
      bold: h.hasAttribute('data-gcg-bold'), relief: h.hasAttribute('data-gcg-relief'),
      contrast: h.getAttribute('data-gcg-contrast') === 'high', invert: h.hasAttribute('data-gcg-invert'),
    };
  }
  function aplicarEmag(s, gravar) {
    var h = document.documentElement;
    function flag(nome, sim, valor) { if (sim) h.setAttribute(nome, valor || ''); else h.removeAttribute(nome); }
    flag('data-gcg-text-scale', s.scale !== 100, String(s.scale));
    flag('data-gcg-bold', s.bold); flag('data-gcg-relief', s.relief);
    flag('data-gcg-contrast', s.contrast, 'high'); flag('data-gcg-invert', s.invert);
    arr(document.querySelectorAll('[data-gcg-emag]')).forEach(function (b) {
      var k = b.getAttribute('data-gcg-emag');
      if (k === 'decrease' || k === 'increase') {
        var limite = k === 'decrease' ? s.scale <= ESCALAS[0] : s.scale >= ESCALAS[ESCALAS.length - 1];
        if (limite) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      } else if (k !== 'reset') b.setAttribute('aria-pressed', String(!!s[k]));
    });
    if (gravar) { try { localStorage.setItem(CHAVE_EMAG, JSON.stringify(s)); } catch (e) { /* sem armazenamento: funciona e não lembra */ } }
  }
  function anunciar(msg) {
    var r = document.getElementById('gcg-emag-status');
    if (!r) { r = document.createElement('div'); r.id = 'gcg-emag-status'; r.className = 'gcg-sr-only'; r.setAttribute('role', 'status'); r.setAttribute('aria-live', 'polite'); inserir(document.body, [r]); }
    r.textContent = '';
    setTimeout(function () { r.textContent = msg; }, 50);
  }
  function acaoEmag(b) {
    if (inativo(b)) return;
    var s = lerEmag(), k = b.getAttribute('data-gcg-emag'), i = ESCALAS.indexOf(s.scale);
    if (k === 'decrease') s.scale = ESCALAS[Math.max(0, i - 1)];
    else if (k === 'increase') s.scale = ESCALAS[Math.min(ESCALAS.length - 1, i + 1)];
    else if (k === 'reset') s.scale = 100;
    else { s[k] = !s[k]; if (k === 'contrast' && s.contrast) s.invert = false; if (k === 'invert' && s.invert) s.contrast = false; }
    aplicarEmag(s, true);
    if (k === 'decrease' || k === 'increase' || k === 'reset') anunciar('Tamanho do texto: ' + s.scale + '%');
  }
  function teclaNaBarra(barra, e) {
    var bs = arr(barra.querySelectorAll('[data-gcg-emag]'));
    var i = bs.indexOf(document.activeElement), n = bs.length, prox = -1;
    if (e.key === 'ArrowRight') prox = (i + 1) % n;
    else if (e.key === 'ArrowLeft') prox = (i - 1 + n) % n;
    else if (e.key === 'Home') prox = 0;
    else if (e.key === 'End') prox = n - 1;
    if (prox < 0) return false;
    e.preventDefault();
    bs.forEach(function (b, k) { b.setAttribute('tabindex', k === prox ? '0' : '-1'); });
    focar(bs[prox]);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Janela dos signatários (Assinatura Eletrônica): + Adicionar signatário e a lixeira de cada linha
  // ---------------------------------------------------------------------------
  function renumerarSignatarios(lista) {
    var linhas = arr(lista.querySelectorAll('.gcg-tpl-signatarios__row'));
    linhas.forEach(function (li, i) {
      var b = li.querySelector('.gcg-tpl-signatarios__remove');
      if (!b) return;
      var nome = (b.getAttribute('aria-label') || '').split(', ').slice(1).join(', ');
      var rot = 'Remover o signatário ' + (i + 1) + (nome ? ', ' + nome : '');
      b.setAttribute('aria-label', rot); b.setAttribute('title', rot);
      b.disabled = linhas.length === 1;
    });
  }
  function adicionarSignatario(botao) {
    var caixa = botao.closest('.gcg-tpl-signatarios__content') || botao.closest('.gcg-tpl-signatarios');
    var lista = caixa && caixa.querySelector('.gcg-tpl-signatarios__rows');
    var modelo = lista && lista.querySelector('.gcg-tpl-signatarios__row:last-child');
    if (!modelo) return;
    var nova = modelo.cloneNode(true);
    var sufixo = novoId('s').replace(/^s/, '');
    var trocas = {};
    arr(nova.querySelectorAll('[id]')).forEach(function (el) { trocas[el.id] = el.id + sufixo; el.id += sufixo; });
    arr(nova.querySelectorAll('*')).forEach(function (el) {
      ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls'].forEach(function (a) {
        if (el.hasAttribute(a)) el.setAttribute(a, el.getAttribute(a).split(/\s+/).map(function (v) { return trocas[v] || v; }).join(' '));
      });
      el.removeAttribute('aria-invalid');
    });
    limparDemo(nova);
    arr(nova.querySelectorAll('input, textarea')).forEach(function (el) { el.value = ''; el.removeAttribute('value'); });
    arr(nova.querySelectorAll('.gcg-field__error, .gcg-field__clear')).forEach(function (el) { el.parentNode.removeChild(el); });
    arr(nova.querySelectorAll('.gcg-field[data-gcg-state]')).forEach(function (el) { el.removeAttribute('data-gcg-state'); });
    var b = nova.querySelector('.gcg-tpl-signatarios__remove');
    if (b) b.setAttribute('aria-label', 'Remover o signatário');
    lista.appendChild(nova);
    renumerarSignatarios(lista);
    animar(nova, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: duracao('--gcg-motion-base', 200), easing: CURVA.standard });
    focar(focaveis(nova)[0]);
  }
  function removerSignatario(botao) {
    var li = botao.closest('.gcg-tpl-signatarios__row');
    var lista = li && li.parentNode;
    if (!lista || lista.querySelectorAll('.gcg-tpl-signatarios__row').length < 2) return;
    var antes = li.previousElementSibling || li.nextElementSibling;
    lista.removeChild(li);
    renumerarSignatarios(lista);
    focar(focaveis(antes)[0]);
  }

  // ---------------------------------------------------------------------------
  // Eventos (delegação no document)
  // ---------------------------------------------------------------------------
  document.addEventListener('pointerdown', function (e) {
    // clique fora fecha menus, listas, calendários e a confirmação ancorada, sem roubar o foco
    flutuantes.slice().forEach(function (f) {
      if (f.el.contains(e.target) || (f.gatilho && f.gatilho.contains(e.target)) || (f.ancora && f.ancora.contains(e.target))) return;
      f.fechar(false);
    });
    // clique no alvo fecha a dica
    var a = e.target.closest && e.target.closest('.gcg-tooltip');
    if (a && a._gcgDica) { a._gcgDica.hover = false; esconderDica(a._gcgDica); }
  }, true);

  document.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    // Select: abre e fecha no mousedown do controle; o foco fica no campo
    var controle = e.target.closest('.gcg-field--select .gcg-field__control');
    if (controle && !e.target.closest('.gcg-field__clear')) {
      var g = controle.querySelector('[role="combobox"][aria-haspopup="listbox"]');
      if (!g || inativo(g)) return;
      e.preventDefault();
      focar(g);
      var f = flutuanteDe(g);
      if (f && f.tipo === 'select') fecharSelect(f, false); else abrirSelect(g);
      return;
    }
    // opção da lista: escolher sem tirar o foco do campo
    var fl = flutuanteDe(e.target);
    if (fl && fl.tipo === 'select' && fl.el.contains(e.target)) {
      // clicar na lista (até na barra de rolagem) não tira o foco do campo
      e.preventDefault();
      var op = e.target.closest('[role="option"]');
      if (op) escolherOpcao(fl, opcoesDe(fl.lista).indexOf(op));
    }
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;
    var b;
    // menu: o gatilho e os itens
    if ((b = t.closest('[role="menuitem"]'))) {
      var fm = flutuanteDe(b);
      if (fm && fm.tipo === 'menu') { e.preventDefault(); escolherItem(fm, b); }
      return;
    }
    if ((b = t.closest('[aria-haspopup="menu"]'))) {
      if (inativo(b)) return;
      var aberto = flutuanteDe(b);
      if (aberto && aberto.tipo === 'menu' && aberto.gatilho === b) fecharMenu(aberto, false);
      else abrirMenu(b, 'first');
      return;
    }
    // DatePicker: o ícone abre e fecha (e foca o dia); clicar no campo abre (o gesto do legado)
    if ((b = t.closest('.gcg-datepicker__trigger'))) {
      var campo = b.closest('.gcg-field');
      var fc = flutuanteDe(b);
      if (fc && fc.tipo === 'calendario') fecharCalendario(fc, true);
      else if (campo) { focar(campo.querySelector('input')); abrirCalendario(campo, true); }
      return;
    }
    if ((b = t.closest('.gcg-field--date input'))) { abrirCalendario(b.closest('.gcg-field'), false); return; }
    // dentro de uma janela: fechar (×, Cancelar, véu) e confirmar
    var j = janelaDe(t);
    if (j) {
      if (t.classList.contains('gcg-scrim')) { fecharJanela(j); return; }
      b = t.closest('button');
      if (b && !inativo(b) && j.dialogo.contains(b) && ehFechar(b)) { e.preventDefault(); fecharJanela(j); return; }
      if (b && !inativo(b) && b.closest('.gcg-modal__footer, .gcg-start-screen-button__actions') && b.classList.contains('gcg-button--solid')) {
        if (emitir(j.dialogo, 'gcg:confirm', { button: b, trigger: j.gatilho }, true)) fecharJanela(j);
        return;
      }
      if (b && !inativo(b) && b.closest('.gcg-filter-drawer__actions') && texto(b) === 'Limpar') { emitir(j.dialogo, 'gcg:clear', { trigger: j.gatilho }); return; }
    }
    // signatários
    if ((b = t.closest('.gcg-tpl-signatarios__add button'))) { adicionarSignatario(b); return; }
    if ((b = t.closest('.gcg-tpl-signatarios__remove'))) { if (!inativo(b)) removerSignatario(b); return; }
    // abas, grupo da tabela, seção recolhível, eMAG, toast, limpar o Select
    if ((b = t.closest('[role="tab"]'))) { selecionarAba(b); return; }
    if ((b = t.closest('.gcg-data-table__group-button'))) { alternarGrupo(b); return; }
    if ((b = t.closest('.gcg-section-card__toggle'))) { alternarSecao(b); return; }
    if ((b = t.closest('[data-gcg-emag]'))) { acaoEmag(b); return; }
    if ((b = t.closest('.gcg-toast__close button'))) { fecharToast(b.closest('.gcg-toast')); return; }
    if ((b = t.closest('.gcg-field--select .gcg-field__clear'))) {
      var gs = b.closest('.gcg-field').querySelector('[role="combobox"]');
      if (gs) { gs._gcgEscolha = []; escreverValor(gs, []); b.parentNode.removeChild(b); focar(gs); emitir(gs, 'gcg:change', { value: null, values: [] }); }
      return;
    }
    // janela: o gatilho (Filtros, Visualizar, a casinha, Salvar filtro…) ou qualquer elemento com data-gcg-popup
    if ((b = t.closest('[aria-haspopup="dialog"], [data-gcg-popup]'))) {
      if (inativo(b) || b.getAttribute('aria-haspopup') === 'listbox') return;
      var ja = janelas.filter(function (x) { return x.gatilho === b; })[0];
      if (ja) { if (ja.tipo === 'ancorada') fecharJanela(ja); return; }
      if (b.getAttribute('data-gcg-popup') || b._gcgGuardado) {
        if (b.tagName === 'A') e.preventDefault();
        abrirJanela(b);
      }
    }
  });

  document.addEventListener('submit', function (e) {
    var j = janelaDe(e.target);
    if (!j || e.target.hasAttribute('action')) return;
    e.preventDefault();
    if (emitir(e.target, 'gcg:submit', { trigger: j.gatilho }, true)) fecharJanela(j);
  });

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (!t.closest) return;
    // 1. a dica aberta: Esc fecha só ela, sem mexer no foco
    if (e.key === 'Escape') {
      var abertas = dicas.filter(function (d) { return d.aberta; });
      if (abertas.length) { abertas.forEach(function (d) { d.hover = false; d.foco = false; esconderDica(d); }); return; }
    }
    // 2. o toast com o foco: Esc fecha só ele
    var ts = t.closest('.gcg-toast');
    if (ts && e.key === 'Escape') { e.preventDefault(); fecharToast(ts); return; }
    // 3. camadas abertas por cima de tudo
    var sel = t.closest('[role="combobox"][aria-haspopup="listbox"]');
    if (sel && teclaNoSelect(sel, e)) return;
    var fm = flutuanteDe(t);
    if (fm && fm.tipo === 'menu' && fm.menu.contains(t)) { teclaNoMenu(fm, e); return; }
    if (fm && fm.tipo === 'calendario') {
      if (e.gcgTratado) return;
      if (e.key === 'Escape') { e.preventDefault(); fecharCalendario(fm, true); return; }
      if (t.tagName === 'INPUT' && e.key === 'ArrowDown') { e.preventDefault(); focar(fm.el.querySelector('.gcg-calendar__grid [tabindex="0"]')); return; }
    }
    var mg = t.closest('[aria-haspopup="menu"]');
    if (mg && !inativo(mg)) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirMenu(mg, 'first'); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); abrirMenu(mg, 'last'); return; }
      if (e.key === 'Escape' && fm && fm.tipo === 'menu' && fm.gatilho === mg) { e.preventDefault(); fecharMenu(fm, true); return; }
    }
    // o campo de data: ↓ (ou Alt + ↓) abre o calendário
    if (t.matches('.gcg-field--date input') && e.key === 'ArrowDown') { e.preventDefault(); abrirCalendario(t.closest('.gcg-field'), true); return; }
    // 4. abas e barra eMAG
    var tl = t.closest('[role="tablist"]');
    if (tl && teclaNasAbas(tl, e)) return;
    var barra = t.closest('.gcg-topbar__emag');
    if (barra && teclaNaBarra(barra, e)) return;
    // 5. a janela de cima: Esc fecha (o que estava aberto dentro já tratou o seu Esc acima); Tab fica preso
    var j = janelas[janelas.length - 1];
    if (!j) return;
    if (e.key === 'Escape') {
      if (e.defaultPrevented || e.gcgTratado) return;
      if (j.tipo === 'ancorada' && j.f) { e.preventDefault(); fecharJanela(j); return; }
      var fora = !j.raiz.contains(t) && t !== document.body;
      if (fora && !flutuanteDe(t)) return;
      e.preventDefault();
      fecharJanela(j);
    } else if (e.key === 'Tab' && (j.raiz.contains(t) || t === document.body)) prenderTab(j, e);
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t.matches || !t.matches('.gcg-field--date input')) return;
    var v = mascara(t.value);
    if (v !== t.value) t.value = v;
    // data completa leva o calendário aberto ao mês digitado
    var d = lerData(v), f = flutuanteDe(t.closest('.gcg-field').querySelector('.gcg-datepicker__trigger') || t);
    if (d && f && f.tipo === 'calendario') { f.cal.escolhido = d; f.cal.foco = d; ativarCalendario(f.cal); trocarMes(f.cal, d); }
  });

  // dica: hover com atraso (300 ms para abrir, 120 ms para fechar) e foco pelo teclado
  document.addEventListener('mouseover', function (e) {
    var a = e.target.closest && e.target.closest('.gcg-tooltip');
    var bolha = e.target.closest && e.target.closest('.gcg-tooltip-bubble');
    var d = a ? dicaDo(a) : bolha && bolha._gcgDica;
    if (d && !d.hover) { d.hover = true; agendarDica(d, true, d.aberta ? 0 : (bolha ? 0 : 300)); }
    var ts = e.target.closest && e.target.closest('.gcg-toast');
    if (ts) pausarToast(ts, true);
  });
  document.addEventListener('mouseout', function (e) {
    var de = e.target.closest && (e.target.closest('.gcg-tooltip') || e.target.closest('.gcg-tooltip-bubble'));
    var d = de && (de._gcgDica || dicaDo(de));
    var para = e.relatedTarget;
    if (d && !(para && (d.ancora.contains(para) || d.bolha.contains(para)))) { d.hover = false; agendarDica(d, false, 120); }
    var ts = e.target.closest && e.target.closest('.gcg-toast');
    if (ts && !(para && ts.contains(para)) && !ts.contains(document.activeElement)) pausarToast(ts, false);
  });
  document.addEventListener('focusin', function (e) {
    var t = e.target;
    var a = t.closest && t.closest('.gcg-tooltip');
    if (a) {
      var vis = true;
      try { vis = t.matches(':focus-visible'); } catch (x) { /* navegador antigo */ }
      var d = dicaDo(a);
      if (d && vis) { d.foco = true; mostrarDica(d); }
    }
    var ts = t.closest && t.closest('.gcg-toast');
    if (ts) pausarToast(ts, true);
    else focoAntesDoToast = t;
  });
  document.addEventListener('focusout', function (e) {
    var t = e.target;
    var a = t.closest && t.closest('.gcg-tooltip');
    if (a && a._gcgDica) { a._gcgDica.foco = false; if (!a._gcgDica.hover) esconderDica(a._gcgDica); }
    // o Select fecha quando o campo perde o foco
    if (t.matches && t.matches('[role="combobox"][aria-haspopup="listbox"]')) {
      var f = flutuanteDe(t);
      if (f && f.tipo === 'select') setTimeout(function () { if (document.activeElement !== t && flutuantes.indexOf(f) >= 0) fecharSelect(f, false); }, 0);
    }
    var ts = t.closest && t.closest('.gcg-toast');
    if (ts && !ts.contains(e.relatedTarget)) pausarToast(ts, false);
  });

  window.addEventListener('scroll', reposicionarTudo, true);
  window.addEventListener('resize', reposicionarTudo);

  // ---------------------------------------------------------------------------
  // Seleção na tabela (v1.6): marcar documentos para baixar vários de uma vez
  // ---------------------------------------------------------------------------
  /* Vale para a caixa da primeira célula da linha (a coluna de seleção). A caixa do cabeçalho marca as linhas da
     página; a da faixa, as do grupo (o <tbody>), mesmo recolhido; a da linha, só ela. A caixa desabilitada (sem
     permissão) fica de fora. A linha marcada ganha gcg-data-table__row--selected (a linha que já vinha destacada
     por ter o menu ou o preview aberto continua destacada ao desmarcar). As caixas do grupo e do cabeçalho ficam
     marcadas só quando todas as linhas habilitadas delas estão. Recolher o grupo guarda as linhas, com a marcação.
     Quando a seleção muda, dispara gcg:selectionchange na tabela (detail.count e detail.rows): quem constrói mostra
     ou esconde a barra de seleção (gcg-doc-selecao), soma o tamanho e monta o ZIP. Limpar seleção, na barra,
     desmarca tudo (também por GcgBehavior.clearSelection(tabela)). */
  function ehCaixaDeSelecao(c) {
    var cel = c.closest('td, th');
    return !!cel && !!cel.parentNode && cel === cel.parentNode.firstElementChild;
  }
  /* as caixas das linhas, também as das linhas guardadas de um grupo recolhido */
  function caixasDeLinha(raiz) {
    var lista = arr(raiz.querySelectorAll('.gcg-checkbox__input'));
    arr(raiz.querySelectorAll('.gcg-data-table__group-button')).forEach(function (b) {
      (b._gcgGuardado || []).forEach(function (p) {
        p.nos.forEach(function (n) { lista = lista.concat(arr(n.querySelectorAll('.gcg-checkbox__input'))); });
      });
    });
    return lista.filter(function (c) { return ehCaixaDeSelecao(c) && !c.closest('thead') && !c.closest('th[scope="rowgroup"]'); });
  }
  function habilitadas(lista) { return lista.filter(function (c) { return !c.disabled; }); }
  /* o grupo recolhido que ainda não abriu: as linhas saem do molde e ficam guardadas, prontas para marcar */
  function prepararGrupo(botao) {
    if (botao.getAttribute('aria-expanded') === 'true' || botao._gcgGuardado || !botao.getAttribute('data-gcg-popup')) return;
    var corpo = botao.closest('tbody');
    var nos = montar(botao);
    if (!nos || !corpo) return;
    if (nos[0] && nos[0].parentNode !== corpo) nos.forEach(function (x) { corpo.appendChild(x); });
    desmontar(botao, nos, true);
  }
  var LINHA_MARCADA = 'gcg-data-table__row--selected';
  function marcarLinha(c, v) {
    if (c.disabled) return;
    c.checked = v;
    var tr = c.closest('tr');
    if (!tr) return;
    if (v) {
      if (!tr.classList.contains(LINHA_MARCADA)) { tr.classList.add(LINHA_MARCADA); tr._gcgPelaCaixa = true; }
    } else if (tr._gcgPelaCaixa || c.defaultChecked) {
      tr.classList.remove(LINHA_MARCADA);
      tr._gcgPelaCaixa = false;
    }
  }
  function todasMarcadas(lista) { return lista.length > 0 && lista.every(function (c) { return c.checked; }); }
  function sincronizarSelecao(tabela) {
    arr(tabela.querySelectorAll('tbody')).forEach(function (tb) {
      var g = tb.querySelector('th[scope="rowgroup"] .gcg-checkbox__input');
      if (g) g.checked = todasMarcadas(habilitadas(caixasDeLinha(tb)));
    });
    var h = tabela.querySelector('thead .gcg-checkbox__input');
    if (h) {
      // um grupo recolhido que nunca abriu ainda não tem as linhas na página: o cabeçalho não fica marcado
      var pendente = arr(tabela.querySelectorAll('.gcg-data-table__group-button[data-gcg-popup]')).some(function (b) {
        return b.getAttribute('aria-expanded') !== 'true' && !b._gcgGuardado;
      });
      h.checked = !pendente && todasMarcadas(habilitadas(caixasDeLinha(tabela)));
    }
    var marcadas = caixasDeLinha(tabela).filter(function (c) { return c.checked; });
    var antes = tabela._gcgMarcadas || [];
    if (antes.length === marcadas.length && marcadas.every(function (c) { return antes.indexOf(c) >= 0; })) return;
    tabela._gcgMarcadas = marcadas;
    emitir(tabela, 'gcg:selectionchange', { count: marcadas.length, rows: marcadas.map(function (c) { return c.closest('tr'); }) });
  }
  function tabelaDaSelecao(el) {
    var t = el && el.closest('table');
    return t && t.closest('.gcg-data-table') ? t : null;
  }
  function limparSelecao(tabela) {
    if (!tabela) return;
    habilitadas(caixasDeLinha(tabela)).forEach(function (x) { marcarLinha(x, false); });
    sincronizarSelecao(tabela);
  }
  document.addEventListener('change', function (e) {
    var c = e.target;
    if (!c || !c.matches || !c.matches('.gcg-checkbox__input') || !ehCaixaDeSelecao(c)) return;
    var tabela = tabelaDaSelecao(c);
    if (!tabela) return;
    if (c.closest('thead')) {
      arr(tabela.querySelectorAll('.gcg-data-table__group-button')).forEach(prepararGrupo);
      habilitadas(caixasDeLinha(tabela)).forEach(function (x) { marcarLinha(x, c.checked); });
    } else if (c.closest('th[scope="rowgroup"]')) {
      var corpo = c.closest('tbody');
      var botao = corpo.querySelector('.gcg-data-table__group-button');
      if (botao) prepararGrupo(botao);
      habilitadas(caixasDeLinha(corpo)).forEach(function (x) { marcarLinha(x, c.checked); });
    } else marcarLinha(c, c.checked);
    sincronizarSelecao(tabela);
  });
  /* Limpar seleção, na barra de seleção da aba */
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('.gcg-doc-selecao__limpar');
    if (!b || b.disabled) return;
    var area = b.closest('.gcg-tpl-aba') || document;
    limparSelecao(area.querySelector('table.gcg-data-table, .gcg-data-table table'));
  });

  // ---------------------------------------------------------------------------
  // Ao carregar: adota o que já está aberto no HTML (sem mexer no desenho) e aplica o eMAG guardado
  // ---------------------------------------------------------------------------
  function adotar() {
    // menus abertos
    arr(document.querySelectorAll('[aria-haspopup="menu"][aria-expanded="true"]')).forEach(function (g) {
      var menu = document.getElementById(g.getAttribute('aria-controls') || '');
      if (!menu && g.classList.contains('gcg-topbar__menu-perfil')) menu = g.parentNode.querySelector('[role="menu"]');
      if (!menu) return;
      var sup = menu.closest('.gcg-action-menu__surface') || menu;
      var f = registrar({ tipo: 'menu', el: sup, nos: [sup], menu: menu, gatilho: g, ancora: g, movel: false });
      f.fechar = function (devolver) { fecharMenu(f, devolver); };
      f.posicionar = function () {};
    });
    // listas abertas
    arr(document.querySelectorAll('[role="combobox"][aria-haspopup="listbox"][aria-expanded="true"]')).forEach(function (g) {
      var lista = document.getElementById(g.getAttribute('aria-controls') || '');
      if (!lista) return;
      var pop = lista.closest('.gcg-popover') || lista;
      var f = registrar({ tipo: 'select', el: pop, nos: [pop], lista: lista, gatilho: g, ancora: controleDo(g), movel: false, ativo: -1 });
      f.fechar = function (devolver) { fecharSelect(f, devolver); };
      f.posicionar = function () {
        var p = posicaoPopover(f.ancora, pop, true);
        pop.style.top = p.top + 'px'; pop.style.left = p.left + 'px'; pop.style.width = p.width + 'px';
        trocarLado(pop, 'gcg-popover', p.lado);
      };
    });
    // calendário aberto
    arr(document.querySelectorAll('.gcg-datepicker__trigger[aria-expanded="true"]')).forEach(function (b) {
      var cal = document.getElementById(b.getAttribute('aria-controls') || '');
      var campo = b.closest('.gcg-field');
      if (!cal || !campo) return;
      var dias = arr(cal.querySelectorAll('.gcg-calendar-day')).filter(function (d) { return d.getAttribute('data-gcg-outside') !== 'true'; });
      if (!dias.length) return;
      // o intervalo permitido que o HTML mostra (dias riscados) vira data-gcg-min-date / data-gcg-max-date
      var livres = dias.filter(function (d) { return d.getAttribute('data-gcg-disabled') !== 'true'; });
      if (livres.length && livres.length < dias.length) {
        if (dias[0].getAttribute('data-gcg-disabled') === 'true' && !campo.hasAttribute('data-gcg-min-date')) campo.setAttribute('data-gcg-min-date', livres[0].getAttribute('data-gcg-date'));
        if (dias[dias.length - 1].getAttribute('data-gcg-disabled') === 'true' && !campo.hasAttribute('data-gcg-max-date')) campo.setAttribute('data-gcg-max-date', livres[livres.length - 1].getAttribute('data-gcg-date'));
      }
      var input = campo.querySelector('input');
      var mes = lerData(dias[0].getAttribute('data-gcg-date'));
      var c = { campo: campo, input: input, escolhido: lerData(input && input.value), mes: mes, foco: lerData(input && input.value) || mes, id: cal.id, el: cal.closest('.gcg-popover') || cal, adotado: true };
      ligarCalendario(c, b, false);
    });
    // janelas abertas (Modal, gaveta, preview, a confirmação da casinha)
    var gatDialogo = arr(document.querySelectorAll('[aria-haspopup="dialog"][aria-expanded="true"]')).filter(function (g) { return !g.classList.contains('gcg-datepicker__trigger'); });
    arr(document.querySelectorAll('.gcg-modal-layer, .gcg-filter-drawer--overlay, .gcg-tpl-preview, .gcg-popover')).forEach(function (raiz) {
      var d = dialogoDe(raiz);
      if (!d || raiz.querySelector('.gcg-calendar')) return;
      var g = null;
      if (raiz.classList.contains('gcg-popover')) g = gatDialogo.filter(function (x) { return x.classList.contains('gcg-is-open'); })[0] || null;
      else if (raiz.classList.contains('gcg-filter-drawer')) g = gatDialogo.filter(function (x) { return !x.classList.contains('gcg-start-screen-button'); })[0] || null;
      var j = adotarJanela(raiz, g, [raiz]);
      if (j.tipo === 'ancorada' && j.f) j.f.movel = false;
    });
    // dicas já à mostra (o frame mostra a dica)
    arr(document.querySelectorAll('.gcg-tooltip')).forEach(function (a) { var d = dicaDo(a); if (d && d.aberta) d.movel = false; });
    // eMAG guardado de outra página
    var guardado = null;
    try { guardado = JSON.parse(localStorage.getItem(CHAVE_EMAG) || 'null'); } catch (e) { /* sem armazenamento */ }
    if (guardado && typeof guardado === 'object') {
      var s = { scale: ESCALAS.indexOf(guardado.scale) >= 0 ? guardado.scale : 100, bold: guardado.bold === true, relief: guardado.relief === true, contrast: guardado.contrast === true, invert: guardado.invert === true && guardado.contrast !== true };
      aplicarEmag(s, false);
    }
  }

  window.GcgBehavior = {
    /** Abre a parte ligada ao gatilho (menu, lista, janela, gaveta, grupo). */
    open: function (gatilho) {
      if (!gatilho) return;
      if (gatilho.matches('[aria-haspopup="menu"]')) abrirMenu(gatilho, 'first');
      else if (gatilho.matches('[aria-haspopup="listbox"]')) abrirSelect(gatilho);
      else if (gatilho.matches('.gcg-data-table__group-button')) { if (gatilho.getAttribute('aria-expanded') !== 'true') alternarGrupo(gatilho); }
      else if (gatilho.closest('.gcg-field--date')) abrirCalendario(gatilho.closest('.gcg-field'), true);
      else abrirJanela(gatilho);
    },
    /** Fecha o que estiver aberto a partir do gatilho (ou a janela de cima, sem argumento). */
    close: function (gatilho) {
      var f = gatilho && flutuanteDe(gatilho);
      if (f) { f.fechar(true); return; }
      var j = gatilho ? janelas.filter(function (x) { return x.gatilho === gatilho || x.raiz.contains(gatilho); })[0] : janelas[janelas.length - 1];
      if (j) fecharJanela(j);
      else if (gatilho && gatilho.matches('.gcg-data-table__group-button') && gatilho.getAttribute('aria-expanded') === 'true') alternarGrupo(gatilho);
    },
    /** Aviso temporário: GcgBehavior.toast({ type: 'success' | 'info' | 'warning' | 'error', message: '…' }). */
    toast: toast,
    /** Escolhe uma aba (o mesmo que o clique). */
    selectTab: selecionarAba,
    /** Desmarca as caixas de seleção da tabela (o mesmo que Limpar seleção). */
    clearSelection: limparSelecao,
    reducedMotion: semMovimento,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', adotar);
  else adotar();
})();

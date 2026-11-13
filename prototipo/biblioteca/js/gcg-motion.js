/* gcg-motion.js — a camada básica de movimento do GCG. JavaScript puro, sem dependência.

   Ligue uma vez no layout, depois do CSS da biblioteca e do gcg-icons.js. O CSS já traz quase todo o
   movimento: a entrada da página, das linhas e dos cartões, a barra que enche, o esqueleto pulsando, o
   hover, o pressionar e o foco (gcg-motion.css e o CSS de cada componente). Este arquivo faz só o que o
   CSS não faz sozinho:

   1. A contagem do dado que chega. Os valores dos cartões e do medidor contam de 0 até o número final
      em --gcg-motion-data (800 ms), na curva --gcg-ease-standard, junto com a barra que enche. Roda
      sozinho quando a página abre. Para contar um valor que mudou depois, GcgMotion.countUp(el, de).
   2. A saída animada. GcgMotion.leave(el, 'gcg-filter-chip--leaving') põe a classe de saída, espera a
      animação acabar e devolve uma Promise. Depois dela, tire o elemento ou feche o estado. Serve à ficha
      de filtro, ao Modal (gcg-modal-layer--leaving), à gaveta e ao menu.
   3. A entrada de novo. GcgMotion.replay(el) roda outra vez as animações de entrada de um bloco cujo
      conteúdo foi trocado sem recarregar a página, como a lista filtrada ou a aba trocada.

   Com prefers-reduced-motion: reduce, nada anima: o valor final aparece na hora, e leave() resolve na
   hora. O texto final fica no DOM o tempo todo, e o leitor de tela lê só ele: a contagem é uma cópia
   por cima, com aria-hidden.

   Regra de negócio (filtrar, somar, ordenar) não está aqui: ela é do back-end, conforme o documento de
   requisitos de cada HU. */
(function () {
  'use strict';

  var reduz = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function semMovimento() { return !!(reduz && reduz.matches); }

  /* a duração de um token de movimento (ex.: --gcg-motion-data), em ms */
  function duracao(token, padrao) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    var n = parseFloat(v);
    if (!n) return padrao;
    return /ms$/.test(v) ? n : n * 1000;
  }

  /* cubic-bezier(0.2, 0, 0, 1), a --gcg-ease-standard: sai rápido e assenta devagar */
  function bezier(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; }
    function b(p1, p2) { return 3 * p2 - 6 * p1; }
    function c(p1) { return 3 * p1; }
    function curva(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function inclinacao(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) {
        var d = inclinacao(t, x1, x2);
        if (Math.abs(d) < 1e-6) break;
        t -= (curva(t, x1, x2) - x) / d;
      }
      return curva(Math.min(1, Math.max(0, t)), y1, y2);
    };
  }
  var easeStandard = bezier(0.2, 0, 0, 1);

  /* o primeiro número do texto, no formato do SISLOG: R$ 1.376.220,00 · 112,40% · 48 */
  var NUMERO = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/;
  function ler(texto) {
    var m = NUMERO.exec(texto);
    if (!m) return null;
    var partes = m[0].split(',');
    var valor = Number(partes[0].replace(/\./g, '') + (partes[1] ? '.' + partes[1] : ''));
    if (!isFinite(valor)) return null;
    return {
      antes: texto.slice(0, m.index),
      depois: texto.slice(m.index + m[0].length),
      valor: valor,
      casas: partes[1] ? partes[1].length : 0,
      milhar: partes[0].indexOf('.') !== -1,
    };
  }
  function escrever(p, n) {
    var partes = Math.abs(n).toFixed(p.casas).split('.');
    var inteiro = p.milhar ? partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') : partes[0];
    return p.antes + inteiro + (partes[1] ? ',' + partes[1] : '') + p.depois;
  }

  /* os valores que contam: os cartões, o medidor e o que levar data-gcg-count */
  var SELETOR = [
    '.gcg-value-tile__value',
    '.gcg-indicator-card__value',
    '.gcg-consumption-meter__value',
    '.gcg-saldo__valor',
    '.gcg-exec__valor',
    '[data-gcg-count]',
  ].join(', ');

  function countUp(el, de) {
    // aba escondida: o navegador para o requestAnimationFrame; o valor final já está escrito
    if (!el || semMovimento() || document.hidden || el.getAttribute('data-gcg-counting') === 'true') return;
    var final = el.textContent.trim();
    var alvo = ler(final);
    if (!alvo) return;
    var inicio = typeof de === 'number' ? de : 0;
    if (inicio === alvo.valor) return;
    var ms = duracao('--gcg-motion-data', 800);

    // o texto final some da vista mas fica no lugar (dá a largura e é o que o leitor de tela lê);
    // a cópia que conta fica por cima, sem ocupar espaço
    var conteudo = Array.prototype.slice.call(el.childNodes);
    var caixa = document.createElement('span');
    caixa.style.cssText = 'position:relative;display:inline-block;max-width:100%;vertical-align:baseline';
    var fim = document.createElement('span');
    fim.style.opacity = '0';
    conteudo.forEach(function (n) { fim.appendChild(n); });
    var vivo = document.createElement('span');
    vivo.setAttribute('aria-hidden', 'true');
    vivo.style.cssText = 'position:absolute;top:0;left:0;white-space:nowrap;pointer-events:none';
    vivo.textContent = escrever(alvo, inicio);
    caixa.appendChild(fim);
    caixa.appendChild(vivo);
    el.appendChild(caixa);
    el.setAttribute('data-gcg-counting', 'true');

    var t0 = null, acabou = false;
    function terminar() {
      if (acabou) return;
      acabou = true;
      // fim: o conteúdo original volta como estava
      Array.prototype.slice.call(fim.childNodes).forEach(function (n) { el.insertBefore(n, caixa); });
      if (caixa.parentNode === el) el.removeChild(caixa);
      el.removeAttribute('data-gcg-counting');
    }
    function passo(agora) {
      if (acabou) return;
      if (t0 === null) t0 = agora;
      var t = Math.min(1, (agora - t0) / ms);
      vivo.textContent = escrever(alvo, inicio + (alvo.valor - inicio) * easeStandard(t));
      if (t < 1 && !semMovimento() && !document.hidden) { requestAnimationFrame(passo); return; }
      terminar();
    }
    requestAnimationFrame(passo);
    // garantia: se o navegador segurar os quadros (aba que foi para o fundo), o valor final volta no tempo certo
    setTimeout(terminar, ms + 150);
  }

  function countAll(raiz) {
    Array.prototype.forEach.call((raiz || document).querySelectorAll(SELETOR), function (el) { countUp(el); });
  }

  function leave(el, classe) {
    return new Promise(function (resolve) {
      if (!el || semMovimento()) { resolve(); return; }
      var feito = false;
      function acabar() { if (feito) return; feito = true; el.removeEventListener('animationend', acabar); resolve(); }
      el.addEventListener('animationend', acabar);
      el.classList.add(classe);
      // garantia: se a classe não tiver animação, resolve depois da duração base
      setTimeout(acabar, duracao('--gcg-motion-slow', 280) + 50);
    });
  }

  function replay(el) {
    if (!el || semMovimento()) return;
    var alvos = [el].concat(Array.prototype.slice.call(el.querySelectorAll('*')));
    alvos.forEach(function (n) {
      if (getComputedStyle(n).animationName === 'none') return;
      n.style.animation = 'none';
      void n.offsetWidth; // força o recálculo para a animação recomeçar
      n.style.animation = '';
    });
    countAll(el);
  }

  window.GcgMotion = { countUp: countUp, countAll: countAll, leave: leave, replay: replay, reducedMotion: semMovimento };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { countAll(); });
  else countAll();
})();

// Resfriar BV — animações e efeitos
// Roda depois do main.js. Usa `graus` e `aplicarClima()` de lá para o
// termostato "esfriar" na abertura. Nada aqui muda conteúdo: só movimento.
(() => {
  const raiz = document.documentElement;
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ponteiroFino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

  // ---------------------------------------------------------------- barra de leitura
  const barra = document.createElement('div');
  barra.className = 'progresso'; barra.setAttribute('aria-hidden', 'true'); barra.innerHTML = '<i></i>';
  document.body.prepend(barra);

  // ---------------------------------------------------------------- abertura do topo
  const capa = q('#capa');
  qa('.capa__titulo .linha').forEach(l => { l.innerHTML = `<span class="linha__in">${l.innerHTML}</span>`; });
  const foto = q('.foto--capa');
  if (foto) { const b = document.createElement('i'); b.className = 'brisa'; b.setAttribute('aria-hidden', 'true'); foto.appendChild(b); }
  const dica = document.createElement('i'); dica.className = 'rolar-dica'; dica.setAttribute('aria-hidden', 'true'); capa.appendChild(dica);

  // os números da capa contam a partir do zero
  const provas = qa('.capa__provas b');
  const alvosProvas = provas.map(b => Number(b.textContent.replace(/\D/g, '')));
  function contarProvas() {
    if (reduz) return;
    const ini = performance.now(), dur = 1600;
    provas.forEach(b => b.textContent = '0');
    (function passo(agora) {
      const p = limitar((agora - ini - 1100) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
      provas.forEach((b, i) => b.textContent = Math.round(alvosProvas[i] * e).toLocaleString('pt-BR'));
      if (p < 1) requestAnimationFrame(passo);
    })(ini);
  }

  // o termostato começa quente e esfria até 23 °C (o ambiente "gela" na abertura)
  function esfriar() {
    if (reduz || typeof aplicarClima !== 'function') return;
    const termo = q('#termostato'), modo = q('#modo');
    graus = 28; aplicarClima(); modo.textContent = 'Resfriando…';
    setTimeout(() => {
      termo.classList.add('esfriando');
      const passo = () => {
        if (graus > 23) { graus--; aplicarClima(); modo.textContent = graus > 23 ? 'Resfriando…' : 'Conforto'; setTimeout(passo, 330); }
        else termo.classList.remove('esfriando');
      };
      passo();
    }, 1250);
  }

  function abrirCapa() {
    raiz.classList.add('capa-pronta');
    capa.classList.add('ar-ligado');
    contarProvas();
    esfriar();
    setTimeout(() => raiz.classList.add('capa-assentada'), 3600);
  }
  if (reduz) { raiz.classList.remove('js-anima'); }
  else {
    const img = q('.foto--capa img');
    const pronta = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      img && !img.complete ? new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); }) : Promise.resolve(),
    ]);
    // não deixa ninguém esperando: no máximo 1,2 s
    Promise.race([pronta, new Promise(r => setTimeout(r, 1200))]).then(() => requestAnimationFrame(abrirCapa));
  }

  // ---------------------------------------------------------------- fluxo de ar (canvas)
  // Linhas finas de ar frio saindo do aparelho da foto e correndo pela dobra.
  // A cor e a força acompanham o termostato: mais frio = azul e mais rápido.
  const tela = document.createElement('canvas');
  tela.className = 'capa__ar'; tela.setAttribute('aria-hidden', 'true');
  q('.capa__fundo').after(tela);
  const ctx = tela.getContext('2d');
  let L = 0, A = 0, dpr = 1, particulas = [], rodando = false, naTela = true, tempo = 0;
  const mouse = { x: -9999, y: -9999 };

  function medir() {
    const r = capa.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 1.6);
    L = r.width; A = r.height;
    tela.width = L * dpr; tela.height = A * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  // de onde o ar sai: a boca do aparelho na foto (PC); no celular, do alto à direita
  function origem() {
    const f = q('.foto--capa');
    const rc = capa.getBoundingClientRect();
    if (f && innerWidth > 900) {
      const r = f.getBoundingClientRect();
      return { x0: r.left - rc.left + r.width * .08, x1: r.left - rc.left + r.width * .62, y: r.top - rc.top + r.height * .27 };
    }
    return { x0: L * .25, x1: L * 1.05, y: A * .1 };
  }
  function nova(p, inicio) {
    const o = origem();
    const daBoca = Math.random() < .62;
    p.x = daBoca ? o.x0 + Math.random() * (o.x1 - o.x0) : L * (.3 + Math.random() * .8);
    p.y = daBoca ? o.y + Math.random() * 10 : -10 + Math.random() * A * (inicio ? 1 : .2);
    if (inicio && daBoca) { p.x -= Math.random() * L * .4; p.y += Math.random() * A * .6; }
    p.vx = 0; p.vy = 0; p.vida = 0; p.max = 160 + Math.random() * 220;
    p.l = .8 + Math.random() * 1.5; p.boca = daBoca;
    p.px = p.x; p.py = p.y;
    return p;
  }
  function criar() {
    const n = innerWidth > 900 ? 230 : 120;
    particulas = Array.from({ length: n }, () => nova({}, true));
  }
  // campo de vento: sopra para baixo e para a esquerda, com ondulação
  function vento(x, y, t, forca) {
    const a = 2.25 + Math.sin(x * .0042 + t * .6) * .55 + Math.cos(y * .0051 - t * .45) * .45;
    return [Math.cos(a) * forca, Math.sin(a) * forca * .9 + .25 * forca];
  }
  function quadro() {
    if (!rodando) return;
    tempo += 1 / 60;
    const clima = typeof graus === 'number' ? limitar((graus - 17) / 11, 0, 1) : .5;
    const forca = 1.1 + (1 - clima) * 1.5;
    // cor: gelo/azul quando frio, laranja suave quando quente
    const cor = [Math.round(191 + (255 - 191) * clima), Math.round(228 + (170 - 228) * clima), Math.round(247 + (110 - 247) * clima)];
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,.09)';
    ctx.fillRect(0, 0, L, A);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const p of particulas) {
      const [wx, wy] = vento(p.x, p.y, tempo, forca);
      p.vx += (wx - p.vx) * .08; p.vy += (wy - p.vy) * .08;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 140 * 140) { const f = (1 - Math.sqrt(d2) / 140) * 1.6; p.vx += dx / 140 * f; p.vy += dy / 140 * f; }
      p.px = p.x; p.py = p.y;
      p.x += p.vx; p.y += p.vy; p.vida++;
      const v = p.vida / p.max;
      const alfa = Math.sin(Math.PI * Math.min(1, v)) * (p.boca ? .5 : .18);
      ctx.strokeStyle = `rgba(${cor[0]},${cor[1]},${cor[2]},${alfa.toFixed(3)})`;
      ctx.lineWidth = p.l;
      ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      if (p.vida > p.max || p.x < -40 || p.y > A + 40 || p.x > L + 60) nova(p, false);
    }
    requestAnimationFrame(quadro);
  }
  function ligar() { if (!rodando && naTela && !document.hidden) { rodando = true; requestAnimationFrame(quadro); } }
  function desligar() { rodando = false; }
  if (!reduz) {
    medir(); criar();
    addEventListener('resize', () => { medir(); criar(); }, { passive: true });
    new IntersectionObserver(([e]) => { naTela = e.isIntersecting; naTela ? ligar() : desligar(); }).observe(capa);
    document.addEventListener('visibilitychange', () => document.hidden ? desligar() : ligar());
    capa.addEventListener('pointermove', e => { const r = capa.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
    capa.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    ligar();
  }

  // ---------------------------------------------------------------- luz que segue o ponteiro
  if (ponteiroFino && !reduz) {
    qa('.capa, .pmoc, .orcamento').forEach(sec => {
      const luz = document.createElement('i'); luz.className = 'luz-cursor'; luz.setAttribute('aria-hidden', 'true');
      sec.classList.add('tem-luz'); sec.prepend(luz);
      sec.addEventListener('pointermove', e => { const r = sec.getBoundingClientRect(); luz.style.setProperty('--mx', `${e.clientX - r.left}px`); luz.style.setProperty('--my', `${e.clientY - r.top}px`); }, { passive: true });
    });
  }

  // ---------------------------------------------------------------- títulos palavra por palavra
  qa('.titulo.revela').forEach(t => {
    const palavras = t.textContent.trim().split(/\s+/);
    t.setAttribute('aria-label', t.textContent.trim());
    t.innerHTML = palavras.map((p, i) => `<span class="pal" aria-hidden="true"><span style="--i:${i}">${p}</span></span>`).join(' ');
    t.classList.add('dividido');
  });

  // ---------------------------------------------------------------- fotos em cortina
  qa('.foto--servico, .sobre__foto').forEach(f => {
    f.classList.add('cortina');
    const veu = document.createElement('i'); veu.className = 'veu'; veu.setAttribute('aria-hidden', 'true'); f.appendChild(veu);
    veu.addEventListener('transitionend', () => { if (f.classList.contains('entrou')) setTimeout(() => f.classList.add('assentou'), 700); });
  });

  // ---------------------------------------------------------------- contagem extra (avaliações)
  const nota = q('.nota__valor');
  if (nota) nota.dataset.conta = nota.textContent.trim();
  // quem tiver data-conta brilha enquanto conta (o main.js faz a conta)
  new MutationObserver(ms => ms.forEach(m => {
    const el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
    if (!el || !el.dataset || !el.dataset.conta) return;
    el.classList.add('contando'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('contando'), 300);
  })).observe(document.body, { subtree: true, characterData: true, childList: true });
  // a nota do Google também conta ao aparecer
  if (nota && !reduz) {
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      const alvo = Number(nota.dataset.conta), ini = performance.now();
      (function passo(agora) { const p = limitar((agora - ini) / 1300, 0, 1); nota.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(passo); })(ini);
    }, { threshold: .5 }).observe(nota);
  }

  // ---------------------------------------------------------------- serviços: troca com varredura
  const fotoServ = q('.foto--servico');
  qa('#aba-ar, #aba-frio').forEach(b => b.addEventListener('click', () => {
    if (!fotoServ || reduz) return;
    fotoServ.classList.add('trocando');
    setTimeout(() => fotoServ.classList.remove('trocando'), 260);
  }, true));

  // ---------------------------------------------------------------- balão do WhatsApp digitando
  const balao = q('.balao');
  if (balao && !reduz) {
    const d = document.createElement('div'); d.className = 'digitando'; d.innerHTML = '<i></i><i></i><i></i>';
    q('.balao__topo', balao).after(d);
    balao.classList.add('digitar');
    new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect(); setTimeout(() => balao.classList.remove('digitar'), 1300); }, { threshold: .6 }).observe(balao);
  }

  // ---------------------------------------------------------------- PMOC: letras acendem
  qa('.pmoc__lista li').forEach(li => new IntersectionObserver(([e], o) => { if (e.isIntersecting) { li.classList.add('entrou'); o.disconnect(); } }, { threshold: .6 }).observe(li));

  // ---------------------------------------------------------------- cartões com inclinação 3D
  if (ponteiroFino && !reduz) {
    qa('.fala, .pmoc__lista li, .termostato').forEach(c => {
      c.classList.add('inclina');
      if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
      const brilho = document.createElement('i'); brilho.className = 'reflexo-card'; brilho.setAttribute('aria-hidden', 'true'); c.appendChild(brilho);
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ry', `${(x - .5) * 8}deg`); c.style.setProperty('--rx', `${(.5 - y) * 8}deg`);
        c.style.setProperty('--gx', `${x * 100}%`); c.style.setProperty('--gy', `${y * 100}%`);
        c.classList.add('sob-ponteiro');
      });
      c.addEventListener('pointerleave', () => c.classList.remove('sob-ponteiro'));
    });

    // botões magnéticos
    qa('.botao, .item__ir, .flutuante').forEach(b => {
      b.classList.add('magnetico');
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--bx', `${(e.clientX - r.left - r.width / 2) * .22}px`);
        b.style.setProperty('--by', `${(e.clientY - r.top - r.height / 2) * .3}px`);
        b.classList.add('puxado');
      });
      b.addEventListener('pointerleave', () => b.classList.remove('puxado'));
    });
  }

  // ---------------------------------------------------------------- rolagem: progresso, parallax, trilho do método
  const passos = q('.passos'), itensPasso = passos ? qa('li', passos) : [];
  const paralaxe = [
    ...qa('.pmoc__foto img').map(el => ({ el, alvo: el.closest('section'), v: .18 })),
    ...qa('.foto--servico img, .sobre__foto img').map(el => ({ el, alvo: el.parentElement, v: .08 })),
  ];
  const conteudoCapa = q('.capa__texto'), cenaCapa = q('.capa__cena');
  let pedido = 0;
  function aoRolar() {
    pedido = 0;
    const H = document.documentElement.scrollHeight - innerHeight;
    barra.style.setProperty('--lido', H > 0 ? (scrollY / H).toFixed(4) : 0);
    if (reduz) return;
    // a dobra se afasta ao rolar
    if (scrollY < innerHeight * 1.2) {
      const p = limitar(scrollY / innerHeight, 0, 1);
      conteudoCapa.style.transform = `translateY(${p * 70}px)`;
      conteudoCapa.style.opacity = (1 - p * 1.15).toFixed(3);
      if (innerWidth > 900) { cenaCapa.style.transform = `translateY(${p * 30}px)`; cenaCapa.style.opacity = (1 - p * .9).toFixed(3); }
      else { cenaCapa.style.transform = ''; cenaCapa.style.opacity = ''; }
      tela.style.opacity = raiz.classList.contains('capa-pronta') ? (1 - p).toFixed(3) : '';
    }
    paralaxe.forEach(({ el, alvo, v }) => {
      const r = alvo.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const meio = r.top + r.height / 2 - innerHeight / 2;
      el.style.setProperty('--px', `${(-meio * v).toFixed(1)}px`);
    });
    if (passos) {
      const r = passos.getBoundingClientRect();
      const enche = limitar((innerHeight * .78 - r.top) / (innerHeight * .5), 0, 1);
      passos.style.setProperty('--enche', enche.toFixed(3));
      itensPasso.forEach((li, i) => li.classList.toggle('chegou', enche >= i / Math.max(1, itensPasso.length - 1) - .02));
    }
  }
  addEventListener('scroll', () => { if (!pedido) pedido = requestAnimationFrame(aoRolar); }, { passive: true });
  addEventListener('resize', () => { if (!pedido) pedido = requestAnimationFrame(aoRolar); }, { passive: true });
  aoRolar();
})();

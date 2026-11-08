// Resfriar BV — comportamento da página
// O número abaixo é o de contato da EMPRESA, conforme a ficha mais recente passada pelo Gabriel (09/10/2026).
const WHATSAPP = '5511947432601';
const MENSAGEM_PADRAO = 'Olá! Encontrei a Resfriar BV pelo site e gostaria de um orçamento.';

const linkWhats = texto => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
const $ = (s, raiz = document) => raiz.querySelector(s);
const $$ = (s, raiz = document) => [...raiz.querySelectorAll(s)];
const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- links diretos de WhatsApp ----------
$$('[data-wa]').forEach(a => {
  a.href = linkWhats(a.dataset.wa || MENSAGEM_PADRAO);
  a.target = '_blank';
  a.rel = 'noopener';
});

// ---------- cabeçalho: encolhe ao rolar, some ao descer, volta ao subir ----------
const topo = $('#topo');
const flutuante = $('.flutuante');
const fotoCapa = $('.foto--capa img');
let ultimo = 0;
function aoRolar() {
  const y = scrollY;
  topo.classList.toggle('rolou', y > 30);
  topo.classList.toggle('some', y > 600 && y > ultimo && !$('#menu').classList.contains('aberto'));
  flutuante.classList.toggle('visivel', y > 500);
  if (fotoCapa && !semMovimento && y < innerHeight) fotoCapa.style.setProperty('--desliza', `${y * 0.06}px`);
  ultimo = y;
}
addEventListener('scroll', aoRolar, { passive: true });
aoRolar();

// ---------- menu no celular ----------
const abrirMenu = $('#abrirMenu');
const menu = $('#menu');
function alternarMenu(abrir) {
  menu.classList.toggle('aberto', abrir);
  abrirMenu.setAttribute('aria-expanded', abrir);
  document.body.style.overflow = abrir ? 'hidden' : '';
}
abrirMenu.addEventListener('click', () => alternarMenu(!menu.classList.contains('aberto')));
$$('a', menu).forEach(a => a.addEventListener('click', () => alternarMenu(false)));

// ---------- entrada dos elementos no scroll ----------
const observador = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('entrou');
    if (e.target.querySelector('[data-conta]')) contar(e.target.querySelector('[data-conta]'));
    observador.unobserve(e.target);
  });
}, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
$$('.revela').forEach(el => {
  // irmãos entram em sequência
  const irmaos = [...el.parentElement.children].filter(f => f.classList.contains('revela'));
  el.style.setProperty('--atraso', `${Math.min(irmaos.indexOf(el), 5) * 0.08}s`);
  observador.observe(el);
});

// ---------- números que contam ----------
function contar(el) {
  const alvo = Number(el.dataset.conta);
  if (semMovimento) return;
  const inicio = performance.now();
  const dura = 1400;
  (function passo(agora) {
    const p = Math.min((agora - inicio) / dura, 1);
    const suave = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(alvo * suave).toLocaleString('pt-BR');
    if (p < 1) requestAnimationFrame(passo);
  })(inicio);
}

// ---------- termostato da capa ----------
const MIN = 17, MAX = 28;
let graus = 23;
const visor = $('#graus'), modo = $('#modo');
function aplicarClima() {
  const clima = (graus - MIN) / (MAX - MIN);
  document.documentElement.style.setProperty('--clima', clima.toFixed(3));
  visor.textContent = graus;
  modo.textContent = graus <= 20 ? 'Bem gelado' : graus <= 24 ? 'Conforto' : 'Ameno';
}
$('#menos').addEventListener('click', () => { graus = Math.max(MIN, graus - 1); aplicarClima(); });
$('#mais').addEventListener('click', () => { graus = Math.min(MAX, graus + 1); aplicarClima(); });
aplicarClima();

// ---------- serviços: troca de frente ----------
const abas = { ar: $('#aba-ar'), frio: $('#aba-frio') };
const listas = { ar: $('#lista-ar'), frio: $('#lista-frio') };
const fotoServico = $('#fotoServico');
const legendas = { ar: 'Higienização de evaporadora', frio: 'Refrigeração comercial' };
function trocarFrente(qual) {
  Object.keys(abas).forEach(k => {
    const ativa = k === qual;
    abas[k].classList.toggle('ativa', ativa);
    abas[k].setAttribute('aria-selected', ativa);
    listas[k].hidden = !ativa;
    listas[k].classList.toggle('troca', ativa);
  });
  $$('.revela', listas[qual]).forEach(el => el.classList.add('entrou'));
  $('#legendaServico').textContent = legendas[qual];
  if (fotoServico) { fotoServico.style.display = ''; fotoServico.src = fotoServico.dataset[qual]; }
}
abas.ar.addEventListener('click', () => trocarFrente('ar'));
abas.frio.addEventListener('click', () => trocarFrente('frio'));

// ---------- formulário → mensagem de WhatsApp ----------
const ficha = $('#ficha');
const previa = $('#previa');
let quantidade = 1;
let detalhe = ""; // equipamento escolhido na lista de serviços (ex.: Câmara fria)

function montarMensagem() {
  const d = new FormData(ficha);
  const nome = (d.get('nome') || '').trim();
  const bairro = (d.get('bairro') || '').trim();
  const extra = (d.get('mensagem') || '').trim();
  const linhas = [
    `Olá! Meu nome é ${nome || '…'}.`,
    'Encontrei a Resfriar BV pelo site e gostaria de um orçamento.',
    '',
    `• Serviço: ${d.get('servico') || '…'}${detalhe ? ` (${detalhe})` : ''}`,
    `• Local: ${d.get('local')}`,
    `• Aparelhos: ${quantidade}`,
    `• Bairro: ${bairro || '…'}`,
  ];
  if (extra) linhas.push('', 'Informações adicionais:', extra);
  return linhas.join('\n');
}
const atualizarPrevia = () => { previa.textContent = montarMensagem(); };

$('#qMenos').addEventListener('click', () => { quantidade = Math.max(1, quantidade - 1); $('#qValor').textContent = quantidade; atualizarPrevia(); });
$('#qMais').addEventListener('click', () => { quantidade = Math.min(99, quantidade + 1); $('#qValor').textContent = quantidade; atualizarPrevia(); });
ficha.addEventListener('input', e => {
  e.target.closest('.campo')?.classList.remove('invalido');
  if (e.target.name === 'servico') { detalhe = ''; $('[data-erro="servico"]').classList.remove('mostra'); }
  atualizarPrevia();
});

ficha.addEventListener('submit', e => {
  e.preventDefault();
  let primeiroErro = null;
  ['nome', 'bairro'].forEach(campo => {
    const entrada = ficha.elements[campo];
    const vazio = !entrada.value.trim();
    entrada.closest('.campo').classList.toggle('invalido', vazio);
    if (vazio && !primeiroErro) primeiroErro = entrada;
  });
  const semServico = !new FormData(ficha).get('servico');
  $('[data-erro="servico"]').classList.toggle('mostra', semServico);
  if (semServico) primeiroErro = $('#opServico input');
  if (primeiroErro) { primeiroErro.focus(); return; }
  open(linkWhats(montarMensagem()), '_blank', 'noopener');
});

// botões de serviço já deixam o formulário marcado
$$('[data-servico]').forEach(a => a.addEventListener('click', () => {
  const desejado = a.dataset.servico;
  const opcao = $$('input[name="servico"]', ficha).find(i => desejado.startsWith(i.value) || i.value.startsWith(desejado.split(' — ')[0]))
    || $$('input[name="servico"]', ficha).find(i => /Refrigeração/.test(i.value) && /fria|Balcão|Refrigeração/.test(desejado));
  detalhe = opcao && desejado !== opcao.value && !/—/.test(desejado) ? desejado : '';
  if (opcao) { opcao.checked = true; $('[data-erro="servico"]').classList.remove('mostra'); }
  if (/PMOC/.test(desejado)) ficha.elements.local.value = 'Empresa';
  else if (/Refrigeração|fria|Balcão/.test(desejado)) ficha.elements.local.value = 'Comércio';
  atualizarPrevia();
}));

atualizarPrevia();
$('#ano').textContent = new Date().getFullYear();

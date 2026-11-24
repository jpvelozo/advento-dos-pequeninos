const amostras = {
  '01': { dia: '1', titulo: 'Uma promessa de amor', referencia: 'Isaías 9,5', resumo: 'O primeiro cartão apresenta a promessa de um Salvador. A missão convida a família a conversar sobre a Coroa do Advento e desenhar a Estrela de Belém.' },
  '07': { dia: '7', titulo: 'Uma visita cheia de alegria', referencia: 'Lucas 1,39-45', resumo: 'Maria visita Isabel. A missão convida a família a ligar ou enviar uma mensagem de carinho a alguém que ficaria feliz em ouvir sua voz.' },
  '25': { dia: '25', titulo: 'Nasceu o nosso Salvador!', referencia: 'Lucas 2,7-14', resumo: 'O último cartão apresenta o nascimento de Jesus e o anúncio aos pastores. A missão reúne a família para uma canção, a Missa de Natal e um abraço.' },
};
const abrir = document.getElementById('abrir-amostra');
const imagem = document.getElementById('amostra-img');
const zoom = document.getElementById('zoom');
const compra = document.getElementById('compra-dialog');
let ativa = '01';

const opcoesCartoes = document.querySelectorAll('[data-ver-cartoes]');
const fotosCartoes = document.querySelectorAll('[data-foto-cartoes]');
for (const opcao of opcoesCartoes) {
  opcao.addEventListener('click', () => {
    const escolhida = opcao.dataset.verCartoes;
    for (const foto of fotosCartoes) foto.hidden = foto.dataset.fotoCartoes !== escolhida;
    for (const botao of opcoesCartoes) botao.setAttribute('aria-pressed', String(botao === opcao));
  });
}

for (const botao of document.querySelectorAll('[data-amostra]')) {
  botao.addEventListener('click', () => {
    ativa = botao.dataset.amostra;
    const { dia, titulo, referencia, resumo } = amostras[ativa];
    imagem.src = 'assets/dia-' + ativa + '.webp';
    imagem.alt = 'Cartão completo do Dia ' + dia + ': ' + titulo;
    abrir.setAttribute('aria-label', 'Ampliar amostra do Dia ' + dia);
    document.getElementById('amostra-ref').textContent = 'Dia ' + dia + ' · ' + referencia;
    document.getElementById('amostra-titulo').textContent = titulo;
    document.getElementById('amostra-resumo').textContent = resumo;
    for (const opcao of document.querySelectorAll('[data-amostra]')) opcao.setAttribute('aria-pressed', String(opcao === botao));
  });
}

abrir.addEventListener('click', () => {
  const { dia, titulo } = amostras[ativa];
  document.getElementById('zoom-titulo').textContent = 'Dia ' + dia + ' · ' + titulo;
  const ampliada = document.getElementById('zoom-img');
  ampliada.src = imagem.src;
  ampliada.alt = imagem.alt;
  zoom.showModal();
});

for (const botao of document.querySelectorAll('[data-comprar]')) {
  botao.addEventListener('click', () => {
    const plano = botao.dataset.comprar;
    const url = window.checkoutAdvento?.[plano];
    if (url && /^https:\/\//i.test(url)) {
      window.location.assign(url);
      return;
    }
    document.getElementById('compra-titulo').textContent = plano === 'basico' ? 'Plano Básico · R$ 17,90' : 'Plano Completo · R$ 27,90';
    compra.showModal();
  });
}

for (const modal of document.querySelectorAll('dialog')) {
  modal.querySelector('[data-fechar]').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (evento) => {
    if (evento.target !== modal) return;
    const caixa = modal.getBoundingClientRect();
    if (evento.clientX < caixa.left || evento.clientX > caixa.right || evento.clientY < caixa.top || evento.clientY > caixa.bottom) modal.close();
  });
}

// Urgência baseada na data: contagem até o Dia 1 e, em dezembro, "Hoje é o Dia X"
(function () {
  const aviso = document.getElementById('aviso');
  const noPlano = document.getElementById('urgencia-planos');
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth(); // 0 = jan
  const dia = agora.getDate();
  let texto = '';
  let textoPlano = '';

  if (mes === 10) { // novembro: conta até 1º de dezembro
    const inicio = new Date(ano, 11, 1);
    const atualizar = () => {
      const ms = inicio - new Date();
      if (ms <= 0) return;
      const d = Math.floor(ms / 864e5);
      const h = Math.floor(ms / 36e5) % 24;
      const m = Math.floor(ms / 6e4) % 60;
      const tempo = (d > 0 ? d + (d === 1 ? ' dia ' : ' dias ') : '') + h + 'h ' + String(m).padStart(2, '0') + 'min';
      aviso.textContent = 'Faltam ' + tempo + ' para o Dia 1 do Advento · Garanta hoje e imprima com calma';
    };
    atualizar();
    setInterval(atualizar, 30000);
    textoPlano = 'A jornada começa em 1º de dezembro. Comprando hoje, você recebe na hora e deixa tudo impresso antes do Dia 1.';
  } else if (mes === 11 && dia <= 24) {
    texto = 'Hoje é o Dia ' + dia + ' do Advento · Compre agora e comece ainda hoje com seu filho';
    textoPlano = 'Hoje é o Dia ' + dia + '. Faltam ' + (25 - dia) + (25 - dia === 1 ? ' dia' : ' dias') + ' para o Natal: o acesso é imediato e vocês podem começar hoje à noite.';
  } else if (mes === 11 && dia === 25) {
    texto = 'Feliz Natal! Garanta o material e use o calendário litúrgico durante todo o ano';
  }
  if (texto) aviso.textContent = texto;
  if (textoPlano && noPlano) { noPlano.textContent = textoPlano; noPlano.hidden = false; }
})();

// Botão fixo no celular: some quando os planos estão na tela
(function () {
  const cta = document.getElementById('cta-fixo');
  const alvos = [document.getElementById('planos'), document.querySelector('.hero')].filter(Boolean);
  if (!cta || !('IntersectionObserver' in window)) return;
  const visiveis = new Set();
  const obs = new IntersectionObserver((entradas) => {
    for (const e of entradas) e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target);
    cta.classList.toggle('escondido', visiveis.size > 0);
  }, { threshold: 0.15 });
  alvos.forEach((a) => obs.observe(a));
})();

// Evento de início de checkout para o Pixel / GA4 (só funciona se estiverem instalados)
for (const botao of document.querySelectorAll('[data-comprar]')) {
  botao.addEventListener('click', () => {
    const valor = botao.dataset.comprar === 'basico' ? 17.9 : 27.9;
    if (window.fbq) window.fbq('track', 'InitiateCheckout', { value: valor, currency: 'BRL' });
    if (window.gtag) window.gtag('event', 'begin_checkout', { value: valor, currency: 'BRL' });
  }, { capture: true });
}

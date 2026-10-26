/* ==========================================================================
   Demonstrações animadas dos exercícios.

   Cada exercício é um bonequinho de palitos desenhado em SVG que se move
   entre duas posições (começo e fim do movimento), em loop. Como é desenhado
   por código, não pesa nada, funciona sem internet e fica nítido em qualquer
   tela. As poses e os textos de cada exercício ficam em `demos-dados.js`.

   Convenções das poses (todos os ângulos em graus):
     • `hip`   posição do quadril [x, y] — é a raiz do boneco.
     • `t`     inclinação do tronco: 0 = em pé, positivo = inclina para a
               direita da tela, negativo = para a esquerda.
     • `h`     inclinação extra da cabeça (opcional).
     • braços e pernas: ou o ponto onde a ponta chega (`to: [x, y]` — o
       cotovelo/joelho se ajusta sozinho), ou os ângulos de cada osso
       (`u`/`f` no braço, `th`/`sh` na perna), medidos a partir do "para
       baixo": 0 = para baixo, 90 = para a direita, 180 = para cima.
       `{ on: 'head', d: [dx, dy] }` gruda a ponta numa parte do corpo.
     • `arm2` / `leg2`: pose própria do braço/perna do lado de trás.
     • `fa`    ângulo do pé (0 = apoiado no chão, positivo = ponta para baixo).
   ========================================================================== */

const Demos = (function () {

  const R = Math.PI / 180;
  const CHAO = 150;
  const MEDIDAS = { torso: 40, braco: 22, antebraco: 21, coxa: 34, canela: 33, pescoco: 13, pe: 12 };
  const DURACAO_MS = 3600;

  const biblioteca = {};

  function registrar(nome, definicao) {
    biblioteca[nome] = definicao;
  }

  function tem(nome) {
    return !!biblioteca[nome];
  }

  function definicao(nome) {
    return biblioteca[nome] || null;
  }

  // ---------- Contas de geometria ----------

  const dirTronco = (t) => [Math.sin(t * R), -Math.cos(t * R)];
  const dirOsso = (a) => [Math.sin(a * R), Math.cos(a * R)];
  const soma = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];

  /** Mistura duas poses (números, listas e objetos de mesmo formato). */
  function misturar(a, b, k) {
    if (typeof a === 'number') return a + (b - a) * k;
    if (Array.isArray(a)) return a.map((v, i) => misturar(v, b[i], k));
    if (a && typeof a === 'object') {
      const saida = {};
      for (const chave of Object.keys(a)) {
        saida[chave] = chave in b ? misturar(a[chave], b[chave], k) : a[chave];
      }
      return saida;
    }
    return a;
  }

  /** Dois ossos ligados (braço ou perna): dado o ponto de partida e o ponto
      onde a ponta deve chegar, acha onde fica o cotovelo/joelho. */
  function doisOssos(origem, alvo, l1, l2, lado) {
    const dx = alvo[0] - origem[0];
    const dy = alvo[1] - origem[1];
    const dist = Math.hypot(dx, dy) || 0.001;
    const alcance = Math.min(l1 + l2 - 0.01, Math.max(Math.abs(l1 - l2) + 0.01, dist));
    const base = Math.atan2(dy, dx);
    const cos = (l1 * l1 + alcance * alcance - l2 * l2) / (2 * l1 * alcance);
    const abertura = Math.acos(Math.max(-1, Math.min(1, cos)));
    const angulo = base + lado * abertura;
    const meio = [origem[0] + Math.cos(angulo) * l1, origem[1] + Math.sin(angulo) * l1];
    const fim = [origem[0] + Math.cos(base) * alcance, origem[1] + Math.sin(base) * alcance];
    return { meio, fim };
  }

  function membro(origem, spec, l1, l2, lado, partes) {
    const osso1 = spec.u !== undefined ? spec.u : spec.th;
    if (osso1 !== undefined) {
      const osso2 = spec.f !== undefined ? spec.f : spec.sh;
      const meio = soma(origem, dirOsso(osso1), l1);
      return { meio, fim: soma(meio, dirOsso(osso2), l2) };
    }
    const alvo = spec.on ? soma(partes[spec.on], spec.d || [0, 0]) : spec.to;
    return doisOssos(origem, alvo, l1, l2, lado);
  }

  // ---------- Montagem do boneco (vista lateral) ----------

  function juntas(def, p) {
    const face = def.face || 1;
    const quadril = p.hip;
    const ombro = soma(quadril, dirTronco(p.t), MEDIDAS.torso);
    const cabeca = soma(ombro, dirTronco(p.t + (p.h || 0)), MEDIDAS.pescoco);
    const partes = { hip: quadril, shoulder: ombro, head: cabeca };

    const ladoBraco = def.cotovelo === undefined ? 1 : def.cotovelo;
    const ladoPerna = def.joelho === undefined ? -face : def.joelho;

    const lado = (braco, perna) => {
      const b = membro(ombro, braco, MEDIDAS.braco, MEDIDAS.antebraco, ladoBraco, partes);
      const l = membro(quadril, perna, MEDIDAS.coxa, MEDIDAS.canela, ladoPerna, partes);
      return { cotovelo: b.meio, mao: b.fim, joelho: l.meio, tornozelo: l.fim };
    };

    return {
      face, quadril, ombro, cabeca,
      perto: lado(p.arm, p.leg),
      longe: lado(p.arm2 || p.arm, p.leg2 || p.leg),
      fa: p.fa || 0
    };
  }

  // ---------- Desenho ----------

  const f = (n) => Math.round(n * 10) / 10;
  const pt = (p) => f(p[0]) + ',' + f(p[1]);

  function linha(a, b, largura, cor, extra = '') {
    return `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" ` +
      `stroke="${cor}" stroke-width="${largura}" stroke-linecap="round" ${extra}/>`;
  }

  function pe(J, lado, cor) {
    const rad = J.fa * R;
    const t = [J.face * Math.cos(rad), Math.sin(rad)];
    const n = [-J.face * Math.sin(rad), Math.cos(rad)];
    const calcanhar = soma(soma(lado.tornozelo, n, 5), t, -3);
    const ponta = soma(soma(lado.tornozelo, n, 5), t, MEDIDAS.pe);
    return linha(calcanhar, ponta, 5, cor);
  }

  function pontoDoAdereco(J, em) {
    const mapa = {
      mao: J.perto.mao, pe: J.perto.tornozelo, joelho: J.perto.joelho,
      quadril: J.quadril, ombro: J.ombro, cabeca: J.cabeca
    };
    return mapa[em] || J.perto.mao;
  }

  /** Equipamentos presos ao corpo: anilhas, halteres, cabos, almofadas. */
  function aderecos(def, J) {
    const AZUL = 'var(--azul)';
    return (def.aderecos || []).map((a) => {
      const base = pontoDoAdereco(J, a.em);
      const ponto = [base[0] + (a.dx || 0), base[1] + (a.dy || 0)];

      if (a.tipo === 'disco') {
        return `<circle cx="${f(ponto[0])}" cy="${f(ponto[1])}" r="${a.r || 7}" fill="${AZUL}" fill-opacity=".22" ` +
          `stroke="${AZUL}" stroke-width="3"/>` +
          `<circle cx="${f(ponto[0])}" cy="${f(ponto[1])}" r="1.8" fill="${AZUL}"/>`;
      }
      if (a.tipo === 'cabo') {
        return linha(ponto, a.ancora, 1.6, AZUL, 'stroke-dasharray="none" opacity=".85"') +
          `<circle cx="${a.ancora[0]}" cy="${a.ancora[1]}" r="4" fill="var(--cartao-2)" stroke="${AZUL}" stroke-width="2"/>`;
      }
      if (a.tipo === 'linha') {
        const dir = dirOsso(a.ang);
        const meio = a.comp / 2;
        return linha(soma(ponto, dir, -meio), soma(ponto, dir, meio), a.larg || 6, AZUL, 'opacity=".9"');
      }
      if (a.tipo === 'almofada') {
        // Perpendicular à canela, no tornozelo.
        const v = [J.perto.tornozelo[0] - J.perto.joelho[0], J.perto.tornozelo[1] - J.perto.joelho[1]];
        const comp = Math.hypot(v[0], v[1]) || 1;
        const perp = [-v[1] / comp, v[0] / comp];
        return linha(soma(ponto, perp, -8), soma(ponto, perp, 8), 6, AZUL, 'opacity=".9"');
      }
      return '';
    }).join('');
  }

  function desenharLateral(def, p) {
    const J = juntas(def, p);
    const CORPO = 'var(--texto)';
    const ATRAS = 'var(--texto-3)';
    const cenarioFundo = def.cenario ? def.cenario(J) : '';
    const cenarioFrente = def.cenarioFrente ? def.cenarioFrente(J) : '';
    const sem = def.sem || [];
    const deslocamento = [-J.face * 3, 0];

    const trasLado = () => {
      const l = J.longe;
      const s = (ponto) => soma(ponto, deslocamento);
      let out = '';
      if (!sem.includes('perna')) {
        out += linha(J.quadril, s(l.joelho), 6, ATRAS) + linha(s(l.joelho), s(l.tornozelo), 6, ATRAS);
        out += pe(J, { tornozelo: s(l.tornozelo) }, ATRAS);
      }
      if (!sem.includes('braco')) {
        out += linha(J.ombro, s(l.cotovelo), 6, ATRAS) + linha(s(l.cotovelo), s(l.mao), 6, ATRAS);
      }
      return out;
    };

    const pertoLado = () => {
      const l = J.perto;
      let out = '';
      out += linha(J.quadril, l.joelho, 7, CORPO) + linha(l.joelho, l.tornozelo, 7, CORPO) + pe(J, l, CORPO);
      out += linha(J.quadril, J.ombro, 9, CORPO);
      out += `<circle cx="${f(J.cabeca[0])}" cy="${f(J.cabeca[1])}" r="8" fill="var(--cartao-2)" stroke="${CORPO}" stroke-width="3.5"/>`;
      out += linha(J.ombro, l.cotovelo, 6, CORPO) + linha(l.cotovelo, l.mao, 6, CORPO);
      return out;
    };

    return cenarioFundo + trasLado() + pertoLado() + aderecos(def, J) + cenarioFrente;
  }

  // ---------- Vista de frente e de cima (poucos exercícios precisam) ----------

  const braco2 = (origem, spec, sinal) => {
    const meio = soma(origem, dirOsso(spec.u * sinal), MEDIDAS.braco);
    return { meio, fim: soma(meio, dirOsso(spec.f * sinal), MEDIDAS.antebraco) };
  };

  function desenharFrente(def, p) {
    const CORPO = 'var(--texto)';
    const [x, y] = p.hip;
    const ombroY = y - MEDIDAS.torso;
    const ombros = [[x - 17, ombroY], [x + 17, ombroY]];
    let out = def.cenario ? def.cenario(p) : '';

    // Pernas
    [-1, 1].forEach((s) => {
      out += linha([x + s * 8, y], [x + s * 14, CHAO - 6], 7, CORPO);
      out += linha([x + s * 14, CHAO - 3], [x + s * 14 + s * 9, CHAO - 3], 5, CORPO);
    });
    // Tronco, ombros e cabeça
    out += linha([x, y], [x, ombroY], 10, CORPO);
    out += linha(ombros[0], ombros[1], 8, CORPO);
    out += `<circle cx="${x}" cy="${ombroY - 21}" r="9" fill="var(--cartao-2)" stroke="${CORPO}" stroke-width="3.5"/>`;

    // Braços (o esquerdo é o espelho do direito)
    [-1, 1].forEach((s, i) => {
      const b = braco2(ombros[i], p.arm, s);
      out += linha(ombros[i], b.meio, 6, CORPO) + linha(b.meio, b.fim, 6, CORPO);
      (def.aderecos || []).forEach((a) => {
        if (a.tipo === 'disco') {
          out += `<circle cx="${f(b.fim[0])}" cy="${f(b.fim[1])}" r="${a.r || 6}" fill="var(--azul)" fill-opacity=".22" stroke="var(--azul)" stroke-width="3"/>`;
        }
      });
    });
    return out;
  }

  function desenharCima(def, p) {
    const CORPO = 'var(--texto)';
    const [x, y] = p.hip;                 // centro dos ombros, visto de cima
    const ombros = [[x - 20, y], [x + 20, y]];
    let out = def.cenario ? def.cenario(p) : '';

    out += `<ellipse cx="${x}" cy="${y + 18}" rx="27" ry="18" fill="var(--cartao-2)" stroke="${CORPO}" stroke-width="3.5"/>`;
    out += `<circle cx="${x}" cy="${y + 4}" r="10" fill="var(--cartao-2)" stroke="${CORPO}" stroke-width="3.5"/>`;

    [-1, 1].forEach((s, i) => {
      const b = braco2(ombros[i], p.arm, s);
      out += linha(ombros[i], b.meio, 6, CORPO) + linha(b.meio, b.fim, 6, CORPO);
      // Almofada da máquina ao longo do antebraço.
      out += linha(soma(b.meio, [0, 0]), b.fim, 12, 'var(--azul)', 'opacity=".28"');
    });
    return out;
  }

  function desenhar(def, p) {
    if (def.vista === 'frente') return desenharFrente(def, p);
    if (def.vista === 'cima') return desenharCima(def, p);
    return desenharLateral(def, p);
  }

  // ---------- Animação ----------

  const suave = (x) => x * x * (3 - 2 * x);

  /** 0 = pose inicial, 1 = pose final; fica parado um instante em cada ponta. */
  function progresso(fracao) {
    if (fracao < 0.1) return { k: 0, indo: true };
    if (fracao < 0.5) return { k: suave((fracao - 0.1) / 0.4), indo: true };
    if (fracao < 0.6) return { k: 1, indo: false };
    return { k: 1 - suave((fracao - 0.6) / 0.4), indo: false };
  }

  const LARGURA = 240;
  const ALTURA = 182;

  function moldura(def, conteudo, rotulo) {
    return `<svg viewBox="0 -16 ${LARGURA} ${ALTURA}" role="img" aria-label="${rotulo}" ` +
      `xmlns="http://www.w3.org/2000/svg">` +
      `<line x1="8" y1="${CHAO}" x2="${LARGURA - 8}" y2="${CHAO}" stroke="var(--texto-3)" stroke-width="2" stroke-linecap="round"/>` +
      `<g id="demo-corpo">${conteudo}</g></svg>`;
  }

  /** Quadro estático (usado nos testes e como alternativa sem animação). */
  function quadro(nome, k) {
    const def = biblioteca[nome];
    const frames = def.frames;
    const p = frames.length > 1 ? misturar(frames[0], frames[1], k) : frames[0];
    return moldura(def, desenhar(def, p), nome);
  }

  /** Cria o elemento com a animação. Toque para pausar/continuar. */
  function criar(nome) {
    const def = biblioteca[nome];
    const caixa = document.createElement('div');
    caixa.className = 'demo-caixa';
    caixa.innerHTML = quadro(nome, 0);

    const legenda = document.createElement('div');
    legenda.className = 'demo-legenda';
    caixa.appendChild(legenda);

    const dica = document.createElement('div');
    dica.className = 'demo-pausa';
    dica.textContent = 'Toque para pausar';
    caixa.appendChild(dica);

    if (def.frames.length < 2) {
      legenda.textContent = def.legenda ? def.legenda[0] : '';
      dica.hidden = true;
      return caixa;
    }

    let pausado = false;
    let inicio = performance.now();
    let acumulado = 0;      // tempo já decorrido quando pausou

    caixa.addEventListener('click', () => {
      pausado = !pausado;
      if (pausado) acumulado = performance.now() - inicio;
      else inicio = performance.now() - acumulado;
      dica.textContent = pausado ? 'Pausado — toque para continuar' : 'Toque para pausar';
    });

    function passo(agora) {
      if (!caixa.isConnected) return;       // janela fechada: para de animar
      if (!pausado) {
        const fracao = ((agora - inicio) % DURACAO_MS) / DURACAO_MS;
        const { k, indo } = progresso(fracao);
        const p = misturar(def.frames[0], def.frames[1], k);
        const corpo = caixa.querySelector('#demo-corpo');
        if (corpo) corpo.innerHTML = desenhar(def, p);
        if (def.legenda) legenda.textContent = indo ? def.legenda[0] : def.legenda[1];
      }
      requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
    return caixa;
  }

  return { registrar, tem, definicao, criar, quadro, nomes: () => Object.keys(biblioteca) };
})();

/* Poses e textos de cada exercício. O motor que desenha fica em `demos.js`.
   O nome aqui precisa ser igual ao nome do exercício no catálogo. */

(function () {

  const CINZA = 'var(--texto-3)';
  const ln = (x1, y1, x2, y2, w = 4) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${CINZA}" stroke-width="${w}" stroke-linecap="round"/>`;
  const ret = (x, y, w, h) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${CINZA}" fill-opacity=".45" stroke="${CINZA}" stroke-width="1.5"/>`;

  /** Banco reto: tampo e dois pés. */
  const bancoReto = (x1, x2, topo) =>
    ret(x1, topo, x2 - x1, 6) + ln(x1 + 8, topo + 6, x1 + 8, 150, 3) + ln(x2 - 8, topo + 6, x2 - 8, 150, 3);

  const disco = (em, r = 7, dx = 0, dy = 0) => ({ tipo: 'disco', em, r, dx, dy });
  const barra = (r = 7) => disco('mao', r);
  const halter = () => disco('mao', 4.5);

  /** Pernas em pé, retas. */
  const emPe = { th: 0, sh: 0 };

  /** Cenário de banco inclinado/reclinado: encosto acompanha o tronco. */
  const encosto = (J, comp = 56) => {
    const dx = J.ombro[0] - J.quadril[0];
    const dy = J.ombro[1] - J.quadril[1];
    const n = Math.hypot(dx, dy);
    const u = [dx / n, dy / n];
    const normal = [u[1], -u[0]];                 // para o lado de trás das costas
    const lado = normal[1] > 0 ? normal : [-normal[0], -normal[1]];
    const a = [J.quadril[0] + lado[0] * 8, J.quadril[1] + lado[1] * 8];
    const b = [a[0] + u[0] * comp, a[1] + u[1] * comp];
    return ln(a[0], a[1], b[0], b[1], 7) + ln(a[0], a[1], a[0], 150, 3) +
      ln(a[0] + 22, a[1], a[0] - 4, a[1], 6) + ln(a[0] + 20, a[1], a[0] + 20, 150, 3);
  };

  // ==========================================================================
  // PEITO
  // ==========================================================================

  const supinoQuadros = (mao) => [
    { hip: [150, 109], t: -90, arm: { to: [110, 68] }, leg: { to: [188, 144] } },
    { hip: [150, 109], t: -90, arm: { to: [111, 100] }, leg: { to: [188, 144] } }
  ];

  const bancoSupino = () => bancoReto(52, 168, 115);

  Demos.registrar('Supino reto com barra', {
    frames: supinoQuadros(),
    aderecos: [barra(9)],
    cenario: bancoSupino,
    legenda: ['Descer a barra até tocar de leve o peito', 'Empurrar a barra para cima'],
    grupo: 'Peito',
    musculos: 'Peito, ombro (frente) e tríceps',
    passos: [
      'Deite com os olhos abaixo da barra, pés firmes no chão e escápulas juntas e "para baixo".',
      'Segure a barra um pouco mais aberto que a largura dos ombros e tire-a do suporte.',
      'Desça controlando (2 a 3 s) até a barra tocar de leve a parte baixa do peito.',
      'Empurre a barra de volta para cima, no mesmo caminho, sem perder o apoio do corpo no banco.'
    ],
    dicas: [
      'Cotovelos a cerca de 45–75° do tronco, não abertos a 90°.',
      'Punhos retos, em cima do antebraço.',
      'Peça ajuda de alguém (ou use o suporte de segurança) nas séries pesadas.'
    ],
    erros: 'Tirar o quadril do banco, quicar a barra no peito e deixar os punhos dobrados para trás.'
  });

  Demos.registrar('Supino reto com halteres', {
    frames: supinoQuadros(),
    aderecos: [halter()],
    cenario: bancoSupino,
    legenda: ['Descer abrindo os cotovelos de leve', 'Empurrar juntando os halteres em cima'],
    grupo: 'Peito',
    musculos: 'Peito, ombro (frente) e tríceps',
    passos: [
      'Sente com os halteres sobre as coxas e deite-se levando-os até a altura do peito.',
      'Comece com os braços esticados em cima do peito, palmas para os pés.',
      'Desça até os cotovelos passarem um pouco da linha do tronco, sentindo o peito alongar.',
      'Suba empurrando para cima e levemente para dentro, sem bater um halter no outro.'
    ],
    dicas: [
      'Os halteres permitem uma amplitude maior que a barra; use isso a seu favor.',
      'Mantenha as escápulas juntas durante toda a série.'
    ],
    erros: 'Descer rápido demais e jogar os cotovelos muito para trás, sobrecarregando o ombro.'
  });

  Demos.registrar('Supino inclinado com halteres', {
    frames: [
      { hip: [152, 112], t: -55, arm: { to: [121, 48] }, leg: { to: [190, 144] } },
      { hip: [152, 112], t: -55, arm: { to: [125, 82] }, leg: { to: [190, 144] } }
    ],
    aderecos: [halter()],
    cenario: (J) => encosto(J),
    legenda: ['Descer até a altura do peito', 'Empurrar para cima'],
    grupo: 'Peito',
    musculos: 'Peito (parte de cima), ombro (frente) e tríceps',
    passos: [
      'Ajuste o banco entre 30° e 45° de inclinação (mais que isso vira exercício de ombro).',
      'Leve os halteres à altura do peito, escápulas juntas e pés firmes.',
      'Desça controlando até sentir o peito alongar.',
      'Empurre os halteres para cima, até os braços ficarem quase esticados.'
    ],
    dicas: [
      'Inclinação de 30° costuma ser o melhor equilíbrio entre peito e ombro.',
      'Não trave os cotovelos com força no topo.'
    ],
    erros: 'Banco muito inclinado e arquear demais as costas para empurrar mais peso.'
  });

  Demos.registrar('Crucifixo na máquina', {
    vista: 'cima',
    frames: [
      { hip: [120, 70], arm: { u: 120, f: 200 } },
      { hip: [120, 70], arm: { u: 190, f: 220 } }
    ],
    cenario: () => ret(94, 74, 52, 50) + `<text x="120" y="-6" text-anchor="middle" font-size="11" fill="${CINZA}">vista de cima</text>`,
    legenda: ['Abrir com controle, sentindo o peito alongar', 'Juntar os braços à frente do peito'],
    grupo: 'Peito',
    musculos: 'Peito e ombro (frente)',
    passos: [
      'Ajuste o banco para que as manoplas fiquem na altura do meio do peito.',
      'Encoste bem as costas no encosto e segure as manoplas com os cotovelos levemente dobrados.',
      'Abra os braços até sentir o peito alongar, sem forçar o ombro para trás.',
      'Feche juntando as mãos à frente do peito e segure 1 s apertando.'
    ],
    dicas: [
      'Pense em "abraçar uma árvore", mantendo o ângulo do cotovelo fixo.',
      'Use uma carga que permita controlar a volta.'
    ],
    erros: 'Projetar os ombros para a frente e usar impulso para fechar.'
  });

  // ==========================================================================
  // COSTAS
  // ==========================================================================

  Demos.registrar('Puxada frontal', {
    frames: [
      { hip: [110, 111], t: -12, arm: { to: [118, 33] }, leg: { th: 90, sh: 0 } },
      { hip: [110, 111], t: -12, arm: { to: [114, 78] }, leg: { th: 90, sh: 0 } }
    ],
    aderecos: [{ tipo: 'cabo', em: 'mao', ancora: [142, -10] }, disco('mao', 3)],
    cenario: () => ret(78, 117, 52, 6) + ln(104, 123, 104, 150, 3),
    cenarioFrente: () => ret(100, 98, 44, 7),
    legenda: ['Puxar a barra até a parte de cima do peito', 'Voltar controlando, braços esticados'],
    grupo: 'Costas',
    musculos: 'Dorsal (costas), bíceps e parte de trás do ombro',
    passos: [
      'Ajuste o apoio das coxas para firmar o corpo no banco.',
      'Segure a barra mais aberto que os ombros e incline o tronco de leve para trás.',
      'Puxe a barra até a parte de cima do peito, levando os cotovelos para baixo e para trás.',
      'Volte devagar, esticando os braços completamente.'
    ],
    dicas: [
      'Pense em puxar com os cotovelos, não com as mãos.',
      'Peito para frente e ombros longe das orelhas.'
    ],
    erros: 'Balançar o tronco para trás para puxar e levar a barra atrás da nuca.'
  });

  Demos.registrar('Barra fixa', {
    frames: [
      { hip: [111, 84], t: 2, arm: { to: [116, 2] }, leg: { th: 0, sh: -40 } },
      { hip: [105, 46], t: -8, arm: { to: [116, 2] }, leg: { th: 12, sh: -45 } }
    ],
    cotovelo: 1,
    cenario: () => ln(70, 2, 160, 2, 5) + ln(70, 2, 70, 150, 3) + ln(160, 2, 160, 150, 3),
    legenda: ['Subir até o queixo passar da barra', 'Descer controlando até esticar os braços'],
    grupo: 'Costas',
    musculos: 'Dorsal (costas), bíceps e antebraço',
    passos: [
      'Segure a barra com as palmas para a frente, um pouco mais aberto que os ombros.',
      'Comece pendurado, com os braços esticados e o abdômen firme.',
      'Puxe o corpo para cima levando os cotovelos para baixo, até o queixo passar da barra.',
      'Desça em 2 a 3 s até esticar os braços de novo.'
    ],
    dicas: [
      'Se ainda não consegue, use a máquina de barra assistida ou elástico.',
      'Evite balançar as pernas para ganhar impulso.'
    ],
    erros: 'Subir só pela metade e relaxar os ombros na descida.'
  });

  Demos.registrar('Remada curvada', {
    frames: [
      { hip: [92, 84], t: 62, arm: { to: [130, 106] }, leg: { to: [108, 144] } },
      { hip: [92, 84], t: 62, arm: { to: [113, 84] }, leg: { to: [108, 144] } }
    ],
    aderecos: [barra(8)],
    legenda: ['Puxar a barra em direção ao umbigo', 'Descer controlando, braços esticados'],
    grupo: 'Costas',
    musculos: 'Costas (meio e dorsal), bíceps e parte de trás do ombro',
    passos: [
      'Pés na largura dos ombros, joelhos levemente dobrados e quadril para trás.',
      'Incline o tronco a cerca de 45° com a coluna reta e a barra pendurada à frente.',
      'Puxe a barra até o abdômen, levando os cotovelos para trás e juntando as escápulas.',
      'Desça devagar, sem mexer o tronco.'
    ],
    dicas: [
      'Olhe para o chão, um pouco à frente, para manter o pescoço neutro.',
      'Se o tronco sobe a cada repetição, a carga está alta.'
    ],
    erros: 'Arredondar a lombar e usar impulso do quadril.'
  });

  Demos.registrar('Remada baixa', {
    frames: [
      { hip: [88, 120], t: 16, arm: { to: [140, 92] }, leg: { to: [150, 118] } },
      { hip: [88, 120], t: -6, arm: { to: [112, 100] }, leg: { to: [150, 118] } }
    ],
    aderecos: [{ tipo: 'cabo', em: 'mao', ancora: [205, 96] }, disco('mao', 3)],
    cenario: () => ret(58, 126, 56, 6) + ln(80, 132, 80, 150, 3) + ln(158, 104, 158, 126, 6) + ln(60, 132, 168, 132, 2),
    legenda: ['Puxar o cabo até o abdômen e juntar as escápulas', 'Voltar devagar, deixando o tronco ir à frente'],
    grupo: 'Costas',
    musculos: 'Costas (meio e dorsal), bíceps e parte de trás do ombro',
    passos: [
      'Sente com os pés apoiados e os joelhos levemente dobrados.',
      'Segure o triângulo/barra com os braços esticados e a coluna reta.',
      'Puxe até a altura do abdômen, levando os cotovelos para trás e juntando as escápulas.',
      'Volte devagar sem arredondar as costas.'
    ],
    dicas: [
      'Peito aberto, ombros baixos.',
      'Pause 1 s com as escápulas juntas.'
    ],
    erros: 'Jogar o tronco muito para trás para puxar mais carga.'
  });

  Demos.registrar('Remada unilateral com halter', {
    face: -1,
    frames: [
      { hip: [150, 82], t: -75, arm: { u: 0, f: 0 }, arm2: { u: 0, f: 0 }, leg: { to: [158, 144] }, leg2: { th: -35, sh: 80 } },
      { hip: [150, 82], t: -75, arm: { u: 125, f: 10 }, arm2: { u: 0, f: 0 }, leg: { to: [158, 144] }, leg2: { th: -35, sh: 80 } }
    ],
    sem: ['braco'],
    aderecos: [halter()],
    cenario: () => bancoReto(76, 142, 112),
    cenarioFrente: (J) => ln(J.ombro[0], J.ombro[1], 104, 112, 6),
    legenda: ['Puxar o halter em direção ao quadril', 'Descer devagar até esticar o braço'],
    grupo: 'Costas',
    musculos: 'Costas (dorsal e meio), bíceps e parte de trás do ombro',
    passos: [
      'Apoie uma mão e o joelho do mesmo lado no banco, com as costas retas e paralelas ao chão.',
      'Segure o halter com o braço esticado, na linha do ombro.',
      'Puxe o halter em direção ao quadril, levando o cotovelo para cima e para trás.',
      'Desça devagar até esticar o braço, sem girar o tronco. Depois troque de lado.'
    ],
    dicas: [
      'Imagine que o cotovelo é a "alça": o braço só segura.',
      'Mantenha o pescoço alinhado com a coluna.'
    ],
    erros: 'Girar o tronco para levantar o halter e puxar com o braço, não com as costas.'
  });

  Demos.registrar('Face pull', {
    frames: [
      { hip: [110, 77], t: -4, arm: { to: [150, 36] }, leg: emPe },
      { hip: [110, 77], t: -4, arm: { to: [130, 33] }, leg: emPe }
    ],
    cotovelo: -1,
    aderecos: [{ tipo: 'cabo', em: 'mao', ancora: [205, 32] }],
    legenda: ['Puxar a corda em direção ao rosto, cotovelos altos', 'Voltar esticando os braços'],
    grupo: 'Ombros',
    musculos: 'Parte de trás do ombro, parte alta das costas e manguito rotador',
    passos: [
      'Ajuste a polia na altura do rosto e use a corda.',
      'Segure a corda, dê um passo atrás e fique com o tronco firme e os braços esticados.',
      'Puxe a corda em direção ao rosto, abrindo os cotovelos para os lados e para cima.',
      'Segure 1 s juntando as escápulas e volte devagar.'
    ],
    dicas: [
      'Carga leve: o foco é a qualidade do movimento e a saúde do ombro.',
      'Mãos terminam ao lado das orelhas.'
    ],
    erros: 'Usar muita carga e inclinar o tronco para trás.'
  });

  // ==========================================================================
  // OMBROS
  // ==========================================================================

  const militarQuadros = [
    { hip: [110, 77], t: 0, arm: { to: [117, 36] }, leg: emPe },
    { hip: [110, 77], t: 0, arm: { to: [113, -4] }, leg: emPe }
  ];

  Demos.registrar('Desenvolvimento militar', {
    frames: militarQuadros,
    aderecos: [barra(8)],
    legenda: ['Descer a barra até a altura do queixo', 'Empurrar a barra para cima, passando rente ao rosto'],
    grupo: 'Ombros',
    musculos: 'Ombro (frente e lado), tríceps e parte alta do peito',
    passos: [
      'Em pé, pés na largura dos ombros, barra apoiada na frente dos ombros, cotovelos à frente da barra.',
      'Contraia abdômen e glúteos para não arquear a lombar.',
      'Empurre a barra para cima, desviando o rosto para trás e passando a barra rente à testa.',
      'No topo, deixe a barra alinhada com o meio do pé e desça controlando até o queixo.'
    ],
    dicas: [
      'Punhos retos e cotovelos levemente à frente da barra.',
      'Respire fundo e segure o ar na hora de empurrar (abdômen firme).'
    ],
    erros: 'Arquear a lombar e empurrar a barra para a frente em vez de para cima.'
  });

  Demos.registrar('Desenvolvimento com halteres', {
    frames: militarQuadros,
    aderecos: [halter()],
    legenda: ['Descer os halteres até a altura das orelhas', 'Empurrar para cima, juntando os halteres'],
    grupo: 'Ombros',
    musculos: 'Ombro (frente e lado) e tríceps',
    passos: [
      'Sentado (com apoio nas costas) ou em pé, leve os halteres à altura dos ombros, palmas para a frente.',
      'Empurre os halteres para cima até esticar os braços, sem bater um no outro.',
      'Desça devagar até os cotovelos formarem cerca de 90°.'
    ],
    dicas: ['Mantenha o abdômen firme.', 'Não deixe os cotovelos caírem muito para trás.'],
    erros: 'Arquear as costas para empurrar mais peso.'
  });

  Demos.registrar('Elevação lateral', {
    vista: 'frente',
    frames: [
      { hip: [120, 77], arm: { u: 6, f: 6 } },
      { hip: [120, 77], arm: { u: 86, f: 80 } }
    ],
    aderecos: [halter()],
    cenario: () => `<text x="120" y="-6" text-anchor="middle" font-size="11" fill="${CINZA}">vista de frente</text>`,
    legenda: ['Subir os braços até a altura dos ombros', 'Descer devagar, sem balançar'],
    grupo: 'Ombros',
    musculos: 'Ombro (parte do meio)',
    passos: [
      'Em pé, um halter em cada mão ao lado do corpo, cotovelos levemente dobrados.',
      'Eleve os braços para os lados até a altura dos ombros, como se despejasse água de uma jarra.',
      'Segure 1 s no alto e desça devagar (2 a 3 s).'
    ],
    dicas: [
      'Use uma carga leve e foque em controlar a descida.',
      'Leve os cotovelos para cima, não as mãos.'
    ],
    erros: 'Balançar o corpo e subir os ombros em direção às orelhas.'
  });

  // ==========================================================================
  // BRAÇOS
  // ==========================================================================

  const roscaQuadros = [
    { hip: [110, 77], t: 0, arm: { u: 3, f: 3 }, leg: emPe },
    { hip: [110, 77], t: 0, arm: { u: 3, f: 148 }, leg: emPe }
  ];

  Demos.registrar('Rosca direta', {
    frames: roscaQuadros,
    aderecos: [barra(7)],
    legenda: ['Dobrar os cotovelos levando a barra aos ombros', 'Descer devagar até esticar os braços'],
    grupo: 'Bíceps',
    musculos: 'Bíceps e antebraço',
    passos: [
      'Em pé, segure a barra com as palmas para cima, na largura dos ombros.',
      'Mantenha os cotovelos colados ao tronco e o corpo parado.',
      'Dobre os cotovelos levando a barra até a altura dos ombros e aperte o bíceps.',
      'Desça controlando (2 a 3 s) até esticar os braços.'
    ],
    dicas: ['Cotovelos fixos ao lado do corpo.', 'Não encoste a barra na coxa para pegar impulso.'],
    erros: 'Balançar o tronco para trás para subir a carga.'
  });

  Demos.registrar('Rosca martelo', {
    frames: roscaQuadros,
    aderecos: [halter()],
    legenda: ['Subir o halter com a palma virada para dentro', 'Descer devagar'],
    grupo: 'Bíceps',
    musculos: 'Bíceps (braquial) e antebraço',
    passos: [
      'Em pé, um halter em cada mão, palmas viradas para o corpo (pegada neutra, como segurar um martelo).',
      'Com os cotovelos colados ao tronco, dobre um braço (ou os dois) levando o halter ao ombro.',
      'Desça devagar até esticar o braço.'
    ],
    dicas: ['Pode alternar os braços ou fazer os dois ao mesmo tempo.', 'Evite girar o punho.'],
    erros: 'Balançar o corpo e levantar os ombros.'
  });

  Demos.registrar('Rosca inclinada com halteres', {
    frames: [
      { hip: [100, 111], t: -35, arm: { u: 0, f: 0 }, leg: { th: 90, sh: 0 } },
      { hip: [100, 111], t: -35, arm: { u: 0, f: 150 }, leg: { th: 90, sh: 0 } }
    ],
    aderecos: [halter()],
    cenario: (J) => encosto(J, 60),
    legenda: ['Dobrar o cotovelo subindo o halter', 'Descer até esticar completamente o braço'],
    grupo: 'Bíceps',
    musculos: 'Bíceps (cabeça longa) e antebraço',
    passos: [
      'Ajuste o banco entre 45° e 60° e sente-se com as costas bem apoiadas.',
      'Deixe os braços pendurados atrás da linha do corpo, palmas para a frente.',
      'Dobre os cotovelos, subindo os halteres sem tirar os cotovelos do lugar.',
      'Desça devagar até esticar totalmente, alongando o bíceps.'
    ],
    dicas: ['O alongamento extra é o diferencial deste exercício; use carga moderada.', 'Mantenha os ombros encostados no banco.'],
    erros: 'Levar os cotovelos para a frente e perder o alongamento.'
  });

  Demos.registrar('Tríceps testa', {
    frames: [
      { hip: [150, 109], t: -90, arm: { u: 187, f: 187 }, leg: { to: [188, 144] } },
      { hip: [150, 109], t: -90, arm: { u: 192, f: 290 }, leg: { to: [188, 144] } }
    ],
    aderecos: [barra(7)],
    cenario: () => bancoReto(52, 168, 115),
    legenda: ['Dobrar só os cotovelos, descendo até a testa', 'Estender os braços de volta'],
    grupo: 'Tríceps',
    musculos: 'Tríceps',
    passos: [
      'Deitado no banco, segure a barra (de preferência a barra W) com os braços esticados sobre o peito.',
      'Mantendo os braços parados, dobre só os cotovelos levando a barra em direção à testa (ou um pouco atrás da cabeça).',
      'Estenda os cotovelos voltando à posição inicial, contraindo o tríceps.'
    ],
    dicas: ['Cotovelos apontando para o teto, sem abrir.', 'Comece leve: o cotovelo sofre se a carga for alta.'],
    erros: 'Abrir os cotovelos e transformar em um supino fechado.'
  });

  Demos.registrar('Tríceps na polia', {
    frames: [
      { hip: [110, 77], t: 6, arm: { u: 0, f: 108 }, leg: emPe },
      { hip: [110, 77], t: 6, arm: { u: 0, f: 0 }, leg: emPe }
    ],
    aderecos: [{ tipo: 'cabo', em: 'mao', ancora: [124, -12] }],
    legenda: ['Empurrar a corda para baixo, esticando os cotovelos', 'Voltar devagar até 90° no cotovelo'],
    grupo: 'Tríceps',
    musculos: 'Tríceps',
    passos: [
      'Em pé de frente para a polia alta, com a corda nas duas mãos e os cotovelos colados ao corpo.',
      'Empurre a corda para baixo até esticar os braços, abrindo as pontas da corda no final.',
      'Volte devagar até os antebraços ficarem na altura da cintura, sem mexer os cotovelos.'
    ],
    dicas: ['Tronco levemente inclinado e firme.', 'Contraia o tríceps por 1 s embaixo.'],
    erros: 'Balançar o corpo e deixar os cotovelos subirem.'
  });

  Demos.registrar('Tríceps francês', {
    frames: [
      { hip: [110, 77], t: 0, arm: { u: 176, f: 176 }, leg: emPe },
      { hip: [110, 77], t: 0, arm: { u: 176, f: 322 }, leg: emPe }
    ],
    aderecos: [halter()],
    legenda: ['Dobrar os cotovelos descendo o halter atrás da cabeça', 'Esticar os braços para cima'],
    grupo: 'Tríceps',
    musculos: 'Tríceps (cabeça longa)',
    passos: [
      'Em pé ou sentado, segure um halter com as duas mãos acima da cabeça, braços esticados.',
      'Dobrando só os cotovelos, desça o halter atrás da cabeça.',
      'Estenda os cotovelos subindo o halter até esticar os braços.'
    ],
    dicas: ['Mantenha os cotovelos apontando para cima, próximos da cabeça.', 'Abdômen firme para não arquear a lombar.'],
    erros: 'Abrir os cotovelos e arquear as costas.'
  });

  // ==========================================================================
  // PERNAS
  // ==========================================================================

  const bracosNaBarra = { u: -40, f: 140 };

  Demos.registrar('Agachamento livre', {
    frames: [
      { hip: [108, 78], t: 0, arm: bracosNaBarra, leg: { to: [108, 144] } },
      { hip: [85, 110], t: 40, arm: bracosNaBarra, leg: { to: [108, 144] } }
    ],
    aderecos: [disco('ombro', 9, -3, -2)],
    legenda: ['Descer jogando o quadril para trás', 'Subir empurrando o chão'],
    grupo: 'Pernas',
    musculos: 'Quadríceps, glúteos, posteriores de coxa e lombar',
    passos: [
      'Barra apoiada na parte alta das costas (não no pescoço), pés na largura dos ombros, pontas levemente abertas.',
      'Respire fundo, contraia o abdômen e desça jogando o quadril para trás e os joelhos para fora.',
      'Desça até as coxas ficarem paralelas ao chão (ou o máximo que mantiver a coluna reta).',
      'Suba empurrando o chão com o pé inteiro, mantendo o peito aberto.'
    ],
    dicas: [
      'A barra deve passar sempre sobre o meio do pé.',
      'Joelhos acompanham a direção das pontas dos pés.',
      'Use o suporte de segurança nas séries pesadas.'
    ],
    erros: 'Joelhos "caindo" para dentro, calcanhares saindo do chão e arredondar a lombar embaixo.'
  });

  Demos.registrar('Agachamento frontal', {
    frames: [
      { hip: [108, 78], t: 0, arm: { to: [118, 40] }, leg: { to: [108, 144] } },
      { hip: [90, 110], t: 18, arm: { to: [122, 74] }, leg: { to: [108, 144] } }
    ],
    cotovelo: 1,
    aderecos: [disco('mao', 8)],
    legenda: ['Descer mantendo o tronco bem vertical', 'Subir empurrando o chão'],
    grupo: 'Pernas',
    musculos: 'Quadríceps, glúteos e core',
    passos: [
      'Apoie a barra na frente dos ombros, com os cotovelos altos apontando para a frente.',
      'Desça com o tronco o mais vertical possível, joelhos acompanhando os pés.',
      'Desça até as coxas ficarem paralelas ao chão ou mais.',
      'Suba empurrando o chão e mantendo os cotovelos altos.'
    ],
    dicas: ['Cotovelos altos o tempo todo para a barra não rolar.', 'Pode usar tira (straps) se faltar mobilidade no punho.'],
    erros: 'Deixar os cotovelos caírem e curvar as costas.'
  });

  Demos.registrar('Agachamento búlgaro', {
    frames: [
      { hip: [108, 78], t: 6, arm: { u: 0, f: 0 }, leg: { to: [142, 144] }, leg2: { to: [60, 107] } },
      { hip: [108, 108], t: 14, arm: { u: 0, f: 0 }, leg: { to: [142, 144] }, leg2: { to: [60, 107] } }
    ],
    aderecos: [halter()],
    cenario: () => ret(36, 112, 44, 6) + ln(42, 118, 42, 150, 3) + ln(74, 118, 74, 150, 3),
    legenda: ['Descer com o joelho da frente alinhado ao pé', 'Subir empurrando o pé da frente'],
    grupo: 'Pernas',
    musculos: 'Quadríceps, glúteos e equilíbrio',
    passos: [
      'Fique de costas para um banco e apoie o peito do pé de trás sobre ele; o pé da frente fica a um passo largo.',
      'Desça dobrando o joelho da frente, com o tronco levemente inclinado.',
      'Desça até a coxa da frente ficar paralela ao chão.',
      'Suba empurrando com o pé da frente. Complete as repetições e troque de perna.'
    ],
    dicas: ['Faça sem peso na primeira vez para achar o equilíbrio.', 'Quanto mais longe o pé da frente, mais glúteo.'],
    erros: 'Pé da frente muito perto do banco, jogando o joelho à frente do pé.'
  });

  Demos.registrar('Stiff', {
    frames: [
      { hip: [108, 78], t: 0, arm: { u: 4, f: 4 }, leg: { to: [110, 144] } },
      { hip: [80, 84], t: 72, arm: { u: 0, f: 0 }, leg: { to: [110, 144] } }
    ],
    aderecos: [barra(8)],
    legenda: ['Empurrar o quadril para trás, barra rente às pernas', 'Subir estendendo o quadril'],
    grupo: 'Pernas',
    musculos: 'Posteriores de coxa, glúteos e lombar',
    passos: [
      'Em pé, segure a barra à frente das coxas, joelhos levemente dobrados.',
      'Empurre o quadril para trás, mantendo a coluna reta e a barra rente às pernas.',
      'Desça até sentir os posteriores de coxa alongarem (geralmente abaixo do joelho).',
      'Suba estendendo o quadril, apertando os glúteos no final.'
    ],
    dicas: ['O movimento é de dobradiça no quadril, não de agachar.', 'Olhar para baixo, um pouco à frente.'],
    erros: 'Arredondar as costas e dobrar demais os joelhos.'
  });

  Demos.registrar('Leg press', {
    frames: [
      { hip: [80, 128], t: -55, arm: { u: 20, f: 60 }, leg: { to: [132, 92] }, fa: -125 },
      { hip: [80, 128], t: -55, arm: { u: 20, f: 60 }, leg: { to: [114, 105] }, fa: -125 }
    ],
    joelho: 1,
    aderecos: [{ tipo: 'linha', em: 'pe', ang: -35, comp: 46, larg: 6, dx: 7, dy: -3 }],
    cenario: (J) => encosto(J, 50) + ln(70, 140, 168, 80, 3),
    legenda: ['Descer a plataforma dobrando os joelhos', 'Empurrar a plataforma sem travar os joelhos'],
    grupo: 'Pernas',
    musculos: 'Quadríceps e glúteos',
    passos: [
      'Sente com as costas e o quadril bem encostados, pés na plataforma na largura dos ombros.',
      'Solte as travas e desça a plataforma até os joelhos formarem cerca de 90°.',
      'Empurre a plataforma sem esticar totalmente os joelhos no final.'
    ],
    dicas: ['Quadril sempre colado no banco.', 'Joelhos alinhados com a ponta dos pés.'],
    erros: 'Deixar o quadril "enrolar" embaixo e travar os joelhos no topo.'
  });

  Demos.registrar('Mesa flexora', {
    frames: [
      { hip: [120, 108], t: -90, arm: { u: -70, f: -110 }, leg: { th: 90, sh: 90 } },
      { hip: [120, 108], t: -90, arm: { u: -70, f: -110 }, leg: { th: 90, sh: 188 } }
    ],
    aderecos: [{ tipo: 'almofada', em: 'pe', dx: 0, dy: -2 }],
    cenario: () => bancoReto(60, 170, 114),
    legenda: ['Flexionar os joelhos levando os calcanhares aos glúteos', 'Descer devagar até quase esticar'],
    grupo: 'Pernas',
    musculos: 'Posteriores de coxa',
    passos: [
      'Deite de bruços, com a almofada logo acima dos calcanhares e o quadril colado ao banco.',
      'Flexione os joelhos levando os calcanhares em direção aos glúteos.',
      'Contraia 1 s no alto e volte devagar (2 a 3 s).'
    ],
    dicas: ['Não tire o quadril do banco.', 'Mantenha os pés em posição neutra.'],
    erros: 'Levantar o quadril e usar impulso para subir a carga.'
  });

  Demos.registrar('Cadeira flexora', {
    frames: [
      { hip: [90, 110], t: -12, arm: { u: 55, f: 95 }, leg: { th: 90, sh: 88 } },
      { hip: [90, 110], t: -12, arm: { u: 55, f: 95 }, leg: { th: 90, sh: -5 } }
    ],
    joelho: 0,
    aderecos: [{ tipo: 'almofada', em: 'pe', dx: -2, dy: -3 }],
    cenario: () => ret(62, 116, 56, 6) + ln(70, 122, 70, 150, 3) + ln(110, 122, 110, 150, 3),
    cenarioFrente: () => ret(92, 98, 44, 6),
    legenda: ['Puxar os calcanhares para baixo, dobrando os joelhos', 'Voltar devagar até esticar as pernas'],
    grupo: 'Pernas',
    musculos: 'Posteriores de coxa',
    passos: [
      'Sente com as costas apoiadas e a almofada de coxa travando as pernas; a outra almofada fica logo acima dos calcanhares.',
      'Puxe os calcanhares para baixo e para trás, dobrando os joelhos.',
      'Contraia 1 s e volte devagar até quase esticar as pernas.'
    ],
    dicas: ['Mantenha a lombar encostada.', 'Segure nas manoplas para estabilizar o corpo.'],
    erros: 'Balançar o tronco e dar tranco para subir o peso.'
  });

  Demos.registrar('Cadeira extensora', {
    frames: [
      { hip: [90, 110], t: -12, arm: { u: 55, f: 95 }, leg: { th: 90, sh: 0 } },
      { hip: [90, 110], t: -12, arm: { u: 55, f: 95 }, leg: { th: 90, sh: 95 } }
    ],
    joelho: 0,
    aderecos: [{ tipo: 'almofada', em: 'pe', dx: 3, dy: -2 }],
    cenario: () => ret(62, 116, 56, 6) + ln(70, 122, 70, 150, 3) + ln(110, 122, 110, 150, 3),
    legenda: ['Esticar os joelhos levantando as pernas', 'Descer devagar até 90°'],
    grupo: 'Pernas',
    musculos: 'Quadríceps',
    passos: [
      'Ajuste o encosto para que o joelho fique alinhado com o eixo da máquina e a almofada fique sobre o peito do pé.',
      'Estenda os joelhos até esticar as pernas, contraindo o quadríceps.',
      'Segure 1 s em cima e desça controlando (2 a 3 s).'
    ],
    dicas: ['Não trave os joelhos de forma brusca no topo.', 'Use carga que permita a descida lenta.'],
    erros: 'Levantar o quadril do banco e usar impulso.'
  });

  Demos.registrar('Hip thrust', {
    frames: [
      { hip: [110, 130], t: -45, arm: { to: [110, 124] }, leg: { to: [158, 144] } },
      { hip: [122, 102], t: -90, arm: { to: [122, 96] }, leg: { to: [158, 144] } }
    ],
    cotovelo: -1,
    aderecos: [disco('quadril', 8, 0, -6)],
    cenario: () => bancoReto(54, 98, 108),
    legenda: ['Empurrar o quadril para cima, apertando os glúteos', 'Descer devagar sem encostar no chão'],
    grupo: 'Pernas',
    musculos: 'Glúteos e posteriores de coxa',
    passos: [
      'Apoie a parte de baixo das escápulas num banco, com a barra sobre o quadril (use uma almofada).',
      'Pés firmes no chão, na largura do quadril, joelhos dobrados a cerca de 90° no topo.',
      'Empurre o quadril para cima até o corpo ficar em linha reta, dos ombros aos joelhos.',
      'Aperte os glúteos por 1 s e desça devagar.'
    ],
    dicas: ['Queixo levemente para o peito, olhar para a frente.', 'Não arqueie a lombar no topo; a força vem dos glúteos.'],
    erros: 'Usar a lombar para subir e deixar os pés muito longe ou muito perto.'
  });

  Demos.registrar('Panturrilha em pé', {
    frames: [
      { hip: [112, 77], t: 0, arm: { u: 4, f: 4 }, leg: { th: 0, sh: 0 }, fa: 0 },
      { hip: [118, 71.5], t: 0, arm: { u: 4, f: 4 }, leg: { th: 0, sh: 0 }, fa: 40 }
    ],
    aderecos: [halter()],
    legenda: ['Subir na ponta dos pés o máximo possível', 'Descer devagar, alongando a panturrilha'],
    grupo: 'Pernas',
    musculos: 'Panturrilha (gastrocnêmio e sóleo)',
    passos: [
      'Em pé, com a ponta dos pés num degrau e os calcanhares para fora, joelhos esticados.',
      'Suba o máximo que conseguir na ponta dos pés e segure 1 s.',
      'Desça devagar abaixo da linha do degrau, alongando bem a panturrilha.'
    ],
    dicas: ['A amplitude completa importa mais que a carga.', 'Pode fazer com halteres ou na máquina.'],
    erros: 'Fazer o movimento curto e rápido, sem pausa em cima e embaixo.'
  });

  Demos.registrar('Panturrilha sentado', {
    frames: [
      { hip: [90, 110], t: 0, arm: { u: 40, f: 110 }, leg: { th: 90, sh: 0 }, fa: 0 },
      { hip: [96, 104.5], t: 0, arm: { u: 40, f: 110 }, leg: { th: 90, sh: 0 }, fa: 40 }
    ],
    aderecos: [disco('joelho', 8, 0, -9)],
    cenario: () => ret(62, 116, 56, 6) + ln(70, 122, 70, 150, 3),
    legenda: ['Subir os calcanhares o máximo possível', 'Descer devagar, alongando'],
    grupo: 'Pernas',
    musculos: 'Panturrilha (sóleo)',
    passos: [
      'Sente com a almofada sobre os joelhos e a ponta dos pés na plataforma.',
      'Suba os calcanhares o máximo que conseguir e segure 1 s.',
      'Desça devagar abaixo da linha da plataforma.'
    ],
    dicas: ['Com o joelho dobrado, o sóleo trabalha mais.', 'Séries de 12 a 15 repetições funcionam bem.'],
    erros: 'Fazer o movimento curto e quicar embaixo.'
  });

  // ==========================================================================
  // ABDÔMEN
  // ==========================================================================

  Demos.registrar('Abdominal na polia', {
    frames: [
      { hip: [110, 112], t: 8, h: 0, arm: { on: 'head', d: [4, -2] }, leg: { th: 0, sh: -90 }, fa: 180 },
      { hip: [110, 112], t: 62, h: 30, arm: { on: 'head', d: [4, -4] }, leg: { th: 0, sh: -90 }, fa: 180 }
    ],
    joelho: 0,
    aderecos: [{ tipo: 'cabo', em: 'mao', ancora: [128, -12] }],
    cenario: () => ret(100, 146, 44, 5),
    legenda: ['Enrolar o tronco levando o peito em direção ao quadril', 'Voltar devagar, com o abdômen contraído'],
    grupo: 'Abdômen',
    musculos: 'Reto abdominal',
    passos: [
      'Ajoelhe-se de frente para a polia alta e segure a corda junto à cabeça.',
      'Enrole o tronco, levando os cotovelos em direção aos joelhos e contraindo o abdômen.',
      'Volte devagar, mantendo a tensão no abdômen.'
    ],
    dicas: ['O quadril fica parado: só a coluna se enrola.', 'Expire ao descer.'],
    erros: 'Puxar com os braços e inclinar o quadril para trás.'
  });

  Demos.registrar('Abdominal supra', {
    frames: [
      { hip: [150, 143], t: -90, h: 0, arm: { on: 'head', d: [-2, -2] }, leg: { th: 140, sh: 20 } },
      { hip: [150, 143], t: -66, h: 18, arm: { on: 'head', d: [-2, -2] }, leg: { th: 140, sh: 20 } }
    ],
    joelho: 0,
    legenda: ['Subir os ombros do chão contraindo o abdômen', 'Descer devagar sem relaxar'],
    grupo: 'Abdômen',
    musculos: 'Reto abdominal',
    passos: [
      'Deitado de costas, joelhos dobrados e pés no chão; mãos junto às orelhas ou cruzadas no peito.',
      'Contraia o abdômen e suba os ombros do chão, enrolando a coluna.',
      'Desça devagar, sem apoiar totalmente a cabeça.'
    ],
    dicas: ['Não puxe o pescoço com as mãos.', 'Olhe para o teto, mantendo um espaço entre o queixo e o peito.'],
    erros: 'Subir o tronco todo e usar impulso.'
  });

  Demos.registrar('Prancha abdominal', {
    face: -1,
    frames: [
      { hip: [134, 134], t: -79, arm: { u: 0, f: -90 }, leg: { th: 79, sh: 79 }, fa: 55 },
      { hip: [134, 132.5], t: -80, arm: { u: 0, f: -90 }, leg: { th: 80, sh: 80 }, fa: 55 }
    ],
    joelho: 0,
    cenario: () => '',
    legenda: ['Mantenha o corpo em linha reta, abdômen e glúteos contraídos', 'Respire normalmente'],
    grupo: 'Abdômen',
    musculos: 'Abdômen (transverso), core e ombros',
    passos: [
      'Apoie os antebraços no chão com os cotovelos sob os ombros e os pés afastados na largura do quadril.',
      'Contraia abdômen e glúteos, formando uma linha reta da cabeça aos calcanhares.',
      'Mantenha por 20 a 60 s respirando normalmente.'
    ],
    dicas: ['Olhe para o chão, pescoço relaxado.', 'Se o quadril cair ou subir, pare e recomece.'],
    erros: 'Deixar o quadril cair (lombar) ou levantar demais.'
  });

  // ==========================================================================
  // CARDIO
  // ==========================================================================

  Demos.registrar('Esteira', {
    frames: [
      { hip: [110, 77], t: 8, arm: { u: -35, f: 60 }, arm2: { u: 35, f: 60 }, leg: { th: -30, sh: -60 }, leg2: { th: 25, sh: 10 }, fa: 20 },
      { hip: [110, 77], t: 8, arm: { u: 35, f: 60 }, arm2: { u: -35, f: 60 }, leg: { th: 25, sh: 10 }, leg2: { th: -30, sh: -60 }, fa: 0 }
    ],
    joelho: 0,
    cenario: () => ln(40, 148, 190, 148, 6),
    legenda: ['Passadas curtas e firmes', 'Braços acompanham o ritmo'],
    grupo: 'Cardio',
    musculos: 'Pernas, coração e pulmão',
    passos: [
      'Comece com 3 a 5 minutos de caminhada leve para aquecer.',
      'Suba a velocidade até um ritmo em que ainda consiga falar frases curtas.',
      'Mantenha o tronco ereto e olhe para a frente.'
    ],
    dicas: ['Não segure nas barras laterais, a menos que precise.', 'Termine com 3 minutos de caminhada leve.'],
    erros: 'Passos muito longos e inclinação excessiva sem controle.'
  });

})();

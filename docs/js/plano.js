/* Aba "Plano": o cronograma da semana. Toque em um dia para ver os exercícios,
   assistir à demonstração de cada um e começar o treino já montado. */

const TelaPlano = {

  /** Número do dia aberto (1 = segunda ... 5 = sexta), ou null na lista. */
  diaAberto: null,

  titulo() {
    const dia = this.diaAberto && PLANO.doDia(this.diaAberto);
    return dia ? dia.nome : 'Plano';
  },

  acao() {
    if (!this.diaAberto) return null;
    return { texto: '‹ Plano', aoTocar: () => { this.diaAberto = null; App.render(); } };
  },

  render() {
    const dia = this.diaAberto && PLANO.doDia(this.diaAberto);
    return dia ? this.detalhe(dia) : this.semana();
  },

  // ---------- Semana ----------

  semana() {
    const hoje = new Date().getDay();
    const doDia = PLANO.doDia(hoje);
    const partes = [];

    partes.push(UI.el('div', { class: 'plano-resumo' }, [
      UI.el('strong', { texto: PLANO.nome }),
      UI.el('span', { texto: PLANO.resumo })
    ]));

    if (doDia) {
      partes.push(UI.tituloSecao('Hoje • ' + PLANO.NOMES_DIAS[hoje]));
      partes.push(UI.el('div', { class: 'blocos' }, [
        UI.el('button', {
          class: 'botao primario',
          onclick: () => this.comecar(doDia)
        }, `Começar ${doDia.nome}`)
      ]));
    } else {
      const proximo = PLANO.proximo(hoje);
      partes.push(UI.tituloSecao('Hoje • ' + PLANO.NOMES_DIAS[hoje]));
      partes.push(UI.el('div', { class: 'grupo' }, [
        UI.item({
          titulo: 'Dia de descanso',
          sub: proximo ? `Próximo treino: ${PLANO.NOMES_DIAS[proximo.dia]} • ${proximo.nome}` : null,
          icone: '😴',
          estatico: true
        })
      ]));
    }

    partes.push(UI.tituloSecao('Semana'));
    partes.push(UI.el('div', { class: 'grupo' }, PLANO.dias.map((dia) => UI.item({
      titulo: `${PLANO.NOMES_DIAS[dia.dia]} • ${dia.nome}`,
      sub: `${dia.foco} • ${Formatar.plural(dia.exercicios.length, 'exercício', 'exercícios')}`,
      icone: dia.emoji,
      valor: dia.dia === hoje ? 'hoje' : null,
      seta: true,
      aoTocar: () => { this.diaAberto = dia.dia; App.render(); }
    }))));

    partes.push(UI.tituloSecao('Fim de semana'));
    partes.push(UI.el('div', { class: 'grupo' }, [
      UI.item({
        titulo: 'Sábado e domingo',
        sub: 'Descanso. Se quiser, caminhada ou cardio leve.',
        icone: '😴',
        estatico: true
      })
    ]));

    partes.push(UI.tituloSecao('Como usar o plano'));
    partes.push(UI.el('div', { class: 'grupo' }, PLANO.dicas.map(([titulo, texto]) => UI.item({
      titulo, sub: texto, estatico: true
    }))));

    return UI.grupoDeElementos(partes);
  },

  // ---------- Um dia ----------

  detalhe(dia) {
    const partes = [];
    const totalSeries = dia.exercicios.reduce((soma, e) => soma + e.series, 0);

    partes.push(UI.el('div', { class: 'plano-resumo' }, [
      UI.el('strong', { texto: `${PLANO.NOMES_DIAS[dia.dia]} • ${dia.nome}` }),
      UI.el('span', { texto: `${dia.foco} • ${totalSeries} séries` })
    ]));

    partes.push(UI.el('div', { class: 'blocos' }, [
      UI.el('button', { class: 'botao primario', onclick: () => this.comecar(dia) }, 'Começar este treino')
    ]));

    partes.push(UI.tituloSecao('Exercícios'));
    partes.push(UI.el('div', { class: 'grupo' }, dia.exercicios.map((ex) => UI.item({
      titulo: ex.nome,
      sub: `${ex.series} × ${ex.reps} • descanso ${ex.descanso}` + (ex.nota ? `\n${ex.nota}` : ''),
      icone: Dados.EMOJI_GRUPO[ex.grupo] || '⭐',
      valor: Demos.tem(ex.nome) ? '🎬' : null,
      seta: true,
      aoTocar: () => UI.demonstracao(ex.nome, ex)
    }))));

    partes.push(UI.el('div', { class: 'secao-rodape',
      texto: 'Toque em um exercício para ver a demonstração. Ao começar o treino, as cargas da última vez já vêm preenchidas.' }));

    return UI.grupoDeElementos(partes);
  },

  // ---------- Começar ----------

  async comecar(dia) {
    if (Dados.treinoAtivo()) {
      const ir = await UI.confirmar({
        titulo: 'Já existe um treino em andamento',
        mensagem: 'Finalize ou descarte o treino atual antes de começar outro.',
        textoOk: 'Ir para o treino'
      });
      if (ir) App.irPara('treinar');
      return;
    }
    Dados.iniciarTreinoDoPlano(dia);
    this.diaAberto = null;
    App.irPara('treinar');
  }
};

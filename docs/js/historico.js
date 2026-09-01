/* Aba "Histórico": treinos finalizados, agrupados por mês, e o detalhe de cada um. */

const TelaHistorico = {

  busca: '',
  detalheId: null,

  titulo() {
    return this.detalheId ? 'Treino' : 'Histórico';
  },

  /** Botão que aparece no canto do cabeçalho. */
  acao() {
    if (!this.detalheId) return null;
    return {
      texto: '‹ Voltar',
      aoTocar: () => { this.detalheId = null; App.render(); }
    };
  },

  render() {
    return this.detalheId ? this.detalhe() : this.lista();
  },

  // ---------- Lista ----------

  lista() {
    const termo = this.busca.trim().toLowerCase();
    const treinos = Dados.finalizados().filter((t) => {
      if (!termo) return true;
      return t.nome.toLowerCase().includes(termo)
        || t.exercicios.some((e) => e.nome.toLowerCase().includes(termo));
    });

    const partes = [
      UI.el('div', { class: 'campo' }, [
        UI.el('input', {
          type: 'search',
          placeholder: 'Buscar treino ou exercício',
          value: this.busca,
          oninput: (e) => {
            this.busca = e.target.value;
            App.renderConteudo();
          }
        })
      ])
    ];

    if (treinos.length === 0) {
      partes.push(termo
        ? UI.vazio('🔍', 'Nada encontrado', 'Nenhum treino com esse nome ou exercício.')
        : UI.vazio('📅', 'Sem treinos ainda',
            'Quando você finalizar um treino na aba Treinar, ele aparece aqui.'));
      return UI.grupoDeElementos(partes);
    }

    // Agrupa por mês mantendo a ordem (do mais recente para o mais antigo).
    let mesAtual = null;
    let grupoAtual = null;

    treinos.forEach((treino) => {
      const mes = Formatar.mesAno(treino.inicio);
      if (mes !== mesAtual) {
        mesAtual = mes;
        partes.push(UI.tituloSecao(mes));
        grupoAtual = UI.el('div', { class: 'grupo' });
        partes.push(grupoAtual);
      }

      const duracao = Dados.duracaoTreino(treino);
      const volume = Dados.volumeTreino(treino);
      const minutos = Dados.minutosTreino(treino);
      const resumo = [
        Formatar.plural(treino.exercicios.length, 'exercício', 'exercícios'),
        Formatar.plural(Dados.seriesFeitas(treino), 'série', 'séries'),
        volume > 0 ? Formatar.volume(volume) : null,
        minutos > 0 ? Formatar.minutos(minutos) + ' de cardio' : null,
        duracao ? Formatar.duracao(duracao) : null
      ].filter(Boolean).join(' • ');

      grupoAtual.appendChild(UI.item({
        titulo: treino.nome,
        sub: Formatar.dataHora(treino.inicio) + '\n' + resumo,
        seta: true,
        aoTocar: () => { this.detalheId = treino.id; App.render(); }
      }));
    });

    return UI.grupoDeElementos(partes);
  },

  // ---------- Detalhe ----------

  detalhe() {
    const treino = Dados.treinoPorId(this.detalheId);
    if (!treino) {
      this.detalheId = null;
      return this.lista();
    }

    const duracao = Dados.duracaoTreino(treino);
    const partes = [];

    partes.push(UI.el('div', { class: 'secao-titulo', texto: Formatar.dataLonga(treino.inicio) }));

    const minutosCardio = Dados.minutosTreino(treino);

    partes.push(UI.el('div', { class: 'grade-stats' }, [
      UI.stat('Exercícios', String(treino.exercicios.length)),
      UI.stat('Séries', String(Dados.seriesFeitas(treino))),
      UI.stat('Repetições', String(Dados.repeticoesFeitas(treino))),
      UI.stat('Volume', Formatar.volume(Dados.volumeTreino(treino))),
      minutosCardio > 0 ? UI.stat('Cardio', Formatar.minutos(minutosCardio)) : null
    ].filter(Boolean)));

    if (duracao) {
      partes.push(UI.el('div', { class: 'secao-rodape', texto: 'Duração: ' + Formatar.duracao(duracao) }));
    }

    treino.exercicios.forEach((exercicio) => {
      const cardio = Dados.ehCardio(exercicio);
      const carga = Dados.maiorCarga(exercicio);
      const minutos = Dados.minutosExercicio(exercicio);

      const destaque = cardio
        ? (minutos > 0 ? Formatar.minutos(minutos) : null)
        : (carga ? 'máx ' + Formatar.peso(carga) : null);

      partes.push(UI.el('div', { class: 'exercicio-topo' }, [
        UI.el('div', {}, [
          UI.el('span', { class: 'nome', texto: exercicio.nome }),
          exercicio.grupo ? UI.el('span', { class: 'grupo-musc', texto: exercicio.grupo }) : null
        ]),
        destaque ? UI.el('span', { class: 'item-valor', texto: destaque }) : null
      ]));

      partes.push(UI.el('div', { class: 'grupo' },
        exercicio.series.map((serie, indice) => UI.item({
          titulo: 'Série ' + (indice + 1),
          valor: !serie.feita
            ? 'não concluída'
            : cardio
              ? Formatar.minutos(Dados.minutosDaSerie(serie))
              : `${Formatar.peso(serie.peso)} × ${serie.reps}`,
          estatico: true
        }))
      ));
    });

    partes.push(UI.tituloSecao('Anotações'));
    partes.push(UI.el('div', { class: 'campo' }, [
      UI.el('textarea', {
        rows: 3,
        placeholder: 'Como foi o treino? (opcional)',
        oninput: (e) => { treino.notas = e.target.value; Dados.salvar(); }
      }, treino.notas || '')
    ]));

    partes.push(UI.el('div', { class: 'blocos', style: 'margin-top:20px' }, [
      UI.el('button', {
        class: 'botao destrutivo',
        onclick: async () => {
          const ok = await UI.confirmar({
            titulo: 'Apagar este treino?',
            mensagem: 'Ele sai do histórico e das estatísticas. Não dá para desfazer.',
            textoOk: 'Apagar',
            perigo: true
          });
          if (!ok) return;
          Dados.apagarTreino(treino.id);
          this.detalheId = null;
          App.render();
        }
      }, 'Apagar treino')
    ]));

    return UI.grupoDeElementos(partes);
  }
};

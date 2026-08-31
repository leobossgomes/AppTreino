/* Aba "Exercícios": o catálogo pessoal que alimenta a montagem dos treinos. */

const TelaExercicios = {

  busca: '',

  titulo() { return 'Exercícios'; },

  acao() {
    return { texto: '＋', aoTocar: () => this.editar(null, '') };
  },

  render() {
    const termo = this.busca.trim().toLowerCase();
    const lista = Dados.exercicios().filter(
      (e) => !termo || e.nome.toLowerCase().includes(termo) || e.grupo.toLowerCase().includes(termo)
    );

    const partes = [
      UI.el('div', { class: 'campo' }, [
        UI.el('input', {
          type: 'search',
          placeholder: 'Buscar exercício',
          value: this.busca,
          oninput: (e) => { this.busca = e.target.value; App.renderConteudo(); }
        })
      ])
    ];

    if (lista.length === 0) {
      partes.push(UI.vazio('📋', 'Nenhum exercício',
        'Toque em ＋ no topo para cadastrar os exercícios que você faz na academia.'));
      return UI.grupoDeElementos(partes);
    }

    // Agrupa por grupo muscular, na ordem fixa definida em Dados.GRUPOS.
    Dados.GRUPOS.forEach((grupo) => {
      const doGrupo = lista.filter((e) => e.grupo === grupo);
      if (doGrupo.length === 0) return;

      partes.push(UI.tituloSecao(`${Dados.EMOJI_GRUPO[grupo] || ''} ${grupo}`.trim()));
      partes.push(UI.el('div', { class: 'grupo' }, doGrupo.map((e) => UI.item({
        titulo: e.nome,
        sub: e.obs || null,
        seta: true,
        aoTocar: () => this.editar(e)
      }))));
    });

    return UI.grupoDeElementos(partes);
  },

  /** Formulário de cadastro/edição. `aoSalvar` é opcional e recebe o exercício. */
  editar(exercicio, nomeInicial = '', aoSalvar = null) {
    const campoNome = UI.el('input', {
      type: 'text',
      placeholder: 'Nome (ex.: Supino reto)',
      value: exercicio ? exercicio.nome : nomeInicial
    });

    const campoGrupo = UI.el('select', {},
      Dados.GRUPOS.map((g) => UI.el('option', {
        value: g,
        selected: exercicio ? exercicio.grupo === g : g === 'Peito'
      }, `${Dados.EMOJI_GRUPO[g] || ''} ${g}`.trim()))
    );

    const campoObs = UI.el('input', {
      type: 'text',
      placeholder: 'Observações (opcional)',
      value: exercicio ? exercicio.obs : ''
    });

    const salvar = () => {
      const nome = campoNome.value.trim();
      if (!nome) {
        campoNome.focus();
        return;
      }
      const salvo = exercicio
        ? Dados.atualizarExercicio(exercicio.id, { nome, grupo: campoGrupo.value, obs: campoObs.value })
        : Dados.criarExercicio(nome, campoGrupo.value, campoObs.value);

      UI.fecharModal();
      if (aoSalvar) aoSalvar(salvo);
      else App.render();
    };

    const acoes = [
      UI.el('button', { class: 'botao primario', onclick: salvar }, 'Salvar')
    ];

    if (exercicio) {
      acoes.push(UI.el('button', {
        class: 'botao destrutivo',
        onclick: async () => {
          UI.fecharModal();
          const ok = await UI.confirmar({
            titulo: `Apagar "${exercicio.nome}"?`,
            mensagem: 'Ele sai do catálogo, mas os treinos antigos no histórico continuam intactos.',
            textoOk: 'Apagar',
            perigo: true
          });
          if (!ok) return;
          Dados.apagarExercicio(exercicio.id);
          App.render();
        }
      }, 'Apagar exercício'));
    }

    acoes.push(UI.el('button', { class: 'botao', onclick: UI.fecharModal }, 'Cancelar'));

    UI.abrirModal([
      UI.el('h2', { texto: exercicio ? 'Editar exercício' : 'Novo exercício' }),
      UI.el('div', { class: 'campo' }, [campoNome]),
      UI.el('div', { class: 'campo' }, [campoGrupo]),
      UI.el('div', { class: 'campo' }, [campoObs]),
      UI.el('div', { class: 'acoes' }, acoes)
    ]);

    setTimeout(() => campoNome.focus(), 60);
  }
};

/* Aba "Treinar": começar um treino e anotar as séries enquanto treina. */

const TelaTreinar = {

  titulo() {
    return Dados.treinoAtivo() ? 'Em andamento' : 'Treinar';
  },

  render() {
    const treino = Dados.treinoAtivo();
    return treino ? this.emAndamento(treino) : this.comecar();
  },

  // ---------- Sem treino ativo ----------

  comecar() {
    const ultimo = Dados.finalizados()[0];

    return UI.grupoDeElementos([
      UI.vazio('🏋️', 'Bora treinar?',
        'Comece um treino e vá anotando as séries, as repetições e o peso de cada exercício.'),

      UI.el('div', { class: 'blocos' }, [
        UI.el('button', {
          class: 'botao primario',
          onclick: () => { Dados.iniciarTreino(); App.render(); }
        }, 'Iniciar treino'),

        ultimo ? UI.el('button', {
          class: 'botao',
          onclick: () => { Dados.iniciarTreino(ultimo); App.render(); }
        }, 'Repetir: ' + ultimo.nome) : null
      ]),

      ultimo ? UI.tituloSecao('Último treino') : null,
      ultimo ? UI.el('div', { class: 'grupo' }, [
        UI.item({
          titulo: ultimo.nome,
          sub: Formatar.dataHora(ultimo.inicio),
          estatico: true
        }),
        UI.item({
          titulo: 'Exercícios',
          valor: String(ultimo.exercicios.length),
          estatico: true
        }),
        UI.item({
          titulo: 'Séries concluídas',
          valor: String(Dados.seriesFeitas(ultimo)),
          estatico: true
        }),
        UI.item({
          titulo: 'Volume',
          valor: Formatar.volume(Dados.volumeTreino(ultimo)),
          estatico: true
        })
      ]) : null
    ]);
  },

  // ---------- Treino acontecendo agora ----------

  emAndamento(treino) {
    const partes = [];

    // Nome do treino (editável) e cronômetro.
    partes.push(UI.el('div', { class: 'campo' }, [
      UI.el('input', {
        type: 'text',
        value: treino.nome,
        placeholder: 'Nome do treino',
        oninput: (e) => { treino.nome = e.target.value; Dados.salvar(); }
      })
    ]));

    partes.push(UI.el('div', { class: 'cronometro' }, [
      UI.el('span', { class: 'tempo', id: 'cronometro', texto: '00:00' }),
      UI.el('span', { class: 'resumo', id: 'resumo-treino' })
    ]));

    // Um bloco por exercício.
    treino.exercicios.forEach((exercicio) => {
      partes.push(this.blocoExercicio(treino, exercicio));
    });

    partes.push(UI.el('div', { class: 'blocos', style: 'margin-top:18px' }, [
      UI.el('button', {
        class: 'botao',
        onclick: () => this.escolherExercicio(treino)
      }, '+  Adicionar exercício'),

      UI.el('button', {
        class: 'botao primario',
        disabled: treino.exercicios.length === 0,
        onclick: () => this.finalizar(treino)
      }, 'Finalizar treino'),

      UI.el('button', {
        class: 'botao destrutivo',
        onclick: () => this.descartar(treino)
      }, 'Descartar treino')
    ]));

    return UI.grupoDeElementos(partes);
  },

  blocoExercicio(treino, exercicio) {
    /* Cardio se anota em minutos; o resto, em peso × repetições. */
    const cardio = Dados.ehCardio(exercicio);

    const cabecalho = [UI.el('span', { texto: 'Série' })];
    if (cardio) {
      cabecalho.push(UI.el('span', { texto: 'Minutos' }));
    } else {
      cabecalho.push(UI.el('span', { texto: 'Peso (kg)' }));
      cabecalho.push(UI.el('span', { texto: 'Reps' }));
    }
    cabecalho.push(UI.el('span', { texto: 'Ok', style: 'text-align:center' }));

    const classeLinha = 'linha-serie' + (cardio ? ' cardio' : '');

    const linhas = [
      UI.el('div', { class: 'linha-cabecalho' + (cardio ? ' cardio' : '') }, cabecalho)
    ];

    exercicio.series.forEach((serie, indice) => {
      linhas.push(UI.el('div', { class: classeLinha + (serie.feita ? ' feita' : '') }, [
        UI.el('span', { class: 'num', texto: String(indice + 1) }),

        ...(cardio ? [
          UI.el('input', {
            type: 'text', inputmode: 'numeric', value: Dados.minutosDaSerie(serie),
            'aria-label': 'Minutos da série ' + (indice + 1),
            onfocus: (e) => e.target.select(),
            oninput: (e) => {
              serie.minutos = Math.max(0, Math.round(Formatar.numero(e.target.value)));
              Dados.salvar();
              App.atualizarResumo();
            }
          })
        ] : [
          UI.el('input', {
            type: 'text', inputmode: 'decimal', value: serie.peso,
            'aria-label': 'Peso da série ' + (indice + 1),
            onfocus: (e) => e.target.select(),
            oninput: (e) => {
              serie.peso = Formatar.numero(e.target.value);
              Dados.salvar();
              App.atualizarResumo();
            }
          }),

          UI.el('input', {
            type: 'text', inputmode: 'numeric', value: serie.reps,
            'aria-label': 'Repetições da série ' + (indice + 1),
            onfocus: (e) => e.target.select(),
            oninput: (e) => {
              serie.reps = Math.round(Formatar.numero(e.target.value));
              Dados.salvar();
              App.atualizarResumo();
            }
          })
        ]),

        UI.el('button', {
          class: 'marcar' + (serie.feita ? ' ativo' : ''),
          'aria-label': 'Marcar série ' + (indice + 1) + ' como feita',
          onclick: () => {
            serie.feita = !serie.feita;
            Dados.salvar();
            App.renderNoLugar();
          }
        }, '✓')
      ]));
    });

    linhas.push(UI.el('button', {
      class: 'item',
      style: 'color:var(--azul)',
      onclick: () => { Dados.adicionarSerie(exercicio); App.renderNoLugar(); }
    }, cardio ? '+  Adicionar tempo' : '+  Adicionar série'));

    const feitas = exercicio.series.filter((s) => s.feita).length;
    const volume = Dados.volumeExercicio(exercicio);
    const minutos = Dados.minutosExercicio(exercicio);

    const rodape = cardio
      ? (minutos > 0 ? Formatar.minutos(minutos) + ' de cardio' : null)
      : (volume > 0
          ? Formatar.plural(feitas, 'série concluída', 'séries concluídas')
            + ' • volume ' + Formatar.volume(volume)
          : null);

    return UI.grupoDeElementos([
      UI.el('div', { class: 'exercicio-topo' }, [
        UI.el('div', {}, [
          UI.el('span', { class: 'nome', texto: exercicio.nome }),
          exercicio.grupo ? UI.el('span', { class: 'grupo-musc', texto: exercicio.grupo }) : null
        ]),
        UI.el('button', {
          'aria-label': 'Opções do exercício',
          onclick: () => this.menuExercicio(treino, exercicio)
        }, '⋯')
      ]),
      UI.el('div', { class: 'grupo' }, linhas),
      rodape ? UI.el('div', { class: 'secao-rodape', texto: rodape }) : null
    ]);
  },

  menuExercicio(treino, exercicio) {
    const cardio = Dados.ehCardio(exercicio);

    const acoes = [
      {
        texto: cardio ? 'Adicionar tempo' : 'Adicionar série',
        aoTocar: () => { Dados.adicionarSerie(exercicio); App.renderNoLugar(); }
      }
    ];

    if (exercicio.series.length > 1) {
      acoes.push({
        texto: cardio ? 'Remover último tempo' : 'Remover última série',
        aoTocar: () => {
          Dados.removerSerie(exercicio, exercicio.series[exercicio.series.length - 1].id);
          App.renderNoLugar();
        }
      });
    }

    acoes.push({
      texto: 'Remover exercício',
      perigo: true,
      aoTocar: () => { Dados.removerExercicio(treino, exercicio.id); App.renderNoLugar(); }
    });

    UI.menu(exercicio.nome, acoes);
  },

  // ---------- Escolher exercício ----------

  escolherExercicio(treino) {
    const lista = UI.el('div', { class: 'lista-modal' });
    const busca = UI.el('input', {
      type: 'search', placeholder: 'Buscar exercício',
      oninput: (e) => desenhar(e.target.value)
    });

    const escolher = (nome, grupo) => {
      UI.fecharModal();
      Dados.adicionarExercicio(treino, nome, grupo);
      App.renderNoLugar();
    };

    function desenhar(filtro = '') {
      const termo = filtro.trim().toLowerCase();
      const achados = Dados.exercicios().filter(
        (e) => !termo || e.nome.toLowerCase().includes(termo) || e.grupo.toLowerCase().includes(termo)
      );

      lista.innerHTML = '';

      if (achados.length === 0) {
        lista.appendChild(UI.item({
          titulo: filtro.trim() ? `Criar "${filtro.trim()}"` : 'Cadastrar exercício',
          icone: '＋',
          aoTocar: () => {
            UI.fecharModal();
            TelaExercicios.editar(null, filtro.trim(), (criado) => {
              Dados.adicionarExercicio(treino, criado.nome, criado.grupo);
              App.renderNoLugar();
            });
          }
        }));
        return;
      }

      achados.forEach((e) => lista.appendChild(UI.item({
        titulo: e.nome,
        sub: e.grupo,
        icone: Dados.EMOJI_GRUPO[e.grupo] || '⭐',
        aoTocar: () => escolher(e.nome, e.grupo)
      })));
    }

    desenhar();

    UI.abrirModal([
      UI.el('h2', { texto: 'Escolher exercício' }),
      UI.el('div', { class: 'busca' }, [busca]),
      lista,
      UI.el('div', { class: 'acoes' }, [
        UI.el('button', { class: 'botao', onclick: UI.fecharModal }, 'Cancelar')
      ])
    ]);
  },

  // ---------- Finalizar / descartar ----------

  async finalizar(treino) {
    const ok = await UI.confirmar({
      titulo: 'Finalizar treino?',
      mensagem: 'O treino vai para o histórico. Só as séries marcadas com ✓ entram nas estatísticas.',
      textoOk: 'Finalizar'
    });
    if (!ok) return;
    Dados.finalizarTreino(treino);
    App.irPara('historico');
  },

  async descartar(treino) {
    const ok = await UI.confirmar({
      titulo: 'Descartar este treino?',
      mensagem: 'Tudo o que você anotou nele será apagado. Não dá para desfazer.',
      textoOk: 'Descartar',
      perigo: true
    });
    if (!ok) return;
    Dados.apagarTreino(treino.id);
    App.render();
  }
};

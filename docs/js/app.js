/* Coração do app: troca de abas, cabeçalho, cronômetro e inicialização. */

const App = {

  aba: 'treinar',
  timer: null,

  telas: {
    treinar: TelaTreinar,
    historico: TelaHistorico,
    exercicios: TelaExercicios,
    progresso: TelaProgresso
  },

  abas: [
    ['treinar', '🏋️', 'Treinar'],
    ['historico', '📅', 'Histórico'],
    ['exercicios', '📋', 'Exercícios'],
    ['progresso', '📈', 'Progresso']
  ],

  iniciar() {
    Dados.carregar();
    this.montarAbas();

    // Tocar fora da janela fecha o modal.
    document.getElementById('fundo-modal').addEventListener('click', (evento) => {
      if (evento.target.id === 'fundo-modal') UI.fecharModal();
    });

    // Ao voltar para o app, acerta o cronômetro na hora.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.cuidarCronometro();
    });

    this.render();
    this.registrarServiceWorker();
  },

  montarAbas() {
    const barra = document.getElementById('abas');
    barra.innerHTML = '';
    this.abas.forEach(([chave, icone, rotulo]) => {
      barra.appendChild(UI.el('button', {
        type: 'button',
        dataset: { aba: chave },
        onclick: () => this.irPara(chave)
      }, [
        UI.el('span', { class: 'icone', texto: icone }),
        UI.el('span', { texto: rotulo })
      ]));
    });
  },

  irPara(aba) {
    this.aba = aba;
    if (aba === 'historico') TelaHistorico.detalheId = null;
    this.render();
  },

  /** Redesenha tudo e volta para o topo da página. */
  render() {
    this.renderConteudo();
    this.marcarAba();
    window.scrollTo(0, 0);
  },

  /** Redesenha sem tirar o usuário do lugar onde ele estava.
      É o que usamos nas ações que acontecem no meio da tela — marcar uma
      série como feita, adicionar um exercício ou uma série — para a tela
      não pular para o topo no meio do treino. */
  renderNoLugar() {
    const posicao = window.scrollY;
    this.renderConteudo();
    window.scrollTo(0, posicao);
  },

  /** Redesenha só o conteúdo, mantendo a posição da rolagem
      (usado enquanto o usuário digita numa busca). */
  renderConteudo() {
    const tela = this.telas[this.aba];

    document.getElementById('titulo').textContent = tela.titulo();

    const areaAcao = document.getElementById('acao');
    areaAcao.innerHTML = '';
    const acao = tela.acao ? tela.acao() : null;
    if (acao) {
      areaAcao.appendChild(UI.el('button', {
        class: 'topo-acao', type: 'button', onclick: acao.aoTocar
      }, acao.texto));
    }

    const alvo = document.getElementById('tela');
    alvo.innerHTML = '';
    alvo.appendChild(tela.render());

    this.cuidarCronometro();
  },

  marcarAba() {
    document.querySelectorAll('#abas button').forEach((botao) => {
      botao.classList.toggle('ativa', botao.dataset.aba === this.aba);
    });
  },

  // ---------- Cronômetro do treino em andamento ----------

  cuidarCronometro() {
    clearInterval(this.timer);
    this.timer = null;

    const treino = Dados.treinoAtivo();
    if (this.aba !== 'treinar' || !treino) return;

    const atualizar = () => {
      const alvo = document.getElementById('cronometro');
      if (!alvo) {
        clearInterval(this.timer);
        this.timer = null;
        return;
      }
      alvo.textContent = Formatar.cronometro(Date.now() - new Date(treino.inicio).getTime());
      this.atualizarResumo();
    };

    atualizar();
    this.timer = setInterval(atualizar, 1000);
  },

  /** Atualiza os números do cabeçalho sem redesenhar a tela inteira
      (se redesenhasse, o teclado fecharia enquanto você digita o peso). */
  atualizarResumo() {
    const treino = Dados.treinoAtivo();
    const alvo = document.getElementById('resumo-treino');
    if (!treino || !alvo) return;

    const volume = Dados.volumeTreino(treino);
    const minutos = Dados.minutosTreino(treino);

    const detalhes = [
      volume > 0 ? Formatar.volume(volume) + ' de volume' : null,
      minutos > 0 ? Formatar.minutos(minutos) + ' de cardio' : null
    ].filter(Boolean);

    alvo.textContent =
      Formatar.plural(treino.exercicios.length, 'exercício', 'exercícios')
      + ' • ' + Formatar.plural(Dados.seriesFeitas(treino), 'série', 'séries')
      + (detalhes.length ? '\n' + detalhes.join(' • ') : '');
  },

  // ---------- Funcionar sem internet ----------

  registrarServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (!location.protocol.startsWith('http')) return;   // não funciona abrindo o arquivo direto
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((erro) => {
        console.warn('Service worker não registrado:', erro);
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.iniciar());

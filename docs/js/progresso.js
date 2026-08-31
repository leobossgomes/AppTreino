/* Aba "Progresso": números gerais, gráfico de evolução, recordes e backup. */

const TelaProgresso = {

  exercicioSelecionado: null,
  metrica: 'carga',   // 'carga' ou 'volume'

  titulo() { return 'Progresso'; },

  render() {
    const treinos = Dados.finalizados();

    if (treinos.length === 0) {
      return UI.grupoDeElementos([
        UI.vazio('📈', 'Sem dados ainda',
          'Finalize alguns treinos e volte aqui para ver sua evolução.'),
        this.painelBackup()
      ]);
    }

    const agora = new Date();
    const noMes = treinos.filter((t) => {
      const d = new Date(t.inicio);
      return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
    }).length;

    const totalSeries = treinos.reduce((s, t) => s + Dados.seriesFeitas(t), 0);
    const totalVolume = treinos.reduce((s, t) => s + Dados.volumeTreino(t), 0);

    return UI.grupoDeElementos([
      UI.el('div', { class: 'grade-stats' }, [
        UI.stat('Treinos', String(treinos.length)),
        UI.stat('Neste mês', String(noMes)),
        UI.stat('Séries feitas', String(totalSeries)),
        UI.stat('Volume total', Formatar.volume(totalVolume))
      ]),

      UI.tituloSecao('Evolução'),
      this.painelGrafico(),

      UI.tituloSecao('Recordes de carga'),
      this.painelRecordes(),

      this.painelBackup()
    ]);
  },

  // ---------- Gráfico ----------

  painelGrafico() {
    const nomes = Dados.nomesTreinados();

    if (nomes.length === 0) {
      return UI.el('div', { class: 'painel' }, [
        UI.el('p', { class: 'aviso', style: 'margin:0;color:var(--texto-2);font-size:15px',
          texto: 'Marque as séries com ✓ durante o treino para o gráfico aparecer aqui.' })
      ]);
    }

    if (!nomes.includes(this.exercicioSelecionado)) {
      this.exercicioSelecionado = nomes[0];
    }

    const seletor = UI.el('select', {
      onchange: (e) => { this.exercicioSelecionado = e.target.value; App.renderConteudo(); }
    }, nomes.map((n) => UI.el('option', { value: n, selected: n === this.exercicioSelecionado }, n)));

    const segmentado = UI.el('div', { class: 'segmentado' }, [
      ['carga', 'Carga máxima'],
      ['volume', 'Volume']
    ].map(([chave, rotulo]) => UI.el('button', {
      class: this.metrica === chave ? 'ativo' : '',
      onclick: () => { this.metrica = chave; App.renderConteudo(); }
    }, rotulo)));

    const pontos = Dados.evolucao(this.exercicioSelecionado);

    const conteudo = pontos.length < 2
      ? UI.el('p', { style: 'color:var(--texto-2);font-size:15px;text-align:center;padding:34px 10px;margin:0',
          texto: 'Faça esse exercício em pelo menos dois treinos para ver o gráfico.' })
      : UI.el('div', { html: this.svgGrafico(pontos) });

    return UI.el('div', { class: 'painel' }, [
      UI.el('div', { class: 'painel-topo' }, [
        UI.el('span', { style: 'font-size:15px;color:var(--texto-2)', texto: 'Exercício' }),
        seletor
      ]),
      segmentado,
      conteudo
    ]);
  },

  /** Desenha o gráfico de linha em SVG, sem depender de nenhuma biblioteca. */
  svgGrafico(pontos) {
    const L = 320, A = 180, mE = 42, mD = 10, mT = 12, mB = 22;
    const valores = pontos.map((p) => (this.metrica === 'carga' ? p.carga : p.volume));

    let min = Math.min(...valores);
    let max = Math.max(...valores);
    if (max === min) { max = min + 1; min = Math.max(0, min - 1); }
    const folga = (max - min) * 0.18;
    min = Math.max(0, min - folga);
    max = max + folga;

    const x = (i) => mE + (i * (L - mE - mD)) / (pontos.length - 1);
    const y = (v) => mT + (A - mT - mB) * (1 - (v - min) / (max - min));

    const caminho = valores
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(' ');

    const bolinhas = valores
      .map((v, i) => `<circle class="ponto" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5"/>`)
      .join('');

    const formatarValor = (v) => (this.metrica === 'carga'
      ? v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
      : Math.round(v).toLocaleString('pt-BR'));

    const rotulosY = [max, (max + min) / 2, min].map((v, i) => {
      const py = mT + ((A - mT - mB) * i) / 2;
      return `<line class="eixo" x1="${mE}" y1="${py.toFixed(1)}" x2="${L - mD}" y2="${py.toFixed(1)}"/>`
        + `<text class="rotulo" x="${mE - 6}" y="${(py + 4).toFixed(1)}" text-anchor="end">${formatarValor(v)}</text>`;
    }).join('');

    const primeiro = Formatar.dataCurta(pontos[0].data);
    const ultimo = Formatar.dataCurta(pontos[pontos.length - 1].data);
    const rotulosX =
      `<text class="rotulo" x="${mE}" y="${A - 4}" text-anchor="start">${primeiro}</text>`
      + `<text class="rotulo" x="${L - mD}" y="${A - 4}" text-anchor="end">${ultimo}</text>`;

    return `<svg class="grafico" viewBox="0 0 ${L} ${A}" role="img" aria-label="Gráfico de evolução">
      ${rotulosY}${rotulosX}
      <path class="linha" d="${caminho}"/>
      ${bolinhas}
    </svg>`;
  },

  // ---------- Recordes ----------

  painelRecordes() {
    const recordes = Dados.recordes();
    if (recordes.length === 0) {
      return UI.el('div', { class: 'grupo' }, [
        UI.item({ titulo: 'Nenhum recorde ainda', sub: 'Marque as séries com ✓ durante o treino.', estatico: true })
      ]);
    }
    return UI.el('div', { class: 'grupo' }, recordes.map((r) => UI.item({
      titulo: r.nome,
      sub: Formatar.dataHora(r.data),
      valor: Formatar.peso(r.peso),
      estatico: true
    })));
  },

  // ---------- Backup ----------

  painelBackup() {
    return UI.grupoDeElementos([
      UI.tituloSecao('Backup'),
      UI.el('div', { class: 'grupo' }, [
        UI.item({
          titulo: 'Exportar meus dados',
          sub: 'Salva um arquivo .json com todo o histórico',
          seta: true,
          aoTocar: () => this.exportar()
        }),
        UI.item({
          titulo: 'Importar de um backup',
          sub: 'Substitui os dados atuais pelos do arquivo',
          seta: true,
          aoTocar: () => this.importar()
        }),
        UI.item({
          titulo: 'Apagar todos os dados',
          sub: 'Volta o app ao estado inicial',
          seta: true,
          aoTocar: () => this.apagarTudo()
        })
      ]),
      UI.el('div', { class: 'secao-rodape',
        texto: 'Seus treinos ficam salvos apenas neste aparelho. Faça um backup de vez em quando — '
             + 'se você limpar os dados do navegador, eles se perdem.' })
    ]);
  },

  exportar() {
    const texto = Dados.exportar();
    const nome = 'apptreino-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    const blob = new Blob([texto], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = UI.el('a', { href: url, download: nome });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  },

  importar() {
    const entrada = UI.el('input', {
      type: 'file',
      accept: 'application/json,.json',
      onchange: (evento) => {
        const arquivo = evento.target.files && evento.target.files[0];
        if (!arquivo) return;
        const leitor = new FileReader();
        leitor.onload = () => {
          UI.fecharModal();
          if (Dados.importar(String(leitor.result))) {
            App.render();
            UI.abrirModal([
              UI.el('h2', { texto: 'Backup restaurado' }),
              UI.el('p', { class: 'aviso', texto: 'Seus treinos foram recuperados.' }),
              UI.el('div', { class: 'acoes' }, [
                UI.el('button', { class: 'botao primario', onclick: UI.fecharModal }, 'Fechar')
              ])
            ]);
          } else {
            UI.abrirModal([
              UI.el('h2', { texto: 'Arquivo inválido' }),
              UI.el('p', { class: 'aviso', texto: 'Esse arquivo não parece ser um backup do AppTreino.' }),
              UI.el('div', { class: 'acoes' }, [
                UI.el('button', { class: 'botao primario', onclick: UI.fecharModal }, 'Fechar')
              ])
            ]);
          }
        };
        leitor.readAsText(arquivo);
      }
    });

    UI.abrirModal([
      UI.el('h2', { texto: 'Importar backup' }),
      UI.el('p', { class: 'aviso', texto: 'Escolha o arquivo .json que você exportou antes. Os dados atuais serão substituídos.' }),
      UI.el('div', { class: 'campo' }, [entrada]),
      UI.el('div', { class: 'acoes' }, [
        UI.el('button', { class: 'botao', onclick: UI.fecharModal }, 'Cancelar')
      ])
    ]);
  },

  async apagarTudo() {
    const ok = await UI.confirmar({
      titulo: 'Apagar todos os dados?',
      mensagem: 'Todos os treinos e exercícios serão apagados deste aparelho. Não dá para desfazer.',
      textoOk: 'Apagar tudo',
      perigo: true
    });
    if (!ok) return;
    Dados.apagarTudo();
    App.irPara('treinar');
  }
};

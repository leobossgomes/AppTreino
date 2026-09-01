/* ==========================================================================
   Camada de dados do AppTreino.
   Tudo fica salvo no próprio iPhone, no "localStorage" do navegador.
   Nada é enviado para lugar nenhum — não existe servidor neste app.

   Formato guardado:
   {
     versao: 1,
     exercicios: [ { id, nome, grupo, obs } ],
     treinos: [
       { id, nome, inicio, fim, notas,
         exercicios: [ { id, nome, grupo, series: [ { id, reps, peso, feita } ] } ] }
     ]
   }

   Nos exercícios do grupo "Cardio" a série guarda `minutos` no lugar de
   peso e repetições — esteira e bicicleta se medem em tempo, não em carga.
   ========================================================================== */

const Dados = (function () {

  const CHAVE = 'apptreino.dados.v1';

  const GRUPOS = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Cardio', 'Outro'];

  /** Grupo cujos exercícios são anotados em minutos, e não em peso × reps. */
  const GRUPO_CARDIO = 'Cardio';

  const REPS_PADRAO = 10;
  const MINUTOS_PADRAO = 20;

  const EMOJI_GRUPO = {
    'Peito': '🫁', 'Costas': '🔙', 'Pernas': '🦵', 'Ombros': '🤸',
    'Bíceps': '💪', 'Tríceps': '🦾', 'Abdômen': '🧘', 'Cardio': '❤️', 'Outro': '⭐'
  };

  const EXERCICIOS_PADRAO = [
    ['Supino reto com barra', 'Peito'],
    ['Supino inclinado com halteres', 'Peito'],
    ['Crucifixo na máquina', 'Peito'],
    ['Puxada frontal', 'Costas'],
    ['Remada curvada', 'Costas'],
    ['Remada baixa', 'Costas'],
    ['Agachamento livre', 'Pernas'],
    ['Leg press', 'Pernas'],
    ['Cadeira extensora', 'Pernas'],
    ['Mesa flexora', 'Pernas'],
    ['Panturrilha em pé', 'Pernas'],
    ['Desenvolvimento com halteres', 'Ombros'],
    ['Elevação lateral', 'Ombros'],
    ['Rosca direta', 'Bíceps'],
    ['Rosca martelo', 'Bíceps'],
    ['Tríceps na polia', 'Tríceps'],
    ['Tríceps testa', 'Tríceps'],
    ['Prancha abdominal', 'Abdômen'],
    ['Abdominal supra', 'Abdômen'],
    ['Esteira', 'Cardio']
  ];

  let estado = { versao: 1, exercicios: [], treinos: [] };

  // ---------- Identificadores e armazenamento ----------

  function novoId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (bruto) {
        const lido = JSON.parse(bruto);
        if (lido && typeof lido === 'object') estado = lido;
      }
    } catch (erro) {
      console.warn('Não consegui ler os dados salvos:', erro);
    }

    if (!Array.isArray(estado.exercicios)) estado.exercicios = [];
    if (!Array.isArray(estado.treinos)) estado.treinos = [];
    estado.versao = 1;

    // Primeira vez abrindo o app: cadastra alguns exercícios comuns.
    if (estado.exercicios.length === 0) {
      estado.exercicios = EXERCICIOS_PADRAO.map(([nome, grupo]) => ({
        id: novoId(), nome, grupo, obs: ''
      }));
      salvar();
    }

    migrarCardioParaMinutos();
    return estado;
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
      return true;
    } catch (erro) {
      console.error('Não consegui salvar:', erro);
      return false;
    }
  }

  // ---------- Cardio (anotado em minutos) ----------

  /** Este exercício é de cardio? (esteira, bicicleta, elíptico...) */
  function ehCardio(exercicio) {
    return !!exercicio && exercicio.grupo === GRUPO_CARDIO;
  }

  /** Descobre pelo nome se um exercício é de cardio. Vale o que está no
      histórico (é dele que saem os números das telas); se o exercício nunca
      foi treinado, vale o grupo do catálogo. */
  function ehCardioPorNome(nome) {
    for (const treino of finalizados()) {
      const achado = treino.exercicios.find((e) => e.nome === nome);
      if (achado) return ehCardio(achado);
    }

    const doCatalogo = estado.exercicios.find((e) => e.nome === nome);
    return !!doCatalogo && doCatalogo.grupo === GRUPO_CARDIO;
  }

  /** Minutos de uma série, tolerando séries antigas sem o campo. */
  function minutosDaSerie(serie) {
    return Math.max(0, Math.round(Number(serie && serie.minutos) || 0));
  }

  /* Antes desta versão o cardio também era anotado como peso × repetições.
     O tempo só podia ter sido digitado no campo de repetições, então é ele
     que vira os minutos. Nada é apagado: o valor antigo continua em `reps`. */
  function migrarCardioParaMinutos() {
    let mudou = false;

    estado.treinos.forEach((treino) => {
      (treino.exercicios || []).forEach((exercicio) => {
        if (!ehCardio(exercicio)) return;
        (exercicio.series || []).forEach((serie) => {
          if (typeof serie.minutos === 'number') return;
          serie.minutos = Math.max(0, Math.round(Number(serie.reps) || 0));
          mudou = true;
        });
      });
    });

    if (mudou) salvar();
  }

  // ---------- Catálogo de exercícios ----------

  function exercicios() {
    return estado.exercicios.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  function criarExercicio(nome, grupo, obs = '') {
    const item = { id: novoId(), nome: nome.trim(), grupo, obs: obs.trim() };
    estado.exercicios.push(item);
    salvar();
    return item;
  }

  function atualizarExercicio(id, campos) {
    const item = estado.exercicios.find((e) => e.id === id);
    if (!item) return null;
    Object.assign(item, campos);
    item.nome = item.nome.trim();
    salvar();
    return item;
  }

  /* Apagar do catálogo NÃO mexe no histórico: cada treino guarda o nome do
     exercício por conta própria, então os treinos antigos continuam corretos. */
  function apagarExercicio(id) {
    estado.exercicios = estado.exercicios.filter((e) => e.id !== id);
    salvar();
  }

  // ---------- Treinos ----------

  function treinos() {
    return estado.treinos.slice().sort((a, b) => new Date(b.inicio) - new Date(a.inicio));
  }

  function treinoAtivo() {
    return estado.treinos.find((t) => !t.fim) || null;
  }

  function finalizados() {
    return treinos().filter((t) => t.fim);
  }

  function treinoPorId(id) {
    return estado.treinos.find((t) => t.id === id) || null;
  }

  /** Cria um treino. Se receber um treino antigo como modelo, copia os
      exercícios e as cargas dele (as séries entram desmarcadas). */
  function iniciarTreino(modelo = null) {
    const treino = {
      id: novoId(),
      nome: modelo ? modelo.nome : Formatar.nomeSugerido(),
      inicio: new Date().toISOString(),
      fim: null,
      notas: '',
      exercicios: []
    };

    if (modelo) {
      treino.exercicios = modelo.exercicios.map((ex) => ({
        id: novoId(),
        nome: ex.nome,
        grupo: ex.grupo,
        series: ex.series.map((s) => novaSerie(s, ehCardio(ex)))
      }));
    }

    estado.treinos.push(treino);
    salvar();
    return treino;
  }

  function finalizarTreino(treino) {
    treino.fim = new Date().toISOString();
    salvar();
  }

  function apagarTreino(id) {
    estado.treinos = estado.treinos.filter((t) => t.id !== id);
    salvar();
  }

  // ---------- Exercícios dentro de um treino ----------

  /** Última vez que esse exercício foi feito em um treino já finalizado. */
  function ultimaExecucao(nome) {
    for (const treino of finalizados()) {
      const achado = treino.exercicios.find((e) => e.nome === nome);
      if (achado && achado.series.length) return achado;
    }
    return null;
  }

  /** Cria uma série copiando os valores de uma anterior, quando houver.
      No cardio o que se copia é o tempo; nos demais, o peso e as repetições. */
  function novaSerie(anterior, cardio) {
    const serie = { id: novoId(), reps: 0, peso: 0, feita: false };

    if (cardio) {
      serie.minutos = (anterior && minutosDaSerie(anterior)) || MINUTOS_PADRAO;
    } else {
      serie.reps = anterior ? anterior.reps : REPS_PADRAO;
      serie.peso = anterior ? anterior.peso : 0;
    }
    return serie;
  }

  /** Adiciona o exercício ao treino, já com os valores da última vez
      (a carga na musculação, o tempo no cardio). */
  function adicionarExercicio(treino, nome, grupo) {
    const cardio = grupo === GRUPO_CARDIO;
    const anterior = ultimaExecucao(nome);
    const series = anterior && anterior.series.length
      ? anterior.series.map((s) => novaSerie(s, cardio))
      : [novaSerie(null, cardio)];

    const item = { id: novoId(), nome, grupo, series };
    treino.exercicios.push(item);
    salvar();
    return item;
  }

  function removerExercicio(treino, exercicioId) {
    treino.exercicios = treino.exercicios.filter((e) => e.id !== exercicioId);
    salvar();
  }

  /** Nova série copiando os valores da anterior (quase sempre é o que queremos). */
  function adicionarSerie(exercicio) {
    const ultima = exercicio.series[exercicio.series.length - 1];
    const serie = novaSerie(ultima, ehCardio(exercicio));
    exercicio.series.push(serie);
    salvar();
    return serie;
  }

  function removerSerie(exercicio, serieId) {
    exercicio.series = exercicio.series.filter((s) => s.id !== serieId);
    salvar();
  }

  // ---------- Contas (estatísticas) ----------

  const feitas = (exercicio) => exercicio.series.filter((s) => s.feita);

  /** Volume = soma de (peso × repetições) das séries concluídas.
      É a medida mais comum de "quanto" você treinou.
      Cardio fica de fora: ele é medido em minutos. */
  function volumeExercicio(exercicio) {
    if (ehCardio(exercicio)) return 0;
    return feitas(exercicio).reduce((total, s) => total + s.peso * s.reps, 0);
  }

  /** Minutos concluídos de um exercício de cardio (0 nos de musculação). */
  function minutosExercicio(exercicio) {
    if (!ehCardio(exercicio)) return 0;
    return feitas(exercicio).reduce((total, s) => total + minutosDaSerie(s), 0);
  }

  function minutosTreino(treino) {
    return treino.exercicios.reduce((total, e) => total + minutosExercicio(e), 0);
  }

  function maiorCarga(exercicio) {
    if (ehCardio(exercicio)) return null;
    const pesos = feitas(exercicio).map((s) => s.peso);
    return pesos.length ? Math.max(...pesos) : null;
  }

  function volumeTreino(treino) {
    return treino.exercicios.reduce((total, e) => total + volumeExercicio(e), 0);
  }

  function seriesFeitas(treino) {
    return treino.exercicios.reduce((total, e) => total + feitas(e).length, 0);
  }

  function repeticoesFeitas(treino) {
    return treino.exercicios.reduce(
      (total, e) => total + (ehCardio(e) ? 0 : feitas(e).reduce((soma, s) => soma + s.reps, 0)), 0);
  }

  function duracaoTreino(treino) {
    if (!treino.fim) return null;
    return new Date(treino.fim) - new Date(treino.inicio);
  }

  /** Nomes de todos os exercícios já treinados, sem repetir. */
  function nomesTreinados() {
    const nomes = new Set();
    finalizados().forEach((t) => t.exercicios.forEach((e) => {
      if (feitas(e).length) nomes.add(e.nome);
    }));
    return Array.from(nomes).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  /** Um ponto por treino em que o exercício apareceu — alimenta o gráfico.
      No cardio o que evolui é o tempo; nos demais, a carga e o volume. */
  function evolucao(nome) {
    return finalizados()
      .map((treino) => {
        const ex = treino.exercicios.find((e) => e.nome === nome);
        if (!ex) return null;

        if (ehCardio(ex)) {
          const minutos = minutosExercicio(ex);
          if (!minutos) return null;
          return { data: treino.inicio, carga: 0, volume: 0, minutos, cardio: true };
        }

        const carga = maiorCarga(ex);
        if (carga === null) return null;
        return { data: treino.inicio, carga, volume: volumeExercicio(ex), minutos: 0, cardio: false };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.data) - new Date(b.data));
  }

  /** Maior carga já levantada em cada exercício. */
  function recordes() {
    const melhores = new Map();
    finalizados().forEach((treino) => {
      treino.exercicios.forEach((ex) => {
        const carga = maiorCarga(ex);
        if (!carga) return;
        const atual = melhores.get(ex.nome);
        if (!atual || carga > atual.peso) {
          melhores.set(ex.nome, { nome: ex.nome, peso: carga, data: treino.inicio });
        }
      });
    });
    return Array.from(melhores.values()).sort((a, b) => b.peso - a.peso);
  }

  // ---------- Backup ----------

  function exportar() {
    return JSON.stringify(estado, null, 2);
  }

  /** Substitui todos os dados pelos de um backup. Devolve true se deu certo. */
  function importar(texto) {
    try {
      const lido = JSON.parse(texto);
      if (!lido || !Array.isArray(lido.treinos) || !Array.isArray(lido.exercicios)) return false;
      estado = { versao: 1, exercicios: lido.exercicios, treinos: lido.treinos };
      salvar();
      migrarCardioParaMinutos();
      return true;
    } catch (erro) {
      return false;
    }
  }

  function apagarTudo() {
    estado = { versao: 1, exercicios: [], treinos: [] };
    salvar();
    carregar();
  }

  return {
    GRUPOS, EMOJI_GRUPO, GRUPO_CARDIO,
    carregar, salvar, novoId,
    ehCardio, ehCardioPorNome, minutosDaSerie,
    exercicios, criarExercicio, atualizarExercicio, apagarExercicio,
    treinos, treinoAtivo, finalizados, treinoPorId,
    iniciarTreino, finalizarTreino, apagarTreino,
    ultimaExecucao, adicionarExercicio, removerExercicio, adicionarSerie, removerSerie,
    volumeExercicio, minutosExercicio, minutosTreino, maiorCarga, volumeTreino,
    seriesFeitas, repeticoesFeitas, duracaoTreino,
    nomesTreinados, evolucao, recordes,
    exportar, importar, apagarTudo
  };
})();

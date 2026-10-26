/* O plano de treino da semana (segunda a sexta).
   Divisão "Upper/Lower + Push/Pull/Legs": cada músculo é treinado 2 vezes por
   semana. Segunda e terça são dias de força (cargas altas, poucas repetições);
   quarta a sexta são dias de volume para ganhar massa.

   Para mudar o plano, edite as listas abaixo. Cada exercício precisa ter um
   nome igual ao do catálogo (aba Exercícios) para o app achar a demonstração.
   Ao mudar o plano, aumente `versao` para o app cadastrar os exercícios novos. */

const PLANO = {

  versao: 1,
  nome: 'Upper/Lower + Push/Pull/Legs',
  resumo: '5 dias por semana • cada músculo 2x',

  dias: [
    {
      dia: 1, nome: 'Upper A', emoji: '🏋️',
      foco: 'Força • parte superior',
      exercicios: [
        { nome: 'Supino reto com barra', grupo: 'Peito', series: 4, reps: '5', descanso: '3 min' },
        { nome: 'Remada curvada', grupo: 'Costas', series: 4, reps: '6', descanso: '2–3 min' },
        { nome: 'Desenvolvimento militar', grupo: 'Ombros', series: 3, reps: '6–8', descanso: '2–3 min' },
        { nome: 'Puxada frontal', grupo: 'Costas', series: 3, reps: '8', descanso: '2 min' },
        { nome: 'Rosca direta', grupo: 'Bíceps', series: 2, reps: '8–10', descanso: '90 s' },
        { nome: 'Tríceps testa', grupo: 'Tríceps', series: 2, reps: '8–10', descanso: '90 s' }
      ]
    },
    {
      dia: 2, nome: 'Lower A', emoji: '🦵',
      foco: 'Força • parte inferior',
      exercicios: [
        { nome: 'Agachamento livre', grupo: 'Pernas', series: 4, reps: '5', descanso: '3–4 min' },
        { nome: 'Stiff', grupo: 'Pernas', series: 3, reps: '6–8', descanso: '3 min',
          nota: 'Também chamado de levantamento romeno.' },
        { nome: 'Leg press', grupo: 'Pernas', series: 3, reps: '8–10', descanso: '2 min' },
        { nome: 'Mesa flexora', grupo: 'Pernas', series: 3, reps: '8–12', descanso: '90 s' },
        { nome: 'Panturrilha em pé', grupo: 'Pernas', series: 4, reps: '8–12', descanso: '90 s' },
        { nome: 'Abdominal na polia', grupo: 'Abdômen', series: 3, reps: '10–15', descanso: '60 s' }
      ]
    },
    {
      dia: 3, nome: 'Push', emoji: '💥',
      foco: 'Volume • peito, ombro e tríceps',
      exercicios: [
        { nome: 'Supino inclinado com halteres', grupo: 'Peito', series: 4, reps: '8–10', descanso: '2 min' },
        { nome: 'Supino reto com halteres', grupo: 'Peito', series: 3, reps: '10–12', descanso: '2 min',
          nota: 'Pode trocar por um supino na máquina.' },
        { nome: 'Elevação lateral', grupo: 'Ombros', series: 4, reps: '12–15', descanso: '60–90 s' },
        { nome: 'Crucifixo na máquina', grupo: 'Peito', series: 3, reps: '12–15', descanso: '90 s',
          nota: 'Também chamado de peck deck.' },
        { nome: 'Tríceps na polia', grupo: 'Tríceps', series: 3, reps: '10–12', descanso: '90 s' },
        { nome: 'Tríceps francês', grupo: 'Tríceps', series: 3, reps: '10–12', descanso: '90 s' }
      ]
    },
    {
      dia: 4, nome: 'Pull', emoji: '🔙',
      foco: 'Volume • costas e bíceps',
      exercicios: [
        { nome: 'Barra fixa', grupo: 'Costas', series: 4, reps: '8–10', descanso: '2 min',
          nota: 'Se ainda não faz 8 repetições, use a Puxada frontal no lugar.' },
        { nome: 'Remada baixa', grupo: 'Costas', series: 4, reps: '8–12', descanso: '2 min' },
        { nome: 'Remada unilateral com halter', grupo: 'Costas', series: 3, reps: '10–12', descanso: '90 s',
          nota: 'As repetições são por braço.' },
        { nome: 'Face pull', grupo: 'Ombros', series: 3, reps: '12–15', descanso: '60–90 s' },
        { nome: 'Rosca inclinada com halteres', grupo: 'Bíceps', series: 3, reps: '10–12', descanso: '90 s' },
        { nome: 'Rosca martelo', grupo: 'Bíceps', series: 3, reps: '10–12', descanso: '90 s' }
      ]
    },
    {
      dia: 5, nome: 'Legs', emoji: '🔥',
      foco: 'Volume • pernas e glúteos',
      exercicios: [
        { nome: 'Agachamento frontal', grupo: 'Pernas', series: 4, reps: '8–10', descanso: '2–3 min',
          nota: 'Pode trocar pelo agachamento hack, se a academia tiver.' },
        { nome: 'Agachamento búlgaro', grupo: 'Pernas', series: 3, reps: '10', descanso: '2 min',
          nota: 'As repetições são por perna.' },
        { nome: 'Cadeira extensora', grupo: 'Pernas', series: 3, reps: '12–15', descanso: '90 s' },
        { nome: 'Cadeira flexora', grupo: 'Pernas', series: 3, reps: '10–12', descanso: '90 s' },
        { nome: 'Hip thrust', grupo: 'Pernas', series: 3, reps: '10', descanso: '2 min' },
        { nome: 'Panturrilha sentado', grupo: 'Pernas', series: 4, reps: '12–15', descanso: '60–90 s' }
      ]
    }
  ],

  /** Regras gerais mostradas no pé da aba Plano. */
  dicas: [
    ['Esforço', 'Termine cada série com 1 a 3 repetições sobrando. Não precisa chegar à falha total.'],
    ['Progressão', 'Quando fizer o máximo de repetições em todas as séries, aumente a carga em 2 a 5% no próximo treino.'],
    ['Descanso', 'Use o descanso indicado: é nele que você recupera força para a série seguinte.'],
    ['Semana leve', 'A cada 6 a 8 semanas, faça uma semana com metade das séries para recuperar.'],
    ['Comida e sono', 'Proteína de 1,6 a 2,2 g por kg de peso por dia, um pouco de superávit calórico e 7 a 9 horas de sono.']
  ],

  /** Plano do dia da semana (0 = domingo ... 6 = sábado), ou null no fim de semana. */
  doDia(diaDaSemana) {
    return this.dias.find((d) => d.dia === diaDaSemana) || null;
  },

  /** Primeiro dia de treino a partir de hoje, para avisar "amanhã tem...". */
  proximo(diaDaSemana) {
    for (let passo = 1; passo <= 7; passo++) {
      const achado = this.doDia((diaDaSemana + passo) % 7);
      if (achado) return achado;
    }
    return null;
  },

  NOMES_DIAS: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
};

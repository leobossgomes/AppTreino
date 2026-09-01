/* Funções para deixar números e datas bonitos na tela.
   Ficam todas juntas aqui para não repetir código nas telas. */

const Formatar = {

  /** 82.5 -> "82,5 kg"   |   80 -> "80 kg" */
  peso(valor) {
    const n = Number(valor) || 0;
    return n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' kg';
  },

  /** 12500 -> "12.500 kg" */
  volume(valor) {
    const n = Math.round(Number(valor) || 0);
    return n.toLocaleString('pt-BR') + ' kg';
  },

  /** milissegundos -> "1:05:32" ou "05:32" */
  cronometro(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const dois = (v) => String(v).padStart(2, '0');
    return h > 0 ? `${h}:${dois(m)}:${dois(s)}` : `${dois(m)}:${dois(s)}`;
  },

  /** 25 -> "25 min"   |   90 -> "1h 30min" — usado no cardio */
  minutos(valor) {
    const total = Math.max(0, Math.round(Number(valor) || 0));
    const h = Math.floor(total / 60);
    const m = total % 60;
    return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m} min`;
  },

  /** milissegundos -> "1h 05min" ou "42min" */
  duracao(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min`;
  },

  /** "31/08/2026 • 19:30" */
  dataHora(iso) {
    const d = new Date(iso);
    const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${data} • ${hora}`;
  },

  /** "domingo, 31 de agosto" */
  dataLonga(iso) {
    const texto = new Date(iso).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  },

  /** "agosto de 2026" — usado para agrupar o histórico por mês */
  mesAno(iso) {
    const texto = new Date(iso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  },

  /** "10/03" — rótulo curto para o eixo do gráfico */
  dataCurta(iso) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  },

  /** Nome sugerido para um treino novo: "Treino de domingo" */
  nomeSugerido(data = new Date()) {
    const dia = data.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '');
    return 'Treino de ' + dia;
  },

  /** 1 -> "1 série"   |   3 -> "3 séries" */
  plural(quantidade, singular, plural) {
    return quantidade + ' ' + (quantidade === 1 ? singular : plural);
  },

  /** Lê o que o usuário digitou aceitando vírgula ou ponto ("82,5" -> 82.5) */
  numero(texto) {
    const n = parseFloat(String(texto).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }
};

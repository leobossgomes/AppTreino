import Foundation
import SwiftData

/// Um exercício **dentro de um treino específico**.
///
/// Guardamos o nome copiado (e não só uma referência ao catálogo) de propósito:
/// assim, se você renomear ou apagar um exercício do catálogo depois,
/// o histórico antigo continua fazendo sentido.
@Model
final class ExercicioDoTreino {
    var nome: String
    var grupoMuscular: String
    var ordem: Int
    var treino: Treino?

    @Relationship(deleteRule: .cascade, inverse: \Serie.exercicio)
    var series: [Serie]

    init(nome: String,
         grupoMuscular: String = "",
         ordem: Int = 0,
         series: [Serie] = []) {
        self.nome = nome
        self.grupoMuscular = grupoMuscular
        self.ordem = ordem
        self.series = series
    }

    // MARK: - Valores calculados

    var seriesOrdenadas: [Serie] {
        series.sorted { $0.ordem < $1.ordem }
    }

    var seriesConcluidas: Int {
        series.filter(\.concluida).count
    }

    /// Este exercício é de cardio? Aí ele é anotado em minutos, não em carga.
    var ehCardio: Bool {
        grupoMuscular == GrupoMuscular.cardio.rawValue
    }

    /// Volume = peso x repetições das séries concluídas.
    /// Cardio fica de fora: ele é medido em minutos.
    var volume: Double {
        guard !ehCardio else { return 0 }
        return series.filter(\.concluida).reduce(0) { $0 + $1.volume }
    }

    /// Minutos concluídos de um exercício de cardio (0 nos de musculação).
    var minutosConcluidos: Int {
        guard ehCardio else { return 0 }
        return series.filter(\.concluida).reduce(0) { $0 + $1.minutos }
    }

    var maiorCarga: Double? {
        guard !ehCardio else { return nil }
        return series.filter(\.concluida).map(\.peso).max()
    }

    /// Próximo número de ordem livre, para adicionar uma série nova no fim.
    var proximaOrdem: Int {
        (series.map(\.ordem).max() ?? -1) + 1
    }
}

import Foundation
import SwiftData

/// Uma sessão de treino: o dia em que você foi treinar.
/// Enquanto `fim` for `nil`, o treino está em andamento.
@Model
final class Treino {
    var nome: String
    var inicio: Date
    var fim: Date?
    var notas: String

    /// `.cascade` = ao apagar o treino, os exercícios dele também são apagados.
    @Relationship(deleteRule: .cascade, inverse: \ExercicioDoTreino.treino)
    var exercicios: [ExercicioDoTreino]

    init(nome: String,
         inicio: Date = .now,
         fim: Date? = nil,
         notas: String = "",
         exercicios: [ExercicioDoTreino] = []) {
        self.nome = nome
        self.inicio = inicio
        self.fim = fim
        self.notas = notas
        self.exercicios = exercicios
    }

    // MARK: - Valores calculados

    var emAndamento: Bool { fim == nil }

    /// Exercícios já na ordem certa (a lista do banco não garante ordem).
    var exerciciosOrdenados: [ExercicioDoTreino] {
        exercicios.sorted { $0.ordem < $1.ordem }
    }

    /// Quantidade de atividades (exercícios) realizadas no treino.
    var totalExercicios: Int { exercicios.count }

    /// Total de séries marcadas como concluídas.
    var totalSeriesConcluidas: Int {
        exercicios.reduce(0) { $0 + $1.series.filter(\.concluida).count }
    }

    /// Total de repetições concluídas (o cardio não entra: ele conta em minutos).
    var totalRepeticoes: Int {
        exercicios.reduce(0) { parcial, exercicio in
            guard !exercicio.ehCardio else { return parcial }
            return parcial + exercicio.series.filter(\.concluida).reduce(0) { $0 + $1.repeticoes }
        }
    }

    /// Minutos de cardio concluídos no treino inteiro.
    var totalMinutosCardio: Int {
        exercicios.reduce(0) { $0 + $1.minutosConcluidos }
    }

    /// Volume = soma de (peso x repetições) de todas as séries concluídas.
    /// É a forma mais comum de medir o "quanto" você treinou.
    var volumeTotal: Double {
        exercicios.reduce(0) { $0 + $1.volume }
    }

    /// Maior carga usada no treino inteiro.
    var maiorCarga: Double {
        exercicios.compactMap(\.maiorCarga).max() ?? 0
    }

    var duracao: TimeInterval? {
        guard let fim else { return nil }
        return fim.timeIntervalSince(inicio)
    }
}

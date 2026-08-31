import Foundation
import SwiftData

/// Consultas ao histórico que são usadas em mais de uma tela.
enum HistoricoUtil {

    /// Última vez que você fez esse exercício em um treino já finalizado.
    /// Usamos para sugerir a mesma carga da última vez ao adicionar o exercício.
    static func ultimaExecucao(nome: String, contexto: ModelContext) -> ExercicioDoTreino? {
        let busca = FetchDescriptor<ExercicioDoTreino>(
            predicate: #Predicate<ExercicioDoTreino> { $0.nome == nome }
        )
        let encontrados = (try? contexto.fetch(busca)) ?? []

        return encontrados
            .filter { $0.treino?.fim != nil }
            .sorted { ($0.treino?.inicio ?? .distantPast) > ($1.treino?.inicio ?? .distantPast) }
            .first
    }

    /// Todas as execuções (em treinos finalizados) de um exercício,
    /// da mais antiga para a mais recente. Usado no gráfico de progresso.
    static func execucoes(nome: String, contexto: ModelContext) -> [ExercicioDoTreino] {
        let busca = FetchDescriptor<ExercicioDoTreino>(
            predicate: #Predicate<ExercicioDoTreino> { $0.nome == nome }
        )
        let encontrados = (try? contexto.fetch(busca)) ?? []

        return encontrados
            .filter { $0.treino?.fim != nil && !$0.series.filter(\.concluida).isEmpty }
            .sorted { ($0.treino?.inicio ?? .distantPast) < ($1.treino?.inicio ?? .distantPast) }
    }
}

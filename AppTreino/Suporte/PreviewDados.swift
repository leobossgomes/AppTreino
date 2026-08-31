import Foundation
import SwiftData

/// Banco de dados "de mentirinha", guardado só na memória.
/// Serve para os previews do Xcode (aquele painel que mostra a tela ao lado
/// do código) aparecerem já com treinos de exemplo, sem sujar seus dados reais.
@MainActor
enum PreviewDados {

    /// Container com três treinos já finalizados no histórico.
    static let container: ModelContainer = criarContainer(comTreinoEmAndamento: false)

    /// Container que, além do histórico, tem um treino acontecendo agora.
    static let containerEmAndamento: ModelContainer = criarContainer(comTreinoEmAndamento: true)

    /// O treino em andamento do `containerEmAndamento`.
    static var treinoEmAndamento: Treino {
        let treinos = (try? containerEmAndamento.mainContext.fetch(FetchDescriptor<Treino>())) ?? []
        return treinos.first { $0.emAndamento } ?? Treino(nome: "Treino de hoje")
    }

    /// O treino mais recente do `container` (usado no preview do detalhe).
    static var treinoDoHistorico: Treino {
        let treinos = (try? container.mainContext.fetch(FetchDescriptor<Treino>())) ?? []
        return treinos.sorted { $0.inicio > $1.inicio }.first ?? Treino(nome: "Treino")
    }

    // MARK: - Montagem

    private static func criarContainer(comTreinoEmAndamento: Bool) -> ModelContainer {
        let configuracao = ModelConfiguration(isStoredInMemoryOnly: true)
        let container = try! ModelContainer(
            for: Treino.self, ExercicioDoTreino.self, Serie.self, Exercicio.self,
            configurations: configuracao
        )
        let contexto = container.mainContext

        DadosIniciais.popularSeNecessario(contexto: contexto)

        // Três treinos de exemplo, um por semana, com a carga subindo.
        for semana in 0..<3 {
            let data = Calendar.current.date(byAdding: .day, value: -7 * semana, to: .now) ?? .now
            let treino = Treino(
                nome: "Treino A — Peito e Tríceps",
                inicio: data,
                fim: data.addingTimeInterval(60 * 62)
            )
            contexto.insert(treino)
            adicionar(nome: "Supino reto com barra", grupo: "Peito", ordem: 0,
                      repeticoes: 10, peso: 60 - Double(semana * 5),
                      em: treino, contexto: contexto)
            adicionar(nome: "Tríceps na polia", grupo: "Tríceps", ordem: 1,
                      repeticoes: 12, peso: 30,
                      em: treino, contexto: contexto)
        }

        if comTreinoEmAndamento {
            let agora = Treino(nome: "Treino de hoje", inicio: .now)
            contexto.insert(agora)
            adicionar(nome: "Agachamento livre", grupo: "Pernas", ordem: 0,
                      repeticoes: 8, peso: 80, concluida: false,
                      em: agora, contexto: contexto)
        }

        try? contexto.save()
        return container
    }

    private static func adicionar(nome: String,
                                  grupo: String,
                                  ordem: Int,
                                  repeticoes: Int,
                                  peso: Double,
                                  concluida: Bool = true,
                                  em treino: Treino,
                                  contexto: ModelContext) {
        let exercicio = ExercicioDoTreino(nome: nome, grupoMuscular: grupo, ordem: ordem)
        exercicio.treino = treino
        contexto.insert(exercicio)

        for indice in 0..<3 {
            let serie = Serie(ordem: indice, repeticoes: repeticoes, peso: peso, concluida: concluida)
            serie.exercicio = exercicio
            contexto.insert(serie)
        }
    }
}

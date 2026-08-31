import SwiftUI
import SwiftData

/// Ponto de entrada do app.
///
/// O `@main` diz ao iOS: "comece por aqui".
/// O `.modelContainer` liga o banco de dados (SwiftData) em todas as telas,
/// e é ele que faz seus treinos continuarem salvos depois de fechar o app.
@main
struct AppTreinoApp: App {

    let container: ModelContainer

    init() {
        do {
            container = try ModelContainer(
                for: Treino.self, ExercicioDoTreino.self, Serie.self, Exercicio.self
            )
        } catch {
            fatalError("Não foi possível criar o banco de dados: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .task {
                    // Na primeira execução, cadastra alguns exercícios comuns.
                    DadosIniciais.popularSeNecessario(contexto: container.mainContext)
                }
        }
        .modelContainer(container)
    }
}

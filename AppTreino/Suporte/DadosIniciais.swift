import Foundation
import SwiftData

/// Na primeira vez que o app abre, o catálogo de exercícios está vazio.
/// Aqui criamos alguns exercícios comuns para você já começar usando o app.
/// Você pode apagar ou editar todos eles dentro da aba "Exercícios".
enum DadosIniciais {

    static let exercicios: [(nome: String, grupo: GrupoMuscular)] = [
        ("Supino reto com barra", .peito),
        ("Supino inclinado com halteres", .peito),
        ("Crucifixo na máquina", .peito),
        ("Puxada frontal", .costas),
        ("Remada curvada", .costas),
        ("Remada baixa", .costas),
        ("Agachamento livre", .pernas),
        ("Leg press", .pernas),
        ("Cadeira extensora", .pernas),
        ("Mesa flexora", .pernas),
        ("Panturrilha em pé", .pernas),
        ("Desenvolvimento com halteres", .ombros),
        ("Elevação lateral", .ombros),
        ("Rosca direta", .biceps),
        ("Rosca martelo", .biceps),
        ("Tríceps na polia", .triceps),
        ("Tríceps testa", .triceps),
        ("Prancha abdominal", .abdomen),
        ("Abdominal supra", .abdomen),
        ("Esteira", .cardio)
    ]

    /// Insere os exercícios padrão apenas se o catálogo estiver vazio.
    static func popularSeNecessario(contexto: ModelContext) {
        let busca = FetchDescriptor<Exercicio>()
        let quantidade = (try? contexto.fetchCount(busca)) ?? 0
        guard quantidade == 0 else { return }

        for item in exercicios {
            contexto.insert(Exercicio(nome: item.nome, grupoMuscular: item.grupo.rawValue))
        }
        try? contexto.save()
    }
}

import Foundation

/// Lista fixa de grupos musculares, usada nos menus de seleção.
enum GrupoMuscular: String, CaseIterable, Identifiable {
    case peito = "Peito"
    case costas = "Costas"
    case pernas = "Pernas"
    case ombros = "Ombros"
    case biceps = "Bíceps"
    case triceps = "Tríceps"
    case abdomen = "Abdômen"
    case cardio = "Cardio"
    case outro = "Outro"

    var id: String { rawValue }

    /// Ícone do SF Symbols mostrado ao lado do nome.
    var icone: String {
        switch self {
        case .peito:   return "figure.strengthtraining.traditional"
        case .costas:  return "figure.rower"
        case .pernas:  return "figure.strengthtraining.functional"
        case .ombros:  return "figure.arms.open"
        case .biceps:  return "dumbbell"
        case .triceps: return "dumbbell.fill"
        case .abdomen: return "figure.core.training"
        case .cardio:  return "heart.fill"
        case .outro:   return "square.grid.2x2"
        }
    }

    /// Converte um texto salvo no banco de volta para o enum.
    static func from(_ texto: String) -> GrupoMuscular {
        GrupoMuscular(rawValue: texto) ?? .outro
    }
}

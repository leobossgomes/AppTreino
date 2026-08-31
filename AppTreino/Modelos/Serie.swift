import Foundation
import SwiftData

/// Uma série (set): quantas repetições você fez e com quantos quilos.
@Model
final class Serie {
    var ordem: Int
    var repeticoes: Int
    var peso: Double
    var concluida: Bool

    var exercicio: ExercicioDoTreino?

    init(ordem: Int = 0,
         repeticoes: Int = 10,
         peso: Double = 0,
         concluida: Bool = false) {
        self.ordem = ordem
        self.repeticoes = repeticoes
        self.peso = peso
        self.concluida = concluida
    }

    /// Volume da série: peso x repetições.
    var volume: Double { peso * Double(repeticoes) }
}

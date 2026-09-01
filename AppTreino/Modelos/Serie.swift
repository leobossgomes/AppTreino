import Foundation
import SwiftData

/// Uma série (set): quantas repetições você fez e com quantos quilos.
///
/// No cardio (esteira, bicicleta...) não existe carga: o que vale é o tempo,
/// então a série guarda `minutos` no lugar de peso e repetições.
@Model
final class Serie {
    var ordem: Int
    var repeticoes: Int
    var peso: Double
    var minutos: Int = 0
    var concluida: Bool

    var exercicio: ExercicioDoTreino?

    init(ordem: Int = 0,
         repeticoes: Int = 10,
         peso: Double = 0,
         minutos: Int = 0,
         concluida: Bool = false) {
        self.ordem = ordem
        self.repeticoes = repeticoes
        self.peso = peso
        self.minutos = minutos
        self.concluida = concluida
    }

    /// Volume da série: peso x repetições.
    var volume: Double { peso * Double(repeticoes) }
}

extension Serie {

    static let repeticoesPadrao = 10
    static let minutosPadrao = 20

    /// Cria uma série copiando os valores de uma anterior, quando houver.
    /// No cardio o que se copia é o tempo; nos demais, o peso e as repetições.
    static func nova(ordem: Int, copiando anterior: Serie?, cardio: Bool) -> Serie {
        if cardio {
            let minutos = anterior?.minutos ?? 0
            return Serie(ordem: ordem,
                         repeticoes: 0,
                         peso: 0,
                         minutos: minutos > 0 ? minutos : minutosPadrao)
        }

        return Serie(ordem: ordem,
                     repeticoes: anterior?.repeticoes ?? repeticoesPadrao,
                     peso: anterior?.peso ?? 0)
    }
}

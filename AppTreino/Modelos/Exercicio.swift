import Foundation
import SwiftData

/// Um exercício do seu catálogo pessoal (ex.: "Supino reto", "Agachamento").
/// Serve como um "cardápio" para você montar os treinos mais rápido.
@Model
final class Exercicio {
    var nome: String
    var grupoMuscular: String
    var observacoes: String
    var criadoEm: Date

    init(nome: String,
         grupoMuscular: String,
         observacoes: String = "",
         criadoEm: Date = .now) {
        self.nome = nome
        self.grupoMuscular = grupoMuscular
        self.observacoes = observacoes
        self.criadoEm = criadoEm
    }
}

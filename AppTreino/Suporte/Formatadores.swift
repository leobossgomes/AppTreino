import Foundation

/// Funções de formatação usadas em várias telas.
/// Deixar tudo num lugar só evita repetir código.
enum Formatadores {

    /// 82.5 -> "82,5 kg"   |   80 -> "80 kg"
    static func peso(_ valor: Double) -> String {
        let numero = valor.formatted(.number.precision(.fractionLength(0...1)))
        return "\(numero) kg"
    }

    /// 12500 -> "12.500 kg"
    static func volume(_ valor: Double) -> String {
        let numero = valor.formatted(.number.precision(.fractionLength(0)))
        return "\(numero) kg"
    }

    /// 25 -> "25 min"   |   90 -> "1h 30min" — usado no cardio
    static func minutos(_ valor: Int) -> String {
        let total = max(0, valor)
        let horas = total / 60
        let restantes = total % 60
        if horas > 0 {
            return String(format: "%dh %02dmin", horas, restantes)
        }
        return "\(total) min"
    }

    /// 3900 segundos -> "1h 05min"
    static func duracao(_ segundos: TimeInterval) -> String {
        let total = Int(segundos)
        let horas = total / 3600
        let minutos = (total % 3600) / 60
        if horas > 0 {
            return String(format: "%dh %02dmin", horas, minutos)
        }
        return "\(minutos)min"
    }

    /// "quinta-feira, 14 de março"
    static func dataLonga(_ data: Date) -> String {
        data.formatted(.dateTime.weekday(.wide).day().month(.wide).locale(Locale(identifier: "pt_BR")))
    }

    /// "14/03/2026 • 19:30"
    static func dataHora(_ data: Date) -> String {
        let dia = data.formatted(.dateTime.day().month(.twoDigits).year())
        let hora = data.formatted(.dateTime.hour().minute())
        return "\(dia) • \(hora)"
    }

    /// "março de 2026" — usado para agrupar o histórico por mês.
    static func mesAno(_ data: Date) -> String {
        data.formatted(.dateTime.month(.wide).year().locale(Locale(identifier: "pt_BR")))
    }

    /// Nome sugerido para um treino novo: "Treino de quinta".
    static func nomeSugerido(para data: Date = .now) -> String {
        let diaDaSemana = data.formatted(.dateTime.weekday(.wide).locale(Locale(identifier: "pt_BR")))
        let semSufixo = diaDaSemana
            .replacingOccurrences(of: "-feira", with: "")
            .capitalized
        return "Treino de \(semSufixo)"
    }
}

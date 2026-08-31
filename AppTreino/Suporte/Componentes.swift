import SwiftUI

/// Um número grande com uma legenda pequena embaixo. Ex.: "12" / "séries".
struct EstatisticaCompacta: View {
    let valor: String
    let legenda: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(valor)
                .font(.headline)
                .monospacedDigit()
            Text(legenda)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
    }
}

/// Cartão de estatística usado na aba Progresso.
struct CartaoEstatistica: View {
    let titulo: String
    let valor: String
    let icone: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(titulo, systemImage: icone)
                .font(.caption)
                .foregroundStyle(.secondary)
                .labelStyle(.titleAndIcon)

            Text(valor)
                .font(.title3.bold())
                .monospacedDigit()
                .minimumScaleFactor(0.7)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 14))
    }
}

/// Mensagem centralizada para quando ainda não há nada para mostrar.
struct EstadoVazio: View {
    let icone: String
    let titulo: String
    let mensagem: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icone)
                .font(.system(size: 44))
                .foregroundStyle(.secondary)
            Text(titulo)
                .font(.headline)
            Text(mensagem)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}

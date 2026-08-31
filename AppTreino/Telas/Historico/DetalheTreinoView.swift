import SwiftUI
import SwiftData

/// Detalhe de um treino do histórico: tudo o que foi feito naquele dia.
struct DetalheTreinoView: View {
    @Environment(\.modelContext) private var contexto
    @Bindable var treino: Treino

    var body: some View {
        List {
            Section {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    CartaoEstatistica(
                        titulo: "Exercícios",
                        valor: "\(treino.totalExercicios)",
                        icone: "dumbbell"
                    )
                    CartaoEstatistica(
                        titulo: "Séries",
                        valor: "\(treino.totalSeriesConcluidas)",
                        icone: "repeat"
                    )
                    CartaoEstatistica(
                        titulo: "Repetições",
                        valor: "\(treino.totalRepeticoes)",
                        icone: "figure.run"
                    )
                    CartaoEstatistica(
                        titulo: "Volume total",
                        valor: Formatadores.volume(treino.volumeTotal),
                        icone: "scalemass"
                    )
                }
                .listRowInsets(EdgeInsets(top: 8, leading: 12, bottom: 8, trailing: 12))
                .listRowBackground(Color.clear)
            } header: {
                VStack(alignment: .leading, spacing: 4) {
                    Text(Formatadores.dataLonga(treino.inicio).capitalized)
                        .font(.subheadline.bold())
                        .textCase(nil)
                    if let duracao = treino.duracao {
                        Text("Duração: \(Formatadores.duracao(duracao))")
                            .font(.caption)
                            .textCase(nil)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            ForEach(treino.exerciciosOrdenados) { exercicio in
                Section {
                    ForEach(Array(exercicio.seriesOrdenadas.enumerated()), id: \.element.id) { indice, serie in
                        HStack {
                            Text("Série \(indice + 1)")
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text("\(Formatadores.peso(serie.peso)) × \(serie.repeticoes)")
                                .monospacedDigit()
                            if !serie.concluida {
                                // Série que ficou anotada mas não foi marcada como feita.
                                Image(systemName: "minus.circle")
                                    .foregroundStyle(.tertiary)
                            }
                        }
                        .font(.subheadline)
                        .foregroundStyle(serie.concluida ? Color.primary : Color.secondary)
                    }
                } header: {
                    HStack {
                        Text(exercicio.nome).textCase(nil)
                        Spacer()
                        if let maior = exercicio.maiorCarga, maior > 0 {
                            Text("máx \(Formatadores.peso(maior))")
                                .textCase(nil)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .font(.subheadline.bold())
                }
            }

            Section("Anotações") {
                TextField("Como foi o treino? (opcional)", text: $treino.notas, axis: .vertical)
                    .lineLimit(3...6)
            }
        }
        .navigationTitle(treino.nome)
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        DetalheTreinoView(treino: PreviewDados.treinoDoHistorico)
    }
    .modelContainer(PreviewDados.container)
}

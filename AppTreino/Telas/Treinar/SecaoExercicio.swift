import SwiftUI
import SwiftData

/// Um exercício dentro do treino em andamento, com a lista de séries.
struct SecaoExercicio: View {
    @Environment(\.modelContext) private var contexto
    @Bindable var exercicio: ExercicioDoTreino
    let aoRemover: () -> Void

    /// Cardio se anota em minutos; o resto, em peso × repetições.
    private var ehCardio: Bool { exercicio.ehCardio }

    var body: some View {
        Section {
            // Cabeçalho das colunas, para não ficar dúvida do que é cada campo.
            HStack {
                Text("SÉRIE").frame(width: 44, alignment: .leading)
                if ehCardio {
                    Text("MINUTOS").frame(maxWidth: .infinity, alignment: .leading)
                } else {
                    Text("PESO (KG)").frame(maxWidth: .infinity, alignment: .leading)
                    Text("REPS").frame(width: 64, alignment: .leading)
                }
                Text("OK").frame(width: 32, alignment: .center)
            }
            .font(.caption2.weight(.semibold))
            .foregroundStyle(.secondary)

            ForEach(Array(exercicio.seriesOrdenadas.enumerated()), id: \.element.id) { indice, serie in
                LinhaSerie(numero: indice + 1, serie: serie, cardio: ehCardio)
            }
            .onDelete(perform: apagarSeries)

            Button {
                adicionarSerie()
            } label: {
                Label(ehCardio ? "Adicionar tempo" : "Adicionar série", systemImage: "plus")
                    .font(.subheadline)
            }
        } header: {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(exercicio.nome)
                        .font(.subheadline.bold())
                        .textCase(nil)
                    if !exercicio.grupoMuscular.isEmpty {
                        Text(exercicio.grupoMuscular)
                            .font(.caption2)
                            .textCase(nil)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                Menu {
                    Button(role: .destructive) {
                        aoRemover()
                    } label: {
                        Label("Remover exercício", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .font(.body)
                }
            }
        } footer: {
            if ehCardio {
                if exercicio.minutosConcluidos > 0 {
                    Text("\(Formatadores.minutos(exercicio.minutosConcluidos)) de cardio")
                }
            } else if exercicio.volume > 0 {
                Text("\(exercicio.seriesConcluidas) séries concluídas • volume \(Formatadores.volume(exercicio.volume))")
            }
        }
    }

    // MARK: - Ações

    /// A nova série já vem preenchida com os valores da série anterior
    /// (o tempo, no cardio), que é quase sempre o que a gente quer na academia.
    private func adicionarSerie() {
        let nova = Serie.nova(
            ordem: exercicio.proximaOrdem,
            copiando: exercicio.seriesOrdenadas.last,
            cardio: ehCardio
        )
        nova.exercicio = exercicio
        contexto.insert(nova)
        try? contexto.save()
    }

    private func apagarSeries(_ indices: IndexSet) {
        let ordenadas = exercicio.seriesOrdenadas
        for indice in indices where ordenadas.indices.contains(indice) {
            contexto.delete(ordenadas[indice])
        }
        try? contexto.save()
    }
}

/// Uma linha de série: peso e repetições (ou os minutos, no cardio)
/// e o botão de "feito".
struct LinhaSerie: View {
    let numero: Int
    @Bindable var serie: Serie
    let cardio: Bool

    var body: some View {
        HStack(spacing: 8) {
            Text("\(numero)")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.secondary)
                .frame(width: 44, alignment: .leading)

            if cardio {
                TextField("0", value: $serie.minutos, format: .number)
                    .keyboardType(.numberPad)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                TextField("0", value: $serie.peso, format: .number)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)

                TextField("0", value: $serie.repeticoes, format: .number)
                    .keyboardType(.numberPad)
                    .frame(width: 64, alignment: .leading)
            }

            Button {
                serie.concluida.toggle()
            } label: {
                Image(systemName: serie.concluida ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(serie.concluida ? Color.green : Color.secondary)
            }
            .buttonStyle(.plain)
            .frame(width: 32, alignment: .center)
        }
        .monospacedDigit()
    }
}

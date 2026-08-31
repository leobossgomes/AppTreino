import SwiftUI
import SwiftData

/// Tela do treino que está acontecendo agora.
/// Aqui você adiciona exercícios, séries, e vai marcando o que já fez.
struct TreinoEmAndamentoView: View {
    @Environment(\.modelContext) private var contexto

    // @Bindable permite editar direto os campos do objeto salvo no banco.
    @Bindable var treino: Treino

    @State private var mostrarSeletorDeExercicio = false
    @State private var confirmarFinalizar = false
    @State private var confirmarDescartar = false

    var body: some View {
        List {
            secaoCabecalho

            ForEach(treino.exerciciosOrdenados) { exercicio in
                SecaoExercicio(exercicio: exercicio, aoRemover: { remover(exercicio) })
            }

            Section {
                Button {
                    mostrarSeletorDeExercicio = true
                } label: {
                    Label("Adicionar exercício", systemImage: "plus.circle.fill")
                }
            }

            Section {
                Button {
                    confirmarFinalizar = true
                } label: {
                    Label("Finalizar treino", systemImage: "checkmark.circle.fill")
                        .frame(maxWidth: .infinity)
                }
                .disabled(treino.exercicios.isEmpty)

                Button(role: .destructive) {
                    confirmarDescartar = true
                } label: {
                    Label("Descartar treino", systemImage: "trash")
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .sheet(isPresented: $mostrarSeletorDeExercicio) {
            SelecionarExercicioView { nome, grupo in
                adicionarExercicio(nome: nome, grupo: grupo)
            }
        }
        .confirmationDialog("Finalizar treino?", isPresented: $confirmarFinalizar, titleVisibility: .visible) {
            Button("Finalizar") { finalizar() }
            Button("Continuar treinando", role: .cancel) { }
        } message: {
            Text("O treino vai para o histórico. Só as séries marcadas como concluídas entram nas estatísticas.")
        }
        .confirmationDialog("Descartar este treino?", isPresented: $confirmarDescartar, titleVisibility: .visible) {
            Button("Descartar", role: .destructive) { descartar() }
            Button("Cancelar", role: .cancel) { }
        } message: {
            Text("Tudo o que você anotou neste treino será apagado. Não dá para desfazer.")
        }
    }

    // MARK: - Cabeçalho com nome, cronômetro e resumo

    private var secaoCabecalho: some View {
        Section {
            TextField("Nome do treino", text: $treino.nome)
                .font(.headline)

            HStack {
                Label {
                    Text(treino.inicio, style: .timer)
                        .monospacedDigit()
                } icon: {
                    Image(systemName: "stopwatch")
                }
                .foregroundStyle(.tint)

                Spacer()

                Text("\(treino.totalExercicios) exercícios • \(treino.totalSeriesConcluidas) séries")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            if treino.volumeTotal > 0 {
                HStack {
                    Text("Volume até agora")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text(Formatadores.volume(treino.volumeTotal))
                        .font(.footnote.weight(.semibold))
                        .monospacedDigit()
                }
            }
        }
    }

    // MARK: - Ações

    private func adicionarExercicio(nome: String, grupo: String) {
        let novo = ExercicioDoTreino(
            nome: nome,
            grupoMuscular: grupo,
            ordem: (treino.exercicios.map(\.ordem).max() ?? -1) + 1
        )
        novo.treino = treino
        contexto.insert(novo)

        // Já cria as séries com a carga da última vez que você fez esse exercício.
        if let anterior = HistoricoUtil.ultimaExecucao(nome: nome, contexto: contexto) {
            for (indice, serieAntiga) in anterior.seriesOrdenadas.enumerated() {
                let serie = Serie(
                    ordem: indice,
                    repeticoes: serieAntiga.repeticoes,
                    peso: serieAntiga.peso,
                    concluida: false
                )
                serie.exercicio = novo
                contexto.insert(serie)
            }
        } else {
            let serie = Serie(ordem: 0, repeticoes: 10, peso: 0, concluida: false)
            serie.exercicio = novo
            contexto.insert(serie)
        }

        try? contexto.save()
    }

    private func remover(_ exercicio: ExercicioDoTreino) {
        contexto.delete(exercicio)
        try? contexto.save()
    }

    private func finalizar() {
        treino.fim = .now
        try? contexto.save()
    }

    private func descartar() {
        contexto.delete(treino)
        try? contexto.save()
    }
}

#Preview {
    NavigationStack {
        TreinoEmAndamentoView(treino: PreviewDados.treinoEmAndamento)
    }
    .modelContainer(PreviewDados.containerEmAndamento)
}

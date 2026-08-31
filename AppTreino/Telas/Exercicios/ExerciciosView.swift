import SwiftUI
import SwiftData

/// Aba "Exercícios": o seu catálogo pessoal.
/// Tudo o que estiver aqui aparece na hora de montar um treino.
struct ExerciciosView: View {
    @Environment(\.modelContext) private var contexto
    @Query(sort: \Exercicio.nome) private var exercicios: [Exercicio]

    @State private var busca = ""
    @State private var mostrarNovo = false
    @State private var emEdicao: Exercicio?

    private var filtrados: [Exercicio] {
        guard !busca.trimmingCharacters(in: .whitespaces).isEmpty else { return exercicios }
        return exercicios.filter {
            $0.nome.localizedStandardContains(busca) ||
            $0.grupoMuscular.localizedStandardContains(busca)
        }
    }

    private var porGrupo: [(grupo: String, itens: [Exercicio])] {
        Dictionary(grouping: filtrados, by: \.grupoMuscular)
            .map { (grupo: $0.key, itens: $0.value.sorted { $0.nome < $1.nome }) }
            .sorted { $0.grupo < $1.grupo }
    }

    var body: some View {
        NavigationStack {
            Group {
                if exercicios.isEmpty {
                    EstadoVazio(
                        icone: "list.bullet.rectangle",
                        titulo: "Nenhum exercício",
                        mensagem: "Toque em + para cadastrar os exercícios que você faz na academia."
                    )
                } else {
                    List {
                        ForEach(porGrupo, id: \.grupo) { secao in
                            Section {
                                ForEach(secao.itens) { exercicio in
                                    Button {
                                        emEdicao = exercicio
                                    } label: {
                                        linha(exercicio)
                                    }
                                    .buttonStyle(.plain)
                                }
                                .onDelete { indices in
                                    apagar(indices, de: secao.itens)
                                }
                            } header: {
                                Label(secao.grupo, systemImage: GrupoMuscular.from(secao.grupo).icone)
                            }
                        }
                    }
                    .searchable(text: $busca, prompt: "Buscar exercício")
                }
            }
            .navigationTitle("Exercícios")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        mostrarNovo = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $mostrarNovo) {
                EditarExercicioView()
            }
            .sheet(item: $emEdicao) { exercicio in
                EditarExercicioView(exercicio: exercicio)
            }
        }
    }

    private func linha(_ exercicio: Exercicio) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(exercicio.nome)
            if !exercicio.observacoes.isEmpty {
                Text(exercicio.observacoes)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .contentShape(Rectangle())
    }

    /// Apagar aqui remove só do catálogo — os treinos antigos continuam
    /// no histórico, porque eles guardam o nome do exercício por conta própria.
    private func apagar(_ indices: IndexSet, de itens: [Exercicio]) {
        for indice in indices where itens.indices.contains(indice) {
            contexto.delete(itens[indice])
        }
        try? contexto.save()
    }
}

#Preview {
    ExerciciosView()
        .modelContainer(PreviewDados.container)
}

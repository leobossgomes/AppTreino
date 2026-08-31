import SwiftUI
import SwiftData

/// Folha (sheet) para escolher um exercício do catálogo
/// ou cadastrar um novo na hora.
struct SelecionarExercicioView: View {
    @Environment(\.modelContext) private var contexto
    @Environment(\.dismiss) private var fechar

    @Query(sort: \Exercicio.nome) private var exercicios: [Exercicio]

    @State private var busca = ""
    @State private var mostrarNovoExercicio = false

    /// Chamado quando o usuário escolhe um exercício: devolve nome e grupo.
    let aoEscolher: (String, String) -> Void

    private var filtrados: [Exercicio] {
        guard !busca.trimmingCharacters(in: .whitespaces).isEmpty else { return exercicios }
        return exercicios.filter { $0.nome.localizedStandardContains(busca) }
    }

    /// Agrupa por grupo muscular para a lista ficar organizada.
    private var porGrupo: [(grupo: String, itens: [Exercicio])] {
        Dictionary(grouping: filtrados, by: \.grupoMuscular)
            .map { (grupo: $0.key, itens: $0.value.sorted { $0.nome < $1.nome }) }
            .sorted { $0.grupo < $1.grupo }
    }

    var body: some View {
        NavigationStack {
            List {
                if filtrados.isEmpty {
                    Section {
                        Button {
                            mostrarNovoExercicio = true
                        } label: {
                            Label(
                                busca.isEmpty ? "Cadastrar exercício" : "Criar \"\(busca)\"",
                                systemImage: "plus.circle.fill"
                            )
                        }
                    }
                }

                ForEach(porGrupo, id: \.grupo) { secao in
                    Section(secao.grupo) {
                        ForEach(secao.itens) { exercicio in
                            Button {
                                aoEscolher(exercicio.nome, exercicio.grupoMuscular)
                                fechar()
                            } label: {
                                HStack {
                                    Image(systemName: GrupoMuscular.from(exercicio.grupoMuscular).icone)
                                        .foregroundStyle(.tint)
                                        .frame(width: 28)
                                    Text(exercicio.nome)
                                        .foregroundStyle(.primary)
                                    Spacer()
                                }
                            }
                        }
                    }
                }
            }
            .searchable(text: $busca, prompt: "Buscar exercício")
            .navigationTitle("Escolher exercício")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { fechar() }
                }
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        mostrarNovoExercicio = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $mostrarNovoExercicio) {
                EditarExercicioView(nomeInicial: busca) { exercicio in
                    // Depois de cadastrar, já adiciona no treino.
                    aoEscolher(exercicio.nome, exercicio.grupoMuscular)
                    fechar()
                }
            }
        }
    }
}

#Preview {
    SelecionarExercicioView { _, _ in }
        .modelContainer(PreviewDados.container)
}

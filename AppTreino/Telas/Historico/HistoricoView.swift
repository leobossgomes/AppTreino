import SwiftUI
import SwiftData

/// Aba "Histórico": todos os treinos que você já finalizou,
/// agrupados por mês, do mais recente para o mais antigo.
struct HistoricoView: View {
    @Environment(\.modelContext) private var contexto
    @Query(sort: \Treino.inicio, order: .reverse) private var treinos: [Treino]

    @State private var busca = ""

    private var finalizados: [Treino] {
        let base = treinos.filter { !$0.emAndamento }
        guard !busca.trimmingCharacters(in: .whitespaces).isEmpty else { return base }
        return base.filter { treino in
            treino.nome.localizedStandardContains(busca) ||
            treino.exercicios.contains { $0.nome.localizedStandardContains(busca) }
        }
    }

    /// Agrupa por "mês de ano" mantendo a ordem decrescente.
    private var porMes: [(mes: String, treinos: [Treino])] {
        var ordem: [String] = []
        var mapa: [String: [Treino]] = [:]

        for treino in finalizados {
            let chave = Formatadores.mesAno(treino.inicio)
            if mapa[chave] == nil {
                mapa[chave] = []
                ordem.append(chave)
            }
            mapa[chave]?.append(treino)
        }

        return ordem.map { (mes: $0, treinos: mapa[$0] ?? []) }
    }

    var body: some View {
        NavigationStack {
            Group {
                if finalizados.isEmpty {
                    EstadoVazio(
                        icone: "calendar.badge.clock",
                        titulo: busca.isEmpty ? "Sem treinos ainda" : "Nada encontrado",
                        mensagem: busca.isEmpty
                            ? "Quando você finalizar um treino na aba Treinar, ele aparece aqui."
                            : "Nenhum treino com esse nome ou exercício."
                    )
                } else {
                    List {
                        ForEach(porMes, id: \.mes) { secao in
                            Section {
                                ForEach(secao.treinos) { treino in
                                    NavigationLink {
                                        DetalheTreinoView(treino: treino)
                                    } label: {
                                        LinhaTreino(treino: treino)
                                    }
                                }
                                .onDelete { indices in
                                    apagar(indices, de: secao.treinos)
                                }
                            } header: {
                                Text(secao.mes.capitalized)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Histórico")
            .searchable(text: $busca, prompt: "Buscar treino ou exercício")
        }
    }

    private func apagar(_ indices: IndexSet, de lista: [Treino]) {
        for indice in indices where lista.indices.contains(indice) {
            contexto.delete(lista[indice])
        }
        try? contexto.save()
    }
}

/// Uma linha da lista do histórico.
struct LinhaTreino: View {
    let treino: Treino

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(treino.nome)
                .font(.headline)

            Text(Formatadores.dataHora(treino.inicio))
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack(spacing: 16) {
                Label("\(treino.totalExercicios)", systemImage: "dumbbell")
                Label("\(treino.totalSeriesConcluidas)", systemImage: "repeat")
                Label(Formatadores.volume(treino.volumeTotal), systemImage: "scalemass")
                if let duracao = treino.duracao {
                    Label(Formatadores.duracao(duracao), systemImage: "clock")
                }
            }
            .font(.caption2)
            .foregroundStyle(.secondary)
            .monospacedDigit()
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    HistoricoView()
        .modelContainer(PreviewDados.container)
}

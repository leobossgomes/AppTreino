import SwiftUI
import SwiftData

/// Aba "Treinar".
///
/// Se existe um treino em andamento (sem data de fim), mostra a tela de
/// execução. Se não existe, mostra a tela para começar um treino novo.
struct TreinarView: View {
    @Environment(\.modelContext) private var contexto

    // O @Query lê o banco de dados e mantém a tela sempre atualizada sozinha.
    @Query(sort: \Treino.inicio, order: .reverse) private var treinos: [Treino]

    private var treinoAtivo: Treino? {
        treinos.first { $0.emAndamento }
    }

    private var ultimoFinalizado: Treino? {
        treinos.first { !$0.emAndamento }
    }

    var body: some View {
        NavigationStack {
            Group {
                if let treinoAtivo {
                    TreinoEmAndamentoView(treino: treinoAtivo)
                } else {
                    inicio
                }
            }
            .navigationTitle(treinoAtivo == nil ? "Treinar" : "Em andamento")
        }
    }

    // MARK: - Tela de "começar treino"

    private var inicio: some View {
        ScrollView {
            VStack(spacing: 24) {
                Image(systemName: "figure.strengthtraining.traditional")
                    .font(.system(size: 64))
                    .foregroundStyle(.tint)
                    .padding(.top, 48)

                VStack(spacing: 6) {
                    Text("Bora treinar?")
                        .font(.title2.bold())
                    Text("Comece um treino e vá anotando as séries, as repetições e o peso de cada exercício.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }

                Button {
                    iniciarTreino(copiandoDe: nil)
                } label: {
                    Label("Iniciar treino", systemImage: "play.fill")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 6)
                }
                .buttonStyle(.borderedProminent)
                .padding(.horizontal, 24)

                if let ultimoFinalizado {
                    Button {
                        iniciarTreino(copiandoDe: ultimoFinalizado)
                    } label: {
                        Label("Repetir: \(ultimoFinalizado.nome)", systemImage: "arrow.clockwise")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                    }
                    .buttonStyle(.bordered)
                    .padding(.horizontal, 24)

                    ResumoUltimoTreinoCard(treino: ultimoFinalizado)
                        .padding(.horizontal, 20)
                        .padding(.top, 8)
                }

                Spacer(minLength: 40)
            }
        }
    }

    // MARK: - Ações

    /// Cria um treino novo. Se receber um treino antigo, copia a lista de
    /// exercícios e as cargas dele (as séries entram desmarcadas).
    private func iniciarTreino(copiandoDe modelo: Treino?) {
        let novo = Treino(nome: modelo?.nome ?? Formatadores.nomeSugerido())
        contexto.insert(novo)

        if let modelo {
            for exercicioAntigo in modelo.exerciciosOrdenados {
                let copia = ExercicioDoTreino(
                    nome: exercicioAntigo.nome,
                    grupoMuscular: exercicioAntigo.grupoMuscular,
                    ordem: exercicioAntigo.ordem
                )
                copia.treino = novo
                contexto.insert(copia)

                for serieAntiga in exercicioAntigo.seriesOrdenadas {
                    let novaSerie = Serie(
                        ordem: serieAntiga.ordem,
                        repeticoes: serieAntiga.repeticoes,
                        peso: serieAntiga.peso,
                        concluida: false
                    )
                    novaSerie.exercicio = copia
                    contexto.insert(novaSerie)
                }
            }
        }

        try? contexto.save()
    }
}

/// Cartãozinho com o resumo do último treino finalizado.
private struct ResumoUltimoTreinoCard: View {
    let treino: Treino

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Último treino")
                .font(.caption.bold())
                .foregroundStyle(.secondary)

            Text(Formatadores.dataHora(treino.inicio))
                .font(.subheadline.weight(.semibold))

            HStack(spacing: 20) {
                EstatisticaCompacta(valor: "\(treino.totalExercicios)", legenda: "exercícios")
                EstatisticaCompacta(valor: "\(treino.totalSeriesConcluidas)", legenda: "séries")
                EstatisticaCompacta(valor: Formatadores.volume(treino.volumeTotal), legenda: "volume")
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 14))
    }
}

#Preview {
    TreinarView()
        .modelContainer(PreviewDados.container)
}

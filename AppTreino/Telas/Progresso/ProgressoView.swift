import SwiftUI
import SwiftData
import Charts

/// Aba "Progresso": números gerais, gráfico de evolução por exercício
/// e a lista dos seus recordes de carga.
struct ProgressoView: View {
    @Query(sort: \Treino.inicio, order: .reverse) private var treinos: [Treino]

    @State private var exercicioSelecionado: String?
    @State private var metrica: Metrica = .carga

    enum Metrica: String, CaseIterable, Identifiable {
        case carga = "Carga máxima"
        case volume = "Volume"
        var id: String { rawValue }
    }

    private var finalizados: [Treino] {
        treinos.filter { !$0.emAndamento }
    }

    /// Todos os exercícios já treinados, sem repetir, em ordem alfabética.
    private var nomesDeExercicios: [String] {
        let nomes = finalizados.flatMap { $0.exercicios.map(\.nome) }
        return Array(Set(nomes)).sorted()
    }

    private var nomeAtual: String? {
        exercicioSelecionado ?? nomesDeExercicios.first
    }

    /// Um ponto por treino em que o exercício selecionado apareceu.
    private var pontos: [PontoProgresso] {
        guard let nomeAtual else { return [] }

        return finalizados
            .compactMap { treino -> PontoProgresso? in
                guard let exercicio = treino.exercicios.first(where: { $0.nome == nomeAtual }),
                      let maior = exercicio.maiorCarga else { return nil }
                return PontoProgresso(
                    data: treino.inicio,
                    carga: maior,
                    volume: exercicio.volume
                )
            }
            .sorted { $0.data < $1.data }
    }

    /// Maior carga já levantada em cada exercício.
    private var recordes: [Recorde] {
        var melhores: [String: Recorde] = [:]

        for treino in finalizados {
            for exercicio in treino.exercicios {
                guard let maior = exercicio.maiorCarga, maior > 0 else { continue }
                if let atual = melhores[exercicio.nome], atual.peso >= maior { continue }
                melhores[exercicio.nome] = Recorde(
                    nome: exercicio.nome,
                    peso: maior,
                    data: treino.inicio
                )
            }
        }

        return melhores.values.sorted { $0.peso > $1.peso }
    }

    private var treinosNoMes: Int {
        let calendario = Calendar.current
        return finalizados.filter { calendario.isDate($0.inicio, equalTo: .now, toGranularity: .month) }.count
    }

    var body: some View {
        NavigationStack {
            Group {
                if finalizados.isEmpty {
                    EstadoVazio(
                        icone: "chart.line.uptrend.xyaxis",
                        titulo: "Sem dados ainda",
                        mensagem: "Finalize alguns treinos e volte aqui para ver sua evolução."
                    )
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            resumo
                            grafico
                            listaDeRecordes
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                    }
                }
            }
            .navigationTitle("Progresso")
        }
    }

    // MARK: - Blocos da tela

    private var resumo: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
            CartaoEstatistica(
                titulo: "Treinos",
                valor: "\(finalizados.count)",
                icone: "checkmark.seal"
            )
            CartaoEstatistica(
                titulo: "Neste mês",
                valor: "\(treinosNoMes)",
                icone: "calendar"
            )
            CartaoEstatistica(
                titulo: "Séries feitas",
                valor: "\(finalizados.reduce(0) { $0 + $1.totalSeriesConcluidas })",
                icone: "repeat"
            )
            CartaoEstatistica(
                titulo: "Volume total",
                valor: Formatadores.volume(finalizados.reduce(0) { $0 + $1.volumeTotal }),
                icone: "scalemass"
            )
        }
    }

    @ViewBuilder
    private var grafico: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Evolução")
                    .font(.headline)
                Spacer()
                Menu {
                    ForEach(nomesDeExercicios, id: \.self) { nome in
                        Button(nome) { exercicioSelecionado = nome }
                    }
                } label: {
                    HStack(spacing: 4) {
                        Text(nomeAtual ?? "Escolher")
                            .lineLimit(1)
                        Image(systemName: "chevron.up.chevron.down")
                            .font(.caption2)
                    }
                    .font(.subheadline)
                }
            }

            Picker("Métrica", selection: $metrica) {
                ForEach(Metrica.allCases) { item in
                    Text(item.rawValue).tag(item)
                }
            }
            .pickerStyle(.segmented)

            if pontos.count < 2 {
                Text("Faça esse exercício em pelo menos dois treinos para ver o gráfico.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, minHeight: 120)
            } else {
                Chart(pontos) { ponto in
                    LineMark(
                        x: .value("Data", ponto.data),
                        y: .value(metrica.rawValue, valor(de: ponto))
                    )
                    .interpolationMethod(.catmullRom)
                    .lineStyle(StrokeStyle(lineWidth: 2.5))

                    PointMark(
                        x: .value("Data", ponto.data),
                        y: .value(metrica.rawValue, valor(de: ponto))
                    )
                    .symbolSize(60)
                }
                .chartYAxis {
                    AxisMarks(position: .leading)
                }
                .frame(height: 200)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 14))
    }

    private var listaDeRecordes: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recordes de carga")
                .font(.headline)

            ForEach(recordes) { recorde in
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(recorde.nome)
                            .font(.subheadline)
                        Text(Formatadores.dataHora(recorde.data))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Text(Formatadores.peso(recorde.peso))
                        .font(.subheadline.bold())
                        .monospacedDigit()
                }
                if recorde.id != recordes.last?.id {
                    Divider()
                }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 14))
    }

    private func valor(de ponto: PontoProgresso) -> Double {
        switch metrica {
        case .carga:  return ponto.carga
        case .volume: return ponto.volume
        }
    }
}

/// Um ponto do gráfico de evolução.
struct PontoProgresso: Identifiable {
    let id = UUID()
    let data: Date
    let carga: Double
    let volume: Double
}

/// Maior carga já usada em um exercício.
struct Recorde: Identifiable {
    var id: String { nome }
    let nome: String
    let peso: Double
    let data: Date
}

#Preview {
    ProgressoView()
        .modelContainer(PreviewDados.container)
}

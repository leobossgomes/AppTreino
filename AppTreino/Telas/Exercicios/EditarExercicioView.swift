import SwiftUI
import SwiftData

/// Formulário para cadastrar um exercício novo ou editar um existente.
struct EditarExercicioView: View {
    @Environment(\.modelContext) private var contexto
    @Environment(\.dismiss) private var fechar

    /// Se vier preenchido, estamos editando. Se for `nil`, estamos criando.
    private let exercicioExistente: Exercicio?
    private let aoSalvar: ((Exercicio) -> Void)?

    @State private var nome: String
    @State private var grupo: GrupoMuscular
    @State private var observacoes: String

    init(nomeInicial: String = "",
         exercicio: Exercicio? = nil,
         aoSalvar: ((Exercicio) -> Void)? = nil) {
        self.exercicioExistente = exercicio
        self.aoSalvar = aoSalvar
        _nome = State(initialValue: exercicio?.nome ?? nomeInicial)
        _grupo = State(initialValue: GrupoMuscular.from(exercicio?.grupoMuscular ?? ""))
        _observacoes = State(initialValue: exercicio?.observacoes ?? "")
    }

    private var nomeValido: Bool {
        !nome.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Exercício") {
                    TextField("Nome (ex.: Supino reto)", text: $nome)

                    Picker("Grupo muscular", selection: $grupo) {
                        ForEach(GrupoMuscular.allCases) { item in
                            Label(item.rawValue, systemImage: item.icone).tag(item)
                        }
                    }
                }

                Section("Observações (opcional)") {
                    TextField("Ex.: pegada fechada, banco no 3º furo", text: $observacoes, axis: .vertical)
                        .lineLimit(2...4)
                }
            }
            .navigationTitle(exercicioExistente == nil ? "Novo exercício" : "Editar exercício")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { fechar() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") { salvar() }
                        .disabled(!nomeValido)
                }
            }
        }
    }

    private func salvar() {
        let nomeLimpo = nome.trimmingCharacters(in: .whitespacesAndNewlines)
        let observacoesLimpas = observacoes.trimmingCharacters(in: .whitespacesAndNewlines)

        let exercicio: Exercicio
        if let exercicioExistente {
            exercicioExistente.nome = nomeLimpo
            exercicioExistente.grupoMuscular = grupo.rawValue
            exercicioExistente.observacoes = observacoesLimpas
            exercicio = exercicioExistente
        } else {
            let novo = Exercicio(
                nome: nomeLimpo,
                grupoMuscular: grupo.rawValue,
                observacoes: observacoesLimpas
            )
            contexto.insert(novo)
            exercicio = novo
        }

        try? contexto.save()
        fechar()
        aoSalvar?(exercicio)
    }
}

#Preview {
    EditarExercicioView()
        .modelContainer(PreviewDados.container)
}

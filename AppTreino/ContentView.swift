import SwiftUI

/// A "casca" do app: as 4 abas da barra inferior.
struct ContentView: View {
    var body: some View {
        TabView {
            TreinarView()
                .tabItem {
                    Label("Treinar", systemImage: "figure.strengthtraining.traditional")
                }

            HistoricoView()
                .tabItem {
                    Label("Histórico", systemImage: "calendar")
                }

            ExerciciosView()
                .tabItem {
                    Label("Exercícios", systemImage: "list.bullet")
                }

            ProgressoView()
                .tabItem {
                    Label("Progresso", systemImage: "chart.line.uptrend.xyaxis")
                }
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(PreviewDados.container)
}

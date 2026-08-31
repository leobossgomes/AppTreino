# AppTreino 🏋️

App de iPhone para registrar seus treinos de academia: quais exercícios você fez,
quantas séries, quantas repetições, quanto peso — e todo o histórico salvo no aparelho.

> Feito em **SwiftUI + SwiftData**, que são as ferramentas oficiais da Apple.
> Não precisa de internet, não precisa de conta, não precisa de servidor.
> Tudo fica salvo no seu iPhone.

---

## 📱 O que o app faz

| Aba | Para que serve |
|---|---|
| **Treinar** | Começa um treino e vai anotando série por série (peso + repetições). Tem cronômetro e botão de "repetir o último treino". |
| **Histórico** | Todos os treinos finalizados, agrupados por mês. Toque em um para ver tudo o que foi feito naquele dia. |
| **Exercícios** | Seu catálogo pessoal de exercícios (já vem com 20 cadastrados). Você pode adicionar, editar e apagar. |
| **Progresso** | Números gerais (treinos, séries, volume), gráfico de evolução por exercício e a lista dos seus recordes de carga. |

Alguns detalhes que ajudam no dia a dia:

- Ao adicionar um exercício, o app **já preenche o peso e as repetições da última vez** que você o fez.
- Ao adicionar uma série, ela **copia os valores da série anterior** (é o que quase sempre você quer).
- O **volume** (peso × repetições somado) é calculado sozinho — é a forma mais comum de medir o quanto você treinou.

---

## ✅ O que você precisa

1. Um **Mac** (o Xcode só existe para macOS — não dá para desenvolver app de iPhone no Windows).
2. **Xcode 16 ou mais recente** — instale de graça pela **Mac App Store**. É um download grande (~10 GB), deixe baixando com calma.
3. Para testar: o **simulador de iPhone** já vem junto com o Xcode. Se quiser instalar no seu iPhone de verdade, precisa de um **iPhone com iOS 17 ou mais novo**.

Não precisa pagar nada. A conta paga de desenvolvedor (US$ 99/ano) só é necessária
para publicar na App Store — para usar no seu próprio celular, a conta gratuita resolve.

---

## 🚀 Como abrir e rodar (passo a passo)

### 1. Baixar o projeto

Abra o app **Terminal** no Mac e cole:

```bash
git clone https://github.com/leobossgomes/apptreino.git
cd apptreino
```

> Se você nunca usou o `git`, o macOS vai perguntar se quer instalar as
> "ferramentas de linha de comando" — aceite e rode o comando de novo.

### 2. Abrir no Xcode

```bash
open AppTreino.xcodeproj
```

Ou simplesmente dê **dois cliques** no arquivo `AppTreino.xcodeproj` no Finder.

### 3. Rodar no simulador

1. No topo da janela do Xcode, ao lado do nome **AppTreino**, escolha um simulador
   (por exemplo *iPhone 16*).
2. Aperte o botão **▶︎ Play** (ou `Cmd + R`).
3. Espere um pouco — na primeira vez o Xcode demora, é normal. O simulador abre e o app aparece.

Pronto, o app está rodando. 🎉

### 4. Rodar no seu iPhone de verdade (opcional)

1. Conecte o iPhone no Mac pelo cabo e desbloqueie a tela.
2. No Xcode, vá em **Xcode → Settings → Accounts** e clique em **+** para
   adicionar o seu Apple ID (o mesmo do seu iPhone). É gratuito.
3. Clique no projeto **AppTreino** na coluna da esquerda → aba **Signing & Capabilities**.
4. Em **Team**, escolha o seu nome (aparece como *"Seu Nome (Personal Team)"*).
5. Ainda ali, mude o **Bundle Identifier** para algo único seu, por exemplo:
   `com.seunome.AppTreino`.
6. No topo, escolha o seu iPhone no lugar do simulador e aperte **▶︎ Play**.
7. Na primeira vez o iPhone vai reclamar de "desenvolvedor não confiável". No iPhone vá em
   **Ajustes → Geral → VPN e Gerenciamento de Dispositivo** e confie no seu Apple ID.

> ⚠️ Com a conta gratuita, o app instalado no iPhone **expira em 7 dias**.
> É só conectar o cabo e apertar Play de novo para renovar.

---

## 🗂 Como o projeto está organizado

```
AppTreino/
├── AppTreinoApp.swift          ← onde o app começa; liga o banco de dados
├── ContentView.swift           ← a barra com as 4 abas
│
├── Modelos/                    ← COMO OS DADOS SÃO GUARDADOS
│   ├── Treino.swift            ← uma sessão de treino (um dia na academia)
│   ├── ExercicioDoTreino.swift ← um exercício dentro de um treino
│   ├── Serie.swift             ← uma série: peso + repetições
│   └── Exercicio.swift         ← o catálogo de exercícios
│
├── Telas/                      ← AS TELAS QUE VOCÊ VÊ
│   ├── Treinar/                ← treino em andamento
│   ├── Historico/              ← lista e detalhe dos treinos passados
│   ├── Exercicios/             ← catálogo de exercícios
│   └── Progresso/              ← estatísticas, gráfico e recordes
│
├── Suporte/                    ← CÓDIGO AUXILIAR
│   ├── Formatadores.swift      ← deixa números e datas bonitos ("82,5 kg")
│   ├── GrupoMuscular.swift     ← lista de grupos musculares e ícones
│   ├── Componentes.swift       ← pedacinhos de tela reaproveitados
│   ├── DadosIniciais.swift     ← os 20 exercícios que vêm prontos
│   ├── HistoricoUtil.swift     ← buscas no histórico
│   └── PreviewDados.swift      ← dados falsos para os previews do Xcode
│
└── Assets.xcassets/            ← ícone do app e cor principal
```

**Não existe nenhuma lista de arquivos para manter atualizada.** O projeto usa o
recurso do Xcode 16 em que *tudo que estiver dentro da pasta `AppTreino/` entra no app
automaticamente*. Criou um arquivo `.swift` novo ali dentro? Ele já é compilado.

---

## 🧠 Os 5 conceitos que explicam 90% do código

Você não precisa saber tudo para mexer aqui. Basicamente:

**1. `View` é uma tela (ou um pedaço dela).**
```swift
struct HistoricoView: View {
    var body: some View {   // <- "body" é o que aparece na tela
        Text("Olá")
    }
}
```

**2. `@Model` transforma uma classe em "tabela do banco de dados".**
Toda propriedade dentro dela é salva no iPhone automaticamente.
```swift
@Model
final class Serie {
    var repeticoes: Int
    var peso: Double
}
```

**3. `@Query` lê o banco e mantém a tela sempre atualizada sozinha.**
Se um treino novo é salvo, a lista se redesenha sem você pedir.
```swift
@Query(sort: \Treino.inicio, order: .reverse) private var treinos: [Treino]
```

**4. `@State` e `@Bindable` guardam coisas que mudam.**
`@State` é para coisas da tela (ex.: "a sheet está aberta?").
`@Bindable` é para editar direto um objeto salvo no banco (o `$` cria a ligação
com o campo de texto).
```swift
@State private var mostrarSeletor = false
@Bindable var treino: Treino
TextField("Nome", text: $treino.nome)   // digitou = salvou
```

**5. `contexto.insert(...)` cria e `contexto.delete(...)` apaga.**
```swift
let novo = Treino(nome: "Treino de Segunda")
contexto.insert(novo)
try? contexto.save()
```

> 💡 Dica de ouro para aprender: abra qualquer arquivo dentro de `Telas/` e clique em
> **Canvas** (`Cmd + Option + Enter`). O Xcode mostra a tela ao vivo ao lado do código,
> já com treinos de exemplo. Mude um texto e veja acontecendo na hora.

---

## 🔧 Coisas fáceis de mexer para começar a praticar

| Quero... | Onde mexer |
|---|---|
| Mudar a cor do app | `Assets.xcassets/AccentColor` — clique na cor e escolha outra |
| Mudar o nome que aparece embaixo do ícone | Build Settings → `INFOPLIST_KEY_CFBundleDisplayName` |
| Mudar os exercícios que já vêm cadastrados | `Suporte/DadosIniciais.swift` |
| Adicionar um grupo muscular novo | `Suporte/GrupoMuscular.swift` |
| Trocar o texto de alguma tela | Procure o texto dentro de `Telas/` (`Cmd + Shift + F` busca no projeto todo) |
| Mudar as repetições padrão de 10 para outro número | `Modelos/Serie.swift`, no `init` |

---

## 🧭 Próximos passos (ideias para evoluir o app)

Em ordem do mais fácil para o mais difícil:

1. **Ícone do app** — arraste uma imagem 1024×1024 para `Assets.xcassets/AppIcon`.
2. **Tempo de descanso** — um cronômetro que dispara ao marcar uma série como feita.
3. **Modelos de treino** (Treino A / B / C) — salvar uma lista de exercícios pronta.
4. **Anotar também o peso corporal** ao longo do tempo, com gráfico.
5. **Exportar o histórico** em CSV para abrir no Excel.
6. **Widget na tela de início** mostrando quantos treinos você fez no mês.
7. **Sincronizar entre iPhone e iPad** com iCloud (o SwiftData já tem suporte, é
   basicamente ligar o CloudKit nas capabilities).

---

## ❓ Problemas comuns

**"Unsupported Swift architecture" / o projeto não abre**
Seu Xcode é mais antigo que a versão 16. Atualize pela Mac App Store.

**"Signing for AppTreino requires a development team"**
Falta escolher seu Apple ID em **Signing & Capabilities → Team**. Veja o passo 4 acima.

**O app abre mas está sem os exercícios de exemplo**
Eles só são criados quando o catálogo está vazio. Apague o app do simulador
(segure o ícone → Remover) e rode de novo.

**Mudei um `@Model` (adicionei um campo) e o app quebra ao abrir**
Isso é uma "migração de banco". Durante o desenvolvimento, o mais simples é apagar o
app do simulador/iPhone e instalar de novo — os dados antigos se perdem, mas o app volta a abrir.

---

## 📄 Licença

Projeto pessoal, use como quiser.

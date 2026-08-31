# AppTreino 🏋️

App para controlar seus treinos de academia: quais exercícios você fez, quantas séries,
quantas repetições, quanto peso — e todo o histórico salvo no seu celular.

Este repositório tem **duas versões do mesmo app**:

| Versão | Onde fica | Precisa de Mac? | Serve para |
|---|---|---|---|
| 🌐 **App web (PWA)** | `docs/` | **Não** | **Usar hoje no iPhone.** É a versão principal. |
| 🍎 **App nativo (Swift)** | `AppTreino/` | Sim (ou Mac na nuvem) | Continuar depois, se você quiser publicar na App Store |

As duas fazem exatamente as mesmas coisas. Se você está no Windows, use a versão web.

---

## 📱 O que o app faz

| Aba | Para que serve |
|---|---|
| **Treinar** | Começa um treino e você vai anotando série por série (peso + repetições). Tem cronômetro e botão de "repetir o último treino". |
| **Histórico** | Todos os treinos finalizados, agrupados por mês, com busca. Toque em um para ver tudo o que foi feito naquele dia. |
| **Exercícios** | Seu catálogo pessoal (já vem com 20 cadastrados). Você pode adicionar, editar e apagar. |
| **Progresso** | Números gerais, gráfico de evolução por exercício, recordes de carga e backup dos dados. |

Detalhes que ajudam no dia a dia:

- Ao adicionar um exercício, o app **já preenche o peso e as repetições da última vez** que você o fez.
- Ao adicionar uma série, ela **copia os valores da série anterior**.
- O **volume** (peso × repetições somado) é calculado sozinho — é a medida mais comum de quanto você treinou.
- Funciona **offline**, no avião, no subsolo da academia. Não precisa de internet depois de instalado.

---

# 🌐 Versão web (a que você vai usar)

## Passo 1 — Ligar o site (só uma vez, leva 1 minuto)

1. Abra https://github.com/leobossgomes/AppTreino/settings/pages
2. Em **Source**, escolha **Deploy from a branch**
3. Em **Branch**, escolha `claude/ios-workout-tracker-app-jjr5dr` e a pasta **`/docs`**
4. Clique em **Save**

Espere 1 ou 2 minutos. Depois disso o app fica no ar em:

**https://leobossgomes.github.io/AppTreino/**

## Passo 2 — Instalar no iPhone

1. Abra esse endereço **no Safari** do iPhone (tem que ser o Safari, não funciona no Chrome).
2. Toque no botão **Compartilhar** (o quadradinho com a seta para cima, embaixo).
3. Role a lista e toque em **"Adicionar à Tela de Início"**.
4. Toque em **Adicionar**.

Pronto: o AppTreino vira um ícone na sua tela, abre em tela cheia (sem barra de navegador)
e funciona sem internet. Na prática, igual a um app baixado da App Store.

> **Importante:** abra sempre pelo ícone da tela de início, não pelo Safari.
> É o ícone que guarda os seus dados.

## Passo 3 — Fazer backup de vez em quando

Os treinos ficam salvos **só no seu iPhone** — não existe servidor, ninguém além de você
tem acesso. A contrapartida é que, se você apagar o app ou limpar os dados do Safari,
eles se perdem.

Por isso: **Progresso → Backup → Exportar meus dados** salva um arquivo `.json` com tudo.
Guarde no iCloud Drive de vez em quando. Para restaurar, use **Importar de um backup**.

## Como mexer no código (tudo no Windows)

Não precisa instalar nada além de um editor de texto. O recomendado é o
[VS Code](https://code.visualstudio.com/), que é gratuito.

```bash
git clone https://github.com/leobossgomes/AppTreino.git
cd AppTreino/docs
```

Para ver o resultado no seu PC, **dê dois cliques no `docs/index.html`** — ele abre no
navegador e funciona. (O modo offline só liga quando o app está publicado, mas todo o
resto funciona igual.)

Quando gostar do resultado:

```bash
git add .
git commit -m "descrição do que eu mudei"
git push
```

Em 1 minuto o GitHub publica sozinho e o app no seu iPhone se atualiza na próxima vez que abrir.

> Mudou algum arquivo? Aumente o número em `VERSAO` no `docs/sw.js`
> (de `apptreino-v1` para `apptreino-v2`, etc.). É isso que avisa o iPhone
> que existe uma versão nova para baixar.

## Mapa dos arquivos da versão web

```
docs/
├── index.html          ← a estrutura da página (cabeçalho, conteúdo, abas)
├── manifest.webmanifest← diz ao iPhone o nome e o ícone do app
├── sw.js               ← faz o app funcionar sem internet
├── css/estilo.css      ← TODA a aparência (cores, tamanhos, modo escuro)
├── icones/             ← o ícone do halter
└── js/
    ├── formatar.js     ← deixa números e datas bonitos ("82,5 kg", "1h 05min")
    ├── dados.js        ← onde os treinos são guardados e as contas são feitas
    ├── ui.js           ← peças de tela reaproveitadas (listas, botões, janelas)
    ├── treinar.js      ← tela do treino em andamento
    ├── historico.js    ← lista e detalhe dos treinos passados
    ├── exercicios.js   ← catálogo de exercícios
    ├── progresso.js    ← estatísticas, gráfico e backup
    └── app.js          ← troca de abas, cronômetro e inicialização
```

### Coisas fáceis de mexer para praticar

| Quero... | Onde mexer |
|---|---|
| Mudar a cor principal do app | `css/estilo.css`, a variável `--azul` (lá no topo) |
| Mudar os exercícios que já vêm cadastrados | `js/dados.js`, a lista `EXERCICIOS_PADRAO` |
| Adicionar um grupo muscular novo | `js/dados.js`, as listas `GRUPOS` e `EMOJI_GRUPO` |
| Mudar as repetições padrão de 10 para outro número | `js/dados.js`, função `adicionarSerie` |
| Trocar o texto de alguma tela | Busque o texto na pasta `js/` (no VS Code: `Ctrl + Shift + F`) |

### Ideias para evoluir

Em ordem do mais fácil para o mais difícil:

1. **Cronômetro de descanso** que dispara ao marcar uma série como feita.
2. **Modelos de treino** (Treino A / B / C) salvos para começar mais rápido.
3. **Peso corporal** anotado ao longo do tempo, com gráfico próprio.
4. **Exportar em CSV** para abrir no Excel.
5. **Sincronizar entre aparelhos** — aí sim precisaria de um servidor (ex.: Firebase).

---

# 🍎 Versão nativa (Swift)

O app nativo em SwiftUI + SwiftData está em `AppTreino/`, com o projeto do Xcode em
`AppTreino.xcodeproj`. Ele **compila sem erros** — isso é verificado automaticamente a
cada `push` pelo GitHub Actions, num Mac na nuvem (grátis para repositórios públicos).

Veja o resultado em: https://github.com/leobossgomes/AppTreino/actions

Para trabalhar nele você precisa de um Mac com **Xcode 16+**, ou de um Mac alugado na
nuvem (MacinCloud, Scaleway, AWS EC2 Mac).

Se um dia quiser instalá-lo no iPhone sem Mac: o mesmo workflow gera um arquivo `.ipa`
sem assinatura (aba **Actions** → último run → **Artifacts**). No Windows, o
[Sideloadly](https://sideloadly.io/) assina esse arquivo com um Apple ID gratuito e
instala no iPhone pelo cabo USB — com a ressalva de que o app expira a cada 7 dias.

### Mapa dos arquivos da versão Swift

```
AppTreino/
├── AppTreinoApp.swift    ← onde o app começa; liga o banco de dados
├── ContentView.swift     ← a barra com as 4 abas
├── Modelos/              ← como os dados são guardados (Treino, Série, Exercício)
├── Telas/                ← as 4 telas
├── Suporte/              ← formatadores, componentes e dados de exemplo
└── Assets.xcassets/      ← ícone e cor principal
```

---

## 📄 Licença

Projeto pessoal, use como quiser.

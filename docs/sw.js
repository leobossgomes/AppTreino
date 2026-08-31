/* Service worker: guarda o app no aparelho para funcionar sem internet.
   Ao mudar qualquer arquivo, aumente o número da VERSAO para forçar a
   atualização nos celulares que já instalaram o app. */

const VERSAO = 'apptreino-v1';

const ARQUIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/estilo.css',
  './js/formatar.js',
  './js/dados.js',
  './js/ui.js',
  './js/treinar.js',
  './js/historico.js',
  './js/exercicios.js',
  './js/progresso.js',
  './js/app.js',
  './icones/icone-192.png',
  './icones/icone-512.png',
  './icones/apple-touch-icon.png',
  './icones/favicon-32.png'
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(VERSAO)
      .then((cache) => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(
        chaves.filter((c) => c !== VERSAO).map((c) => caches.delete(c))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const requisicao = evento.request;
  if (requisicao.method !== 'GET') return;

  // Abrir o app: tenta a internet primeiro (para pegar atualizações),
  // e cai para a cópia guardada se estiver offline.
  if (requisicao.mode === 'navigate') {
    evento.respondWith(
      fetch(requisicao)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(VERSAO).then((cache) => cache.put('./index.html', copia));
          return resposta;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Demais arquivos: usa a cópia guardada, que é instantânea.
  evento.respondWith(
    caches.match(requisicao).then((guardado) => guardado || fetch(requisicao).then((resposta) => {
      if (resposta.ok && new URL(requisicao.url).origin === location.origin) {
        const copia = resposta.clone();
        caches.open(VERSAO).then((cache) => cache.put(requisicao, copia));
      }
      return resposta;
    }))
  );
});

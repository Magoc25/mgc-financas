const CACHE = 'mgc-v40';
const SHELL = ['./mgc-financas.html', './manifest.json', './icon-192.png', './icon-512.png'];
// Fora do próprio site, só bibliotecas de CDN entram no cache. Resposta de API NUNCA: com a rede
// fora, o `.catch` lá embaixo devolveria o payload antigo como se a nuvem tivesse respondido, e o
// app fundiria e gravaria em cima de uma foto velha. Lista de permissão de propósito: host novo
// fica de fora por padrão, e ficar fora do cache é a falha inofensiva das duas.
const CDN_CACHEAVEL = ['cdn.tailwindcss.com', 'cdn.jsdelivr.net'];
// Quanto a abertura espera a rede antes de usar a cópia guardada (r147). Offline não é o caso
// difícil: com sinal que conecta e não responde, o `fetch` leva dezenas de segundos para desistir,
// e o app e as bibliotecas (que bloqueiam a página) esperavam esse tempo todo para abrir.
const ESPERA_MS = 3500;

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => clients.claim())
    );
});

// Resposta que pode ir para a tela e para o cache. `opaque` é a biblioteca de CDN carregada por
// <script> sem CORS: o status não é legível, mas é o arquivo.
const boa = res => res.ok || res.type === 'opaque';

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    const u = new URL(e.request.url);
    const doSite = u.origin === self.location.origin;
    if (!doSite && !CDN_CACHEAVEL.includes(u.hostname)) return;

    // `?origem=qr`/`?utm=…` não podem esconder o app guardado. No CDN, não: lá a query escolhe o arquivo.
    const doCache = () => caches.match(e.request, { ignoreSearch: doSite });
    let gravou = Promise.resolve();
    const daRede = fetch(e.request).then(res => {
        // erro do servidor não substitui a cópia boa que serve o modo offline
        if (boa(res)) { const copia = res.clone(); gravou = caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {}); }
        return res;
    });
    // a resposta que chegar depois do tempo-limite ainda atualiza o cache
    e.waitUntil(daRede.then(() => gravou).catch(() => {}));
    const espera = new Promise((_, rej) => setTimeout(() => rej(new Error('tempo-limite')), ESPERA_MS));
    e.respondWith(
        Promise.race([daRede, espera])
            .then(res => (boa(res) || res.type === 'opaqueredirect') ? res : doCache().then(c => c || res))
            .catch(() => doCache().then(c => c || daRede.catch(() => new Response('Offline', { status: 503 }))))
    );
});

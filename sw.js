const CACHE = 'mgc-v39';
const SHELL = ['./mgc-financas.html', './manifest.json', './icon-192.png', './icon-512.png'];
// Fora do próprio site, só bibliotecas de CDN entram no cache. Resposta de API NUNCA: com a rede
// fora, o `.catch` lá embaixo devolveria o payload antigo como se a nuvem tivesse respondido, e o
// app fundiria e gravaria em cima de uma foto velha. Lista de permissão de propósito: host novo
// fica de fora por padrão, e ficar fora do cache é a falha inofensiva das duas.
const CDN_CACHEAVEL = ['cdn.tailwindcss.com', 'cdn.jsdelivr.net'];

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

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    const u = new URL(e.request.url);
    if (u.origin !== self.location.origin && !CDN_CACHEAVEL.includes(u.hostname)) return;
    e.respondWith(
        fetch(e.request)
            .then(res => {
                // erro do servidor não substitui a cópia boa que serve o modo offline
                if (res.ok || res.type === 'opaque') {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
                }
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});

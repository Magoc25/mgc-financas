// Smoke §35 — mgc-financas: 2 "aparelhos" jsdom contra um Supabase falso COMPARTILHADO.
//
// COMO RODAR (jsdom fica FORA do OneDrive — o projeto não pode ganhar node_modules, r33):
//   1) num diretório temporário:  npm i jsdom
//   2) na raiz do projeto:
//      NODE_PATH=<temp>/node_modules node tests/smoke-sync.js mgc-financas.html
//   3) baseline (prova que o cenário reproduz a perda no código anterior):
//      git show HEAD:mgc-financas.html > baseline.html
//      NODE_PATH=<temp>/node_modules node tests/smoke-sync.js baseline.html --baseline
//
// ESTE ARQUIVO É VERSIONADO (r100) — mora em `tests/`, não em `docs/` (que é git-excluded).
// Asserção fora do repositório não tem como virar gatilho de CI: as 9 asserções da seção 0
// são o ÚNICO gate da `apresentacao.html`, e enquanto dependiam de alguém rodar o smoke à
// mão elas eram "teste que existe e nunca dispara". O `.github/workflows/verificar.yml`
// roda este arquivo a cada push (§35d + §37 item 8).
//
// Cobre o gate r68b: se uma coleção sincronizada nova nascer fora do merge,
// _syncColecoesNaoRegistradas() deixa de ser [] e a seção 10 falha.
//
// Relógio injetável (r136b): SMOKE_AGORA=2027-01-31T12:00:00Z roda a suíte inteira como se fosse
// aquela data. Asserção com mês escrito à mão quebra sozinha quando o calendário anda.
const fs = require('fs');
const path = require('path');
// r57d — o MESMO arquivo roda SEM jsdom, fazendo só o degrau estático (a seção 0/§37 vem
// daí). No CI, jsdom ausente é FALHA: teste que "passa" por não ter rodado é pior que
// teste vermelho — mesmo princípio do secret ausente no keep-alive (§16).
let JSDOM = null, VirtualConsole = null;
try { ({ JSDOM, VirtualConsole } = require('jsdom')); } catch (e) {}

process.on('unhandledRejection', e => { erros.push('rejeição no Node: ' + (e && e.message)); });
const ARQ      = process.argv[2];
const BASELINE = process.argv.includes('--baseline');
let ok = 0, fail = 0;
const check = (nome, cond, extra) => { if (cond) { ok++; console.log('  ✓ ' + nome); } else { fail++; console.log('  ✗ ' + nome + (extra !== undefined ? '  → ' + JSON.stringify(extra) : '')); } };
// Asserção que ESTOURA (nó ausente, expressão inválida) derruba o harness inteiro e some
// com as seções seguintes — numa bateria de mutação isso é indistinguível de "asserção morta"
// se você só contar os ✗. Toda leitura de DOM/estado passa por aqui: erro vira ✗, não crash.
const ler = (ap, expr) => { try { return ap.w.eval(expr); } catch (e) { return undefined; } };
const txt = (ap, id) => ler(ap, `(document.getElementById('${id}')||{}).textContent`);
const secao  = t => console.log('\n── ' + t + ' ' + '─'.repeat(Math.max(0, 58 - t.length)));

// ─────────── "Supabase" compartilhado ───────────
// Fala PostgREST de verdade onde o app depende disso: `updated_at` volta no formato do servidor
// (com +00:00, que precisa de encodeURIComponent na URL), PATCH filtrado devolve [] quando a linha
// mudou, e a escrita copia o corpo (r85a). `pagina` conta só leitura que trouxe o blob inteiro.
const nuvem = { payload: null, updated_at: null, gets: 0, checks: 0, posts: 0, patches: 0, conflitos: 0, get escritas() { return this.posts + this.patches; } };
const clonar = o => JSON.parse(JSON.stringify(o));
// Uma vez só: calculado por aparelho, cada um abriria com o relógio em SMOKE_AGORA e os abertos depois ficariam atrasados.
const SMOKE_DESLOCAMENTO = process.env.SMOKE_AGORA ? Date.parse(process.env.SMOKE_AGORA) - Date.now() : 0;
const zerarNuvem = () => { nuvem.payload = null; nuvem.updated_at = null; };
const resposta = data => ({ ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) });

const htmlBase = fs.readFileSync(ARQ, 'utf8').replace(/<script src="https:\/\/[^"]*"><\/script>/g, '');
const erros = [];

function encadeavel() { // r57c — stub de API fluente (cliente de reviews) em 1 linha
    const p = new Proxy(function () {}, { get: (_, k) => (k === 'then' ? undefined : (k === Symbol.toPrimitive ? () => '' : p)), apply: () => p, construct: () => p });
    return p;
}

async function abrirAparelho(nome, cfg = {}) {
    const estado = { offline: false, segurarEscrita: null, respostaLeitura: null, segurarLeitura: cfg.segurarLeitura || null, travarRede: false,
                     skew: SMOKE_DESLOCAMENTO + (cfg.skew || 0) };
    const vc = new VirtualConsole();
    vc.on('jsdomError', e => { if (!/Not implemented|Could not parse CSS/.test(e.message)) erros.push(nome + ' · ' + e.message); });
    const dom = new JSDOM(cfg.html || htmlBase, {
        runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc,
        beforeParse(w) {
            const R = w.Date;
            w.Date = class extends R {
                constructor(...a) { if (a.length) super(...a); else super(R.now() + estado.skew); }
                static now() { return R.now() + estado.skew; }
            };
            // O tique de checagem periódica fica à mão: disparado pelo teste, não pelo acaso (senão
            // um aparelho esquecido aberto entraria na cena do seguinte quando a suíte passasse de 1 min).
            const siReal = w.setInterval.bind(w);
            w.setInterval = (fn, ms, ...a) => { if (ms >= 30000) { (w.__tiques = w.__tiques || []).push(fn); return 0; } return siReal(fn, ms, ...a); };
            w.localStorage.setItem('finSupaUrl', 'https://fake.supabase.co');
            w.localStorage.setItem('finSupaKey', 'fake-key');
            if (cfg.localStorageInicial) w.localStorage.setItem('financeAppV6_Personalized', cfg.localStorageInicial);
            w.tailwind = { config: {} };
            w.Chart = function (ctx, c) { this.destroy = () => {}; this.update = () => {}; this.resize = () => {}; (w.__charts = w.__charts || []).push(c); };
            w.Chart.register = () => {}; w.Chart.defaults = { font: {}, plugins: {}, scale: {} };
            w.supabase = { createClient: () => encadeavel() };
            w.HTMLCanvasElement.prototype.getContext = () => ({ fillRect: () => {}, clearRect: () => {}, drawImage: () => {}, measureText: () => ({ width: 0 }) });
            w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
            w.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} });
            w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {};
            w.structuredClone = o => JSON.parse(JSON.stringify(o));
            w.confirm = () => true; w.alert = () => {}; w.print = () => {};
            w.onerror = (msg) => { erros.push(nome + ' · onerror: ' + msg); };
            w.addEventListener('unhandledrejection', e => erros.push(nome + ' · rejection: ' + (e.reason && e.reason.message)));
            w.fetch = async (url, options = {}) => {
                const u = String(url), metodo = (options.method || 'GET').toUpperCase();
                if (estado.offline) throw new Error('offline');
                if (!/finance_data/.test(u)) return resposta([]);   // app_config, reviews, pings
                if (estado.travarRede) await new Promise((_, rej) => { if (options.signal) options.signal.addEventListener('abort', () => rej(new Error('abortado'))); });
                const q = new URL(u).searchParams;   // decodifica como o servidor: '+' cru na URL vira espaço
                const rev = t => new Date(t).toISOString().replace('Z', '+00:00');
                const aplicar = () => { const b = JSON.parse(options.body); nuvem.payload = clonar(b.payload); nuvem.updated_at = rev(b.updated_at); return resposta([{ updated_at: nuvem.updated_at }]); };
                if (metodo === 'POST') {
                    if (estado.segurarEscrita) await estado.segurarEscrita;
                    nuvem.posts++;
                    return aplicar();
                }
                if (metodo === 'PATCH') {
                    if (estado.segurarEscrita) await estado.segurarEscrita;
                    if (estado.sempreConflito) { nuvem.conflitos++; return resposta([]); }
                    const f = q.get('updated_at');
                    const casa = f === 'is.null' ? nuvem.updated_at == null : f === 'eq.' + nuvem.updated_at;
                    if (!nuvem.payload || !casa) { nuvem.conflitos++; return resposta([]); }
                    nuvem.patches++;
                    return aplicar();
                }
                const sel = q.get('select') || '';
                if (sel === 'updated_at') { nuvem.checks++; return resposta(nuvem.payload ? [{ updated_at: nuvem.updated_at }] : []); }
                if (sel.includes('payload')) {
                    nuvem.gets++;
                    if (estado.segurarLeitura) await estado.segurarLeitura;
                    if (estado.respostaLeitura) return estado.respostaLeitura();
                    return resposta(nuvem.payload ? [{ payload: clonar(nuvem.payload), updated_at: nuvem.updated_at }] : []);
                }
                return resposta([{ id: 1 }]);
            };
        }
    });
    const w = dom.window;
    await new Promise((res, rej) => {
        const t = setTimeout(() => rej(new Error(nome + ': boot travado')), 8000);
        if (w.document.readyState === 'complete') { clearTimeout(t); res(); }
        else w.addEventListener('load', () => { clearTimeout(t); res(); });
    });
    const ap = { nome, w, dom, estado, skew: cfg.skew || 0 };
    await assentar(ap);
    return ap;
}

// espera a fila de sync do app esvaziar (cada ação = logHistorico + salvarDados → 2 sincronizações)
async function assentar(ap) {
    for (let i = 0; i < 10; i++) {
        try { await Promise.race([ler(ap, '_syncFila'), new Promise(r => setTimeout(r, 150))]); } catch (e) {}
        await new Promise(r => setTimeout(r, 5));
    }
}

function lancar(ap, tipo, nome, valor, mes) {
    const d = ap.w.document;
    d.getElementById('newType').value = tipo;
    d.getElementById('newName').value = nome;
    d.getElementById('newAmount').value = String(valor);
    if (mes) d.getElementById('newMonth').value = mes;
    d.getElementById('addExpenseForm').dispatchEvent(new ap.w.Event('submit'));
}

const nomes  = (ap, col) => (ler(ap, `(${col}||[]).map(x=>x.name)`) || []).join('|');
const naNuvem = col => ((nuvem.payload && nuvem.payload[col]) || []).map(x => x.name);

// ─────────── §37 · a página pública travada por teste (r84c) ───────────
// NENHUM passo do release toca `apresentacao.html`: ela não é recompilada, não entra no
// smoke do app e ninguém a reabre — apodrece sozinha, em público. Estas asserções são o
// único gate que ela tem, e por isso vivem no degrau ESTÁTICO, que roda sem jsdom.
function secaoApresentacao() {
    secao('0. Página de apresentação §37 — as 3 regras invioláveis (r84c)');
    if (BASELINE) { console.log('  ⚠ pulado no baseline — a página não versiona com o app'); return; }
    const dir = path.dirname(ARQ) || '.';
    const arq = a => { try { return fs.readFileSync(path.join(dir, a), 'utf8'); } catch (e) { return ''; } };
    const pag = arq('apresentacao.html');
    if (!pag) { check('apresentacao.html existe na raiz (§37)', false); return; }

    // ── regra 2 · nada de nomes de internals ──
    // A lista é DERIVADA do app (chaves de armazenamento, tabelas/colunas, coleções
    // sincronizadas, nome do cache do SW) e nunca escrita à mão: o internal que nascer
    // amanhã já entra na varredura sozinho.
    const cap = (re, src) => [...src.matchAll(re)].map(m => m[1]);
    const fontes = {
        armazenamento: cap(/localStorage\.(?:get|set)Item\('([^']+)'/g, htmlBase).concat(cap(/const\s+STORAGE_KEY\s*=\s*'([^']+)'/g, htmlBase)),
        tabelas:       cap(/rest\/v1\/([a-z_]+)/g, htmlBase).concat(cap(/\.from\('([a-z_]+)'\)/g, htmlBase)),
        colunas:       cap(/onConflict:\s*'([^']+)'/g, htmlBase).flatMap(s => s.split(',').map(c => c.trim())),
        sincronizadas: cap(/const\s+SYNC_[A-Z]+\s*=\s*\[([^\]]*)\]/g, htmlBase).flatMap(s => cap(/'([^']+)'/g, s)),
        cache:         cap(/CACHE\s*=\s*'([^']+)'/g, arq('sw.js'))
    };
    // Derivação que seca em silêncio deixa a regra 2 passar de graça (r72a): a asserção
    // vira "nenhum dos zero internals apareceu". Cada fonte responde por si.
    const secas = Object.keys(fontes).filter(k => fontes[k].length === 0);
    check('as 5 fontes de internals foram derivadas do app (nenhuma seca)', secas.length === 0, secas);
    // Filtro de FORMA, não lista de exceções à mão: entra o que tem cara de identificador
    // (underscore, hífen, ponto, dígito ou camelCase) e fica de fora palavra do idioma
    // ('metas', 'limites', 'pagamentos'), que a página tem todo direito de usar em prosa.
    const internos = [...new Set(Object.values(fontes).flat())].filter(t => t.length >= 4 && /[_.-]|\d|[a-z][A-Z]/.test(t));
    const vazados = internos.filter(t => pag.includes(t));
    check('regra 2 — nenhum nome interno do app aparece na página', vazados.length === 0, vazados);

    // ── regra 3 · nada que mude a cada release ──
    const visivel = pag.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
                       .replace(/<head[\s\S]*?<\/head>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ');
    const versoes = visivel.match(/\bv?\d+\.\d+\.\d+\b|\bv\d+\.\d+\b/g) || [];
    check('regra 3 — nenhum número versionado no texto visível', versoes.length === 0, versoes);

    // ── publicação · zero recurso externo, CSP própria, tema nas duas formas ──
    const externos = [
        ...pag.matchAll(/<(?:script|img|iframe|object|embed|source|video|audio)\b[^>]*\bsrc\s*=\s*["']([^"']+)/gi),
        ...pag.matchAll(/<link\b[^>]*\bhref\s*=\s*["']([^"']+)/gi),
        ...pag.matchAll(/url\(\s*["']?(https?:\/\/[^"')]+)/gi),
        ...pag.matchAll(/@import\s+(?:url\()?["']([^"']+)/gi)
    ].map(m => m[1]).filter(u => /^(?:https?:)?\/\//i.test(u));
    check('zero recurso externo — a página abre offline e passa na própria CSP', externos.length === 0, externos);

    // o valor da CSP é cheio de aspas simples ('self', 'none') — o delimitador tem de vir por
    // retrovisor, senão a captura para no primeiro 'self' e a asserção fica verde por engano
    const csp = (pag.match(/http-equiv=(["'])Content-Security-Policy\1\s+content=(["'])([\s\S]*?)\2/i) || [])[3] || '';
    check('CSP própria, mais rígida que a do app (connect-src none)', /default-src 'self'/.test(csp) && /connect-src 'none'/.test(csp) && /object-src 'none'/.test(csp), csp.slice(0, 90));
    check('sem `frame-ancestors` — em <meta> o navegador ignora a diretiva', csp !== '' && !csp.includes('frame-ancestors'));

    const media = /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([\s\S]*?)\}/.exec(pag);
    const stamp = /:root\[data-theme="dark"\]\s*\{([\s\S]*?)\}/.exec(pag);
    check('tema escuro nas DUAS formas (media query sem stamp + [data-theme])', !!media && !!stamp, { media: !!media, stamp: !!stamp });
    const noRoot = new Set([...pag.matchAll(/:root\s*\{([\s\S]*?)\}/g)].flatMap(m => [...m[1].matchAll(/(--[\w-]+)\s*:/g)].map(x => x[1])));
    const noEscuro = [...media ? media[1].matchAll(/(--[\w-]+)\s*:/g) : [], ...stamp ? stamp[1].matchAll(/(--[\w-]+)\s*:/g) : []].map(m => m[1]);
    const soEscuro = [...new Set(noEscuro)].filter(t => !noRoot.has(t));
    check('nenhuma cor definida SÓ no escuro (no modo "sistema" ela nunca se aplica)', soEscuro.length === 0, soEscuro);
    check('body com fundo vindo de token (transparente empresta o fundo do host)', /body\s*\{[^}]*background:\s*var\(--/.test(pag));
}

(async () => {
    console.log('\n=== SMOKE §35 — sync multi-device' + (BASELINE ? ' [BASELINE: espera a perda]' : '') + ' — ' + ARQ + ' ===');

    secaoApresentacao();          // estática — não precisa de jsdom
    if (!JSDOM) {
        console.log('\n⚠ jsdom ausente — só o degrau estático rodou (r57d).');
        if (process.env.CI) check('jsdom instalado no CI (ausente = FALHA, não "pulei")', false);
        return relatorio();
    }

    // ───────────────────────────────────────────────────────────
    secao('1. Cenário do r68a — aparelho desatualizado grava por cima');
    const A = await abrirAparelho('PC');
    lancar(A, 'Renda', 'Salário', 5000);      await assentar(A);
    lancar(A, 'Fixa',  'Mercado', 200);       await assentar(A);
    // r91c — o duplo tem de ser EXERCITADO, e isso se asserta, não se supõe. Se algum stub
    // sobrescrever o `fetch` falso, TODA asserção deste cenário fica vermelha lendo-se como
    // reprodução perfeita da perda de dado que ele existe para caçar — "não chamou o duplo"
    // e "chamou e perdeu tudo" dão exatamente o mesmo vermelho. Com esta linha o bypass vira
    // um ✗ localizado, no topo da suíte, que se lê em um segundo.
    check('o duplo da nuvem foi exercitado (r91c) — leitura E escrita chegaram nele', nuvem.gets > 0 && nuvem.escritas > 0, { gets: nuvem.gets, escritas: nuvem.escritas });
    check('PC publicou os 2 lançamentos na nuvem', naNuvem('rendas').includes('Salário') && naNuvem('fixas').includes('Mercado'), { rendas: naNuvem('rendas'), fixas: naNuvem('fixas') });

    const B = await abrirAparelho('Celular');
    check('Celular recebeu os 2 no boot', nomes(B, 'appData.rendas') === 'Salário' && nomes(B, 'appData.fixas') === 'Mercado', { rendas: nomes(B, 'appData.rendas'), fixas: nomes(B, 'appData.fixas') });

    lancar(B, 'Fixa', 'Farmácia', 90);        await assentar(B);
    check('Celular publicou Farmácia', naNuvem('fixas').includes('Farmácia'), naNuvem('fixas'));

    // o PC segue aberto desde antes — nunca puxou a Farmácia
    check('PC ainda NÃO tem Farmácia (é o aparelho desatualizado)', !nomes(A, 'appData.fixas').includes('Farmácia'), nomes(A, 'appData.fixas'));
    lancar(A, 'Fixa', 'Luz', 150);            await assentar(A);

    const perdeu = !naNuvem('fixas').includes('Farmácia');
    if (BASELINE) {
        check('BASELINE reproduz a perda (Farmácia sumiu da nuvem)', perdeu, naNuvem('fixas'));
    } else {
        check('nuvem manteve Farmácia E recebeu Luz', naNuvem('fixas').includes('Farmácia') && naNuvem('fixas').includes('Luz'), naNuvem('fixas'));
        check('PC adotou a fusão (tem Farmácia sem reabrir)', nomes(A, 'appData.fixas').includes('Farmácia'), nomes(A, 'appData.fixas'));
        const C = await abrirAparelho('Celular2');
        check('3º boot vê os 3 lançamentos fixos', ['Mercado', 'Farmácia', 'Luz'].every(n => nomes(C, 'appData.fixas').includes(n)), nomes(C, 'appData.fixas'));
        check('nenhum item duplicado após as fusões', ler(C, 'appData.fixas.length') === 3, ler(C, 'appData.fixas.length'));
        check('ids únicos entre as coleções', ler(C, 'new Set(appData.fixas.map(x=>String(x.id))).size') === 3);
        // r95d2 — a união revela duplicatas ANTIGAS (item que o usuário recriou quando o
        // last-write-wins o fez sumir), e o relato chega como "a correção duplicou meus
        // dados". Separar os dois casos é comparar os `id`: iguais ⇒ bug nosso, porque a
        // união tem obrigação de deduplicar; diferentes ⇒ identidades pré-existentes e o
        // merge está certo. Esta asserção prova o NOSSO lado, e é ela que permite responder
        // com evidência em minutos em vez de teoria.
        const dedup = ler(C, `(function(){
            const l = JSON.parse(JSON.stringify(appData));          // normalizarAppData muta o argumento
            const clone = JSON.parse(JSON.stringify(l.fixas[0]));   // mesmo id, cópia à parte
            l.fixas.push(clone);
            const m = mesclarAppData({}, l);
            return [l.fixas.length, m.fixas.length, m.fixas.filter(x => String(x.id) === String(clone.id)).length];
        })()`);
        check('lista local com id repetido é deduplicada pela união (r95)', Array.isArray(dedup) && dedup[0] === 4 && dedup[1] === 3 && dedup[2] === 1, { entrou: dedup && dedup[0], saiu: dedup && dedup[1], comOIdRepetido: dedup && dedup[2] });
        C.dom.window.close();
    }

    if (BASELINE) { relatorio(); return; }

    // ───────────────────────────────────────────────────────────
    secao('2. Exclusão — tombstone impede ressurreição (r66a)');
    const idxMercado = ler(A, "appData.fixas.findIndex(x=>x.name==='Mercado')");
    ler(A, `removerItem('fixa', ${idxMercado})`); await assentar(A);
    check('PC removeu Mercado e a nuvem registrou o tombstone', !naNuvem('fixas').map(String).includes('Mercado') && Object.keys(nuvem.payload.del || {}).length > 0, { fixas: naNuvem('fixas'), del: Object.keys(nuvem.payload.del || {}).length });
    const D = await abrirAparelho('Celular3');
    check('outro aparelho NÃO ressuscita o removido', !nomes(D, 'appData.fixas').includes('Mercado'), nomes(D, 'appData.fixas'));
    // o aparelho B (aberto, ainda com Mercado) sincroniza e também perde o item
    lancar(B, 'Renda', 'Freela', 300); await assentar(B);
    check('aparelho aberto com o item velho respeita o tombstone ao sincronizar', !naNuvem('fixas').includes('Mercado'), naNuvem('fixas'));

    secao('3. Desfazer remoção revive (updatedAt > tombstone)');
    const idxLuz = ler(A, "appData.fixas.findIndex(x=>x.name==='Luz')");
    ler(A, `removerItem('fixa', ${idxLuz})`); await assentar(A);
    ler(A, 'desfazerRemocao()');              await assentar(A);
    check('Luz voltou no PC', nomes(A, 'appData.fixas').includes('Luz'), nomes(A, 'appData.fixas'));
    check('Luz voltou na nuvem (tombstone perdeu p/ o updatedAt novo)', naNuvem('fixas').includes('Luz'), naNuvem('fixas'));
    const E = await abrirAparelho('Celular4');
    check('aparelho novo vê a Luz restaurada', nomes(E, 'appData.fixas').includes('Luz'), nomes(E, 'appData.fixas'));

    secao('4. Duplicar item — a cópia ganha id próprio');
    const idxDup = ler(A, "appData.fixas.findIndex(x=>x.name==='Luz')");
    ler(A, `duplicarItem('fixa', ${idxDup})`); await assentar(A);
    check('PC tem Luz e Luz (cópia)', nomes(A, 'appData.fixas').includes('Luz (cópia)'), nomes(A, 'appData.fixas'));
    check('ids distintos (cópia não herdou o id)', ler(A, 'new Set(appData.fixas.map(x=>String(x.id))).size') === ler(A, 'appData.fixas.length'));
    const F = await abrirAparelho('Celular5');
    check('a cópia chega íntegra no outro aparelho', nomes(F, 'appData.fixas').includes('Luz (cópia)') && ler(F, 'appData.fixas.length') === ler(A, 'appData.fixas.length'), { la: nomes(F, 'appData.fixas'), aqui: nomes(A, 'appData.fixas') });

    secao('5. Edição concorrente — vence o updatedAt mais novo');
    const G = await abrirAparelho('PC2');
    const iG = ler(G, "appData.rendas.findIndex(x=>x.name==='Salário')");
    ler(G, `appData.rendas[${iG}].amount = 5200; salvarDados();`); await assentar(G);
    await new Promise(r => setTimeout(r, 5));
    const iA = ler(A, "appData.rendas.findIndex(x=>x.name==='Salário')");
    ler(A, `appData.rendas[${iA}].amount = 5500; salvarDados();`); await assentar(A);
    check('a edição mais recente (5500) venceu na nuvem', (naNuvemObj('rendas').find(x => x.name === 'Salário') || {}).amount === 5500, naNuvemObj('rendas').map(x => x.name + '=' + x.amount));

    secao('6. Conjuntos — categoria criada num aparelho, removida no outro');
    ler(B, "appData.categorias.push('Pets'); salvarDados();"); await assentar(B);
    check('categoria nova sobe para a nuvem', (nuvem.payload.categorias || []).includes('Pets'), nuvem.payload.categorias);
    const H = await abrirAparelho('Celular6');
    check('outro aparelho recebe a categoria nova', ler(H, "appData.categorias.includes('Pets')"));
    ler(H, "removerCategoria('Pets')"); await assentar(H);
    check('remoção de categoria vira tombstone', !(nuvem.payload.categorias || []).includes('Pets'), nuvem.payload.categorias);
    ler(B, "appData.rendas[0].amount = 5501; salvarDados();"); await assentar(B);   // B ainda tem 'Pets' localmente
    check('aparelho com a categoria velha não a ressuscita', !(nuvem.payload.categorias || []).includes('Pets'), nuvem.payload.categorias);

    secao('7. Offline — não grava cego e não perde nada');
    const I = await abrirAparelho('Celular7');
    I.estado.offline = true;
    lancar(I, 'Fixa', 'Internet', 120); await assentar(I);
    check('offline: a nuvem NÃO foi sobrescrita', !naNuvem('fixas').includes('Internet'), naNuvem('fixas'));
    check('offline: o lançamento ficou salvo localmente', ler(I, "!!localStorage.getItem('financeAppV6_Personalized') && appData.fixas.some(x=>x.name==='Internet')"));
    lancar(A, 'Fixa', 'Água', 80); await assentar(A);   // outro aparelho publica enquanto isso
    I.estado.offline = false;
    ler(I, "appData.fixas[0].amount = appData.fixas[0].amount; salvarDados();"); await assentar(I);
    check('ao voltar, o item offline sobe', naNuvem('fixas').includes('Internet'), naNuvem('fixas'));
    check('e o que o outro aparelho criou no intervalo continua lá', naNuvem('fixas').includes('Água'), naNuvem('fixas'));

    secao('8. Importar backup = restauração autoritativa');
    const backup = JSON.stringify({ rendas: [{ name: 'Salário Novo', amount: 7000 }], fixas: [{ name: 'Aluguel', amount: 1500 }], categorias: ['Casa'], cartoes: ['Nubank'] });
    const J = await abrirAparelho('PC3');
    ler(J, `(function(){ appData = normalizarAppData(JSON.parse(${JSON.stringify(backup)})); _syncCarimbar(); _syncRestaurar(); salvarDados(); })()`);
    await assentar(J);
    check('backup substituiu as coleções na nuvem', naNuvem('fixas').join('|') === 'Aluguel' && naNuvem('rendas').join('|') === 'Salário Novo', { fixas: naNuvem('fixas'), rendas: naNuvem('rendas') });
    const K = await abrirAparelho('Celular8');
    check('outro aparelho converge para o backup', nomes(K, 'appData.fixas') === 'Aluguel', nomes(K, 'appData.fixas'));
    check('o importado não é reapagado por tombstone antigo', ler(K, 'appData.fixas.length') === 1 && ler(K, "appData.fixas[0].name") === 'Aluguel');

    secao('9. Apagar todos os dados propaga (não volta na fusão)');
    ler(J, 'appData = normalizarAppData({}); salvarDados();'); await assentar(J);
    check('nuvem ficou sem lançamentos', naNuvem('fixas').length === 0 && naNuvem('rendas').length === 0, { fixas: naNuvem('fixas'), rendas: naNuvem('rendas') });
    const L = await abrirAparelho('Celular9');
    check('aparelho novo também abre vazio', ler(L, 'appData.fixas.length + appData.rendas.length') === 0, ler(L, 'appData.fixas.length + appData.rendas.length'));

    secao('10. Gate r68b — toda coleção sincronizada está registrada');
    check('_syncColecoesNaoRegistradas() = []', JSON.stringify(ler(L, '_syncColecoesNaoRegistradas()')) === '[]', ler(L, 'JSON.stringify(_syncColecoesNaoRegistradas())'));
    check('as 7 coleções com id estão inscritas', ler(L, 'SYNC_COLECOES.length') === 7, ler(L, 'SYNC_COLECOES.join()'));
    check('merge é o caminho único (salvarNoSupabase → sincronizarSupabase)', /sincronizarSupabase/.test(ler(L, 'String(salvarNoSupabase)')) && /sincronizarSupabase/.test(ler(L, 'String(carregarDoSupabase)')));

    secao('11. Regressão — app segue funcionando');
    check('form monta e aceita lançamento', (lancar(L, 'Renda', 'Teste', 10), ler(L, "appData.rendas.some(x=>x.name==='Teste')")));
    await assentar(L);
    check('itens carimbados com id e updatedAt', ler(L, 'appData.rendas.every(x=>x.id && typeof x.updatedAt==="number" && x.updatedAt>0)'));
    check('dashboard renderizou (gráficos instanciados)', ler(L, '(window.__charts||[]).length') > 0, ler(L, '(window.__charts||[]).length'));
    check('tabela de fluxo de caixa montou', ler(L, "(document.getElementById('cashflowBody')||{innerHTML:''}).innerHTML.length") > 100);
    check('histórico carimbado com _t', ler(L, 'appData.historico.length>0 && appData.historico.every(h=>typeof h._t==="number")'));
    check('normalizarAppData round-trip preserva ids', ler(L, '(function(){const a=JSON.parse(JSON.stringify(appData));const b=normalizarAppData(a);return b.rendas.every((x,i)=>x.id===appData.rendas[i].id);})()'));
    check('modo escuro cobre a barra de meta (r67)', /html\.dark \.goal-progress-bar/.test(htmlBase));
    check('§24: .limit-input tem 16px no mobile', /@media \(max-width: 767px\) \{ \.limit-input \{[^}]*font-size: 16px/.test(htmlBase));

    secao('12. Cross-check estático (§35)');
    const idsUsados = [...htmlBase.matchAll(/getElementById\('([^']+)'\)/g)].map(m => m[1]);
    const idsDecl   = new Set([...htmlBase.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])
                        .concat([...htmlBase.matchAll(/\.id\s*=\s*'([^']+)'/g)].map(m => m[1])));   // id atribuído em JS
    const idsOrfaos = [...new Set(idsUsados)].filter(i => !idsDecl.has(i));
    check('nenhum getElementById órfão', idsOrfaos.length === 0, idsOrfaos);
    const fns = new Set([...htmlBase.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]));
    const handlers = [...new Set([...htmlBase.matchAll(/on(?:click|change|input|submit)="([A-Za-z_$][\w$]*)\(/g)].map(m => m[1]))];
    const palavras = new Set(['if', 'for', 'while', 'switch', 'return', 'typeof', 'function', 'this']);
    const semFn = handlers.filter(h => !fns.has(h) && !palavras.has(h));
    check('nenhum handler inline sem função', semFn.length === 0, semFn);
    // r68b — a regra vira teste. Mapa sincronizado funde por UNIÃO DE CHAVES: a ausência
    // nunca apaga, então `delete mapa[k]` é sempre bug (a nuvem remarca no merge seguinte).
    // Desligar tem de gravar valor falsy. Quem defende isto é a asserção ESTÁTICA (r74b):
    // a dinâmica de um aparelho só passa a ver o problema quando há uma 2ª fusão.
    const mapas = String(ler(L, 'SYNC_MAPAS.join(",")') || '').split(',').filter(Boolean);
    const comDelete = mapas.filter(m => new RegExp('delete\\s+appData\\.' + m + '\\s*\\[').test(htmlBase));
    check('nenhum `delete` de chave em mapa sincronizado', mapas.length > 0 && comDelete.length === 0, { mapas, comDelete });
    // o nome vai para dentro de um literal JS no atributo: esc() sozinho vira &#39;, que o
    // HTML decodifica ANTES do JS ler → apóstrofo mata o handler ("Conta d'água").
    const inlineComEsc = [...htmlBase.matchAll(/on(?:click|change)="[A-Za-z_$][\w$]*\('\$\{esc\(/g)].length;
    check('nenhum handler inline interpola nome com esc() cru (use escJs)', inlineComEsc === 0, inlineComEsc);

    secao('13. Migração do blob LEGADO (sem id) nos dois aparelhos');
    // Estado real de hoje: payload v4.11.3 sem id/updatedAt, igual na nuvem e no localStorage dos 2 aparelhos.
    const legado = { rendas: [{ name: 'Salário', amount: 5000 }], fixas: [{ name: 'Aluguel', amount: 1500 }, { name: 'Luz', amount: 150 }], faturas: [{ card: 'Nubank', name: 'Mercado', category: 'Alimentação', amount: 300, curr: 1, total: 3, mesInicio: 'Jul/26' }], dividas: [], categorias: ['Alimentação', 'Transporte'], cartoes: ['Nubank'] };
    nuvem.payload = JSON.parse(JSON.stringify(legado));
    const M = await abrirAparelho('PC-legado',      { localStorageInicial: JSON.stringify(legado) });
    const N = await abrirAparelho('Celular-legado', { localStorageInicial: JSON.stringify(legado) });
    await assentar(M); await assentar(N);
    check('nenhuma duplicata após os 2 aparelhos migrarem o mesmo blob', naNuvem('fixas').length === 2 && naNuvem('rendas').length === 1 && naNuvem('faturas').length === 1, { fixas: naNuvem('fixas'), rendas: naNuvem('rendas'), faturas: naNuvem('faturas').length });
    check('os dois derivaram os MESMOS ids (migração determinística)', ler(M, 'appData.fixas.map(x=>x.id).join()') === ler(N, 'appData.fixas.map(x=>x.id).join()'), { pc: ler(M, 'appData.fixas.map(x=>x.id).join()'), cel: ler(N, 'appData.fixas.map(x=>x.id).join()') });
    check('conteúdo legado intacto (nada renomeado/perdido)', nomes(M, 'appData.fixas') === 'Aluguel|Luz' && ler(M, "appData.faturas[0].name") === 'Mercado', nomes(M, 'appData.fixas'));
    lancar(N, 'Fixa', 'Água', 80); await assentar(N);
    check('lançamento novo após a migração não duplica os legados', naNuvem('fixas').length === 3, naNuvem('fixas'));

    secao('14. Convivência com aparelho ainda na versão ANTIGA (rollout, r65b)');
    let antigoHtml = null;
    try { antigoHtml = fs.readFileSync('baseline.html', 'utf8').replace(/<script src="https:\/\/[^"]*"><\/script>/g, ''); } catch (e) {}
    if (!antigoHtml) { console.log('  ⚠ pulado — sem baseline.html (rode: git show <commit-anterior>:mgc-financas.html > baseline.html)'); }
    else {
        const O = await abrirAparelho('Celular-v4.11.3', { html: antigoHtml });
        await assentar(O);
        check('a versão antiga lê o payload novo sem quebrar', ler(O, 'appData.fixas.length') === 3, ler(O, 'appData.fixas.length'));
        ler(O, "appData.fixas[0].amount = 1600; salvarDados();"); await assentar(O);
        check('e devolve os ids/updatedAt intactos (campos desconhecidos sobrevivem)', naNuvemObj('fixas').every(x => x.id && typeof x.updatedAt === 'number'), naNuvemObj('fixas').map(x => x.id));
        const P = await abrirAparelho('PC-novo-depois');
        check('o aparelho novo volta a fundir por cima sem duplicar', ler(P, 'appData.fixas.length') === 3 && ler(P, 'new Set(appData.fixas.map(x=>String(x.id))).size') === 3, ler(P, 'appData.fixas.map(x=>x.name).join()'));
        // A edição carimbada no aparelho novo tem de atravessar um aparelho ainda na versão anterior.
        ler(P, "salvarLimite('Viagem', 321)"); await assentar(P);
        const O2 = await abrirAparelho('Celular-versao-anterior', { html: antigoHtml, localStorageInicial: ler(O, "localStorage.getItem('financeAppV6_Personalized')") });
        await assentar(O2);
        check('a versão anterior recebe a edição carimbada', ler(O2, "appData.limites['Viagem']") === 321, ler(O2, "JSON.stringify(appData.limites)"));
        ler(O2, "appData.fixas[0].amount = 1650; salvarDados();"); await assentar(O2);
        const P2 = await abrirAparelho('PC-novo-depois-2', { localStorageInicial: ler(P, "localStorage.getItem('financeAppV6_Personalized')") });
        check('a edição carimbada sobrevive à gravação da versão anterior', ler(P2, "appData.limites['Viagem']") === 321, ler(P2, "JSON.stringify(appData.limites)"));
        check('e a edição feita na versão anterior chega ao aparelho novo', ler(P2, "appData.fixas[0].amount") === 1650, ler(P2, "appData.fixas[0].amount"));
        [O, P, O2, P2].forEach(x => x.dom.window.close());
    }

    secao('15. Versão exibida vem da constante embutida (r38/r72a)');
    // O estado inicial NÃO pode conter a versão: com o placeholder antigo (`v4.3.0` no HTML)
    // a asserção do rodapé passava sozinha, com o mecanismo desligado — teste verde de graça.
    const espelhos = [...htmlBase.matchAll(/id="(appVersion|appVersionFooter)"[^>]*>([^<]*)</g)].map(m => [m[1], m[2]]);
    check('os 2 espelhos de versão existem no HTML', espelhos.length === 2, espelhos);
    check('nenhum espelho nasce com número de versão (placeholder neutro)', espelhos.every(e => !/\d+\.\d+/.test(e[1])), espelhos);
    const vApp = ler(L, 'APP_VERSION');
    const txtRodape = txt(L, 'appVersionFooter');
    const txtHeader = txt(L, 'appVersion');
    check('rodapé exibe a APP_VERSION depois do boot', txtRodape === 'v' + vApp, txtRodape);
    check('header exibe a APP_VERSION depois do boot', String(txtHeader).includes('v' + vApp), txtHeader);
    check('nenhum fetch de CHANGELOG.md para exibir versão (r38a)', !/fetch\([^)]*CHANGELOG/.test(htmlBase));
    if (!/baseline/.test(ARQ)) {   // itens 1/3/4 do fluxo de release não podem divergir entre si
        const chg = fs.readFileSync('CHANGELOG.md', 'utf8').match(/##\s*\[([0-9][0-9.]*)\]/);
        const bdg = fs.readFileSync('README.md', 'utf8').match(/badge\/vers[^-]*-([0-9][0-9.]*)-/);
        check('CHANGELOG e badge do README batem com a APP_VERSION', !!chg && !!bdg && chg[1] === vApp && bdg[1] === vApp, { app: vApp, changelog: chg && chg[1], badge: bdg && bdg[1] });
    }

    secao('16. Mês do filtro é o padrão do formulário (lançar retroativo)');
    const trocarFiltro = (ap, mes) => {
        const f = ap.w.document.getElementById('filterMonth');
        f.value = mes;
        f.dispatchEvent(new ap.w.Event('change'));
        return ler(ap, "document.getElementById('newMonth').value");
    };
    const mesAtual   = ler(L, 'monthNames[HISTORY_COUNT]');
    const mesPassado = ler(L, 'monthNames[HISTORY_COUNT-1]');
    check('formulário nasce no mês atual (filtro nasce nele)', ler(L, "document.getElementById('newMonth').value") === mesAtual, { form: ler(L, "document.getElementById('newMonth').value"), atual: mesAtual });
    check('trocar o filtro para mês passado leva o formulário junto', trocarFiltro(L, mesPassado) === mesPassado, { esperado: mesPassado, form: ler(L, "document.getElementById('newMonth').value") });
    check('"Todos os Meses" cai no mês atual (não há mês definido)', trocarFiltro(L, 'Todos') === mesAtual, ler(L, "document.getElementById('newMonth').value"));
    // o caso de uso real: vários lançamentos esquecidos no mesmo mês passado
    trocarFiltro(L, mesPassado);
    lancar(L, 'RendaExtra', 'Esquecido 1', 111, mesPassado); await assentar(L);
    check('lançamento gravou no mês do filtro', ler(L, `appData.rendasExtras.some(x=>x.name==='Esquecido 1' && x.mes==='${mesPassado}')`), ler(L, 'JSON.stringify(appData.rendasExtras.map(x=>[x.name,x.mes]))'));
    check('após submeter, o formulário CONTINUA no mês do filtro', ler(L, "document.getElementById('newMonth').value") === mesPassado, ler(L, "document.getElementById('newMonth').value"));
    ler(L, 'abrirFormSheet()');
    check('sheet mobile também abre no mês do filtro', ler(L, "document.getElementById('newMonth').value") === mesPassado, ler(L, "document.getElementById('newMonth').value"));
    ler(L, 'fecharFormSheet()');
    check('todo mês do filtro existe como opção no formulário', ler(L, "(function(){const f=[...document.getElementById('filterMonth').options].map(o=>o.value).filter(v=>v!=='Todos');const n=new Set([...document.getElementById('newMonth').options].map(o=>o.value));return f.every(v=>n.has(v));})()"));

    secao('17. Renda extra aparece SÓ no mês em que foi lançada');
    const mesFuturo   = ler(L, 'monthNames[HISTORY_COUNT+1]');
    const corpoRendas = () => String(ler(L, "(document.getElementById('rendasBody')||{}).innerHTML") || '');
    trocarFiltro(L, mesFuturo);
    lancar(L, 'RendaExtra', 'Bônus futuro', 777, mesFuturo); await assentar(L);
    check('no mês da renda extra ela aparece', corpoRendas().includes('Bônus futuro'), corpoRendas().length);
    check('a renda extra de OUTRO mês não aparece', !corpoRendas().includes('Esquecido 1'), corpoRendas().length);
    trocarFiltro(L, mesPassado);
    check('trocar o mês do topo troca a lista', corpoRendas().includes('Esquecido 1') && !corpoRendas().includes('Bônus futuro'));
    trocarFiltro(L, mesAtual);
    check('mês sem renda extra não lista nenhuma', !corpoRendas().includes('Bônus futuro') && !corpoRendas().includes('Esquecido 1'));
    check('renda RECORRENTE continua aparecendo em todo mês', corpoRendas().includes('Teste'));
    trocarFiltro(L, 'Todos');
    check('"Todos os Meses" lista todas (dá para editar/remover as demais)', corpoRendas().includes('Bônus futuro') && corpoRendas().includes('Esquecido 1'));
    trocarFiltro(L, mesAtual);

    secao('18. Trazer déficit — desmarcar PERSISTE (não volta da nuvem)');
    const carryNuvem = m => ((nuvem.payload && nuvem.payload.carryForward) || {})[m];
    ler(L, `planToggleCarry('${mesFuturo}')`); await assentar(L);
    check('marcar publica o mês na nuvem', carryNuvem(mesFuturo) === true, nuvem.payload.carryForward);
    ler(L, `planToggleCarry('${mesFuturo}')`); await assentar(L);
    check('desmarcar grava FALSE — a chave não some', carryNuvem(mesFuturo) === false, nuvem.payload.carryForward);
    check('e o mês não voltou marcado no aparelho', ler(L, `!appData.carryForward['${mesFuturo}']`), ler(L, 'JSON.stringify(appData.carryForward)'));
    // o relato do usuário: com os dois marcados, desmarcar um remarcava o outro na fusão
    ler(L, `planToggleCarry('${mesAtual}'); planToggleCarry('${mesFuturo}');`); await assentar(L);
    check('os dois marcados sobem juntos', carryNuvem(mesAtual) === true && carryNuvem(mesFuturo) === true, nuvem.payload.carryForward);
    ler(L, `planToggleCarry('${mesAtual}')`);  await assentar(L);
    ler(L, `planToggleCarry('${mesFuturo}')`); await assentar(L);
    check('desmarcar os dois deixa os DOIS desmarcados', ler(L, `!appData.carryForward['${mesAtual}'] && !appData.carryForward['${mesFuturo}']`), ler(L, 'JSON.stringify(appData.carryForward)'));
    const Q = await abrirAparelho('Celular-carry');
    check('aparelho novo abre com os dois desmarcados', ler(Q, `!appData.carryForward['${mesAtual}'] && !appData.carryForward['${mesFuturo}']`), ler(Q, 'JSON.stringify(appData.carryForward)'));
    ler(Q, 'togglePlanPanel()');
    const corpoCarry = String(ler(Q, "(document.getElementById('planCarryBody')||{}).innerHTML") || '');
    check('o painel monta e nenhum checkbox nasce marcado', /planToggleCarry\(/.test(corpoCarry) && !/checked/.test(corpoCarry), corpoCarry.slice(0, 160));

    secao('19. Sugestões de descrição — remover limpa o autocomplete e propaga');
    const opcoesDesc = ap => String(ler(ap, "(document.getElementById('descSugestoes')||{}).innerHTML") || '');
    lancar(L, 'Fixa', 'Mercadoo', 50); await assentar(L);      // descrição digitada errado
    check('a descrição digitada entra no autocomplete', opcoesDesc(L).includes('Mercadoo'), opcoesDesc(L).length);
    ler(L, "removerDescricao('Mercadoo')"); await assentar(L);
    check('remover tira a sugestão do datalist', !opcoesDesc(L).includes('Mercadoo'), opcoesDesc(L));
    check('e o LANÇAMENTO continua intacto (só o autocomplete some)', ler(L, "appData.fixas.some(x=>x.name==='Mercadoo')"));
    check('a remoção virou tombstone na nuvem', !!(nuvem.payload.del || {})['desc:Mercadoo'], Object.keys(nuvem.payload.del || {}).filter(k => k.indexOf('desc:') === 0));
    const R2 = await abrirAparelho('Celular-desc');
    check('outro aparelho também não sugere a removida', !opcoesDesc(R2).includes('Mercadoo'), opcoesDesc(R2));
    check('as demais sugestões continuam lá', opcoesDesc(R2).includes('Teste'), opcoesDesc(R2));
    lancar(R2, 'Fixa', 'Mercadoo', 50); await assentar(R2);
    check('digitar de novo revive a sugestão', opcoesDesc(R2).includes('Mercadoo'), opcoesDesc(R2));
    const S = await abrirAparelho('Celular-desc2');
    check('e a revivida chega no aparelho seguinte', opcoesDesc(S).includes('Mercadoo'), opcoesDesc(S));
    ler(S, "abrirManager('desc')");
    check('a aba Descrições lista com botão de remover', /removerDescricao\(/.test(String(ler(S, "(document.getElementById('descricoesList')||{}).innerHTML") || '')));
    ler(S, "limparDescricoes(); document.getElementById('confirmOkBtn').click();"); await assentar(S);
    check('limpar todas esvazia o autocomplete', opcoesDesc(S) === '', opcoesDesc(S));
    check('e limpar sugestão não apagou lançamento nenhum', ler(S, "appData.fixas.some(x=>x.name==='Mercadoo')"), ler(S, 'appData.fixas.length'));

    secao('20. Limite de categoria — limpar PERSISTE e não vira alerta fantasma');
    // Mesma armadilha do carryForward (§15): `delete` num mapa sincronizado não apaga nada,
    // a nuvem repõe o limite na fusão seguinte. Limpar grava 0 — e aí o 0 tem de ser lido
    // como "sem limite", senão TODA categoria com gasto passa a estourar um limite de zero.
    const limiteNuvem = c => ((nuvem.payload && nuvem.payload.limites) || {})[c];
    const catLim = ler(L, 'getCategorias()[0]');
    const gastar = (ap, cat, valor) => {   // fatura no mês em tela = entra no categoryTotalsThisMonth
        const d = ap.w.document;
        const põe = (id, v) => { const e = d.getElementById(id); if (e) e.value = v; };   // r74a
        põe('newType',     ler(ap, 'getCartoes()[0]'));
        põe('newName',     'Gasto ' + cat);
        põe('newAmount',   String(valor));
        põe('newCategory', cat);
        põe('newMonth',    ler(ap, 'monthNames[HISTORY_COUNT]'));
        const f = d.getElementById('addExpenseForm');
        if (f) f.dispatchEvent(new ap.w.Event('submit'));
    };
    const alertaVisivel = ap => ler(ap, "!document.getElementById('alertBanner').classList.contains('hidden')");
    gastar(L, catLim, 900); await assentar(L);
    ler(L, `salvarLimite('${catLim}', '300'); processarDadosERenderizar();`); await assentar(L);
    check('gravar limite publica na nuvem', limiteNuvem(catLim) === 300, nuvem.payload.limites);
    // o caso POSITIVO prova que o banner está vivo — sem ele, o "sumiu" abaixo passaria de graça
    check('gasto acima do limite acende o alerta', alertaVisivel(L) === true, ler(L, "document.getElementById('alertChips').innerHTML"));
    ler(L, `salvarLimite('${catLim}', ''); processarDadosERenderizar();`); await assentar(L);
    check('limpar grava 0 — a chave NÃO some do mapa', limiteNuvem(catLim) === 0, nuvem.payload.limites);
    check('e o alerta apaga (0 é "sem limite", não limite de zero)', alertaVisivel(L) === false, ler(L, "document.getElementById('alertChips').innerHTML"));
    const T = await abrirAparelho('Celular-limite');
    check('outro aparelho abre com o limite limpo (não volta da nuvem)', !ler(T, `appData.limites['${catLim}']`), ler(T, 'JSON.stringify(appData.limites)'));
    check('e sem alerta fantasma no aparelho novo', alertaVisivel(T) === false, ler(T, "document.getElementById('alertChips').innerHTML"));

    secao('21. Nome com apóstrofo — o handler inline sobrevive ao HTML');
    // O nome entra num literal JS DENTRO de um atributo: o parser de HTML decodifica &#39;
    // de volta para ' ANTES de o JS ser compilado. Só o esc() deixa o handler inválido e o
    // botão morre em silêncio (sem erro visível). A asserção estática da §12 é um lint — não
    // veria um `escJs = esc`; esta aqui exercita o caminho real, com o HTML parseado.
    const U = await abrirAparelho('PC-apostrofo');
    const btnApos = sel => `(function(){const b=[...document.querySelectorAll('${sel} .tag-remove')].find(x=>/d.água/.test(x.parentNode.textContent));return b;})()`;
    ler(U, `appData.categorias.push("Conta d'água"); salvarDados(); abrirManager('cat');`); await assentar(U);
    check('a categoria com apóstrofo aparece na lista', /d.água/.test(String(ler(U, "document.getElementById('categoriasList').innerHTML") || '')), String(ler(U, "document.getElementById('categoriasList').innerHTML") || '').slice(0, 120));
    const onclickApos = ler(U, `(${btnApos('#categoriasList')}||{}).getAttribute && ${btnApos('#categoriasList')}.getAttribute('onclick')`);
    check('o onclick gerado é JS VÁLIDO depois de decodificado', ler(U, `(function(){try{new Function(${JSON.stringify(String(onclickApos || 'ç'))});return true}catch(e){return false}})()`), onclickApos);
    ler(U, `(${btnApos('#categoriasList')}||{}).click && ${btnApos('#categoriasList')}.click()`); await assentar(U);
    check('clicar remove de verdade a categoria com apóstrofo', ler(U, `!appData.categorias.some(c=>/d.água/.test(c))`), ler(U, 'JSON.stringify(appData.categorias)'));
    // mesmo caminho na aba Descrições (removerDescricao) — o outro consumidor do escJs
    lancar(U, 'Fixa', "Conta d'água", 90); await assentar(U);
    ler(U, "abrirManager('desc')");
    ler(U, `(${btnApos('#descricoesList')}||{}).click && ${btnApos('#descricoesList')}.click()`); await assentar(U);
    check('e a sugestão com apóstrofo também sai pelo botão', !String(ler(U, "document.getElementById('descSugestoes').innerHTML") || '').match(/d.água/), ler(U, "document.getElementById('descSugestoes').innerHTML"));

    secao('22. Coluna Ações presa à direita (Detalhamento de Faturas)');
    // A coluna fica depois de 36 colunas de mês; editar exigia arrastar a barra até o fim.
    // Fixar à direita resolve SEM reordenar o DOM — e é isso que estas asserções protegem:
    // se alguém "melhorar" movendo a coluna de lugar, o colspan e os índices do auto-scroll
    // quebram junto (foi assim que a v4.11.3 abriu a tabela na coluna errada).
    gastar(L, catLim, 120); await assentar(L);
    const nTh = ler(L, "document.querySelectorAll('#dataTable thead tr th').length");
    check('cabeçalho tem 3 colunas fixas + meses + Ações', nTh === ler(L, '3 + visibleMonths + 1'), { th: nTh, esperado: ler(L, '3 + visibleMonths + 1') });
    check('a ÚLTIMA coluna do cabeçalho é Ações e está presa', ler(L, "(function(){const t=[...document.querySelectorAll('#dataTable thead tr th')].pop();return t.textContent.trim()==='Ações' && t.classList.contains('fat-sr');})()"), ler(L, "[...document.querySelectorAll('#dataTable thead tr th')].pop().outerHTML.slice(0,120)"));
    // o invariante que o auto-scroll assume: th[2] = última fixa da esquerda, th[3] = 1º mês
    check('th[2] segue sendo Parcela e th[3] o 1º mês (auto-scroll intacto)', ler(L, "(function(){const t=document.querySelectorAll('#dataTable thead tr th');return t[2].classList.contains('fat-s3') && !t[3].classList.contains('fat-s3') && !t[3].classList.contains('fat-sr');})()"));
    const linhas = ler(L, "[...document.querySelectorAll('#dataTable tbody tr')].filter(r=>!r.querySelector('[colspan]'))");
    check('há linha de fatura de verdade para conferir', ler(L, "[...document.querySelectorAll('#dataTable tbody tr')].filter(r=>!r.querySelector('[colspan]')).length") > 0);
    // ALINHAMENTO — a asserção que pega célula sobrando/faltando (o modo de falha do rodapé)
    check('toda linha do corpo tem o mesmo nº de células do cabeçalho', ler(L, `[...document.querySelectorAll('#dataTable tbody tr')].filter(r=>!r.querySelector('[colspan]')).every(r=>r.children.length===${nTh})`), ler(L, "[...document.querySelectorAll('#dataTable tbody tr')].filter(r=>!r.querySelector('[colspan]')).map(r=>r.children.length).join(',')"));
    check('as 2 linhas do RODAPÉ também batem com o cabeçalho', ler(L, `[...document.querySelectorAll('#dataTable tfoot tr')].every(r=>r.children.length===${nTh})`), ler(L, "[...document.querySelectorAll('#dataTable tfoot tr')].map(r=>r.children.length).join(',')"));
    check('última célula de cada linha do corpo é a de Ações, presa', ler(L, "[...document.querySelectorAll('#dataTable tbody tr')].filter(r=>!r.querySelector('[colspan]')).every(r=>{const c=r.children[r.children.length-1];return c.classList.contains('fat-sr') && /editarItem\\('fatura'/.test(c.innerHTML);})"));
    check('última célula de cada linha do rodapé também é presa', ler(L, "[...document.querySelectorAll('#dataTable tfoot tr')].every(r=>r.children[r.children.length-1].classList.contains('fat-sr'))"), ler(L, "[...document.querySelectorAll('#dataTable tfoot tr')].map(r=>r.children[r.children.length-1].outerHTML.slice(0,60)).join(' | ')"));
    // ESTÁTICO (r67/r78c) — célula presa sem fundo opaco deixa os meses passarem POR BAIXO.
    // Cada regra companheira é uma inscrição; faltando uma, só UM estado fica transparente
    // (só no hover, só na linha de TOTAL, só no escuro) — invisível numa conferência rápida.
    const regrasSr = [...htmlBase.matchAll(/^\s*([^\n{]*\.fat-sr[^\n{]*)\{/gm)].map(m => m[1].trim());
    const precisa = [
        ['base presa à direita',      /^\.fat-sr$/],
        ['cabeçalho',                 /^thead \.fat-sr$/],
        ['linha sob o mouse',         /^tr:hover > \.fat-sr$/],
        ['linha TOTAL CARTÕES',       /^\.bg-indigo-50 > \.fat-sr$/],
        ['linha SAÍDA TOTAL',         /^\.bg-gray-800 > \.fat-sr$/],
        ['tema escuro',               /^html\.dark \.fat-sr$/],
        ['tema escuro, cabeçalho',    /^html\.dark thead \.fat-sr$/],
        ['tema escuro, rodapé',       /^html\.dark #dataTable tfoot \.fat-sr$/],
    ];
    const faltando = precisa.filter(([, re]) => !regrasSr.some(s => re.test(s))).map(([n]) => n);
    check('a coluna presa tem fundo opaco em TODOS os estados', faltando.length === 0, { faltando, achadas: regrasSr });
    check('e a sombra dela aponta para a ESQUERDA (o conteúdo vem de lá)', /\.fat-sr\s*\{[^}]*box-shadow:\s*-\d/.test(htmlBase));
    // a decisão de mobile virou regra: no celular 355px já ficam congelados numa tela de ~390px
    check('a fixação vale só a partir de 768px (mobile intacto)', /@media\s*\(min-width:\s*768px\)\s*\{[^@]*\.fat-sr/.test(htmlBase));

    secao('23. Dia da compra — campo pegajoso, sem data inventada');
    // r74a: PASSO QUE DIRIGE o app também tem de tolerar nó ausente. A 1ª versão fazia
    // `d.getElementById('newDia').value = …` cru e, contra o código anterior (sem o campo),
    // estourou e MATOU o harness — as seções 23 e 24 nem apareceram, que é indistinguível
    // de "passou" para quem só olha o stdout. Com o setter tolerante vira ✗ localizado.
    const setV = (ap, id, v) => { const e = ap.w.document.getElementById(id); if (e) e.value = v; return !!e; };
    const comprar = (ap, nome, valor, mes, dia) => {
        setV(ap, 'newType',     ler(ap, 'getCartoes()[0]'));
        setV(ap, 'newName',     nome);
        setV(ap, 'newAmount',   String(valor));
        setV(ap, 'newCategory', ler(ap, 'getCategorias()[0]'));
        setV(ap, 'newMonth',    mes);
        setV(ap, 'newDia',      dia === undefined ? '' : String(dia));
        const f = ap.w.document.getElementById('addExpenseForm');
        if (f) f.dispatchEvent(new ap.w.Event('submit'));
    };
    const fat = (ap, nome) => ler(ap, `(appData.faturas.find(f=>f.name===${JSON.stringify(nome)})||{})`);
    const mesHoje = ler(L, 'monthNames[HISTORY_COUNT]');
    const mesAnt  = ler(L, 'monthNames[HISTORY_COUNT-1]');
    comprar(L, 'Compra dia 7', 70, mesHoje, 7); await assentar(L);
    check('o dia escolhido grava na compra', fat(L, 'Compra dia 7').dia === 7, fat(L, 'Compra dia 7'));
    // O PEDIDO: escolher a data uma vez e lançar vários sem redigitar
    check('o campo CONTINUA com o dia depois de enviar', ler(L, "document.getElementById('newDia').value") === '7', ler(L, "document.getElementById('newDia').value"));
    comprar(L, 'Mesma data 2', 80, mesHoje, 7); await assentar(L);
    check('a 2ª compra sai com a mesma data sem redigitar', fat(L, 'Mesma data 2').dia === 7);
    check('e o dia sobrevive ao reset do formulário', ler(L, "document.getElementById('newDia').value") === '7');
    // sem dia = SEM campo; o gráfico precisa distinguir "não sei" de um dia qualquer
    comprar(L, 'Sem data', 90, mesHoje); await assentar(L);
    check('deixar vazio não inventa data (campo ausente)', !('dia' in fat(L, 'Sem data')), fat(L, 'Sem data'));
    check('e o campo vazio também permanece vazio', ler(L, "document.getElementById('newDia').value") === '');
    // exige que o campo TENHA recebido o 32 — senão, num código sem o campo, o passo não
    // roda e o "nada gravado" passaria sozinho (verde vazio; ver r74a)
    setV(L, 'newDia', '32'); setV(L, 'newName', 'Dia impossível'); setV(L, 'newAmount', '10');
    const pegou32 = ler(L, "document.getElementById('newDia').value") === '32';
    ler(L, "document.getElementById('addExpenseForm').dispatchEvent(new Event('submit'))"); await assentar(L);
    check('dia fora de 1..31 é recusado (nada gravado)', pegou32 && !ler(L, "appData.faturas.some(f=>f.name==='Dia impossível')"), { pegou32 });
    ler(L, "preencherDiaHoje()");
    check('"hoje" preenche o dia de hoje', ler(L, "document.getElementById('newDia').value") === String(ler(L, 'new Date().getDate()')), ler(L, "document.getElementById('newDia').value"));
    ler(L, "document.getElementById('newType').value='Fixa'; toggleFormFields();");
    check('o campo Dia some para tipo que não é cartão', ler(L, "document.getElementById('divNewDia').style.display") === 'none');
    ler(L, `document.getElementById('newType').value=getCartoes()[0]; toggleFormFields();`);
    check('e volta para cartão', ler(L, "document.getElementById('divNewDia').style.display") !== 'none');

    secao('24. Preencher datas em massa — escreve na compra CERTA');
    // A lista do modal é FILTRADA por mês. Gravar pela posição da lista escreveria
    // na fatura errada — por isso o índice original viaja no data-fat de cada campo.
    comprar(L, 'Antiga mes passado', 55, mesAnt); await assentar(L);
    comprar(L, 'Antiga A', 11, mesHoje); await assentar(L);
    comprar(L, 'Antiga B', 22, mesHoje); await assentar(L);
    const antesDaLista = ler(L, "JSON.stringify(appData.faturas.slice(0,2).map(f=>f.dia===undefined?null:f.dia))");
    ler(L, "abrirDatasModal()");
    const naLista = ler(L, "[...document.querySelectorAll('#datasLista .datas-dia')].length");
    check('o modal lista as compras sem data do mês em tela', naLista >= 3, { naLista });
    // as duas negativas exigem lista NÃO-VAZIA: com 0 itens elas passariam sozinhas
    check('e NÃO lista as de outro mês', naLista > 0 && !/Antiga mes passado/.test(String(ler(L, "document.getElementById('datasLista').innerHTML") || '')));
    check('nem as que já têm data', naLista > 0 && !/Compra dia 7/.test(String(ler(L, "document.getElementById('datasLista').innerHTML") || '')));
    ler(L, `(function(){const c=[...document.querySelectorAll('#datasLista .datas-dia')];
        const a=c.find(e=>e.parentNode.textContent.includes('Antiga A'));
        const b=c.find(e=>e.parentNode.textContent.includes('Antiga B'));
        if(a) a.value='5'; if(b) b.value='9';})()`);
    ler(L, "salvarDatas()"); await assentar(L);
    check('cada compra recebeu O SEU dia', fat(L, 'Antiga A').dia === 5 && fat(L, 'Antiga B').dia === 9, { a: fat(L, 'Antiga A').dia, b: fat(L, 'Antiga B').dia });
    check('a compra deixada em branco segue sem data', !('dia' in fat(L, 'Sem data')), fat(L, 'Sem data'));
    check('a de outro mês não foi tocada', !('dia' in fat(L, 'Antiga mes passado')), fat(L, 'Antiga mes passado'));
    check('e nenhuma fatura de outra seção foi sobrescrita', ler(L, "JSON.stringify(appData.faturas.slice(0,2).map(f=>f.dia===undefined?null:f.dia))") === antesDaLista, { antes: antesDaLista, depois: ler(L, "JSON.stringify(appData.faturas.slice(0,2).map(f=>f.dia===undefined?null:f.dia))") });
    ler(L, "document.getElementById('datasTodos').value='3'; aplicarDiaTodas();");
    check('"preencher tudo" preenche todos os campos da lista', ler(L, "(function(){const c=[...document.querySelectorAll('#datasLista .datas-dia')];return c.length>0 && c.every(e=>e.value==='3');})()"), ler(L, "[...document.querySelectorAll('#datasLista .datas-dia')].length"));
    // o convite some sozinho quando não há mais o que preencher
    ler(L, "salvarDatas()"); await assentar(L);
    check('o botão de preencher some quando o mês fica completo', ler(L, "_faturasSemData(_mesPadraoForm()).length") === 0 && ler(L, "document.getElementById('btnDatas').style.display") === 'none', { faltam: ler(L, "_faturasSemData(_mesPadraoForm()).length"), display: ler(L, "document.getElementById('btnDatas').style.display") });
    // edição avulsa + o dia atravessa o sync
    ler(L, `(function(){const i=appData.faturas.findIndex(f=>f.name==='Antiga A'); editarItem('fatura',i);})()`);
    check('a edição abre mostrando o dia gravado', ler(L, "document.getElementById('editDia').value") === '5', ler(L, "document.getElementById('editDia').value"));
    ler(L, "document.getElementById('editDia').value='21'; document.getElementById('editSaveBtn').click();"); await assentar(L);
    check('editar o dia grava o novo valor', fat(L, 'Antiga A').dia === 21, fat(L, 'Antiga A'));
    const V = await abrirAparelho('Celular-dia');
    check('o dia chega no outro aparelho pelo sync', fat(V, 'Antiga A').dia === 21, fat(V, 'Antiga A'));
    ler(L, `(function(){const i=appData.faturas.findIndex(f=>f.name==='Antiga A'); editarItem('fatura',i);})()`);
    ler(L, "document.getElementById('editDia').value=''; document.getElementById('editSaveBtn').click();"); await assentar(L);
    check('limpar o dia na edição remove a data', !ler(L, "!!appData.faturas.find(f=>f.name==='Antiga A').dia"), fat(L, 'Antiga A'));
    const W = await abrirAparelho('Celular-dia2');
    check('e a limpeza também propaga (não volta da nuvem)', !ler(W, "!!(appData.faturas.find(f=>f.name==='Antiga A')||{}).dia"), fat(W, 'Antiga A'));
    check('o CSV exporta a coluna Dia', /Mês Início,Dia/.test(htmlBase) && /f\.mesInicio \|\| ''\},\$\{f\.dia \|\| ''\}/.test(htmlBase));

    secao('25. Vigência — alterar renda/fixa NÃO reescreve o passado');
    // Cenário LIMPO: a nuvem falsa é compartilhada por todos os aparelhos do harness, e sem
    // zerá-la o aparelho novo funde o acumulado das seções anteriores e os números não fecham.
    const blobVig = {
        rendas: [{ name: 'Salário', amount: 5000 }],          // LEGADO: sem inicio/fim
        fixas:  [{ name: 'Aluguel', amount: 1500 }],
        faturas: [], dividas: [], rendasExtras: [], categorias: ['Casa'], cartoes: ['Nubank']
    };
    nuvem.payload = JSON.parse(JSON.stringify(blobVig));
    const X = await abrirAparelho('PC-vigencia', { localStorageInicial: JSON.stringify(blobVig) });
    const mesAtualX  = ler(X, 'monthNames[HISTORY_COUNT]');
    const mesAntX    = ler(X, 'monthNames[HISTORY_COUNT-1]');
    const iAgora     = ler(X, 'HISTORY_COUNT');
    const serie      = (ap, arr, i) => ler(ap, `${arr}[${i}]`);
    // 1) O LEGADO não pode mudar de sentido na atualização
    check('renda legada (sem vigência) conta em TODOS os meses', serie(X, '_rendaArr', 0) === 5000 && serie(X, '_rendaArr', iAgora) === 5000, { mes0: serie(X, '_rendaArr', 0), atual: serie(X, '_rendaArr', iAgora) });
    check('despesa fixa legada idem', serie(X, '_fixasArr', 0) === 1500 && serie(X, '_fixasArr', iAgora) === 1500);

    // 2) O CENÁRIO DO USUÁRIO: salário aumenta em agosto
    const trocaMes = (ap, m) => { const f = ap.w.document.getElementById('filterMonth'); if (f) { f.value = m; f.dispatchEvent(new ap.w.Event('change')); } };
    trocaMes(X, mesAtualX);
    ler(X, "(function(){const i=appData.rendas.findIndex(r=>r.name==='Salário'); editarItem('renda',i);})()");
    // exige que a linha EXISTA — `undefined !== 'none'` passaria num código sem ela
    check('o modal de renda oferece a escolha de vigência', ler(X, "!!document.getElementById('editVigenciaRow') && document.getElementById('editVigenciaRow').style.display !== 'none'"), ler(X, "!!document.getElementById('editVigenciaRow')"));
    check('e vem com "a partir deste mês" marcado', ler(X, "document.getElementById('editVigDaqui').checked") === true);
    ler(X, "document.getElementById('editValor').value='6500'; document.getElementById('editSaveBtn').click();"); await assentar(X);
    check('virou DOIS registros (o antigo encerrado + o novo)', ler(X, "appData.rendas.length") === 2, ler(X, 'JSON.stringify(appData.rendas)'));
    check('o antigo foi encerrado no mês ANTERIOR', ler(X, `appData.rendas[0].fim === '${mesAntX}'`), ler(X, 'appData.rendas[0].fim'));
    check('o novo vale a partir do mês em tela', ler(X, `appData.rendas[1].inicio === '${mesAtualX}' && appData.rendas[1].amount === 6500`), ler(X, 'JSON.stringify(appData.rendas[1])'));
    // O QUE O USUÁRIO RELATOU: o passado NÃO pode mudar
    check('mês passado continua com 5000 (histórico intacto)', serie(X, '_rendaArr', iAgora - 1) === 5000, serie(X, '_rendaArr', iAgora - 1));
    check('o mês mais antigo da janela também', serie(X, '_rendaArr', 0) === 5000, serie(X, '_rendaArr', 0));
    check('e o mês atual em diante tem 6500', serie(X, '_rendaArr', iAgora) === 6500 && serie(X, '_rendaArr', iAgora + 1) === 6500, { atual: serie(X, '_rendaArr', iAgora), prox: serie(X, '_rendaArr', iAgora + 1) });
    check('nenhum mês soma os DOIS (5000+6500=11500 seria dupla contagem)', ler(X, '_rendaArr.every(v=>v===5000||v===6500)'), ler(X, 'JSON.stringify(_rendaArr.slice(0,3))'));

    // 3) Despesa fixa NOVA não retroage
    trocaMes(X, mesAtualX);
    lancar(X, 'Fixa', 'Internet nova', 120); await assentar(X);
    check('fixa nova não conta no mês anterior', serie(X, '_fixasArr', iAgora - 1) === 1500, serie(X, '_fixasArr', iAgora - 1));
    check('e conta do mês em tela em diante', serie(X, '_fixasArr', iAgora) === 1620 && serie(X, '_fixasArr', iAgora + 1) === 1620, { atual: serie(X, '_fixasArr', iAgora) });
    check('nasce com `inicio` gravado', ler(X, "(appData.fixas.find(f=>f.name==='Internet nova')||{}).inicio") === mesAtualX);

    // 4) Cortar a conta de celular em agosto (o exemplo do usuário)
    ler(X, "(function(){const i=appData.fixas.findIndex(f=>f.name==='Aluguel'); removerItem('fixa',i);})()");
    check('o ✕ pergunta antes (não apaga direto)', ler(X, "!document.getElementById('confirmModal').classList.contains('hidden')"));
    check('e oferece a saída "Apagar de vez"', ler(X, "document.getElementById('confirmAltBtn').style.display") !== 'none' && /Apagar/.test(String(ler(X, "document.getElementById('confirmAltBtn').textContent") || '')));
    ler(X, "document.getElementById('confirmOkBtn').click()"); await assentar(X);
    check('encerrar NÃO apaga o registro', ler(X, "appData.fixas.some(f=>f.name==='Aluguel')"), ler(X, 'JSON.stringify(appData.fixas.map(f=>f.name))'));
    check('o mês anterior mantém a despesa', serie(X, '_fixasArr', iAgora - 1) === 1500, serie(X, '_fixasArr', iAgora - 1));
    check('e ela some do mês em tela em diante', serie(X, '_fixasArr', iAgora) === 120 && serie(X, '_fixasArr', iAgora + 1) === 120, { atual: serie(X, '_fixasArr', iAgora) });

    // 5) A tabela acompanha o mês, e o saldo passado não muda
    const corpoFix = () => String(ler(X, "(document.getElementById('fixedExpensesBody')||{}).innerHTML") || '');
    trocaMes(X, mesAntX);
    check('tabela do mês passado ainda mostra a encerrada', corpoFix().includes('Aluguel') && !corpoFix().includes('Internet nova'), corpoFix().length);
    trocaMes(X, mesAtualX);
    check('tabela do mês atual mostra só a vigente', !corpoFix().includes('Aluguel') && corpoFix().includes('Internet nova'));
    trocaMes(X, 'Todos');
    check('"Todos os Meses" lista as duas (dá para reabrir/editar)', corpoFix().includes('Aluguel') && corpoFix().includes('Internet nova'));
    trocaMes(X, mesAtualX);

    // 6) "corrigir em todo o histórico" continua existindo (valor digitado errado)
    ler(X, "(function(){const i=appData.fixas.findIndex(f=>f.name==='Internet nova'); editarItem('fixa',i);})()");
    ler(X, "document.getElementById('editValor').value='99'; document.querySelector('input[name=editVigencia][value=tudo]').checked=true; document.getElementById('editSaveBtn').click();"); await assentar(X);
    check('corrigir no histórico NÃO cria registro novo', ler(X, "appData.fixas.filter(f=>f.name==='Internet nova').length") === 1, ler(X, 'JSON.stringify(appData.fixas)'));
    check('e o valor corrigido vale de onde o item já valia', serie(X, '_fixasArr', iAgora) === 99 && serie(X, '_fixasArr', iAgora - 1) === 1500, { atual: serie(X, '_fixasArr', iAgora), ant: serie(X, '_fixasArr', iAgora - 1) });

    // 7) O saldo por mês reflete a vigência (é o que o usuário viu falseado)
    check('o saldo de um mês passado usa a renda daquele mês', ler(X, `_saldoBaseArr[${iAgora - 1}] === 5000 - 1500`), ler(X, `_saldoBaseArr[${iAgora - 1}]`));
    check('e o do mês atual usa a renda nova', ler(X, `_saldoBaseArr[${iAgora}] === 6500 - 99`), ler(X, `_saldoBaseArr[${iAgora}]`));

    // 8) Vigência atravessa o sync
    const Y = await abrirAparelho('Celular-vigencia');
    check('o outro aparelho recebe a vigência', ler(Y, "appData.rendas.length") === 2 && ler(Y, `appData.rendas[0].fim === '${mesAntX}'`), ler(Y, 'JSON.stringify(appData.rendas)'));
    check('e calcula o mesmo histórico', ler(Y, `_rendaArr[${iAgora - 1}]`) === 5000 && ler(Y, `_rendaArr[${iAgora}]`) === 6500);
    check('CSV exporta Início e Fim', /Nome,Valor,Início,Fim/.test(htmlBase));

    secao('26. Auditoria dos cards — o que está NA TELA tem de fechar');
    // Estas asserções leem o TEXTO RENDERIZADO, não as variáveis: o defeito relatado pelo
    // usuário era exatamente um número certo por dentro e velho na tela (trocar o mês
    // chamava só renderDashboard, e os escalares de renda/fixa eram definidos na outra
    // função — os cards ficavam parados no mês do último recálculo).
    const moeda = t => {
        const s = String(t || '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
        const n = parseFloat(s);
        return isNaN(n) ? null : n;
    };
    const card = (ap, id) => moeda(ler(ap, `(document.getElementById('${id}')||{}).textContent`));
    // Os KPIs sobem ANIMADOS (animateKpi, ANIM_DURATION=500ms): ler o texto na hora pega
    // um valor a meio caminho. Espera o número parar de mudar antes de comparar — senão o
    // teste mede a animação, não o resultado.
    const paradoEm = async (ap, id) => {
        let ant = null;
        for (let i = 0; i < 60; i++) {
            await new Promise(r => setTimeout(r, 25));
            const v = card(ap, id);
            if (v !== null && v === ant) return v;
            ant = v;
        }
        return ant;
    };
    const verMes = async (ap, mes) => { trocaMes(ap, mes); await assentar(ap); await paradoEm(ap, 'valorRenda'); await paradoEm(ap, 'valorFixas'); await paradoEm(ap, 'totalCardSaldo'); };
    // renda extra no mês atual, para o total do painel ter as duas naturezas
    trocaMes(X, mesAtualX);
    lancar(X, 'RendaExtra', 'Bônus', 700, mesAtualX); await assentar(X);
    await verMes(X, mesAtualX);

    check('card Renda = rodapé RENDA TOTAL do painel', card(X, 'valorRenda') === card(X, 'rendasTotal'), { card: card(X, 'valorRenda'), painel: card(X, 'rendasTotal') });
    check('e vale a soma do que o painel LISTA (recorrente vigente + extra do mês)', card(X, 'valorRenda') === 6500 + 700, card(X, 'valorRenda'));
    check('card Fixas = rodapé TOTAL FIXO do painel', card(X, 'valorFixas') === card(X, 'fixedExpensesTotal'), { card: card(X, 'valorFixas'), painel: card(X, 'fixedExpensesTotal') });
    // a aritmética que o usuário consegue conferir na tela
    const somaSaldo = ap => card(ap, 'valorRenda') - card(ap, 'valorFixas') - card(ap, 'totalCardFatura') - card(ap, 'valorDivida');
    check('Saldo = Renda − Fixas − Faturas − Dívidas (sem déficit trazido)', Math.abs(card(X, 'totalCardSaldo') - somaSaldo(X)) < 0.01, { saldo: card(X, 'totalCardSaldo'), contas: somaSaldo(X) });

    // O BUG RELATADO: trocar o mês tem de mexer nos cards
    const rendaAgo = card(X, 'valorRenda'), fixasAgo = card(X, 'valorFixas'), saldoAgo = card(X, 'totalCardSaldo');
    await verMes(X, mesAntX);
    const rendaJul = card(X, 'valorRenda'), fixasJul = card(X, 'valorFixas');
    check('trocar o mês ATUALIZA o card de renda (não fica no mês anterior)', rendaJul !== rendaAgo, { ago: rendaAgo, jul: rendaJul });
    check('o mês passado mostra a renda ANTIGA (5000, sem o bônus de agosto)', rendaJul === 5000, rendaJul);
    check('e o card de fixas também acompanha', fixasJul !== fixasAgo && fixasJul === 1500, { ago: fixasAgo, jul: fixasJul });
    check('no mês passado o rodapé do painel também bate com o card', card(X, 'valorRenda') === card(X, 'rendasTotal'));
    check('e o Saldo do mês passado fecha pelos cards', Math.abs(card(X, 'totalCardSaldo') - somaSaldo(X)) < 0.01, { saldo: card(X, 'totalCardSaldo'), contas: somaSaldo(X) });
    check('o rótulo do rodapé diz de que mês é o total', String(ler(X, "(document.getElementById('rendasTotalLabel')||{}).textContent") || '').includes(mesAntX), { esperado: mesAntX, rotulo: ler(X, "(document.getElementById('rendasTotalLabel')||{}).textContent") });
    await verMes(X, mesAtualX);
    check('voltar para agosto restaura os valores de agosto', card(X, 'valorRenda') === rendaAgo && card(X, 'totalCardSaldo') === saldoAgo, { renda: card(X, 'valorRenda'), saldo: card(X, 'totalCardSaldo') });

    // o painel e a série interna não podem discordar
    check('card de renda == série do mês (tela e cálculo de acordo)', card(X, 'valorRenda') === ler(X, `(_rendaArr[${iAgora}]||0) + (_rendaExtraArr[${iAgora}]||0)`), { tela: card(X, 'valorRenda'), serie: ler(X, `(_rendaArr[${iAgora}]||0) + (_rendaExtraArr[${iAgora}]||0)`) });
    check('card de fixas == série do mês', card(X, 'valorFixas') === ler(X, `_fixasArr[${iAgora}]`), { tela: card(X, 'valorFixas'), serie: ler(X, `_fixasArr[${iAgora}]`) });
    // guard estático: quem depende do mês não pode ser definido fora do renderDashboard
    check('TOTAL_FIXED/RENDA_MENSAL só são atribuídos no renderDashboard', (() => {
        const corpo = (htmlBase.match(/function processarDadosERenderizar\(\)[\s\S]*?\n\}/) || [''])[0];
        return !/^\s*(TOTAL_FIXED|RENDA_MENSAL)\s*=/m.test(corpo);
    })());

    secao('27. Compras nos Cartões — 3 modos e parcela que se propaga');
    // O stub de Chart guarda a config em w.__charts; localizamos o gráfico pelo título do
    // eixo X ('dia do mês' nas visões diárias, 'mês' na mensal) — nenhum outro o define.
    const cfgCompras = ap => {
        const n = ler(ap, '__charts.length');
        for (let i = n - 1; i >= 0; i--) {
            const lbl = ler(ap, `(__charts[${i}].options&&__charts[${i}].options.scales&&__charts[${i}].options.scales.x&&__charts[${i}].options.scales.x.title||{}).text`);
            if (lbl === 'dia do mês' || lbl === 'mês') return i;
        }
        return -1;
    };
    const totalGraf = (ap, i) => ler(ap, `__charts[${i}].data.datasets.reduce((s,d)=>s+d.data.reduce((a,b)=>Math.max(a,b),0),0)`);
    const Z = await abrirAparelho('PC-grafico');
    const mesZ  = ler(Z, 'monthNames[HISTORY_COUNT]');
    const mesZ1 = ler(Z, 'monthNames[HISTORY_COUNT+1]');
    const mesZ3 = ler(Z, 'monthNames[HISTORY_COUNT+3]');
    trocaMes(Z, mesZ);
    // à vista de 100 no dia 5 · parcelada 3x de 100 no dia 20 · uma sem dia
    comprar(Z, 'Mercado dia 5', 100, mesZ, 5); await assentar(Z);
    setV(Z, 'newType', ler(Z, 'getCartoes()[0]')); setV(Z, 'newName', 'TV 3x'); setV(Z, 'newAmount', '100');
    setV(Z, 'newCurr', '1'); setV(Z, 'newTotal', '3'); setV(Z, 'newMonth', mesZ); setV(Z, 'newDia', '20');
    ler(Z, "document.getElementById('addExpenseForm').dispatchEvent(new Event('submit'))"); await assentar(Z);
    comprar(Z, 'Sem data nenhuma', 50, mesZ); await assentar(Z);

    const iZ = cfgCompras(Z);
    check('o gráfico foi montado', iZ >= 0, { charts: ler(Z, '__charts.length') });
    check('o título usa "Cartões" com maiúscula', /Compras nos Cartões/.test(String(ler(Z, "(document.getElementById('comprasDiaTitle')||{}).textContent") || '')), ler(Z, "(document.getElementById('comprasDiaTitle')||{}).textContent"));
    check('as linhas são em DEGRAU no modo acumulado', ler(Z, `__charts[${iZ}].data.datasets.every(d=>d.stepped===true)`));
    check('o eixo X vai de 1 ao último dia do mês', ler(Z, `__charts[${iZ}].data.labels[0]==='1' && __charts[${iZ}].data.labels.length>=28`), ler(Z, `__charts[${iZ}].data.labels.length`));
    check('a série é acumulada (nunca decresce)', ler(Z, `__charts[${iZ}].data.datasets.every(d=>d.data.every((v,i)=>i===0||v>=d.data[i-1]))`));
    // AGORA a parcela entra pelo SEU valor, não pelo valor cheio da compra
    check('o mês da compra soma 100 (à vista) + 100 (1ª parcela) = 200', totalGraf(Z, iZ) === 200, totalGraf(Z, iZ));
    check('antes do dia 5 o acumulado é zero', ler(Z, `__charts[${iZ}].data.datasets.every(d=>d.data[3]===0)`));

    // O PEDIDO DO USUÁRIO: a data da parcela vale para as parcelas seguintes
    await verMes(Z, mesZ1);
    const iZ1 = cfgCompras(Z);
    check('a parcela seguinte APARECE no mês seguinte, sem redigitar', totalGraf(Z, iZ1) === 100, totalGraf(Z, iZ1));
    check('e cai no MESMO dia 20', ler(Z, `(function(){const d=__charts[${iZ1}].data.datasets[0].data;return d[19]>d[18] && d[19]-d[18]===100;})()`), ler(Z, `JSON.stringify(__charts[${iZ1}].data.datasets[0].data.slice(18,21))`));
    check('a compra à vista NÃO reaparece no mês seguinte', totalGraf(Z, iZ1) === 100);
    await verMes(Z, mesZ3);
    check('depois da última parcela o mês fica vazio', totalGraf(Z, cfgCompras(Z)) === 0, totalGraf(Z, cfgCompras(Z)));
    await verMes(Z, mesZ);

    // aviso das parcelas sem dia
    const avisoZ = () => String(ler(Z, "(document.getElementById('comprasDiaAviso')||{}).textContent") || '');
    check('avisa quantas parcelas estão sem dia', /1 de 3/.test(avisoZ()), avisoZ());
    check('e oferece o atalho para preencher', /abrirDatasModal/.test(String(ler(Z, "(document.getElementById('comprasDiaAviso')||{}).innerHTML") || '')));

    // MODO "POR DIA" — colunas, sem acumular
    ler(Z, "setComprasModo('dia')");
    const iD = cfgCompras(Z);
    check('modo "por dia" vira COLUNAS', ler(Z, `__charts[${iD}].type`) === 'bar', ler(Z, `__charts[${iD}].type`));
    check('e NÃO acumula (o dia 5 tem 100, o dia 6 tem 0)', ler(Z, `(function(){const d=__charts[${iD}].data.datasets.reduce((a,s)=>a.map((v,i)=>v+s.data[i]),new Array(__charts[${iD}].data.labels.length).fill(0));return d[4]===100 && d[5]===0;})()`), ler(Z, `JSON.stringify(__charts[${iD}].data.datasets.map(s=>s.data.slice(3,7)))`));
    check('o eixo continua sendo o dia do mês', ler(Z, `__charts[${iD}].options.scales.x.title.text`) === 'dia do mês');

    // MODO "POR MÊS" — colunas na janela inteira
    ler(Z, "setComprasModo('mes')");
    const iM = cfgCompras(Z);
    check('modo "por mês" vira colunas com eixo de MESES', ler(Z, `__charts[${iM}].type`) === 'bar' && ler(Z, `__charts[${iM}].options.scales.x.title.text`) === 'mês', ler(Z, `__charts[${iM}].options.scales.x.title.text`));
    check('e o eixo tem um ponto por mês da janela', ler(Z, `__charts[${iM}].data.labels.length`) === ler(Z, 'visibleMonths'));
    check('mostra a variação entre meses (mês da compra > mês seguinte)', ler(Z, `(function(){const t=__charts[${iM}].data.datasets.reduce((a,s)=>a.map((v,i)=>v+s.data[i]),new Array(__charts[${iM}].data.labels.length).fill(0));return t[HISTORY_COUNT]>t[HISTORY_COUNT+1] && t[HISTORY_COUNT+1]>0;})()`), ler(Z, `JSON.stringify(__charts[${iM}].data.datasets.map(s=>s.data.slice(HISTORY_COUNT,HISTORY_COUNT+4)))`));
    check('na visão mensal a parcela sem dia TAMBÉM conta (data não é necessária)', ler(Z, `(function(){const t=__charts[${iM}].data.datasets.reduce((a,s)=>a.map((v,i)=>v+s.data[i]),new Array(__charts[${iM}].data.labels.length).fill(0));return t[HISTORY_COUNT]===250;})()`), ler(Z, `JSON.stringify(__charts[${iM}].data.datasets.map(s=>s.data[HISTORY_COUNT]))`));
    check('e o aviso explica que ali a data não é necessária', /não é necessária/.test(avisoZ()), avisoZ());
    ler(Z, "setComprasModo('acumulado')");

    // fevereiro tem 28/29 dias — o eixo não pode ter 31 fixos
    const fev = (ler(Z, 'monthNames') || []).find(m => /^Fev\//.test(m));
    if (fev) {
        await verMes(Z, fev);
        const nDias = ler(Z, `__charts[${cfgCompras(Z)}].data.labels.length`);
        check('em fevereiro o eixo tem 28 ou 29 dias (não 31 fixos)', nDias === 28 || nDias === 29, { mes: fev, dias: nDias });
        await verMes(Z, mesZ);
    }
    check('o gráfico está isolado por _safeRender (r63)', /_safeRender\(\(\) => renderComprasDiaChart/.test(htmlBase));


    secao('28. Clicar na coluna abre as compras daquele ponto');
    // O cenário do Z (seção 27) segue de pé: à vista 100 no dia 5, TV 3x de 100 no dia 20,
    // e uma sem dia. A lógica é função pura (`_comprasDoPonto`), então dá para exercitar o
    // conteúdo do modal sem simular clique — o clique em si é conferido pela config do Chart.
    await verMes(Z, mesZ);
    ler(Z, "setComprasModo('dia')");
    const modalAberto = () => ler(Z, "!document.getElementById('comprasPontoModal').classList.contains('hidden')");
    const listaModal   = () => String(ler(Z, "(document.getElementById('comprasPontoLista')||{}).textContent") || '');
    const totalModal   = () => moeda(ler(Z, "(document.getElementById('comprasPontoTotal')||{}).textContent"));

    check('o gráfico registra o clique nas colunas', ler(Z, `typeof __charts[${cfgCompras(Z)}].options.onClick`) === 'function');
    check('e vira "mãozinha" sobre uma coluna', ler(Z, `typeof __charts[${cfgCompras(Z)}].options.onHover`) === 'function');
    // dia 20 = a parcela da TV
    ler(Z, "abrirComprasDoPonto(19)");
    check('clicar no dia 20 abre o modal', modalAberto() === true);
    check('e lista a compra daquele dia, com descrição', /TV 3x/.test(listaModal()), listaModal().slice(0, 120));
    check('mostra a parcela, não o valor cheio da compra', totalModal() === 100, totalModal());
    check('e identifica de qual parcela se trata', /parcela 1\/3/.test(listaModal()), listaModal().slice(0, 160));
    check('o título nomeia o dia e o mês', /dia 20/.test(String(ler(Z, "(document.getElementById('comprasPontoTitulo')||{}).textContent") || '')), ler(Z, "(document.getElementById('comprasPontoTitulo')||{}).textContent"));
    check('a compra de OUTRO dia não entra', /TV 3x/.test(listaModal()) && !/Mercado dia 5/.test(listaModal()), listaModal().slice(0, 160));
    ler(Z, "document.getElementById('comprasPontoModal').classList.add('hidden')");
    // dia 5 = a compra à vista
    ler(Z, "abrirComprasDoPonto(4)");
    check('clicar no dia 5 traz a compra à vista', /Mercado dia 5/.test(listaModal()) && totalModal() === 100, { lista: listaModal().slice(0, 80), total: totalModal() });
    check('compra à vista não mostra rótulo de parcela', /Mercado dia 5/.test(listaModal()) && !/parcela/.test(listaModal()), listaModal().slice(0, 120));
    ler(Z, "document.getElementById('comprasPontoModal').classList.add('hidden')");
    // dia sem compra não abre modal à toa
    ler(Z, "abrirComprasDoPonto(0)");
    check('dia sem compra NÃO abre o modal', modalAberto() === false);

    // na visão POR MÊS, o índice é o mês e o modal traz tudo que cai nele
    ler(Z, "setComprasModo('mes')");
    ler(Z, `abrirComprasDoPonto(${ler(Z, 'HISTORY_COUNT')})`);
    check('na visão mensal, clicar no mês abre as compras do mês', modalAberto() === true);
    check('e traz as duas compras do mês, incluindo a sem dia', /TV 3x/.test(listaModal()) && /Mercado dia 5/.test(listaModal()) && /Sem data nenhuma/.test(listaModal()), listaModal().slice(0, 200));
    check('somando as parcelas do mês (100 + 100 + 50)', totalModal() === 250, totalModal());
    check('o título nomeia o mês', new RegExp(mesZ.replace('/', '\\/')).test(String(ler(Z, "(document.getElementById('comprasPontoTitulo')||{}).textContent") || '')), ler(Z, "(document.getElementById('comprasPontoTitulo')||{}).textContent"));
    ler(Z, "document.getElementById('comprasPontoModal').classList.add('hidden')");
    ler(Z, "setComprasModo('acumulado')");
    check('a dica de clique aparece no texto do gráfico', /Clique numa coluna/.test(htmlBase));

    [A, B, D, E, F, G, H, I, J, K, L, M, N, Q, R2, S, T, U, V, W, X, Y, Z].forEach(x => { try { x.dom.window.close(); } catch (e) {} });

    // ───────────────────────────────────────────────────────────────────────────────
    // O RELATO (v4.22.0): "alterei no Windows, sumiu no Mac; voltei ao Windows, sumiu também".
    // O relógio do blob (_syncTs) dizia quem SINCRONIZOU por último, e era ele que decidia mapa e
    // config: bastava outro aparelho abrir para o blob dele "ficar mais novo". A edição seguinte
    // aqui perdia na fusão — sumia da memória, do disco e da nuvem, com a tela dizendo Sincronizado.
    // ───────────────────────────────────────────────────────────────────────────────
    const CHAVE_LS = 'financeAppV6_Personalized';
    const dorme = ms => new Promise(r => setTimeout(r, ms));
    const reabrir = async (ap, cfg = {}) => {
        const ls = ap.w.localStorage.getItem(CHAVE_LS);
        ap.dom.window.close();
        return abrirAparelho(ap.nome, { skew: ap.skew, ...cfg, localStorageInicial: ls });
    };
    const abrirComSkew = (nome, skew) => abrirAparelho(nome, { skew });
    const cenaComDados = async () => {
        zerarNuvem();
        const W = await abrirAparelho('Windows');
        lancar(W, 'Fixa', 'Aluguel', 1000); await assentar(W);
        lancar(W, 'Fixa', 'Luz', 100);      await assentar(W);
        lancar(W, 'Renda', 'Salário', 5000); await assentar(W);
        ler(W, "appData.faturas.push({card:'Credicard',name:'TV',category:'Outros',amount:100,curr:1,total:1,mesInicio:monthNames[HISTORY_COUNT]}); salvarDados();");
        await assentar(W);
        return W;
    };
    const voltarAoApp = async (ap, evento = 'visibilitychange') => {
        ler(ap, '_syncUltChecagem = 0');
        const alvo = evento === 'visibilitychange' ? ap.w.document : ap.w;
        alvo.dispatchEvent(new ap.w.Event(evento));
        await assentar(ap);
    };

    secao('29. O relato — editar num aparelho com outro aberto, em cada tipo de dado');
    // r71b: um laço pelas variantes, não só a que apareceu no relato. Cada edição entra pela mesma
    // função que o botão da tela chama; a coleção com carimbo por item é a referência (nunca perdeu).
    const VARIANTES = [
        { nome: 'pagamento de conta',    fazer: 'togglePagFixa(0)',                              ver: "(_getPag(_getMesPag()).fixas||[]).includes('Aluguel')", esp: true },
        { nome: 'pagamento de cartão',   fazer: "togglePagCartao('Credicard')",                  ver: "(_getPag(_getMesPag()).cartoes||[]).includes('Credicard')", esp: true },
        { nome: 'limite de categoria',   prep: "salvarLimite('Viagem', 100)", fazer: "salvarLimite('Viagem', 999)", ver: "appData.limites['Viagem']", esp: 999 },
        { nome: 'trazer déficit',        prep: "planToggleCarry(monthNames[HISTORY_COUNT+1])", fazer: "planToggleCarry(monthNames[HISTORY_COUNT+1])", ver: "!!appData.carryForward[monthNames[HISTORY_COUNT+1]]", esp: false },
        { nome: 'economia mensal',       fazer: 'planSetEconomia(777, true)',                    ver: 'appData.planejamento.economia', esp: 777 },
        { nome: 'dívida adicional',      fazer: 'planSetDividaAdicional(555)',                   ver: 'appData.planejamento.dividaAdicional', esp: 555 },
        { nome: 'dívida automática',     fazer: 'planSetDividaAuto(false)',                      ver: 'appData.planejamento.dividaAuto', esp: false },
        { nome: 'taxa CDI',              fazer: "document.getElementById('invCfgCdi').value='12.34'; document.getElementById('invCfgCdi').dispatchEvent(new Event('input'))", ver: 'Math.round(appData.investimentos.config.cdiAnual*10000)', esp: 1234 },
        { nome: 'valor de despesa fixa', fazer: "appData.fixas[0]={...appData.fixas[0],amount:1234}; salvarDados()", ver: "appData.fixas.find(f=>f.name==='Aluguel').amount", esp: 1234 },
        { nome: 'compra no cartão',      fazer: "appData.faturas[0]={...appData.faturas[0],amount:88}; salvarDados()", ver: "appData.faturas.find(f=>f.name==='TV').amount", esp: 88 },
    ];
    for (const v of VARIANTES) {
        let W = await cenaComDados();
        if (v.prep) { ler(W, v.prep); await assentar(W); }
        await dorme(3);
        let M = await abrirAparelho('Mac');           // o Mac abre e fica aberto; não edita nada
        await dorme(3);
        ler(W, v.fazer); await assentar(W);           // o Windows, aberto desde antes, edita
        const logoApos = ler(W, v.ver);
        const lidoNaNuvem = await (async () => { const N = await abrirAparelho('Nuvem-sonda'); const r = ler(N, v.ver); N.dom.window.close(); return r; })();
        M = await reabrir(M); const noMac = ler(M, v.ver);
        W = await reabrir(W); const noWin = ler(W, v.ver);
        check(`${v.nome} — não some logo após salvar`, logoApos === v.esp, logoApos);
        check(`${v.nome} — chega na nuvem`, lidoNaNuvem === v.esp, lidoNaNuvem);
        check(`${v.nome} — aparece no outro aparelho`, noMac === v.esp, noMac);
        check(`${v.nome} — continua aqui ao reabrir`, noWin === v.esp, noWin);
        W.dom.window.close(); M.dom.window.close();
    }
    // Segunda camada: o outro aparelho não só abre, ele EDITA outra coisa (e aí grava de verdade).
    // "Abrir não grava" não cobre este caso; quem protege aqui é o carimbo por célula.
    for (const v of VARIANTES) {
        let W = await cenaComDados();
        if (v.prep) { ler(W, v.prep); await assentar(W); }
        await dorme(3);
        const M = await abrirAparelho('Mac');
        lancar(M, 'Renda', 'OutraCoisaDoMac', 5); await assentar(M);
        await dorme(3);
        ler(W, v.fazer); await assentar(W);
        check(`${v.nome} — com o outro aparelho gravando no meio: não some`, ler(W, v.ver) === v.esp, ler(W, v.ver));
        W = await reabrir(W);
        check(`${v.nome} — com o outro aparelho gravando no meio: continua ao reabrir`, ler(W, v.ver) === v.esp, ler(W, v.ver));
        check(`${v.nome} — e a edição do outro aparelho também fica`, ler(W, "appData.rendas.some(r=>r.name==='OutraCoisaDoMac')") === true);
        W.dom.window.close(); M.dom.window.close();
    }
    {   // fechou a janela antes do envio terminar: fica no aparelho, sobe na volta, e o outro não apaga
        for (const v of VARIANTES.filter(x => ['pagamento de conta', 'economia mensal', 'taxa CDI'].includes(x.nome))) {
            let W = await cenaComDados();
            W = await reabrir(W);
            W.estado.offline = true;
            ler(W, v.fazer); await assentar(W);
            let M = await abrirAparelho('Mac');
            await dorme(3);
            W = await reabrir(W);
            check(`${v.nome} — sem rede ao salvar: sobrevive ao outro aparelho abrir no meio`, ler(W, v.ver) === v.esp, ler(W, v.ver));
            M = await reabrir(M);
            check(`${v.nome} — e chega no outro quando este volta`, ler(M, v.ver) === v.esp, ler(M, v.ver));
            W.dom.window.close(); M.dom.window.close();
        }
    }
    {   // célula, não blob: dois campos/contas diferentes editados em lados diferentes se somam
        let W = await cenaComDados();
        let M = await abrirAparelho('Mac');
        ler(M, 'togglePagFixa(0)'); ler(M, 'planSetEconomia(111, true)'); await assentar(M);
        await dorme(3);
        ler(W, 'togglePagFixa(1)'); ler(W, 'planSetDividaAdicional(222)'); await assentar(W);
        M = await reabrir(M); W = await reabrir(W);
        const pagas = String(ler(W, "(_getPag(_getMesPag()).fixas||[]).slice().sort().join()"));
        check('contas diferentes do MESMO mês, marcadas em aparelhos diferentes, ficam as duas', pagas === 'Aluguel,Luz', pagas);
        check('campos diferentes da mesma config se somam (economia do Mac + dívida do Windows)', ler(W, 'appData.planejamento.economia') === 111 && ler(W, 'appData.planejamento.dividaAdicional') === 222, ler(W, 'JSON.stringify(appData.planejamento)'));
        check('o outro aparelho converge para o mesmo', ler(M, "(_getPag(_getMesPag()).fixas||[]).length") === 2 && ler(M, 'appData.planejamento.dividaAdicional') === 222, ler(M, 'JSON.stringify(appData.planejamento)'));
        // os dois sentidos: desmarcar também propaga (é o que a união sozinha não faz, r104e)
        ler(M, 'togglePagFixa(0)'); await assentar(M);
        await dorme(3);
        W = await reabrir(W);
        check('desmarcar num aparelho desmarca no outro', ler(W, "(_getPag(_getMesPag()).fixas||[]).join()") === 'Luz', ler(W, "JSON.stringify(_getPag(_getMesPag()))"));
        W.dom.window.close(); M.dom.window.close();
    }

    secao('30. Abrir o app não é editar — sem escrita à toa nem pingue-pongue');
    {
        const W = await cenaComDados();
        const e0 = nuvem.escritas, rev0 = nuvem.updated_at;
        const M = await abrirAparelho('Mac');
        check('abrir num aparelho em dia não grava na nuvem', nuvem.escritas === e0 && nuvem.updated_at === rev0, { escritas: nuvem.escritas - e0 });
        check('e o carimbo do blob não muda (era o que fazia a edição do outro lado perder)', (nuvem.payload._syncTs || 0) === ler(W, 'appData._syncTs'), { nuvem: nuvem.payload._syncTs, win: ler(W, 'appData._syncTs') });
        await voltarAoApp(M);
        check('voltar ao app sem novidade também não grava', nuvem.escritas === e0, nuvem.escritas - e0);
        // cada aparelho acrescenta um item diferente: as ordens ficam diferentes para sempre.
        // Ordem não é dado aqui, então isso não pode virar regravação eterna (r135b).
        W.estado.offline = true; M.estado.offline = true;
        ler(W, "appData.rendas.push({name:'SoWin',amount:1}); salvarDados();"); await assentar(W);
        ler(M, "appData.rendas.push({name:'SoMac',amount:2}); salvarDados();"); await assentar(M);
        W.estado.offline = false; M.estado.offline = false;
        await voltarAoApp(W); await voltarAoApp(M); await voltarAoApp(W); await voltarAoApp(M);
        check('os dois convergem no mesmo conjunto', ler(W, "appData.rendas.map(r=>r.name).sort().join()") === ler(M, "appData.rendas.map(r=>r.name).sort().join()") && ler(M, "appData.rendas.some(r=>r.name==='SoWin')"), { w: ler(W, "appData.rendas.map(r=>r.name).join()"), m: ler(M, "appData.rendas.map(r=>r.name).join()") });
        const e1 = nuvem.escritas;
        for (let i = 0; i < 4; i++) { await voltarAoApp(W); await voltarAoApp(M); }
        check('e depois de convergir NINGUÉM regrava (ordem diferente não é mudança)', nuvem.escritas === e1, nuvem.escritas - e1);
        // mais de 200 sugestões de descrição: o recorte tem de ser o mesmo nos dois lados
        ler(W, "appData.descricoes = Array.from({length:200},(_,i)=>'w'+i); salvarDados();"); await assentar(W);
        ler(M, "appData.descricoes = Array.from({length:200},(_,i)=>'m'+i); salvarDados();"); await assentar(M);
        await voltarAoApp(W); await voltarAoApp(M);
        const e2 = nuvem.escritas;
        for (let i = 0; i < 3; i++) { await voltarAoApp(W); await voltarAoApp(M); }
        check('sugestões acima do limite também não viram regravação eterna', nuvem.escritas === e2, nuvem.escritas - e2);
        check('e o limite de sugestões continua valendo', ler(W, 'appData.descricoes.length') <= 200, ler(W, 'appData.descricoes.length'));
        W.dom.window.close(); M.dom.window.close();
    }

    secao('31. Relógios fora de sincronia — quem edita depois de ver, vence');
    {   // a prova de capacidade do arreio vem primeiro (r117): o Mac tem de estar MESMO adiantado
        let W = await cenaComDados();
        let M = await abrirComSkew('Mac-adiantado', 3 * 60 * 1000);
        const d = ler(M, 'Date.now()') - ler(W, 'Date.now()');
        check('o arreio consegue adiantar o relógio de um aparelho', d > 170000, d);
        ler(M, "appData.fixas[0]={...appData.fixas[0],amount:1111}; salvarDados()"); await assentar(M);
        await voltarAoApp(W);
        check('o outro aparelho viu a edição do relógio adiantado', ler(W, 'appData.fixas[0].amount') === 1111, ler(W, 'appData.fixas[0].amount'));
        ler(W, "appData.fixas[0]={...appData.fixas[0],amount:2222}; salvarDados()"); await assentar(W);
        check('quem viu e editou depois vence, mesmo com o relógio atrasado', ler(W, 'appData.fixas[0].amount') === 2222, ler(W, 'appData.fixas[0].amount'));
        M = await reabrir(M);
        check('e a edição chega ao aparelho adiantado', ler(M, 'appData.fixas[0].amount') === 2222, ler(M, 'appData.fixas[0].amount'));
        // o mesmo para célula
        ler(M, "salvarLimite('Viagem', 50)"); await assentar(M);
        await voltarAoApp(W);
        ler(W, "salvarLimite('Viagem', 60)"); await assentar(W);
        M = await reabrir(M);
        check('vale também para limite/taxa/pagamento', ler(M, "appData.limites['Viagem']") === 60, ler(M, "appData.limites['Viagem']"));
        // e para exclusão: apagar o que se acabou de ver, com relógio atrasado, apaga mesmo
        const idApagar = ler(W, "appData.fixas[1].id");
        ler(M, "appData.fixas[1]={...appData.fixas[1],amount:7}; salvarDados()"); await assentar(M);
        await voltarAoApp(W);
        ler(W, "_removerItemDireto('fixa', 1)"); await assentar(W);
        M = await reabrir(M);
        check('apagar o item que veio do relógio adiantado propaga (o tombstone não perde)', !ler(M, `appData.fixas.some(f=>String(f.id)==='${idApagar}')`), ler(M, 'appData.fixas.map(f=>f.name).join()'));
        W.dom.window.close(); M.dom.window.close();
    }

    secao('32. Corrida — dois aparelhos gravando ao mesmo tempo');
    {
        const W = await cenaComDados();
        const M = await abrirAparelho('Mac');
        let solta; M.estado.segurarEscrita = new Promise(r => { solta = r; });
        ler(M, "appData.rendas.push({name:'DoMac',amount:1}); salvarDados();");   // o Mac leu a nuvem e parou antes de gravar
        await dorme(20);
        ler(W, "appData.rendas.push({name:'DoWindows',amount:2}); salvarDados();"); await assentar(W);
        check('o Windows gravou enquanto o Mac estava no meio', naNuvem('rendas').includes('DoWindows'), naNuvem('rendas'));
        const c0 = nuvem.conflitos;
        M.estado.segurarEscrita = null; solta(); await dorme(20); await assentar(M);
        check('a escrita atrasada do Mac foi recusada, não sobrescreveu', nuvem.conflitos > c0, { conflitos: nuvem.conflitos - c0 });
        check('ela releu, fundiu e os DOIS ficaram na nuvem', naNuvem('rendas').includes('DoWindows') && naNuvem('rendas').includes('DoMac'), naNuvem('rendas'));
        check('e o Mac terminou com os dois', ler(M, "appData.rendas.some(r=>r.name==='DoWindows')") === true, ler(M, "appData.rendas.map(r=>r.name).join()"));
        // conflito eterno: desiste sem perder nada e tenta de novo depois
        M.estado.sempreConflito = true;
        ler(M, "appData.rendas.push({name:'Insistente',amount:3}); salvarDados();"); await assentar(M); await dorme(20); await assentar(M);
        check('conflito sem fim não trava nem finge sucesso', !naNuvem('rendas').includes('Insistente') && txt(M, 'headerSupaText') === 'Falha ao salvar', { nuvem: naNuvem('rendas'), status: txt(M, 'headerSupaText') });
        check('o dado segue salvo no aparelho', JSON.parse(ler(M, `localStorage.getItem('${CHAVE_LS}')`)).rendas.some(r => r.name === 'Insistente'));
        M.estado.sempreConflito = false;
        await voltarAoApp(M);
        check('e sobe na próxima oportunidade, sem ação do usuário', naNuvem('rendas').includes('Insistente'), naNuvem('rendas'));
        W.dom.window.close(); M.dom.window.close();
    }

    secao('33. Voltar à janela aberta — a tela acompanha a nuvem');
    {
        const W = await cenaComDados();
        const M = await abrirAparelho('Mac');
        const telaFixas = ap => String(ler(ap, "document.getElementById('fixedExpensesBody').textContent") || '');
        for (const [evento, nomeItem] of [['visibilitychange', 'NovaA'], ['focus', 'NovaB'], ['online', 'NovaC']]) {
            lancar(W, 'Fixa', nomeItem, 10); await assentar(W);
            check(`(${evento}) antes de voltar, a janela parada não sabe do item`, !telaFixas(M).includes(nomeItem));
            await voltarAoApp(M, evento);
            check(`(${evento}) ao voltar, o item aparece NA TELA, sem recarregar`, telaFixas(M).includes(nomeItem), telaFixas(M).slice(0, 80));
        }
        lancar(W, 'Fixa', 'NovaTique', 10); await assentar(W);
        check('o tique periódico está registrado', (ler(M, '(window.__tiques||[]).length') || 0) > 0, ler(M, '(window.__tiques||[]).length'));
        ler(M, '_syncUltChecagem = 0; window.__tiques[0]()'); await assentar(M);
        check('e também traz a novidade', telaFixas(M).includes('NovaTique'));
        // o caso comum tem de ser barato: sem novidade, nem o blob desce
        const g0 = nuvem.gets, c0 = nuvem.checks;
        await voltarAoApp(M);
        check('sem novidade só lê o carimbo da linha, nunca o blob inteiro', nuvem.gets === g0 && nuvem.checks === c0 + 1, { blobs: nuvem.gets - g0, checagens: nuvem.checks - c0 });
        // quem acabou de gravar já sabe o carimbo: não baixa de volta o que ele mesmo escreveu
        lancar(M, 'Fixa', 'GravadaAqui', 10); await assentar(M);
        const g2 = nuvem.gets, c2 = nuvem.checks;
        await voltarAoApp(M);
        check('logo depois de gravar, voltar ao app também só lê o carimbo da linha', nuvem.gets === g2 && nuvem.checks === c2 + 1, { blobs: nuvem.gets - g2, checagens: nuvem.checks - c2 });
        // aba escondida não fica consultando
        Object.defineProperty(M.w.document, 'hidden', { value: true, configurable: true });
        const c1 = nuvem.checks;
        await voltarAoApp(M); ler(M, '_syncUltChecagem = 0; window.__tiques[0]()'); await assentar(M);
        check('aba escondida não consulta a nuvem', nuvem.checks === c1, nuvem.checks - c1);
        Object.defineProperty(M.w.document, 'hidden', { value: false, configurable: true });
        // a novidade que chega DURANTE um save também aparece (antes só o boot redesenhava)
        lancar(W, 'Fixa', 'NovaNoSave', 10); await assentar(W);
        lancar(M, 'Renda', 'QualquerCoisa', 1); await assentar(M);
        check('novidade que veio junto com um save aparece na tela', telaFixas(M).includes('NovaNoSave'), telaFixas(M).slice(0, 80));
        // erro e volta: o selo da conexão não fica mentindo
        M.estado.offline = true;
        await voltarAoApp(M);
        check('sem rede, o selo diz "Sem conexão"', txt(M, 'headerSupaText') === 'Sem conexão', txt(M, 'headerSupaText'));
        M.estado.offline = false;
        await voltarAoApp(M, 'online');
        check('com a rede de volta, o selo volta a "Sincronizado"', txt(M, 'headerSupaText') === 'Sincronizado', txt(M, 'headerSupaText'));
        // outra janela do MESMO navegador: mesma memória de disco, duas cópias em RAM
        ler(W, "appData.rendas.push({name:'DaOutraJanela',amount:9});");
        const blob = ler(W, "(_syncCarimbar(), JSON.stringify(appData))");
        M.w.dispatchEvent(new M.w.StorageEvent('storage', { key: CHAVE_LS, newValue: blob }));
        await assentar(M);
        check('alteração salva por outra janela do navegador entra nesta (e não é sobrescrita depois)', ler(M, "appData.rendas.some(r=>r.name==='DaOutraJanela')") === true);
        await voltarAoApp(M);
        check('e sobe para a nuvem mesmo se a outra janela fechou sem enviar', naNuvem('rendas').includes('DaOutraJanela'), naNuvem('rendas'));
        ler(M, "salvarDados()"); await assentar(M);
        check('e o próximo save desta janela a preserva no disco', JSON.parse(ler(M, `localStorage.getItem('${CHAVE_LS}')`)).rendas.some(r => r.name === 'DaOutraJanela'));
        W.dom.window.close(); M.dom.window.close();
    }

    secao('34. Tela aberta enquanto a nuvem funde — vale o item, não a posição');
    {   // modal de edição: o item acima dele some pela fusão → a posição aponta para outro
        let W = await cenaComDados();
        lancar(W, 'Fixa', 'Água', 50); await assentar(W);
        lancar(W, 'Fixa', 'Internet', 60); await assentar(W);
        let M = await abrirAparelho('Mac');
        const iAgua = ler(W, "appData.fixas.findIndex(f=>f.name==='Água')");
        ler(W, `editarItem('fixa', ${iAgua})`);
        ler(M, "appData.fixas.splice(0,1); salvarDados();"); await assentar(M);       // o Mac apaga o 1º
        await voltarAoApp(W);                                                          // a fusão acontece com o modal aberto
        W.w.document.getElementById('editVigDaqui').checked = false;
        W.w.document.getElementById('editValor').value = '77';
        ler(W, "document.getElementById('editSaveBtn').click()"); await assentar(W);
        const valores = () => ler(W, "appData.fixas.map(f=>f.name+':'+f.amount).join()");
        check('salvar o modal aberto edita O ITEM que estava aberto', /Água:77/.test(valores()), valores());
        check('e não toca em nenhum outro', /Internet:60/.test(valores()) && /Luz:100/.test(valores()), valores());
        // o item do modal foi apagado no outro aparelho
        const iLuz = ler(W, "appData.fixas.findIndex(f=>f.name==='Luz')");
        ler(W, `editarItem('fixa', ${iLuz})`);
        M = await reabrir(M);
        ler(M, "appData.fixas.splice(appData.fixas.findIndex(f=>f.name==='Luz'),1); salvarDados();"); await assentar(M);
        await voltarAoApp(W);
        const antes = valores();
        W.w.document.getElementById('editValor').value = '999';
        ler(W, "document.getElementById('editSaveBtn').click()"); await assentar(W);
        check('item apagado no outro aparelho: o save avisa e não escreve em ninguém', valores() === antes, { antes, depois: valores() });
        check('o modal fecha para não ficar editando o nada', ler(W, "document.getElementById('editModal').classList.contains('hidden')") === true);
        W.dom.window.close(); M.dom.window.close();

        // "Encerrar": a confirmação fica aberta durante a fusão (referência órfã)
        W = await cenaComDados();
        ler(W, "appData.fixas[0]={...appData.fixas[0],inicio:monthNames[0]}; salvarDados();"); await assentar(W);
        const fetchReal = W.w.fetch; let soltaLeitura; const porta = new Promise(r => { soltaLeitura = r; });
        W.w.fetch = async (u, o) => { if (/select=payload/.test(String(u))) await porta; return fetchReal(u, o); };
        ler(W, 'salvarDados()');                       // sincronização em andamento…
        ler(W, "removerItem('fixa', 0)");              // …o usuário abre a confirmação…
        soltaLeitura(); await dorme(10); await assentar(W);   // …a fusão termina e troca o appData…
        ler(W, "document.getElementById('confirmOkBtn').click()"); await assentar(W);   // …e ele confirma.
        check('"Encerrar" confirmado depois da fusão encerra de verdade', !!ler(W, 'appData.fixas[0].fim'), ler(W, 'JSON.stringify(appData.fixas[0])'));
        check('e a nuvem recebe (não só o histórico)', !!(naNuvemObj('fixas')[0] || {}).fim, naNuvemObj('fixas')[0]);
        W.dom.window.close();

        // modal de edição aberto: a tela se atualiza por baixo e a categoria escolhida não pode mudar
        W = await cenaComDados();
        M = await abrirAparelho('Mac');
        ler(W, "appData.faturas[0]={...appData.faturas[0],category:'Viagem'}; salvarDados();"); await assentar(W);
        ler(W, "editarItem('fatura', 0)");
        check('(o modal abre com a categoria do lançamento)', ler(W, "document.getElementById('editCategoria').value") === 'Viagem', ler(W, "document.getElementById('editCategoria').value"));
        ler(M, "appData.categorias.push('Pets'); salvarDados();"); await assentar(M);
        await voltarAoApp(W);
        check('a categoria nova do outro aparelho entra na lista do modal aberto', ler(W, "[...document.getElementById('editCategoria').options].some(o=>o.value==='Pets')") === true);
        check('modal de edição mantém a categoria escolhida quando a tela se atualiza', ler(W, "document.getElementById('editCategoria').value") === 'Viagem', ler(W, "document.getElementById('editCategoria').value"));
        ler(W, "document.getElementById('editSaveBtn').click()"); await assentar(W);
        check('e salvar não troca a categoria sem ninguém pedir', ler(W, "appData.faturas[0].category") === 'Viagem', ler(W, "appData.faturas[0].category"));
        W.dom.window.close(); M.dom.window.close();

        // modal de preencher datas aberto: o índice da fatura muda com a fusão
        W = await cenaComDados();
        M = await abrirAparelho('Mac');
        ler(W, "appData.faturas.push({card:'Credicard',name:'Sofá',category:'Outros',amount:300,curr:1,total:1,mesInicio:monthNames[HISTORY_COUNT]}); salvarDados();"); await assentar(W);
        M = await reabrir(M);
        ler(W, 'abrirDatasModal()');
        ler(M, "appData.faturas.splice(appData.faturas.findIndex(f=>f.name==='TV'),1); salvarDados();"); await assentar(M);
        await voltarAoApp(W);
        ler(W, `(function(){const c=[...document.querySelectorAll('#datasLista .datas-dia')].find(e=>e.parentNode.textContent.includes('Sofá')); if(c) c.value='15';})()`);
        ler(W, 'salvarDatas()'); await assentar(W);
        check('o dia preenchido com o modal aberto vai para a compra certa', ler(W, "appData.faturas.find(f=>f.name==='Sofá').dia") === 15, ler(W, "JSON.stringify(appData.faturas)"));
        W.dom.window.close(); M.dom.window.close();
    }

    secao('35. Leitura ruim nunca vira escrita');
    {
        const W = await cenaComDados();
        const eBase = nuvem.escritas, cBase = clonar(nuvem.payload);
        const ruins = {
            'erro 500 do servidor':   async () => ({ ok: false, status: 500, json: async () => ({}), text: async () => 'erro' }),
            'JSON truncado':          async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('truncado'); }, text: async () => '' }),
            'resposta que não é lista': async () => resposta({ message: 'qualquer coisa' }),
            'payload que não é objeto': async () => resposta([{ payload: 'texto', updated_at: nuvem.updated_at }]),
        };
        for (const [nome, r] of Object.entries(ruins)) {
            W.estado.respostaLeitura = r;
            ler(W, "appData.rendas.push({name:'X" + nome.length + "',amount:1}); salvarDados();"); await assentar(W);
            check(`${nome}: não grava por cima da nuvem`, nuvem.escritas === eBase, nuvem.escritas - eBase);
            check(`${nome}: o selo acusa`, /Sem conexão|ilegível/.test(String(txt(W, 'headerSupaText'))), txt(W, 'headerSupaText'));
        }
        W.estado.respostaLeitura = null;
        check('a nuvem ficou exatamente como estava', JSON.stringify(nuvem.payload) === JSON.stringify(cBase));
        await voltarAoApp(W);
        check('com a leitura de volta, o que ficou pendente sobe', naNuvem('rendas').filter(n => /^X\d+$/.test(n)).length === Object.keys(ruins).length, naNuvem('rendas'));
        W.dom.window.close();
    }

    secao('36. Service worker — resposta da nuvem nunca sai do cache');
    {   // Roda o sw.js de verdade num vm, com caches/fetch falsos: é comportamento, não texto (r78c).
        const vm = require('vm');
        const swPath = path.join(path.dirname(ARQ) || '.', 'sw.js');
        const swSrc = fs.existsSync(swPath) ? fs.readFileSync(swPath, 'utf8') : '';
        check('sw.js encontrado ao lado do app', !!swSrc);
        const ouvintes = {};
        const armazem = new Map();
        let redeFora = false, proximaResposta = null;
        const respostaBoa = () => ({ ok: true, type: 'basic', status: 200, clone() { return this; }, marca: 'rede' });
        const sb = {
            self: null, URL, Promise, console,
            addEventListener: (t, f) => { ouvintes[t] = f; },
            location: { origin: 'https://magoc25.github.io' },
            caches: {
                open: async () => ({ put: async (r, v) => { armazem.set(r.url, v); }, addAll: async () => {} }),
                match: async r => armazem.get(r.url), keys: async () => [], delete: async () => true,
            },
            clients: { claim: async () => {} },
            fetch: async () => { if (redeFora) throw new TypeError('offline'); return proximaResposta || respostaBoa(); },
        };
        sb.self = sb;
        vm.createContext(sb);
        try { vm.runInContext(swSrc, sb); } catch (e) { check('sw.js executa', false, e.message); }
        const buscar = async url => {
            let resp = null, interceptou = false;
            ouvintes.fetch({ request: { method: 'GET', url }, respondWith: p => { interceptou = true; resp = p; } });
            return { interceptou, resp: interceptou ? await resp : undefined };
        };
        const urlNuvem = 'https://abc.supabase.co/rest/v1/finance_data?id=eq.1&select=payload,updated_at';
        const r1 = await buscar(urlNuvem);
        check('GET da nuvem passa direto pelo service worker', r1.interceptou === false, r1.interceptou);
        check('e não deixa cópia no cache', !armazem.has(urlNuvem), [...armazem.keys()]);
        redeFora = true;
        const r2 = await buscar(urlNuvem);
        check('sem rede, NÃO devolve payload antigo como se a nuvem tivesse respondido', r2.interceptou === false && r2.resp === undefined, r2);
        redeFora = false;
        const r3 = await buscar('https://magoc25.github.io/mgc-financas/mgc-financas.html');
        check('o próprio app continua indo pela rede e guardando cópia', r3.interceptou === true && armazem.has('https://magoc25.github.io/mgc-financas/mgc-financas.html'));
        const r4 = await buscar('https://cdn.jsdelivr.net/npm/chart.js');
        check('as bibliotecas de CDN continuam disponíveis offline', r4.interceptou === true && armazem.has('https://cdn.jsdelivr.net/npm/chart.js'));
        const r5 = await buscar('https://api.qrserver.com/v1/create-qr-code/?data=x');
        check('host desconhecido fica de fora por padrão (lista de permissão)', r5.interceptou === false);
        redeFora = true;
        const r6 = await buscar('https://magoc25.github.io/mgc-financas/mgc-financas.html');
        check('offline, o app abre da cópia guardada', r6.interceptou === true && r6.resp && r6.resp.marca === 'rede', r6.resp);
        redeFora = false;
        proximaResposta = { ok: false, type: 'basic', status: 503, clone() { return this; }, marca: 'erro503' };
        await buscar('https://magoc25.github.io/mgc-financas/mgc-financas.html');
        proximaResposta = null;
        check('erro do servidor não apaga a cópia boa do modo offline', (armazem.get('https://magoc25.github.io/mgc-financas/mgc-financas.html') || {}).marca === 'rede');
    }

    secao('37. Auditoria — o resto do que a tela dizia ou gravava errado');
    {
        const W = await cenaComDados();
        // ── pagamentos respeita vigência (v4.18.0) ──
        const mesHojeA = ler(W, 'monthNames[HISTORY_COUNT]'), mesAntesA = ler(W, 'monthNames[HISTORY_COUNT-1]');
        ler(W, `appData.fixas.push({name:'Academia',amount:90,inicio:monthNames[0],fim:'${mesAntesA}'}); appData.fixas.push({name:'Futura',amount:70,inicio:monthNames[HISTORY_COUNT+1]}); salvarDados();`);
        await assentar(W);
        ler(W, 'processarDadosERenderizar()');
        const listaPag = () => String(ler(W, "document.getElementById('pagFixasList').textContent") || '');
        check('despesa encerrada não aparece nos pagamentos do mês', listaPag().includes('Aluguel') && !listaPag().includes('Academia'), listaPag().slice(0, 100));
        check('despesa que ainda não começou também não', listaPag().includes('Aluguel') && !listaPag().includes('Futura'), listaPag().slice(0, 100));
        const quitado = () => String(ler(W, "document.getElementById('pagProgressText').textContent") || '');
        check('e o total a quitar não soma o que não vale no mês (1000 + 100 + fatura 100)', /1\.200,00/.test(quitado()), quitado());
        check('clicar marca a conta certa, mesmo com outras escondidas', (ler(W, "document.querySelectorAll('#pagFixasList .pag-item')[1].click()"), ler(W, "_getPag(_getMesPag()).fixas.join()")) === 'Luz', ler(W, "_getPag(_getMesPag()).fixas.join()"));
        await assentar(W);
        // ── render não escreve ──
        const mesVazio = ler(W, 'monthNames[HISTORY_COUNT+5]');
        const fFiltro = W.w.document.getElementById('filterMonth'); fFiltro.value = mesVazio; fFiltro.dispatchEvent(new W.w.Event('change'));
        check('desenhar um mês não cria registro de pagamento vazio', ler(W, `'${mesVazio}' in appData.pagamentos`) === false, ler(W, 'Object.keys(appData.pagamentos).join()'));
        fFiltro.value = mesHojeA; fFiltro.dispatchEvent(new W.w.Event('change'));
        // ── cor por cartão ──
        ler(W, "appData.faturas.push({card:'Mercado Pago',name:'Mouse',category:'Outros',amount:50,curr:1,total:1,dia:3,mesInicio:monthNames[HISTORY_COUNT]}); appData.faturas[0].dia=2; salvarDados(); processarDadosERenderizar(); setComprasModo('mes');");
        await assentar(W);
        const cores = ler(W, "__charts.filter(c=>c.options&&c.options.onClick).slice(-1)[0].data.datasets.map(d=>d.backgroundColor).join('|')");
        check('cada cartão tem a sua cor no gráfico de compras', String(cores).split('|').length === 2 && new Set(String(cores).split('|')).size === 2, cores);
        ler(W, "setComprasModo('acumulado')");
        // ── nome com HTML ──
        ler(W, `document.getElementById('novaCategoria').value='<b id="injetado">x</b>'; adicionarCategoria();`);
        check('nome com HTML no aviso aparece como texto, não vira elemento', ler(W, "document.querySelector('#toastContainer #injetado')") === null && /<b id=/.test(String(ler(W, "document.getElementById('toastContainer').textContent"))), ler(W, "document.getElementById('toastContainer').innerHTML.slice(-120)"));
        ler(W, `appData.categorias.push('Café "bom"'); appData.faturas.push({card:'Credicard',name:'Pó',category:'Café "bom"',amount:9,curr:1,total:1,mesInicio:monthNames[HISTORY_COUNT]}); salvarDados(); processarDadosERenderizar();`);
        await assentar(W);
        check('categoria com aspas não quebra o filtro de categoria', ler(W, `[...document.getElementById('filterStore').options].some(o=>o.value==='Café "bom"')`) === true, ler(W, `[...document.getElementById('filterStore').options].map(o=>o.value).join('|')`));
        // ── parcela vazia ──
        const qtdFat = ler(W, 'appData.faturas.length');
        const d = W.w.document;
        ler(W, "rebuildFormSelects()");
        d.getElementById('newType').value = 'Credicard'; d.getElementById('newName').value = 'Sem parcela'; d.getElementById('newAmount').value = '10';
        d.getElementById('newCurr').value = ''; d.getElementById('newTotal').value = '';
        d.getElementById('addExpenseForm').dispatchEvent(new W.w.Event('submit'));
        check('parcela em branco é recusada, em vez de gravar compra que some dos cálculos', ler(W, 'appData.faturas.length') === qtdFat, ler(W, 'JSON.stringify(appData.faturas.slice(-1))'));
        d.getElementById('newCurr').value = '1'; d.getElementById('newTotal').value = '1';
        // ── id de sync (texto) nos botões de meta e cenário ──
        ler(W, "appData.metas.push({id:'lg-abc',name:'Viagem',target:1000,mensal:10,acumulado:0}); salvarDados(); renderMetasModal();");
        await assentar(W);
        ler(W, "document.querySelector('#metasListaModal input').value='500'; document.querySelector('#metasListaModal input').dispatchEvent(new Event('change'));");
        check('meta com id de texto: o campo funciona', ler(W, "appData.metas.find(m=>m.id==='lg-abc').acumulado") === 500, ler(W, 'JSON.stringify(appData.metas)'));
        ler(W, "document.querySelector('#metasListaModal button[title=\"Remover\"]').click(); document.getElementById('confirmOkBtn').click();");
        check('meta com id de texto: o botão de remover funciona', ler(W, "appData.metas.some(m=>m.id==='lg-abc')") === false, ler(W, 'JSON.stringify(appData.metas)'));
        await assentar(W);
        // ── item com valor nulo não derruba a tela ──
        ler(W, "appData.fixas.push({name:'Sem valor',amount:null}); processarDadosERenderizar();");
        check('valor nulo (backup editado à mão) não apaga as tabelas', String(ler(W, "document.getElementById('fixedExpensesBody').textContent")).includes('Sem valor'));
        ler(W, "appData.fixas.pop();");
        // ── taxas: mudar uma não regrava as outras ──
        const M = await abrirAparelho('Mac');
        ler(W, "document.getElementById('invCfgSelic').value='13.25'; document.getElementById('invCfgSelic').dispatchEvent(new Event('input'));"); await assentar(W);
        ler(W, "appData.investimentos.config.ipcaAnual = 0.04567; salvarDados();"); await assentar(W);   // mais casas do que o campo mostra (4,57)
        const carimboIpca = ler(W, "appData.ts['investimentos.config:ipcaAnual']");
        await voltarAoApp(M);
        check('o campo da taxa acompanha o que veio do outro aparelho', ler(M, "document.getElementById('invCfgSelic').value") === '13.25', ler(M, "document.getElementById('invCfgSelic').value"));
        ler(M, "document.getElementById('invCfgCdi').value='11.11'; document.getElementById('invCfgCdi').dispatchEvent(new Event('input'));"); await assentar(M);
        check('mudar o CDI aqui não devolve a Selic antiga', Math.round(ler(M, 'appData.investimentos.config.selicAnual') * 10000) === 1325 && Math.round(ler(M, 'appData.investimentos.config.cdiAnual') * 10000) === 1111, ler(M, 'JSON.stringify(appData.investimentos.config)'));
        check('a taxa que ninguém mexeu continua exata (o campo mostra arredondado, e isso não pode ser regravado)', ler(M, 'appData.investimentos.config.ipcaAnual') === 0.04567, ler(M, 'appData.investimentos.config.ipcaAnual'));
        check('e a taxa que ninguém mexeu não ganha carimbo novo', carimboIpca > 0 && ler(M, "appData.ts['investimentos.config:ipcaAnual']") === carimboIpca, { antes: carimboIpca, depois: ler(M, "appData.ts['investimentos.config:ipcaAnual']") });
        // ── a tela não espera a rede ──
        const blobLocal = ler(W, `localStorage.getItem('${CHAVE_LS}')`);
        let soltaLenta; const leituraLenta = new Promise(r => { soltaLenta = r; });
        const Lento = await abrirAparelho('Lento', { localStorageInicial: blobLocal, segurarLeitura: leituraLenta });
        check('a tela não espera a nuvem: o que está salvo aparece enquanto ela não responde', String(ler(Lento, "document.getElementById('fixedExpensesBody').textContent")).includes('Aluguel'), String(ler(Lento, "document.getElementById('fixedExpensesBody').textContent")).slice(0, 60));
        check('e o selo diz que ainda está conectando', txt(Lento, 'headerSupaText') === 'Conectando...', txt(Lento, 'headerSupaText'));
        Lento.estado.segurarLeitura = null; soltaLenta(); await dorme(10); await assentar(Lento);
        check('quando ela responde, o selo acompanha', txt(Lento, 'headerSupaText') === 'Sincronizado', txt(Lento, 'headerSupaText'));
        Lento.dom.window.close();
        // ── rede presa não segura a fila ──
        const Preso = await abrirAparelho('Preso', { localStorageInicial: blobLocal });
        ler(Preso, 'SYNC_TIMEOUT_MS = 30');
        Preso.estado.travarRede = true;
        ler(Preso, "appData.rendas.push({name:'NaRedePresa',amount:1}); salvarDados();");
        await dorme(120); await assentar(Preso);
        check('rede que não responde desiste sozinha e o selo avisa', txt(Preso, 'headerSupaText') === 'Sem conexão', txt(Preso, 'headerSupaText'));
        Preso.estado.travarRede = false;
        await voltarAoApp(Preso);
        check('e a fila não ficou presa: com a rede de volta, o que ficou pendente sobe', naNuvem('rendas').includes('NaRedePresa'), naNuvem('rendas'));
        Preso.dom.window.close();
        // ── virada do mês com o app aberto ──
        const Vira = await abrirAparelho('Virada');
        ler(Vira, 'window.__recarregou = 0; _recarregarApp = function () { window.__recarregou++; };');
        await voltarAoApp(Vira);
        check('no mesmo mês, voltar ao app não recarrega', ler(Vira, 'window.__recarregou') === 0, ler(Vira, 'window.__recarregou'));
        Vira.estado.skew += 40 * 24 * 60 * 60 * 1000;      // o tempo passou com o app aberto
        check('o arreio consegue virar o mês', ler(Vira, '_virouOMes()') === true, ler(Vira, 'gerarMeses(1)[0] + " x " + monthNames[HISTORY_COUNT]'));
        ler(Vira, "document.getElementById('editModal').classList.remove('hidden')");
        await voltarAoApp(Vira);
        check('virada do mês com modal aberto não recarrega por cima de quem digita', ler(Vira, 'window.__recarregou') === 0, ler(Vira, 'window.__recarregou'));
        ler(Vira, "document.getElementById('editModal').classList.add('hidden')");
        await voltarAoApp(Vira);
        check('virada do mês: voltar ao app recarrega (senão o lançamento cai no mês errado)', ler(Vira, 'window.__recarregou') === 1, ler(Vira, 'window.__recarregou'));
        Vira.dom.window.close();
        // ── categoria com nome de propriedade de objeto ──
        check('categoria chamada "constructor" não perde o limite na fusão', ler(W, "mesclarAppData({limites:{constructor:5}}, {limites:{},_syncTs:Date.now()}).limites.constructor") === 5, ler(W, "String(mesclarAppData({limites:{constructor:5}}, {limites:{},_syncTs:Date.now()}).limites.constructor).slice(0,40)"));
        // ── eixo dos gráficos: rótulos que dizem o valor ──
        const rotulosEixo = ler(W, "[0,250,500,750,1000,1500,2000,12500,-500,-1500].map(_eixoMoeda).join('|')");
        check('eixo com marcas pequenas não repete rótulo', rotulosEixo === 'R$0|R$250|R$500|R$750|R$1k|R$1,5k|R$2k|R$12,5k|R$-500|R$-1,5k', rotulosEixo);
        const cbEixos = ler(W, "__charts.slice(-12).filter(c=>c.options&&c.options.scales&&c.options.scales.y&&c.options.scales.y.ticks&&c.options.scales.y.ticks.callback).map(c=>c.options.scales.y.ticks.callback(500)).join('|')");
        check('e os gráficos usam esse rótulo de verdade', /R\$500/.test(String(cbEixos)) && !/R\$\s?1k|R\$0k/.test(String(cbEixos)), cbEixos);
        // ── histórico: a ação "editar" não aparece crua ──
        ler(W, "logHistorico('editar','fixa','Teste',1); abrirHistorico();");
        check('ação "editar" tem rótulo no histórico', /Editado/.test(String(ler(W, "document.getElementById('histBody').querySelector('.hist-badge').textContent"))), ler(W, "document.getElementById('histBody').querySelector('.hist-badge').textContent"));
        ler(W, "document.getElementById('histModal').classList.add('hidden')");
        await assentar(W);
        // ── apagar tudo propaga também mapas e configs ──
        ler(W, "salvarLimite('Viagem', 100); planSetEconomia(50, true);"); await assentar(W);
        ler(W, 'resetarDados(); document.getElementById("confirmOkBtn").click();'); await assentar(W);
        await voltarAoApp(M);
        check('"Apagar todos os dados" limpa limites e pagamentos no outro aparelho', !ler(M, "appData.limites['Viagem']") && ler(M, 'Object.keys(appData.pagamentos).length') === 0, { limites: ler(M, 'JSON.stringify(appData.limites)'), pag: ler(M, 'JSON.stringify(appData.pagamentos)') });
        check('e o planejamento volta ao padrão', ler(M, 'appData.planejamento.economia') === 0, ler(M, 'appData.planejamento.economia'));
        // ── import é autoritativo nas células também ──
        ler(W, "salvarLimite('Viagem', 150)"); await assentar(W);
        await voltarAoApp(M);
        await dorme(3);
        ler(M, "salvarLimite('Viagem', 200)"); await assentar(M);    // o Windows não viu este 200: para ele nada muda ao importar 150
        const blobBackup = JSON.stringify({ rendas: [], fixas: [], faturas: [], dividas: [], limites: { Viagem: 150 }, planejamento: { economia: 40 } });
        ler(W, `(function(){ appData = normalizarAppData(JSON.parse(${JSON.stringify(blobBackup)})); _syncCarimbar(); _syncRestaurar(); salvarDados(); })()`); await assentar(W);
        await voltarAoApp(M);
        check('importar backup vence edição anterior também em limite e config', ler(M, "appData.limites['Viagem']") === 150 && ler(M, 'appData.planejamento.economia') === 40, { lim: ler(M, "appData.limites['Viagem']"), eco: ler(M, 'appData.planejamento.economia') });
        W.dom.window.close(); M.dom.window.close();
    }

    secao('38. A linha que o próprio SQL do app cria (r125)');
    {   // O SQL da tela de configuração semeia a linha, e o carimbo dela vem do now() do banco:
        // com microssegundos e fuso. É o caminho de todo usuário novo, então é caso de teste.
        const seed = (htmlBase.match(/values \(1, '(\{[^']*\})'\)/) || [])[1];
        check('o SQL do app ainda semeia a linha', !!seed, seed);
        zerarNuvem();
        nuvem.payload = JSON.parse(seed || '{}');
        nuvem.updated_at = '2026-11-04T12:34:56.123456+00:00';
        const e0 = nuvem.escritas;
        const N1 = await abrirAparelho('Novo-1');
        check('abrir um app vazio contra a linha recém-criada não grava', nuvem.escritas === e0, nuvem.escritas - e0);
        lancar(N1, 'Fixa', 'Primeira', 10); await assentar(N1);
        check('o 1º lançamento entra pela escrita condicional (carimbo com microssegundos e +00:00)', naNuvem('fixas').includes('Primeira'), { fixas: naNuvem('fixas'), status: txt(N1, 'headerSupaText') });
        nuvem.updated_at = null;     // linha antiga, sem carimbo
        lancar(N1, 'Fixa', 'Segunda', 10); await assentar(N1);
        check('linha com updated_at nulo também aceita a escrita', naNuvem('fixas').includes('Segunda'), naNuvem('fixas'));
        // tabela vazia, sem linha nenhuma (quem pulou o INSERT do SQL)
        zerarNuvem();
        const postsAntes = nuvem.posts;
        lancar(N1, 'Fixa', 'Terceira', 10); await assentar(N1);
        check('tabela sem linha: cria a linha', nuvem.posts === postsAntes + 1 && naNuvem('fixas').includes('Terceira'), naNuvem('fixas'));
        N1.dom.window.close();
    }

    secao('39. Texto-fonte que nada mais confere');
    {
        const bruto = fs.readFileSync(ARQ, 'utf8');
        const iCdn = bruto.indexOf('src="https://cdn.tailwindcss.com"'), iCfg = bruto.indexOf('tailwind.config =');
        check('tailwind.config vem DEPOIS do script do Tailwind (antes dava erro em toda abertura)', iCdn >= 0 && iCfg > iCdn, { iCdn, iCfg });
        const csp = (bruto.match(/http-equiv="Content-Security-Policy"\s+content="([^"]*)"/) || [])[1] || '';
        check('a CSP de produção libera a nuvem só em https://*.supabase.co', /connect-src 'self' https:\/\/\*\.supabase\.co;/.test(csp), csp.slice(0, 200));
        const usaDataNow = (bruto.match(/(?:appData\.(?:add|del)\[[^\]]*\]|updatedAt)\s*=\s*Date\.now\(\)/g) || []);
        check('nenhum carimbo de sync escrito direto com o relógio de parede', usaDataNow.length === 0, usaDataNow);
    }

    relatorio();
})().catch(e => { console.error('\nFALHA DO HARNESS:', e); process.exit(2); });

function naNuvemObj(col) { return (nuvem.payload && nuvem.payload[col]) || []; }

function relatorio() {
    console.log('\n' + '='.repeat(64));
    if (erros.length) { console.log('ERROS DE RUNTIME (' + erros.length + '):'); erros.slice(0, 12).forEach(e => console.log('  ! ' + e)); }
    console.log(`RESULTADO: ${ok} ✓ · ${fail} ✗ · runtime: ${erros.length} · leituras ${nuvem.gets} · checagens ${nuvem.checks} · escritas ${nuvem.escritas} (conflitos ${nuvem.conflitos})`);
    process.exit(fail || erros.length ? 1 : 0);
}

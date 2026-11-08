// Wander 3D 数据本机缓存：把看过的 Google 3D 瓦片存在本机浏览器里，按 Google 返回的 Cache-Control 有效期复用。
// 同一块瓦片每次会话的网址里 session/key 参数不同，浏览器自带缓存认不出来；这里去掉这两个参数当缓存键。
const CACHE = 'wander-3d-v1';
const MAX_ENTRIES = 30000;          // 约 1–2 GB 上限，超出后删最早存的
const DEFAULT_TTL = 0;              // 没有 max-age 就不存
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

function keyOf(u){
  const x = new URL(u); x.searchParams.delete('session'); x.searchParams.delete('key'); x.searchParams.delete('access_token');
  return x.origin + x.pathname + (x.searchParams.toString() ? '?' + x.searchParams : '');
}
function isTile(u){
  const x = new URL(u);
  return (x.hostname === 'tile.googleapis.com' && x.pathname.startsWith('/v1/3dtiles/datasets/') && x.pathname.includes('/files/'))
      || (x.hostname === 'assets.ion.cesium.com' && !x.pathname.endsWith('tileset.json') && !x.pathname.endsWith('root.json'));
}
function ttl(res){
  const cc = res.headers.get('cache-control') || '';
  if (/no-store|private/i.test(cc) && !/max-age/i.test(cc)) return 0;
  if (/no-store/i.test(cc)) return 0;
  const m = cc.match(/max-age=(\d+)/i);
  return m ? +m[1] : DEFAULT_TTL;
}
let n = 0;
async function trim(c){
  if (++n % 200) return;
  const ks = await c.keys();
  for (let i = 0; i < ks.length - MAX_ENTRIES; i++) await c.delete(ks[i]);
}
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || !isTile(r.url)) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE), k = keyOf(r.url);
    const hit = await c.match(k);
    if (hit && +hit.headers.get('x-wander-exp') > Date.now()) return hit;
    const res = await fetch(r);
    const t = res.ok && res.type !== 'opaque' ? ttl(res) : 0;
    if (t > 0) {
      const body = await res.clone().arrayBuffer(), h = new Headers(res.headers);
      h.set('x-wander-exp', String(Date.now() + t * 1000));
      e.waitUntil(c.put(k, new Response(body, { status: res.status, statusText: res.statusText, headers: h })).then(() => trim(c)).catch(() => {}));
    } else if (hit) e.waitUntil(c.delete(k));
    return res;
  })().catch(() => fetch(r)));
});

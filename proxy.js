export const PROXIES = {
corsproxy: url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
allorigins: url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
codetabs: url => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`,
corslol: url => `https://api.cors.lol/?url=${encodeURIComponent(url)}`,
thingproxy: url => `https://thingproxy.freeboard.io/fetch/${url}`,
corseu: url => `https://cors.eu.org/${url}`,
}

const cache = new Map()
let _selected = 'auto'
let _last = ''
const TIMEOUT = 12000

export function setProxy(name) {
if (name !== 'auto' && !PROXIES[name]) throw new Error(`Unknown proxy: ${name}`)
_selected = name
}

export function getProxy() {
return _selected
}

export function lastProxy() {
return _last
}

async function attempt(name, makeUrl, url, signal) {
const ctl = new AbortController()
const onAbort = () => ctl.abort()
signal?.addEventListener('abort', onAbort)
const timer = setTimeout(() => ctl.abort(), TIMEOUT)
try {
const res = await fetch(makeUrl(url), {signal: ctl.signal, credentials: 'omit', referrerPolicy: 'no-referrer'})
if (!res.ok) throw new Error(`${name} HTTP ${res.status}`)
const text = await res.text()
if (!text || text.length < 20 || /^\s*\{"(error|status)"/i.test(text)) throw new Error(`${name} returned no content`)
return {name, text}
} finally {
clearTimeout(timer)
signal?.removeEventListener('abort', onAbort)
}
}

async function race(url) {
const ctl = new AbortController()
const entries = Object.entries(PROXIES)
const direct = fetch(url, {signal: ctl.signal, credentials: 'omit', referrerPolicy: 'no-referrer'})
.then(async r => { if (!r.ok) throw new Error('direct failed'); return {name: 'direct', text: await r.text()} })
const racers = entries.map(([n, f]) => attempt(n, f, url, ctl.signal))
try {
const win = await Promise.any([direct, ...racers])
ctl.abort()
return win
} catch (e) {
const msgs = (e.errors || []).map(x => x.message).filter(m => !/abort/i.test(m))
throw new Error(msgs.length ? msgs.slice(0, 3).join('; ') : 'all proxies failed')
}
}

async function ordered(url) {
const first = _selected
const rest = Object.keys(PROXIES).filter(n => n !== first)
let lastErr
for (const n of [first, ...rest]) {
try { return await attempt(n, PROXIES[n], url) }
catch (e) { lastErr = e }
}
throw lastErr
}

export async function proxyFetch(url) {
if (cache.has(url)) return cache.get(url)
const pending = (_selected === 'auto' ? race(url) : ordered(url)).then(r => {
_last = r.name
return r.text
})
cache.set(url, pending)
try { return await pending }
catch (e) { cache.delete(url); throw e }
}

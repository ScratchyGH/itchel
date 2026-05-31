export const PROXIES = {
allorigins: url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
corsproxy: url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
codetabs: url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
}

let _selected = 'allorigins'

export function setProxy(name) {
if (!PROXIES[name]) throw new Error(`Unknown proxy: ${name}`)
_selected = name
}

export function getProxy() {
return _selected
}

export async function proxyFetch(url) {
const res = await fetch(PROXIES[_selected](url))
if (!res.ok) throw new Error(`Proxy returned HTTP ${res.status}`)
if (_selected === 'allorigins') {
const json = await res.json()
if (!json.contents) throw new Error('AllOrigins returned no content')
return json.contents
}
return res.text()
}

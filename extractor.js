export function extractGameUrl(html) {
for (const m of html.matchAll(/window\.itch\s*=\s*(\{[\s\S]+?\});/g)) {
try {
const obj = JSON.parse(m[1])
if (obj.embed_url) return obj.embed_url
} catch (_) {}
}
const embedMatch = html.match(/"(?:embed_url|game_url|url)"\s*:\s*"(https:\/\/[^"]+\.itch\.zone[^"]+\.html[^"]*)"/)
if (embedMatch) return embedMatch[1]
const iframeMatch = html.match(/<iframe[^>]+src=["'](https:\/\/[^"']+\.itch\.zone[^"']+\.html[^"']*)["']/i)
if (iframeMatch) return iframeMatch[1]
const directMatch = html.match(/(https:\/\/[a-z0-9\-]+\.itch\.zone\/html\/[^"'\s<>]+\.html(?:\?[^"'\s<>]*)?)/)
if (directMatch) return directMatch[1]
const apiMatch = html.match(/"upload_id"\s*:\s*(\d+)/)
if (apiMatch) {
const pageMatch = html.match(/content="(https:\/\/[^"]+\.itch\.io\/[^"]+)"/)
if (pageMatch) return `UPLOAD_ID:${apiMatch[1]}:${pageMatch[1]}`
}
return null
}

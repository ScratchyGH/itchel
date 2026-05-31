export function patchHTML(html, sourceUrl, opts = {}) {
const {stripTracking = true, injectBase = true, injectShim = true} = opts
const originalCount = (html.match(/<script/gi) || []).length
let out = html
if (injectBase) {
const base = sourceUrl.substring(0, sourceUrl.lastIndexOf('/') + 1)
if (!out.match(/<base\s/i)) out = out.replace(/(<head[^>]*>)/i, `$1<base href="${base}">`)
}
if (stripTracking) {
out = out.replace(/<script[^>]+static\.itch\.io\/htmlgame\.js[^>]*><\/script>/gi, '')
out = out.replace(/<script[^>]+static\.itch\.io\/v2[^>]*><\/script>/gi, '')
out = out.replace(/<script[^>]+google-analytics[^>]*>[\s\S]*?<\/script>/gi, '')
out = out.replace(/<script[^>]+googletagmanager[^>]*>[\s\S]*?<\/script>/gi, '')
}
if (injectShim) {
const shim = '<script>\nif(!window.Itch){window.Itch={env:{},options:{}}}\nif(!window.gpr){window.gpr={report:function(){}}}\n<\/script>'
out = out.replace(/(<\/head>)/i, shim + '$1')
}
out = out.replace(/(<\/head>)/i, '<meta name="itchel" content="Saved with Itchel">$1')
return {html: out, scriptsRemoved: originalCount - (out.match(/<script/gi) || []).length}
}

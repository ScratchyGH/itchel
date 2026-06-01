import {proxyFetch, setProxy, getProxy} from './proxy.js'
import {extractGameUrl} from './extractor.js'
import {patchHTML} from './patcher.js'
import {setStep, resetSteps, show, hide, addClass, removeClass, showResult} from './ui.js'
let finalHTML = ''
let finalFilename = 'game.html'
document.querySelectorAll('.proxy-tag').forEach(tag => {
tag.addEventListener('click', () => {
document.querySelectorAll('.proxy-tag').forEach(t => t.classList.remove('active'))
tag.classList.add('active')
setProxy(tag.dataset.proxy)
})
})
function slugify(str) {
return str.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase() || 'game'
}
function getOptions() {
return {
stripTracking: document.getElementById('optStrip').checked,
injectBase: document.getElementById('optBase').checked,
injectShim: document.getElementById('optShim').checked,
}
}
export async function run() {
const url = document.getElementById('itchUrl').value.trim()
if (!url || !url.startsWith('http')) { document.getElementById('itchUrl').focus(); return }
document.getElementById('goBtn').disabled = true
show('progressCard')
removeClass('resultCard', 'visible')
finalHTML = ''
resetSteps()
try {
setStep('s1', 'active', `Fetching via ${getProxy()}…`)
let pageHtml
try { pageHtml = await proxyFetch(url) }
catch (e) { throw {step: 's1', msg: `Proxy fetch failed: ${e.message}. Try a different proxy.`} }
const titleMatch = pageHtml.match(/<title>([^<]+)<\/title>/i)
const pageTitle = titleMatch ? titleMatch[1].replace(/\s*[-–|].*$/, '').trim() : 'game'
finalFilename = slugify(pageTitle) + '.html'
setStep('s1', 'done', `Got ${(pageHtml.length/1024).toFixed(1)} KB — "${pageTitle}"`, 'success')
setStep('s2', 'active', 'Parsing page…')
const gameUrl = extractGameUrl(pageHtml)
if (!gameUrl) throw {step: 's2', msg: 'Could not find a playable HTML5 game on this page. Ensure the game has a web/HTML5 build enabled on itch.io.'}
if (gameUrl.startsWith('UPLOAD_ID:')) throw {step: 's2', msg: "This game uses itch.io's newer upload system and requires authentication. Try opening the game's embed page directly."}
setStep('s2', 'done', gameUrl, 'success')
setStep('s3', 'active', 'Downloading game from itch.zone…')
let gameHtml
try { gameHtml = await proxyFetch(gameUrl.split('?')[0]) }
catch (_) {
try { gameHtml = await proxyFetch(gameUrl) }
catch (e2) { throw {step: 's3', msg: `Could not fetch game file: ${e2.message}`} }
}
setStep('s3', 'done', `${(gameHtml.length/1024).toFixed(1)} KB downloaded`, 'success')
setStep('s4', 'active', 'Patching HTML…')
const opts = getOptions()
const {html: patched, scriptsRemoved} = patchHTML(gameHtml, gameUrl, opts)
finalHTML = patched
setStep('s4', 'done', `Done. ${scriptsRemoved > 0 ? scriptsRemoved + ' script(s) removed.' : 'No scripts removed.'}`, 'success')
showResult(pageTitle, finalFilename, patched.length, scriptsRemoved, opts.injectBase)
} catch (err) {
setStep(err.step || 's1', 'error-step', err.msg || String(err), 'error')
}
document.getElementById('goBtn').disabled = false
}
export function downloadGame() {
if (!finalHTML) return
const a = document.createElement('a')
a.href = URL.createObjectURL(new Blob([finalHTML], {type: 'text/html'}))
a.download = finalFilename
a.click()
setTimeout(() => URL.revokeObjectURL(a.href), 5000)
}
export function reset() {
document.getElementById('itchUrl').value = ''
hide('progressCard')
removeClass('resultCard', 'visible')
finalHTML = ''
document.getElementById('itchUrl').focus()
}
document.getElementById('itchUrl').addEventListener('keydown', e => { if (e.key === 'Enter') run() })
window.run = run
window.downloadGame = downloadGame
window.reset = reset
;(()=>{
const ABBR=n=>{if(n>=1e12)return(n/1e12).toFixed(n%1e12<1e11?1:0)+'T';if(n>=1e9)return(n/1e9).toFixed(n%1e9<1e8?1:0)+'B';if(n>=1e6)return(n/1e6).toFixed(n%1e6<1e5?1:0)+'M';if(n>=1e3)return(n/1e3).toFixed(n%1e3<100?1:0)+'K';return String(n)}
const el=document.getElementById('viewCount')
const KEY='itchel_viewed'
const gun=Gun(['https://gun-manhattan.herokuapp.com/gun','https://gun-us.herokuapp.com/gun'])
const views=gun.get('itchel-views').get('count')
views.on(v=>{if(typeof v==='number'&&el)el.textContent=ABBR(v)})
if(!localStorage.getItem(KEY)){
localStorage.setItem(KEY,'1')
views.once(v=>{views.put(typeof v==='number'?v+1:1)})
}
})()

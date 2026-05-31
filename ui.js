export function setStep(stepId, state, detail, detailClass = '') {
const el = document.getElementById(stepId)
if (!el) return
el.className = 'step' + (state ? ' ' + state : '')
const d = document.getElementById(stepId + 'd')
if (d) {
d.textContent = detail
d.className = 'step-detail' + (detailClass ? ' ' + detailClass : '')
}
const num = el.querySelector('.step-num')
if (!num) return
if (state === 'active') {
num.innerHTML = '<div class="spin"></div>'
num.style.background = 'transparent'
num.style.borderColor = 'var(--border2)'
} else {
num.innerHTML = stepId.replace(/\D/g, '')
num.style.background = ''
num.style.borderColor = ''
}
}

export function resetSteps() {
['s1','s2','s3','s4'].forEach(id => setStep(id, '', 'Waiting…'))
}

export function show(id) {
const el = document.getElementById(id)
if (el) el.style.display = 'block'
}

export function hide(id) {
const el = document.getElementById(id)
if (el) el.style.display = 'none'
}

export function addClass(id, cls) {
document.getElementById(id)?.classList.add(cls)
}

export function removeClass(id, cls) {
document.getElementById(id)?.classList.remove(cls)
}

export function showResult(title, filename, sizeBytes, scriptsRemoved, baseInjected) {
document.getElementById('resultTitle').textContent = title || 'Game ready'
document.getElementById('resultSub').textContent = filename
document.getElementById('metaRow').innerHTML = `<div class="meta-pill">Size: <span>${(sizeBytes/1024).toFixed(1)} KB</span></div><div class="meta-pill">Scripts removed: <span>${scriptsRemoved}</span></div><div class="meta-pill">Base URL: <span>${baseInjected ? 'Injected' : 'Skipped'}</span></div>`
addClass('resultCard', 'visible')
}

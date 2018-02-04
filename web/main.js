'use strict'

const std = document.getElementById('stdio')
const loc = window.location
const wsURI = `ws${loc.protocol === 'https:' ? 's' : ''}://${loc.host}/sock/`
const ws = new WebSocket(wsURI)
let code = document.createElement('code')
std.appendChild(code)
let scrolling = true
let inserting = false

std.addEventListener('scroll', (e) => {
  if (!inserting) {
    scrolling = (std.scrollHeight - std.scrollTop - std.clientHeight) < 20
  }
})

ws.onmessage = m => {
  let data = JSON.parse(m.data)
  if (data.cmd) {
    document.title = `WebTerm: ${data.cmd}`
    return
  }
  data = data.stdout || data.stderr
  if (!data) {
    return
  }
  let i = 0
  inserting = true
  while (i < data.length) {
    const j = data.indexOf('\n', i)
    if (j === -1) {
      code.insertAdjacentText('beforeend', data.slice(i))
      break
    } else {
      code.insertAdjacentText('beforeend', data.slice(i, j))
      std.insertAdjacentText('beforeend', '\n')
      code = document.createElement('code')
      std.appendChild(code)
      i = j + 1
    }
  }
  if (scrolling) {
    code.scrollIntoView({
      behavior: 'instant',
      block: 'end'
    })
  }
  inserting = false
}

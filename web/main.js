'use strict'

const std = document.getElementById('stdio')
const loc = window.location
const wsURI = `ws${loc.protocol === 'https:' ? 's' : ''}://${loc.host}/sock/`
const ws = new WebSocket(wsURI)
let code = document.createElement('code')
std.appendChild(code)
let scrolling = true
let inserting = false
let exited = false

std.addEventListener('scroll', (e) => {
  if (!inserting) {
    scrolling = (std.scrollHeight - std.scrollTop - std.clientHeight) < 20
  }
})

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && (event.key === 'c')) {
    ws.send("{cmd: 'controlC'}")
  }
})

ws.onclose = () => {
  if (!exited) {
    std.insertAdjacentHTML('afterend', '<div class="disconnect">Server disconnected</div>')
  }
}

function insertText (txt) {
  let i = 0
  inserting = true
  while (i < txt.length) {
    const j = txt.indexOf('\n', i)
    if (j === -1) {
      code.insertAdjacentText('beforeend', txt.slice(i))
      break
    } else {
      code.insertAdjacentText('beforeend', txt.slice(i, j))
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

ws.onmessage = m => {
  let msg = JSON.parse(m.data)
  switch (msg.cmd) {
    case 'spawn':
      document.title = `WebTerm: ${msg.data}`
      break
    case 'stdout':
    case 'stderr':
      insertText(msg.data)
      break
    case 'exit':
      exited = true
      std.insertAdjacentHTML('afterend', `<div class="disconnect">Process exited: ${msg.data.code}</div>`)
      break
    default:
      console.log('Unknown command: ' + m.data)
  }
}

const path = require('path')
const {clipboard} = require('electron')
const cp = require('child_process')
const fs = require('fs')

/*
let ucd_worker = cp.fork(path.join(__dirname, 'ucd_worker.js'), {
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
})
*/

let ucd_worker = cp.fork(path.join(__dirname, 'ucd_worker.js'))

/*
ucd_worker.stdout.on('data', (data) => {
  console.log(data)
})
*/


ucd_worker.on('message', (msg) => {
  console.log('received msg')
  console.log(msg)
  const {result} = msg
  updateResult(result)
})

function sendQuery(query) {
  ucd_worker.send(query)
}

function clearResultElem() {
  const resultElem = document.getElementById("result")
  while(resultElem.firstChild) {
    resultElem.removeChild(resultElem.firstChild)
  }
}

function setBusy() {
  const resultElem = document.getElementById("result")
  clearResultElem()
  let spinner = document.createElement('div')
  spinner.setAttribute('class', 'spinner')
  resultElem.appendChild(spinner)
}

function updateResult(hits) {
  const statusbarElem = document.getElementById('statusbar')
  const resultElem = document.getElementById("result")

  let tab = document.createElement('table', {id: 'result-table'})
  tab.setAttribute('id', 'result-table')

  let count = 0
  for(item of hits) {
    if (count++ >= 100) { break }
    try {
      const ch = String.fromCodePoint(item.cp)
      const na = item.na
      let row = tab.insertRow(-1)
      let col1 = row.insertCell(0)
      let col2 = row.insertCell(1)
      row.setAttribute('class', 'result-row')
      col1.setAttribute('class', 'character-cell')
      col2.setAttribute('class', 'name-cell')
      col1.innerHTML = ch
      col2.innerHTML = na
      row.onclick = () => { 
        clipboard.writeText(ch)
        statusbarElem.innerHTML = 'Character ' + ch + ' copied to clipboard.'
      }
    } catch(err) {
      // do nothing
    }
  }
  clearResultElem()
  resultElem.appendChild(tab)
  statusbarElem.innerHTML = 'Found ' + count + ' results.'
}


function searchHandler() {
  const queryElem = document.getElementById('query')
  const statusbarElem = document.getElementById('statusbar')
  const resultElem = document.getElementById("result")

  let tab = document.getElementById('result-table')
  if (tab) { resultElem.removeChild(tab) }

  query = queryElem.value
  if (query.length >= 2) {
    sendQuery(query)
    setBusy()
  } else {
    statusbarElem.innerHTML = 'Results cleared.'
  }
  return false
}
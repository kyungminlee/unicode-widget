const {clipboard} = require('electron')


function updateResult(query) {
  const statusbarElem = document.getElementById('statusbar')
  const resultElem = document.getElementById("result")

  tab = document.createElement('table', {id: 'result-table'})
  tab.setAttribute('id', 'result-table')

  const hits = ucd.search(query)
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
  if (query.length >= 3) {
    const promise = new Promise((resolve, reject) => {
      updateResult(query)
    })
  } else {
    statusbarElem.innerHTML = 'Results cleared.'
  }
  return false
}
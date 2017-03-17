const http = require('http')
const fs = require('fs')
const Fuse = require('fuse.js')
const path = require('path')

class UnicodeDatabase {
  constructor() {
    this.database = []
    this.loadDatabase(path.join(__dirname, 'ucd.nounihan.simplified.json'))
  }

  loadDatabase(filename) {
    this.database = []
    const data = fs.readFileSync(filename, 'utf8', (err) => {
        if (err) { throw err }
      })
    const json = JSON.parse(data)
    for(let item of json) {
      this.database.push({cp: item[0], na: item[1]})
    }

    const options = {
      shouldSort: true,
      tokenize: true,
      matchAllTokens: true,
      threshold: 0.4,
      location: 0,
      distance: 100,
      minMatchCharLength: 3,
      keys: ['na']
    }
    this.fuse = new Fuse(this.database, options)
  }

  search(query) {
    return this.fuse.search(query)
  }
}
ucd = new UnicodeDatabase()
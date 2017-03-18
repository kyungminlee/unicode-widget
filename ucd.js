const http = require('http')
const fs = require('fs')
const Fuse = require('fuse.js')
const path = require('path')

class UnicodeDatabase {
  constructor(maxHits = 100) {
    this.maxHits = maxHits
    this.database = []
    this.lookup = {}
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
      this.lookup[item[0]] = item[1]
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
    let result = this.fuse.search(query)
    result.splice(this.maxHits)
    return result
  }

  lookup(cp) {
    return this.lookup[cp]
  }
}

class CachedUnicodeDatabase {
  constructor(cacheSize = 1000, maxHits = 50) {
    this.cache = {}
    this.history = []
    this.cacheSize = cacheSize
    this.ucd = new UnicodeDatabase(maxHits)
  }

  search(query) {
    query = query.toLowerCase() //.replace(/[^a-z]+/g, "")
    let result = this.cache[query]
    if (!result) {
      result = this.ucd.search(query)
      this.cache[query] = result
      this.history.push(query)
      if (this.history.length > this.cacheSize) {
        let query = this.history.shift()
        delete this.cache[query]
      }
    }
    return result
  }
}
ucd = new CachedUnicodeDatabase()

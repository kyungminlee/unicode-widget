//const http = require('http')
const fs = require('fs')
const Fuse = require('fuse.js')
const path = require('path')
//const cluster = require('cluster')

class UnicodeDatabase {
  constructor(ucdFilename, maxHits = 100) {
    this.maxHits = maxHits
    this.database = []
    this.lookupTable = {}
    this.load(ucdFilename)
  }

  load(filename) {
    this.database = []
    const data = fs.readFileSync(filename, 'utf8', (err) => {
        if (err) { throw err }
      })
    const json = JSON.parse(data)
    for(const item of json) {
      this.database.push({cp: item[0], na: item[1]})
      this.lookupTable[item[0]] = item[1]
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
    return this.lookupTable[cp]
  }
}

class CachedUnicodeDatabase {
  constructor(ucdFilename, configFilename, cacheFilename, aliases = {}, cacheSize = 1000, maxHits = 50) {
    this.cache = {}
    this.history = []
    this.cacheSize = cacheSize
    this.aliases = {}
    this.ucd = new UnicodeDatabase(ucdFilename, maxHits)
    this.loadConfig(configFilename)
    this.loadCache(cacheFilename)
  }

  loadConfig(filename) {
    const config = JSON.parse(fs.readFileSync(filename, "utf8"))
    this.aliases = config.aliases
    // TODO: other configs (unicode categories, number of ...)
  }

  loadCache(filename) {
    try {
      const data = JSON.parse(fs.readFileSync(filename, "utf8"))
      if (data && data['cache'] && data['history']) {
        this.cache = data['cache']
        this.history = data['history']
      }
    } catch (err) {
      // do nothing
    }
  }

  dump(filename) {
    const cache = JSON.stringify({cache: this.cache, history: this.history})
    fs.writeFileSync(filename, cache)
  }

  addAlias(alias, value) {
    this.aliases[alias] = value
  }

  search(query) {
    const aliasResolved = this.aliases[query]
    if (aliasResolved) { query = aliasResolved }
    else { query = query.toUpperCase() }

    let cacheHits = this.cache[query]
    if (cacheHits) {
      const result = cacheHits.map((cp) => ({cp: parseInt(cp), na: this.ucd.lookup(cp)}))
      return result
    } else {
      const result = this.ucd.search(query)
      this.cache[query] = result.map((obj) => obj.cp)
      this.history.push(query)
      if (this.history.length > this.cacheSize) {
        let query = this.history.shift()
        delete this.cache[query]
      }
      return result
    }
  }

  cacheAliases() {
    for(let alias in this.aliases) {
      console.log(alias)
      this.search(alias)
    }
  }
}


module.exports.CachedUnicodeDatabase = CachedUnicodeDatabase
module.exports.UnicodeDatabase = UnicodeDatabase
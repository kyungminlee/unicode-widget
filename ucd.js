//const http = require('http')
const fs = require('fs')
const Fuse = require('fuse.js')
const path = require('path')

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
  constructor(ucdFilename, cacheFilename, aliases = {}, cacheSize = 1000, maxHits = 50) {
    this.cache = {}
    this.history = []
    this.cacheSize = cacheSize
    this.aliases = {}
    this.ucd = new UnicodeDatabase(ucdFilename, maxHits)
    this.load(cacheFilename)
  }

  load(filename) {
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
      this.cache[query] = result.keys()
      this.history.push(query)
      if (this.history.length > this.cacheSize) {
        let query = this.history.shift()
        delete this.cache[query]
      }
      return result
    }
  }

  cacheGreekAlphabet() {
    const greekAlphabets = [
      'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
      'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi',
      'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
    ]
    for (let ga of greekAlphabets) {
      console.log("caching " + ga)
      if (!this.cache[ga]) {
        const queryUpper = 'GREEK CAPITAL LETTER ' + ga.toUpperCase()
        this.addAlias(ga, queryUpper)
        this.search(ga)
      }

      const gaLower = ga.toLowerCase()
      if (!this.cache[gaLower]) {
        const queryLower = 'GREEK SMALL LETTER ' + ga.toUpperCase()
        this.addAlias(gaLower, queryLower)
        this.search(gaLower)
      }
    }
  }
}

let ucd = new CachedUnicodeDatabase(
  path.join(__dirname, 'ucd.nounihan.simplified.json'),
  path.join(__dirname, 'cache.json')
)

ucd.cacheGreekAlphabet()
ucd.dump(path.join(__dirname, 'cache.json'))
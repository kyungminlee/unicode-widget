const path = require('path')
const UCD = require(path.join(__dirname, 'ucd.js'))

process.send({type: 'status', ready: false, message: 'Initializing...'})

let cachedUCD = new UCD.CachedUnicodeDatabase(
  path.join(__dirname, '..', 'ucd.nounihan.simplified.json'),
  path.join(__dirname, '..', 'config.json'),
  path.join(__dirname, '..', 'cache.json')
)

process.on('message', (msg) => {
  try {
    const {query} = msg
    const result = cachedUCD.search(query)
    process.send({type: 'result', result: result})
  } catch (err) {
    process.send({type: 'status', ready: true, message: 'Search failed.'})
  }
})

process.send({type: 'status', ready: false, message: 'Caching...'})
cachedUCD.cacheAliases()
cachedUCD.dump(path.join(__dirname, '..', 'cache.json'))

process.send({type: 'status', ready: true, message: 'Ready.'})

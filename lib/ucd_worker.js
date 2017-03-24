console.log('BEGIN ucd_worker')

const path = require('path')
const UCD = require(__dirname + '/ucd')

let cachedUCD = new UCD.CachedUnicodeDatabase(
  path.join(__dirname, 'ucd.nounihan.simplified.json'),
  path.join(__dirname, 'config.json'),
  path.join(__dirname, 'cache.json')
)

process.on('message', (msg) => {
  const result = cachedUCD.search(msg)
  //process.send(`child received ${msg}`)
  process.send({result: result})
})

//ucd.cacheAliases()
//ucd.dump(path.join(__dirname, 'cache.json'))

console.log('END ucd_worker')

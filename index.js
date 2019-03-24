const Yaml = require('js-yaml')
const fs = require('fs')

function objectMap (object, mapFn) {
  return Object.keys(object).reduce((result, key) => {
    result[key] = mapFn(object[key])
    return result
  }, {})
}

module.exports = api => {
  api.chainWebpack(config => {
    const filename = api.resolve('env.yaml')
    if(!fs.existsSync(filename)) {
      return false
    }    
    const env = Yaml.safeLoad(fs.readFileSync(filename, 'utf8'))
    if(env && typeof env === 'object') {
      const loadEnv = objectMap(env, value => JSON.stringify(value))
      const getCurrentEnv = (args) => {
        args['process.env'] = { ...args['process.env'], ...loadEnv }
        return args
      }
      config.plugin('define').init((Plugin, args) => {
        return new Plugin(getCurrentEnv(...args))
      })
    }
  })
}

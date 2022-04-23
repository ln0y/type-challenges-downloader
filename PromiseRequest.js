const https = require('https')

const UAHeader = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
    Accept: 'application/vnd.github.v3+json',
  }
}

function isObject (value) {
  const type = typeof value
  return value !== null && (type === 'object' || type === 'function')
}

function merge (source, other) {
  if (!isObject(source) || !isObject(other)) {
    return other === undefined ? source : other
  }
  return Object.keys({
    ...source,
    ...other
  }).reduce((acc, key) => {
    // 递归合并 value
    acc[key] = merge(source[key], other[key])
    return acc
  }, Array.isArray(source) ? [] : {})
}

function httpRequest (url, options, postData) {
  return new Promise(function (resolve, reject) {
    var req = https.request(url, options, function (res) {
      // reject on bad status
      if (res.statusCode == 302) {
        return resolve(res.headers.location)
      } else if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('statusCode=' + res.statusCode))
      }

      // cumulate data
      var body = []
      res.on('data', function (chunk) {
        body.push(chunk)
      })
      // resolve on end
      res.on('end', function () {
        try {
          body = JSON.parse(Buffer.concat(body).toString())
        } catch (e) {
          reject(e)
        }
        resolve(body)
      })
    })
    // reject on request error
    req.on('error', function (err) {
      // This is not a "Second reject", just a different sort of failure
      reject(err)
    })
    if (postData) {
      req.write(postData)
    }
    // IMPORTANT
    req.end()
  })
}

const getMethod = (url, options) => httpRequest(url, merge(options, {
  method: 'GET',
}))

const postMethod = (url, data, options) => httpRequest(url, merge(options, {
  method: 'POST',
}), data)


const baseUrl = 'https://api.github.com'
const owner = 'type-challenges'
const repo = 'type-challenges'

const replaceUrlParams = (url, params = {}) => url.replace(/{([\w]+)}/g, function (match, p1) {
  let value
  try {
    value = params[p1] ?? eval(p1)
    Reflect.deleteProperty(params, p1)
  } catch (error) {
    value = match
  }
  return value
})

const urlProxy = url => new Proxy(url, {
  get (target, key) {
    return baseUrl + replaceUrlParams(Reflect.get(target, key))
  },
})


const github = {
  get (url, data, options) {
    url = replaceUrlParams(url, data)
    const reqURL = new URL(url)
    reqURL.search = new URLSearchParams(data).toString()
    return getMethod(reqURL.toString(), merge(options, UAHeader))
  },
  post (url, data, options) {
    url = replaceUrlParams(url, data)
    return postMethod(url, data, merge(options, UAHeader))
  }
}

module.exports = {
  isObject,
  merge,
  urlProxy,
  github,
  getMethod,
  postMethod,
}

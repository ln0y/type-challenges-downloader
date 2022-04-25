const { getMethod, postMethod, replaceUrlParams } = require('./index.js')

const UAHeader = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
    Accept: 'application/vnd.github.v3+json',
  }
}

const urlProxy = url => new Proxy(url, {
  get (target, key, receiver) {
    return baseUrl + replaceUrlParams(Reflect.get(target, key, receiver))
  },
})

const baseUrl = 'https://api.github.com'
const owner = 'type-challenges'
const repo = 'type-challenges'

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
  github,
}

const http = require('http')
const https = require('https')
const { merge } = require('../shared/index')

function httpRequest (url, options, postData) {
  return new Promise(function (resolve, reject) {
    var req = https.request(url, options, function (res) {
      if (res.statusCode == 302 || res.statusCode == 301) {
        return resolve(res.headers.location)
      } else if (res.statusCode < 200 || res.statusCode >= 300) {
        // reject on bad status
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

const replaceUrlParams = (url, params = {}) =>
  url.replace(/{([\w]+)}/g, function (match, p1) {
    const value = params[p1] ?? match
    Reflect.deleteProperty(params, p1)
    return value
  })

const getMethod = (url, options) =>
  httpRequest(url, merge(options, {
    method: 'GET',
  }))

const postMethod = (url, data, options) =>
  httpRequest(url, merge(options, {
    method: 'POST',
  }), data)

module.exports = {
  getMethod,
  postMethod,
  replaceUrlParams,
}

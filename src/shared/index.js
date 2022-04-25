
function isObject (value) {
  const type = typeof value
  return value !== null && (type === 'object' || type === 'function')
}

function merge (source, other, ...rest) {
  if (!isObject(source) || !isObject(other)) {
    return other === undefined ? source : other
  }

  const obj = Object.keys({
    ...source,
    ...other
  }).reduce((acc, key) => {
    acc[key] = merge(source[key], other[key])
    return acc
  }, Array.isArray(source) ? [] : {})

  return rest.length ? merge(obj, ...rest) : obj
}


module.exports = {
  isObject,
  merge,
}

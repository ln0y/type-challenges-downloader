import { isObject, merge } from '../src/shared/index.js'

describe('isObject', function () {
  it('should return `true` for objects', function () {
    expect(isObject([1, 2, 3])).toBe(true)
    expect(isObject(Object(false))).toBe(true)
    expect(isObject(new Date)).toBe(true)
    expect(isObject(new Error)).toBe(true)
    expect(isObject({ 'a': 1 })).toBe(true)
    expect(isObject(Object(0))).toBe(true)
    expect(isObject(/x/)).toBe(true)
    expect(isObject(Object('a'))).toBe(true)

    if (Symbol) {
      expect(isObject(Object(Symbol))).toBe(true)
    }
  })

  it('should return `false` for non-objects', function () {
    expect(isObject(true)).toBe(false)
    expect(isObject(1)).toBe(false)
    expect(isObject('a')).toBe(false)
    expect(isObject((Symbol('a')))).toBe(false)

  })
})

describe('merge', function () {
  it('should merge `source` into `object`', function () {
    let names = {
      'characters': [
        { 'name': 'barney' },
        { 'name': 'fred' }
      ]
    }

    let ages = {
      'characters': [
        { 'age': 36 },
        { 'age': 40 }
      ]
    }

    let heights = {
      'characters': [
        { 'height': '5\'4"' },
        { 'height': '5\'5"' }
      ]
    }

    let expected = {
      'characters': [
        { 'name': 'barney', 'age': 36, 'height': '5\'4"' },
        { 'name': 'fred', 'age': 40, 'height': '5\'5"' }
      ]
    }

    expect(merge(names, ages, heights)).toEqual(expected)
  })

  it.skip('should merge sources containing circular references', function () {
    let object = {
      'foo': { 'a': 1 },
      'bar': { 'a': 2 }
    }

    let source = {
      'foo': { 'b': { 'c': { 'd': {} } } },
      'bar': {} as any
    }

    source.foo.b.c.d = source
    source.bar.b = source.foo.b

    let actual = merge(object, source)

    expect(actual.bar.b).not.toStrictEqual(actual.foo.b)
    expect(actual.foo.b.c.d).toStrictEqual(actual.foo.b.c.d.foo.b.c.d)
  })

  it('should work with four arguments', function () {
    let expected = { 'a': 4 },
      actual = merge({ 'a': 1 }, { 'a': 2 }, { 'a': 3 }, expected)

    expect(actual).toStrictEqual(expected)
  })

  it('should merge first source object properties to function', function () {
    let fn = function () { },
      object = { 'prop': {} },
      actual = merge({ 'prop': fn }, object)

    expect(actual).toStrictEqual(object)
  })

  it('should merge first and second source object properties to function', function () {
    let fn = function () { },
      object = { 'prop': {} },
      actual = merge({ 'prop': fn }, { 'prop': fn }, object)

    expect(actual).toStrictEqual(object)
  })

  it('should not merge onto function values of sources', function () {
    let source1 = { 'a': function () { } },
      source2 = { 'a': { 'b': 2 } },
      expected = { 'a': { 'b': 2 } },
      actual = merge({}, source1, source2)

    expect(actual).toStrictEqual(expected)
    expect(!('b' in source1.a)).toBeTruthy()

    actual = merge(source1, source2)
    expect(actual).toStrictEqual(expected)
  })

  it('should assign `null` values', function () {
    let actual = merge({ 'a': 1 }, { 'a': null })
    expect(actual.a).toStrictEqual(null)
  })


  it('should not overwrite existing values with `undefined` values of object sources', function () {
    let actual = merge({ 'a': 1 }, { 'a': undefined, 'b': undefined })
    expect(actual).toStrictEqual({ 'a': 1, 'b': undefined })
  })

  it('should not overwrite existing values with `undefined` values of array sources', function () {
    let array = [1]
    array[2] = 3

    let actual = merge([4, 5, 6], array),
      expected = [1, 5, 3]

    expect(actual).toStrictEqual(expected)

    array = [1, , 3]
    array[1] = undefined

    actual = merge([4, 5, 6], array)
    expect(actual).toStrictEqual(expected)
  })

  it('should convert strings to arrays when merging arrays of `source`', function () {
    let object = { 'a': 'abcde' },
      actual = merge(object, { 'a': ['x', 'y', 'z'] })

    expect(actual).toStrictEqual({ 'a': ['x', 'y', 'z'] })
  })

})

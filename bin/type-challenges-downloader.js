#!/usr/bin/env node

const parseArgs = require('minimist')
const tcd = require('../src/app.js')

const argv = parseArgs(process.argv.slice(2), {
  boolean: [
    'config'
  ],
  default: {
    config: true
  },
  alias: {
    path: 'p',
    difficulty: 'd',
    update: 'u',
    wait: 'w',
  },
  unknown: (arg) => {
    console.error(`Unknown argument: ${arg}`)
    process.exit(1)
  },
})

// tcd --path ./exercise
// tcd -p ./exercise
// tcd --difficulty easy
// tcd -d easy -d hard
// tcd --wait 100
// tcd -w 100
// tcd --update
// tcd -u
// tcd

// console.log(argv)

tcd.start(argv)

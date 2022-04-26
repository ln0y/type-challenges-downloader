const path = require('path')
const fs = require('fs/promises')
const lzs = require('lz-string')

const {
  fileExists,
  readOrMkdir,
} = require('./shared/fs')

const {
  sleep, merge,
} = require('./shared')

const {
  getMethod,
} = require('./request')

const {
  github,
  urlProxy,
} = require('./request/github')

const resolve = (...paths) => path.resolve(process.cwd(), ...paths)

// https://docs.github.com/cn/rest/reference/git#get-a-tree
const url = urlProxy({
  getTree: `/repos/{owner}/{repo}/git/trees/{tree_sha}`,
  getBlobs: `/repos/{owner}/{repo}/git/blobs/{file_sha}`,
})

async function getRepoTree (sha, recursive) {
  const res = await github.get(url.getTree, {
    tree_sha: sha,
    ...(recursive ? { recursive: 1 } : {}),
  })
  return res.tree
}

async function getQuestions () {
  const tree = await getRepoTree('main')
  const questions = tree.find(item => item.path === 'questions')
  return getRepoTree(questions.sha)
}

// Classification according to the difficulty of the question
function classifyDifficulty (questions) {
  const map = new Map()
  for (const { path } of questions) {
    const [, sequence, difficulty, name] = path.match(/^(\d+)-(\w+)-(.*)/)
    if (!map.has(difficulty)) map.set(difficulty, new Map())

    const difficultyMap = map.get(difficulty)
    const filename = `${Number(sequence)}-${name}`
    difficultyMap.set(Number(sequence), filename)
  }
  return map
}

// Update comments and test cases for old files
function updateTestCaseAndComments (oldFile, newFile) {
  const reg = /(?<=\/\*[\s_]*(?:Your Code Here|你的代码)[\s_]*\*\/\n)((.*\n)*?)(?=\/\*[\s_]*(?:Test Cases|测试用例)[\s_]*\*\/)/
  return newFile.replace(reg, oldFile.match(reg)[1])
}

// parse typescript playground code
const DOMAIN = 'https://tsch.js.org'
async function getCode (seq) {
  const url = `${DOMAIN}/${seq}/play`
  const localtion = await getMethod(url).catch(console.error)
  const code = localtion.match(/(?<=#code\/).*/)[0]
  return lzs.decompressFromEncodedURIComponent(code)
}

async function updateFile (filePath, code) {
  const oldFileContent = await fs.readFile(filePath, 'utf-8')
  await fs.writeFile(filePath, updateTestCaseAndComments(oldFileContent, code))
}

async function createFile (filePath, code) {
  await fs.writeFile(filePath, code)
}

async function writeQuestions (questions, path, options) {
  for (const [seq, name] of questions) {
    // get file path
    const filePath = resolve(path, `${name}.ts`)

    // check file exists
    const exists = await fileExists(filePath)

    console.log(`${!exists ? 'create' : options.update ? 'update' : 'skip'} file: %s`, `${name}.ts`)

    // Skip without update
    if (exists && !options.update) continue

    // get code
    const code = await getCode(seq)
    await (exists ? updateFile : createFile)(filePath, code)

    await sleep(options.wait < 100 ? 100 : options.wait)
  }
}

async function writeFile (difficulties, options) {
  for (const [difficulty, questions] of difficulties) {
    console.log(`----------------${difficulty}----------------`)

    const difficultyPath = resolve(options.path, difficulty)

    // create difficulty dir
    await readOrMkdir(difficultyPath)

    await writeQuestions(questions, difficultyPath, options)
  }
}

function filterDifficulty (difficulties, options) {
  if (options.difficulty.length === 0) return difficulties
  return new Map([...difficulties].filter(item => options.difficulty.includes(item[0])))
}

function getDefaults () {
  return {
    path: './',
    difficulty: [],
    update: false,
    wait: 500,
  }
}

async function start (options) {
  options = merge(getDefaults(), options)
  const questions = await getQuestions()
  const difficulties = classifyDifficulty(questions)
  await writeFile(filterDifficulty(difficulties, options), options)
}

module.exports = {
  start
}

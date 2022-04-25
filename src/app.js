const path = require('path')
const fs = require('fs/promises')
const lzs = require('lz-string')

const {
  fileExists,
  readOrMkdir,
} = require('./shared/fs.js')

const {
  urlProxy,
  getMethod,
} = require('./request')

const {
  github,
} = require('./request/github')

const resolve = (...paths) => path.resolve(process.cwd(), ...paths)
const sleep = ms => new Promise(r => setTimeout(r, ms))

const DOMAIN = 'https://tsch.js.org'

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
  for (const { path: name } of questions) {
    const [, sequence, difficulty, filename] = name.match(/^(\d+)-(\w+)-(.*)/)
    if (!map.has(difficulty)) map.set(difficulty, new Map())
    const difficultyMap = map.get(difficulty)
    difficultyMap.set(`${Number(sequence)}-${filename}`, Number(sequence))
  }
  return map
}

function updateTestCaseAndComments (oldFile, newFile) {
  const reg = /(?<=\/\*[\s_]*(?:Your Code Here|你的代码)[\s_]*\*\/\n)((.*\n)*?)(?=\/\*[\s_]*(?:Test Cases|测试用例)[\s_]*\*\/)/
  return newFile.replace(reg, oldFile.match(reg)[1])
}

async function writeFile (difficulties) {
  for (const [difficulty, questions] of difficulties) {
    console.log(`----------------${difficulty} start----------------`)

    // create difficulty dir
    const difficultyPath = resolve(difficulty)
    await readOrMkdir(difficultyPath)

    for (const [name, seq] of questions) {
      // get file path
      const filePath = resolve(difficultyPath, `${name}.ts`)

      // get code
      let code = await getCode(seq)

      // check file exists
      const exists = await fileExists(filePath)
      if (exists) {
        // Retain the original code, update test cases and comments
        console.log(`update ${name}.ts`)
        const oldFile = await fs.readFile(filePath, 'utf-8')
        code = updateTestCaseAndComments(oldFile, code)
      } else {
        console.log(`create file: ${name}.ts`)
      }

      await fs.writeFile(filePath, code)
      await sleep(500)
    }

    console.log(`----------------${difficulty} finish----------------`)
  }
}

// parse typescript playground code
async function getCode (seq) {
  const url = `${DOMAIN}/${seq}/play`
  const localtion = await getMethod(url).catch(console.error)
  const code = localtion.match(/(?<=#code\/).*/)[0]
  return lzs.decompressFromEncodedURIComponent(code)
}

async function start (options) {
  const questions = await getQuestions()
  const difficulties = classifyDifficulty(questions)
  await writeFile(difficulties)
}

module.exports = {
  start
}

const path = require('path')
const fs = require('fs/promises')
const lzs = require('./lz-string.js')
const { github, urlProxy, getMethod } = require('./PromiseRequest')

const resolve = (...paths) => path.resolve(__dirname, ...paths)
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

// transform GitHub repo directories into a tree structure
// function transfromTree (list) {
//   const pathMap = new Map()

//   for (let item of list) {
//     const dirs = item.path.split('/')
//     let map = pathMap
//     let parent = null
//     while (dirs.length) {
//       const dir = dirs.shift()
//       if (map.has(dir)) {
//         parent = map.get(dir)
//         map = parent.children || new Map()
//       } else {
//         map.set(dir, item)
//         parent && (parent.children = map)
//       }
//     }
//   }

//   return pathMap
// }

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

function dirExists (dir) {
  return fs.stat(dir).then(stat => stat.isDirectory()).catch(() => false)
}

function fileExists (file) {
  return fs.stat(file).then(stat => stat.isFile()).catch(() => false)
}

async function readOrMkdir (dir) {
  const exists = await dirExists(dir)
  if (exists) return fs.readdir(dir)
  else return fs.mkdir(dir).then(() => fs.readdir(dir))
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

!(async function init () {
  const questions = await getQuestions()
  // const tree = transfromTree(mock.questions)
  const difficulties = classifyDifficulty(questions)
  await writeFile(difficulties)
}())

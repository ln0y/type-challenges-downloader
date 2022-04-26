# type-challenges-downloader

目前 [type-challenges](https://github.com/type-challenges/type-challenges) 项目中的题目只支持在 typescript playground 中调试，无法批量下载到本地。本项目可以将 type-challenges 中的题目批量下载到本地，支持在保留你原本的代码的同时更新题目中测试用例及说明。

# 安装

```
npm install type-challenges-downloader
```

# 使用

在 `package.json` 中添加脚本：

```json
  // ...
  "scripts": {
    "start": "tcd"
  },
  // ...
```

运行

```
npm run start
```

即可下载 type-challenges 的题目到你本地

# 命令行

```
tcd [options]
```

## 命令行选项

```
    -p, --path <options>        指定下载到相对位置，默认路径 process.cwd()。
    -d, --difficulty <options>  下载指定难易度的题目。默认全部下载。
                                参数同官方难易度 https://github.com/type-challenges/type-challenges#challenges
    -w, --wait <options>        指定每下载一题后的间隔时间，单位 ms ，最小间隔 100ms
    -u, --update                指定下载时是否更新已有文件的内容（将保留你的代码，更新题目说明及测试用例部分），默认不更新。
                                注意：该操作只保留你代码部分内容，请注意备份
                                /* _____________ Your Code Here _____________ */
                                ...保留该部分，之外部分会被替换
                                /* _____________ Test Cases _____________ */
```

### 示例

- 下载到exercise目录，只下载easy和hard题目

```
tcd -p ./exercise -d easy -d hard
```

- 下载并更新exercise目录下，easy的题目

```
tcd -u -p ./exercise -d easy
```

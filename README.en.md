# type-challenges-downloader

<p align='center'>
  <a href='./README.md'>简体中文</a> | English
</p>

At present, the questions in the project [Type-Challenges](https://github.com/type-challenges/type-challenges), can only support debugging in typescript playground, not support batch downloading to the local address.In this project, it supports you batch download the questions in type-challenges to local address, and update test cases and instructions in the challenges with the preservation of the original code.

# Install

```
npm install type-challenges-downloader
```

# Deploy

Add the script to `package.json`:

```json
  "scripts": {
    "start": "tcd"
  },
```

Run

```
$ npm run start
```

Or：

Enter the script at the command line

```
$ npx tcd
```

Download the questions from type-challenges to your local address

tips：Vs Code's built-in typescript includes type hints, so installing typescript is not required

# Command Line

```
tcd [options]
```

## Command Line Options

```
    -p, --path <string>         Specify a relative path to download the file. The default path is process.cwd().
    -d, --difficulty <options>  Download the specified difficulty questions, and download all by default.
                                refer to the official documentation https://github.com/type-challenges/type-challenges#challenges
    -w, --wait <number>         Specify the interval between downloading each question. Unit:ms, Minimum Interval:100ms
    -u, --update                Specify whether to update the contents of existing files when downloading (preserve your code, and update other parts, such as question descriptions and test cases), not to update by default. tips: the operation only preserves part content of your code , please note the backup
                                /* _____________ Your Code Here _____________ */
                                ...Preserve this part and other parts will be replaced
                                /* _____________ Test Cases _____________ */
    --config [boolean]          Whether to add tsconfig.json, add by default
```

### Examples

- Download the questions to the path exercise within the type only for easy and hard

```
tcd -p ./exercise -d easy -d hard
```

- Download and update the easy questions from the path exercise

```
tcd -u -p ./exercise -d easy
```

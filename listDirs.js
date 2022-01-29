import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

// just filtering for javascript files at the moment, because the walker
// doesn't parse typescript yet, and that's probably going to be in a
// separate corpus anyway
const isJS = fileName => path.extname(fileName) === '.js';

const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(file => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      // hacky way to filter out test files
      if (isJS(file) && !dirPath.includes('test')) {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
      }
    }
  })

  return arrayOfFiles
}

const finalFiles = getAllFiles(path.join('javascript', 'chartjs'))

finalFiles.forEach(fileName => fs.writeFileSync("fileList.txt", fileName + "\n", {
  encoding: 'utf8',
  flag: 'a+',
}));
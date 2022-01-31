import { opendir, readFile } from 'fs/promises';
import { join } from 'path'
import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
const traverse = _traverse.default;
import { MongoClient } from 'mongodb';

const DATABASE_NAME = 'functions';
const COLLECTION_NAME = 'functions';

const mongoUri = `mongodb://localhost:27017/${DATABASE_NAME}`;
const mongoClient = new MongoClient(mongoUri);
await mongoClient.connect();

const collection = mongoClient.db().collection(`${COLLECTION_NAME}`);

for await (const file of allFiles('javascript')) {
  if (file.endsWith('.js')) {
    const buffer = await readFile(file)
    const code = buffer.toString()

    for (const fn of extractFunctions(code)) {

      // Print function to each line
      //console.log(JSON.stringify(fn))
      const originalRepoName = file
                                 .split('/')
                                 .slice(1,3)
                                 .join('/')
      const filePath = file.split('/')
      const originalFileName = filePath[filePath.length - 1]
      //console.log(file)
      //console.log(originalRepoName)
      //console.log(originalFileName)

      const functionLines = fn.split('\n')
      //console.log(functionLines)
      //console.log(fn + '\n\n')

      const fullRepoUrl = `https://github.com/${originalRepoName}`

      const codeObject = {
        "type": "function",
        "project_source": fullRepoUrl,
        "direct_link_to_file_line": "",
        "contents": {
          "total_lines": functionLines.length,
          "lines": functionLines,
        },
      };
      
      console.log(`inserting ${fullRepoUrl}...`)
      collection.insertOne({ "code": codeObject });  
    }
  }
}


/** recursively get all files */
async function* allFiles(directory) {
  for await (const file of await opendir(directory)) {
    const path = join(directory, file.name)

    if (file.isFile()) {
      yield path
    }

    if (file.isDirectory()) {
      for await (const entry of allFiles(path)) {
        yield entry;
      }
    }
  }
}

/** Find function definitions from a js file string */
function extractFunctions(code) {
  try {
    const fns = []
    const ast = parser.parse(code, { sourceType: "module" })

    traverse(ast, {
      enter({ node: { type, start, end } }) {
        if (type === 'FunctionDeclaration') {
          fns.push(code.slice(start, end))
        }
      }
    })

    return fns;
  } catch {
    return []
  }
}

console.log('closing mongo connection...');
mongoClient.close();

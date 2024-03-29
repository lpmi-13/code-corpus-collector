import { opendir, readFile } from 'fs/promises';
import { join } from 'path'
import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
const traverse = _traverse.default;
import { MongoClient } from 'mongodb';

const args = process.argv.slice(2);

const DATABASE_NAME = 'javascript';
const COLLECTION_NAME = 'functions';

const mongoUri = `mongodb://localhost:27017/${DATABASE_NAME}`;
const mongoClient = new MongoClient(mongoUri);
await mongoClient.connect();


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

async function grabFunctions(repoName) {
  console.log(`starting to process files for ${repoName}...`)

  const collection = mongoClient.db().collection(`${COLLECTION_NAME}`);

  for await (const file of allFiles(repoName)) {
    if (file.endsWith('.js')) {
      const buffer = await readFile(file)
      const code = buffer.toString()

      for (const fn of extractFunctions(code)) {

        const originalRepoName = file
                                   .split('/')
                                   .slice(1,3)
                                   .join('/')
        const filePath = file.split('/')

        const functionLines = fn.split('\n')

        const fullRepoUrl = `https://github.com/${originalRepoName}`

        const codeObject = {
          "type": "functions",
          "language": "javascript",
          "project_source": fullRepoUrl,
          // no straightforward way to get this yet, but we would need
          // it for a direct link to the line in github
          "direct_link_to_file_line": "",
          "contents": {
            "total_lines": functionLines.length,
            "lines": functionLines.map((fn, i) => {
               return {"line_number": i+1, "line_content": fn}
            }),
          },
        };

        console.log(`inserting ${fullRepoUrl}...`)

        collection.insertOne(codeObject);
      }
    }
  }
  // the mongo client wasn't playing nice with closing connections, so welcome to
  // the world of hacks!
  process.exit(0)
}

await grabFunctions(args[0])
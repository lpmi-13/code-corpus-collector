import fs from 'fs';
import readline from 'readline';
import events from 'events';
import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
const traverse = _traverse.default;
import { MongoClient } from 'mongodb';

const initMongo = async () => {
    const mongoUri = 'mongodb://localhost:27017/functions'
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    return mongoClient;
}

try {

  const mongoClient = await initMongo();
  const collection = mongoClient.db().collection('functions');

  const rl = readline.createInterface({
    input: fs.createReadStream('fileList.txt'),
    crlfDelay: Infinity,
  });

  rl.on('line', (line) => {

    const code = [];

    const myVisitor = {
      enter(path) {
        if (path.node.type === 'FunctionDeclaration') {
          code.push({"start": path.node.start, "end": path.node.end})
        }
      }
    }

    fs.readFile(line, 'utf-8', (err, data) => {
      if (err) {
        console.log(err)
      } else {
        const ast = parser.parse(data, { sourceType: "module"})
        traverse(ast, myVisitor)
        for (const item of code) {
          getFunction(item.start, item.end)
        }
      }
    })

    const getFunction = async (start, end) => {
      const reader = fs.createReadStream(line, {
        encoding: 'UTF-8',
        start,
        end
      })
      for await (const chunk of reader) {
        console.log(chunk)
        await collection.insertOne({ "code": chunk })
      }
    }
  });

  await events.once(rl, 'close')

} catch (err) {
  console.log(err);
} finally {
  console.log('closing connection...');
  await mongoClient.close();
}

//const codeJsonTemplate = {
//  "projectSource": fullRepoUrl,
//  "directLinkToFileLine": "TODO",
//  "contents": {
//    "totalLines": totalLines,
//    "lines": [
//      const line for lines
//    ]
//  }
//}

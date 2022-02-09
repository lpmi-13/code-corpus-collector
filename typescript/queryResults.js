import { writeFile } from 'fs/promises';

import { MongoClient } from 'mongodb';

const LINE_RANGES = [
  {"low":3, "high": 6},
  {"low":6, "high":10},
  {"low":10, "high": 18},
]

const DATABASE = 'typescript';

const mongoUri = `mongodb://localhost:27017/${DATABASE}`;
const mongoClient = new MongoClient(mongoUri);

await mongoClient.connect();
console.log('mongo connected...');

const uniqueProjects = await mongoClient.db().collection('functions').distinct('project_source');

const resultsMap = {
  "functions": {
    "small": [],
    "medium": [],
    "large": [],
  },
};


async function extractFunctions ({ lowerBound, projectName, upperBound }) {

  const collection = mongoClient.db().collection('functions');

  const query = {
    'project_source': projectName,
    'contents.total_lines': {'$lt': upperBound, '$gt': lowerBound }
  };
  const options = {'projection': { _id: 0 } };

  const projectResults = collection.find(query, options).limit(1);

  if ((await projectResults.count()) === 0) {
    console.log("no results found");
  }

  await projectResults.forEach((result) => {
      if (lowerBound < 6) {
        resultsMap[result['type']]['small'].push(JSON.stringify(result))
      } else if (lowerBound >= 10) {
        resultsMap[result['type']]['large'].push(JSON.stringify(result))
      } else {
        resultsMap[result['type']]['medium'].push(JSON.stringify(result))
      }
  });

}

for (const project of uniqueProjects) {

  for (const LINE_RANGE of LINE_RANGES) {

    const { low, high } = LINE_RANGE;
    await extractFunctions({ lowerBound: low, projectName: project, upperBound: high })
  }
}

await mongoClient.close();
console.log('connection closed');

try {
  await writeFile('functions-output.json', JSON.stringify(resultsMap));
  console.log('functions written to file');
} catch (e) {
  console.log(e)
}

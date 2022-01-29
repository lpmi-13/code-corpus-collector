const lineReader = require('line-reader');
const fs = require('fs');
const clone = require('git-clone');

function processAllRepos(repos) {
  repos.forEach(cloneLocally);
}

const cloneLocally = gitRepo => {
  const repoName = gitRepo.split('/').slice(-2).join('/');
  // TODO: check here to see if the file path already exists and skip if so
  clone(gitRepo, `javascript/${repoName}`, () => console.log(`cloned ${repoName}`));
}

const repos = fs.readFileSync('javascript-results.txt')
                 .toString()
                 .split('\n')
                 .slice(0, -1);
  
processAllRepos(repos);

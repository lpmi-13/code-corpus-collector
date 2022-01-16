const lineReader = require('line-reader');
const fs = require('fs');
//const Git = require('nodegit');
const clone = require('git-clone');

function processAllRepos(repos) {
  const repoClonings = repos.map(cloneLocally);
}

const cloneLocally = gitRepo => {
  const repoName = gitRepo.split('/').slice(-2).join('/');
  clone(gitRepo, `javascript/${repoName}`, () => console.log(`cloned ${repoName}`));
}

const repos = fs.readFileSync('javascript-results.txt')
                 .toString()
                 .split('\n')
                 .slice(0, -1);
  
processAllRepos(repos);

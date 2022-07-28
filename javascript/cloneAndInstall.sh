#! /bin/bash

if [ ! -d repositories ]
then
  mkdir repositories
fi

while IFS= read -r repo_url;
do
  repoName=$(echo $repo_url | cut -d '/' -f4-5)
  git clone --depth=1 $repo_url repositories/$repoName
  node extractFunctions.js repositories/$repoName
  rm -rf repositories/$repoName
done < repositories.txt

rm -rf repositories
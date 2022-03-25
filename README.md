# code corpus collector

inspired by the exciting(!!!) though incomplete work in [python-code-corpus](https://github.com/lpmi-13/python-code-corpus), this is an attempt to be able to grab examples of code from "a bunch"(&copy;) of different programming languages.

The implementation has one different language AST parser per language, particularly since I wanted to do more things with go, but it could probably benefit from a more general approach, with something like [tree-sitter](https://github.com/tree-sitter/tree-sitter). What's currently here works, but is not very nice.

## Current languages with function parsing pipelines

- Golang
- Javascript
- Python
- Typescript

## installation and usage

Grab the top N repos for a particular language

```bash
$ git clone https://github.com/lpmi-13/code-corpus-collector
$ cd code-corpus-collector
$ npm i
$ node grabRepos.js --language python --number 42
// results available in python/repositories.txt
```

> (if you don't pass in anything for `--language` or `--number`, it defaults to `javascript` and `25`, respectively)

For all runs to grab more that 100 repos, the results come back in multiples of 100 (eg, `node grabRepos.js --number 350` will bring back 400 results). I thought about making the logic very complex to enable grabbing _exactly_ 350 in this case, but the paging would require more complexity than I care about, plus it's highly likely that anybody interested in more than 10 repos probably wants the full 1000 anyway.

**NOTE:** Due to the limitations of the GitHub search API, it's only possible to bring back 1,000 results, so that's going to be the foundational number of premilinary efforts at compiling this corpus. We can try to get more trixy later (eg, use alternate sorting mechanisms or queries), but this is the easiest thing to do at the moment.

## Work with Javascript repos

Clone those repos locally

```bash
cd javascript
node cloneRepos.js
```

...and once you have mongo running (either via a local installation or as described below for a container), run the following to populate the database:

```
node extractFunctions.js
```

and then once things are in Mongo, you can get them with

```
node queryResults.js
```

## Work with python repos

```
cd python
python walker.py
```

and once things are populated in mongo, you can run

```
python extract_functions.py
```

to generate a local json file.


## Work with typescript repos

The same as the "Work with Javascript repos", except run the commands from the `typescript` directory.

## Work with golang repos

clone those repos locally

```bash
cd golang
go run cmd/grab-repos.go
```

and once the repos are cloned locally (and you have mongo running), go ahead and parse the files into ASTs and insert them into mongo:

```bash
go run main.go mongodb://localhost:27017
```

if you'd like the grab them out of mongo, there will eventually be a go file for that as well, but currently, you can just adjust `python/extract_functions.py`.


## Start mongo in a container locally

In case you're not interested in installing/running mongodb locally, you can use a container that stores the data locally via volumes, like so:

```
docker run -it --rm -v $(pwd)/data:/data/db -p 27017:27107 mongo:latest
```

This will put all the data into the local `./data` directory so it will persist across container runs.

## extensions

For my own personal use case, I'll probably store all the functions in MongoDB for the moment, then pull stuff out into a json file to use as fuel for a webapp like https://parsons-problems.netlify.app. Though I'm sure you could feed functions to a client as/when needed via an API, but you'd have to host it somewhere. The appeal of flat files is you can just send it along to the client (particularly if it's very tiny), or use it with a static site generator like Gatsby to create pages based on the data.

I might, at some point, switch over to using a more general AST parser implementation, like tree-sitter, so we can just parse with one method, and also extract the data with one implementation (possibly just python). That would simplify this code considerably.

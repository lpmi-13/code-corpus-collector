# code corpus collector

inspired by the exciting(!!!) though incomplete work in [python-code-corpus](https://github.com/lpmi-13/python-code-corpus), this is an attempt to be able to grab examples of code from "a bunch"(&copy;) of different programming languages.

The full list of things that you should try to get is [here](https://github.com/fkling/astexplorer)...I'm not immediately sure why the list in the README doesn't mention python, though it's clearly available in the web UI linked there. Oh well, we'll worry about that later!

## Current languages with function parsing pipelines

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

if you'd like the grab them out of mongo, there will eventually be a go file for that as well.


## Start mongo in a container locally

In case you're not interested in installing/running mongodb locally, you can use a container that stores the data locally via volumes, like so:

```
docker run -it --rm -v $(pwd)/data:/data/db -p 27017:27107 mongo:latest
```

This will put all the data into the local `./data` directory so it will persist across container runs.

## extensions

For my own personal use case, I'll probably store all the functions in MongoDB for the moment, then pull stuff out into a json file to use as fuel for a webapp like https://parsons-problems.netlify.app. Though I'm sure you could feed functions to a client as/when needed via an API, but you'd have to host it somewhere. The appeal of flat files is you can just send it along to the client (particularly if it's very tiny), or use it with a static site generator like Gatsby to create pages based on the data.

I might, at some point, switch over to using a more general AST parser implementation, like tree-sitter, so we can just parse with one method, and also extract the data with one implementation (possibly just python). That would simplify this code considerably.

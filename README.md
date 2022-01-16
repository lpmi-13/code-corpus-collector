# code corpus collector

inspired by the exciting(!!!) though incomplete work in [python-code-corpus](https://github.com/lpmi-13/python-code-corpus), this is an attempt to be able to grab examples of code from "a bunch"(&copy;) of different programming languages.

The full list of things that you should try to get is [here](https://github.com/fkling/astexplorer)...I'm not immediately sure why the list in the README doesn't mention python, though it's clearly available in the web UI linked there. Oh well, we'll worry about that later!

## installation and usage

Grab the top N repos for a particular language

```bash
$ git clone https://github.com/lpmi-13/code-corpus-collector
$ cd code-corpus-collector
$ npm i
$ node grabRepos.js --language python --number 42
// results available in python-results.txt
```

(if you don't pass in anything for `--language` or `--number`, it defaults to `javascript` and `25`, respectively)

Clone those repos locally

```bash
node cloneRepos.js
```



## extensions

It still needs a way to then extract the functions from the source code, so I still need to play around with the parsers listed in the astexplorer repo listed above, but in theory, this could be used to put all found functions into a DB, or even write out to a flat file, depending on how you'd like to use it.

For my own personal use case, I'll probably store all the functions in MongoDB for the moment, then pull stuff out into a json file to use as fuel for a webapp like https://parsons-problems.netlify.app. Though I'm sure you could feed functions to a client as/when needed via an API, but you'd have to host it somewhere. The appeal of flat files is you can just send it along to the client (particularly if it's very tiny), or use it with a static site generator like Gatsby to create pages based on the data.

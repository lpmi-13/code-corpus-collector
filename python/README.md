# Python code corpus collection

The easiest way to run this is to create a container based on the local `Dockerfile`, so first build it:

```
docker build -t py-corpus .
```

and then run it on the host network (to connect to the local mongo you have running, possibly also in a container):

```
docker run -it --rm --network host py-corpus
```

It doesn't run in verbose mode by default, so if you want to see more logging, pass the `--verbose` option when running it locally (or with the container run by `docker run -it --rm --network host --entrypoint "python" py-corpus walker.py --verbose`)

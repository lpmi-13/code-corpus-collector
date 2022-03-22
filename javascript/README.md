# Javascript code corpus collection

It's recommended to run this in a container, so just build it and then run it:

```
docker build -t js-corpus .
```

and then

```
docker run -it --rm --network host js-corpus
```

> it needs to run on the host network to be able to contact the locally running mongo (recommended to also be run in a container).


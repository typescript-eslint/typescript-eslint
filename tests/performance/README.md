# Temp README (intended for maintainers only at this time)

Run:

```sh
docker-compose -f tests/performance/docker-compose.yml up --build
```

It will build the docker container, create volumes for the local files, and will clone the real world project repo ready for experimentation.

The docker container is configured to run forever, so you just need to attach a shell to it,

e.g. by running

```sh
docker exec -it {{ RUNNING_CONTAINER_ID_HERE }} bash
```

Or by using the docker extension in VSCode and right clicking on the running container.

Every time you make an update to the local built packages (e.g. `parser` or `eslint-plugin`), you need to rerun
the utility script _within_ the running container.

For example, you will run something like the following (where `root@a91d93f9ffc3` refers to what's running in your container):

```sh
root@a91d93f9ffc3:/usr/vega-lite# ../linked/install-local-packages.sh
```

# Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/128d21c7-b2fe-45ad-b141-9878fcf5de3a/deploy-status)](https://app.netlify.com/sites/typescript-eslint/deploys)

This website is built using [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

## Installation

```console
yarn install
```

## Local Development

```console
yarn start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

### Production

The website is deployed from the `website` branch automatically using Netlify.
That branch gets updated from the `main` branch whenever a new stable version is released (generally weekly).

### Pull Requests

Each pull request into the `main` branch will have a unique preview deployment generated for it.

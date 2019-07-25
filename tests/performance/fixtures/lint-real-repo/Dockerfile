FROM node:carbon

WORKDIR /usr

# Clone the repo and checkout the relevant commit
RUN git clone https://github.com/typescript-eslint/vega-lite
WORKDIR /usr/vega-lite
RUN git checkout f1e4c1ebe50fdf3b9131ba5dde915e6efbe4bd87

# Run the equivalent of the project's travis build before linting starts
RUN yarn install --frozen-lockfile && yarn cache clean
RUN yarn build

# Keep the container alive forever
CMD [ "tail", "-f", "/dev/null"]

FROM public.ecr.aws/d3j8x8q7/olympus-base-typescript:latest

WORKDIR /app

COPY . .

# Remove packageManager field to prevent corepack from downloading incompatible pnpm@12.0.0-rc.7
RUN sed -i '/"packageManager":/d' package.json

# Install dependencies, skip postinstall to avoid husky/clean issues
ENV SKIP_POSTINSTALL=1
RUN pnpm install --no-frozen-lockfile

# Build all workspace packages so tests can find compiled dist/ output
RUN pnpm run build

CMD ["/bin/bash"]

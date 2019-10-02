# Ensure child script failures are propagated
set -e

# We run the services serially and in a non-detached state just that we can ensure predictable
# exit codes for all of our integration tests, and we can ensure CI builds pass or fail appropriately

# typescript-and-tslint-plugins-together
docker-compose -f tests/integration/docker-compose.yml up --build --abort-on-container-exit typescript-and-tslint-plugins-together

# vue-sfc
docker-compose -f tests/integration/docker-compose.yml up --build --abort-on-container-exit vue-sfc

# recommended-does-not-require-program
docker-compose -f tests/integration/docker-compose.yml up --build --abort-on-container-exit recommended-does-not-require-program

#!/bin/bash
set -exuo pipefail

# This script should be run by attaching a shell to the running docker
# container, and then running `../linked/install-local-packages.sh` from
# that shell.
#
# Use the local volumes for our own packages
# NOTE: You need to rerun this script every time the local packages change
# in order to apply the changes to the node_modules of the repo under test
yarn add @typescript-eslint/typescript-estree@file:///usr/typescript-estree
yarn add @typescript-eslint/parser@file:///usr/parser
yarn add @typescript-eslint/eslint-plugin@file:///usr/eslint-plugin

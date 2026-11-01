#!/usr/bin/env bash
set -euo pipefail

az webapp log download \
  --resource-group Bazar-nazareth_group \
  --name bazar-nazareth-web \
  --log-file /home/bryan/bazar-nazareth-logs.zip

unzip -p /home/bryan/bazar-nazareth-logs.zip \
  | grep -E -i -C 4 'exception|error|failed|sql|token|identity' \
  | tail -n 160

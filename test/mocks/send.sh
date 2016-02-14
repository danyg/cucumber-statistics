#!/bin/sh

curl -i -X PUT 127.0.0.1:9088/db/set/new-nightly/$1 -H "Content-Type: application/json" --data-binary "@./cucumber-external-modules.json"


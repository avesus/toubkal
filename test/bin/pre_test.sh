#!/bin/sh

which forever > /dev/null 2>&1 && forever start test/http.js && sleep 2 || echo 'forever not found, not starting test/http.js' 1>&2

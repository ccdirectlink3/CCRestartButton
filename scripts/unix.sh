#!/bin/bash

set -euo pipefail

# up to 5 times at ~1 second intervals (though it almost always works first try)
for a in {1..5}
do
    sleep 1

    # if CrossCode is not running start it
    if ! pgrep -f "$__cc_restart_button_old_executable"
    then
        exec "$__cc_restart_button_new_executable"
        break
    fi
done

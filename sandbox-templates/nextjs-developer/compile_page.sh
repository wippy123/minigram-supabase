#!/bin/bash
export NEXT_PUBLIC_POSTHOG_KEY="phc_EOAMo0r88mktumtod7X83x9XZ5pz7W5Njdrv4JauOoQ"
export NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# This script runs during building the sandbox template
# and makes sure the Next.js app is (1) running and (2) the `/` page is compiled
function ping_server() {
	counter=0
	response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
	while [[ ${response} -ne 200 ]]; do
	  let counter++
	  if  (( counter % 20 == 0 )); then
        echo "Waiting for server to start..."
        sleep 0.1
      fi

	  response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
	done
}

ping_server &
cd /home/user && npx next --turbo

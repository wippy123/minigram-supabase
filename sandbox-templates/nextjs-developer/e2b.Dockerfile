# You can use most Debian-based base images
FROM node:21-slim

# Install curl
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# Install dependencies and customize sandbox
WORKDIR /home/user/nextjs-app

RUN npx create-next-app@13.5.7 . --ts --tailwind --no-eslint --import-alias "@/*" --use-npm --no-app --no-src-dir --yes
RUN npx -y shadcn@latest init -d
RUN npx --legacy-peer-deps shadcn@latest add --all
COPY _app.tsx pages/_app.tsx
COPY next.config.js /home/user/next.config.js
COPY .env /home/user/.env
RUN npm install -g npm@10.9.0
RUN npm install -y posthog-js --legacy-peer-deps
RUN npm install next-themes --legacy-peer-deps
RUN npm install -y tailwindcss-animate --legacy-peer-deps
RUN export NEXT_PUBLIC_POSTHOG_KEY="phc_EOAMo0r88mktumtod7X83x9XZ5pz7W5Njdrv4JauOoQ"
RUN export NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
# Move the Nextjs app to the home directory and remove the nextjs-app directory
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app

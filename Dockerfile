FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

WORKDIR /usr/src/app/builds

RUN chmod +x fetcher.js

ENTRYPOINT ["node", "fetcher.js"]
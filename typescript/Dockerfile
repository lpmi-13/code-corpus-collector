FROM node:16-slim

RUN apt-get update -y && apt-get install -y git

WORKDIR /app

COPY package.json .

RUN npm install

COPY extractFunctions.js .
COPY repositories.txt .
COPY cloneAndInstall.sh .

ENTRYPOINT ["./cloneAndInstall.sh"]

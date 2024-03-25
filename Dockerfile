FROM node:latest

WORKDIR /usr/src/app/backend-server

COPY backend/package*.json ./

RUN npm install

COPY backend/ .

CMD ["npm", "start"]

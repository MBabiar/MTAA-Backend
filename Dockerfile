FROM node:latest

WORKDIR /usr/src/app/backend-server

COPY backend/package*.json ./

RUN npm install

COPY backend/ .

EXPOSE 8080

CMD ["npm", "start"]

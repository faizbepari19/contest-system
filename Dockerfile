FROM node:18-alpine

# Install MySQL client
RUN apk add --no-cache mysql-client

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
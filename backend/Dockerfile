# FROM node:16.14-alpine

# RUN mkdir -p /app && chown -R node:node /app

# WORKDIR /app

# COPY package*.json ./

# USER node

# RUN npm ci

# COPY --chown=node:node . .

# EXPOSE 8080

# CMD ["npm", "run", "start"]

FROM node:16-alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package*.json .

USER node

RUN npm run ci

COPY . .

CMD ["npm", "run", "start"]

EXPOSE 8080
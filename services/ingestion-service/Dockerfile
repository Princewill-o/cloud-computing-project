FROM node:20-slim

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production || npm install --omit=dev

COPY src ./src
COPY .env.example ./

EXPOSE 8080
CMD ["npm", "start"]

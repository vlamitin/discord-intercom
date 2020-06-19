FROM node:12-alpine

ENV TZ=Europe/Moscow
RUN apk add tzdata && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app
COPY package*.json ./

RUN npm ci
COPY . .

CMD [ "npm", "run", "start" ]

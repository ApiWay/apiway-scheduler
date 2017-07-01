FROM alpine:3.4

LABEL authors="bluehackmaster <master@bluehack.net>"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk add --update nodejs bash

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

ENV PATH /usr/src/app/bin:$PATH

EXPOSE 1883

CMD [ "npm", "start" ]

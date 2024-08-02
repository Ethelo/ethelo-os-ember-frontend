FROM node:6.14.4

RUN npm install -g bower

WORKDIR /app
COPY .bowerrc bower.json ./
RUN bower install --allow-root

COPY package*.json ./
RUN npm install

COPY ember-cli-build.js ./

CMD npm start

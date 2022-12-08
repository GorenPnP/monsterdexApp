FROM node:13-alpine

WORKDIR /usr/angular-workdir
COPY . .

RUN npm update npm && npm i

RUN npm install -g @ionic/cli
RUN ionic build --prod

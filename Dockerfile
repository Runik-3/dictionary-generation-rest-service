FROM alpine

ENV HOME=/home/app

RUN apk update && apk add --update htop nodejs-current npm && apk update

RUN node --version

COPY package.json package-lock.json $HOME/node_docker/

COPY . $HOME/node_docker/

WORKDIR $HOME/node_docker/

RUN npm install --progress=true 

COPY . $HOME/node_docker/

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

FROM node:latest

ENV HOME=/home/app

RUN apt-get update && apt-get install htop

COPY package.json package-lock.json $HOME/node_docker/

COPY . $HOME/node_docker/

WORKDIR $HOME/node_docker/

RUN npm install --progress=true 

COPY . $HOME/node_docker/

RUN npm run build

CMD ["npm", "start"]

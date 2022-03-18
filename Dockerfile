# using FROM to pull the 'node lts alpine' image
# lts is the latest version and
# alpine is a ligther version of node based in alpine linux
FROM node:lts-alpine

# creating a folder where our files will live
WORKDIR /app

# copy some files from local machine
# the first dot: is the NASA project folder (src)
# the second dot: is the app directory (destination)
# COPY . .

# copy the package json and package lock json instead of the full project
# to the current directory. this is done to help layering
COPY package*.json ./

# copy package.json and lock json from client into a new client folder
COPY client/package*.json client/

# to run the npm install script to install only production dependencies
# this will not install devDependencies
# RUN npm install --only=production

# to install client npm dependencies
# done this way to layer it
RUN npm run install-client --only=production

# copy package.json and lock json from server into a new client folder
COPY server/package*.json server/

# to install server npm dependencies
# done this way to layer it
RUN npm run install-server --only=production

COPY client/ client/

# to build the client CRA app
RUN npm run build --prefix client

COPY server/ server/

# using the node user, to minize damage a hacker might do
# this works because the node user has less privileges than the root user
USER node

# using the terminal to start the server that will serve the public files
# CMD will be executed in terminal when the docker container is built
CMD ["npm", "start", "--prefix", "server"]

# to access the container when running
EXPOSE 5000


# ! Whats a Layer
# we break the commands down into smaller components
# so the can be cached easily. so docker will only perfomed certain steps if the steps before have changed
# since we create docker images and container constantly
# the process gotta be as efficient as posible

# * to run the dockerfiler:
# docker build .
# the dot is the nasa project folder
# the command will look for the Dockerfile and run it

# ! Run this command to build and tag
# ? using "docker build -t <IMAGE_TAG> ." allows to name the container
# is a convention to name it <username>/<projectname>
# because later, when pushing it, will try to push to a
# docker repo we do not have access

# ! to run the image in local
# ? then, type in terminal: "docker run -it -p <PORT_CONTAINER>:<PORT_PC> <IMAGE_TAG>"
# -it is used to give us a terminal into the docker container
# PORT_CONTAINER is the port in which the container is EXPOSE (line 52)

# ! to push an image into docker hub
# docker login
  # insert credentials

# docker push <IMAGE_TAG>
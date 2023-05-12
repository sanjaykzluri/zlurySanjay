FROM 637188757652.dkr.ecr.us-west-2.amazonaws.com/zluri-base-images:node-14.17.3-alpine3.14 as deps

# copy package file for dependencies
COPY package.json .

#install dependencies
RUN yarn

# copy code to the container Image
COPY . .

# build code
RUN yarn build

# multi stage 2nd image 
FROM 637188757652.dkr.ecr.us-west-2.amazonaws.com/zluri-base-images:nginx-extras-own-alpine-3.15

# copy code from the 1st image
COPY --from=deps ./build /var/www/html

COPY default.conf /etc/nginx/conf.d/default.conf

#expose the application on port
EXPOSE 80

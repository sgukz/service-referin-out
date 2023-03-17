# Multi-stage
# 1) Node image for building frontend assets
# 2) nginx stage to serve frontend assets

# Name the node stage "builder"
FROM node:19-alpine AS build

LABEL maintainer="SGDEV <passathorn.reh+docker@gmail.com>"

# Set working directory
WORKDIR /usr/src/app

# Copy package.json
COPY . .

# ENV TimeZone Asia/Bangkok
ENV TZ Asia/Bangkok

# RUN config
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    python3 \
    tzdata \
    build-base \
    libtool \
    autoconf \
    automake \
    g++ \
    make && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone


# Copy all files from current directory to working dir in image
COPY . .

# install node modules and build assets
RUN npm install 

FROM keymetrics/pm2:18-slim


COPY --from=build /usr/src/app /usr/src/app

# EXPOSE port
EXPOSE 8080

# start dev
CMD [ "pm2-runtime", "start", "/usr/src/app/pm2.json" ]
# CMD ["yarn", "dev"]
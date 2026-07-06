FROM node:lts-alpine

WORKDIR /app

# File Copy
COPY package*.json ./
COPY events/ ./
COPY commands/ ./
COPY * ./

# Install FFMPEG
RUN apk add --update --no-cache ffmpeg

# Install Dependencies
RUN apk add --no-cache python3 make g++

# Install Package
RUN npm install
COPY . .

# Run_BOT
CMD ["node", "."]

FROM node:lts-alpine

WORKDIR /app

# File Copy
COPY package*.json ./
COPY config.json ./
COPY events/ ./
COPY commands/ ./
COPY * ./

# Install FFMPEG
RUN apk add --update --no-cache ffmpeg

# Install Package
RUN npm install
COPY . .

# Run_BOT
CMD ["node", "."]

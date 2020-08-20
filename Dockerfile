FROM node:alpine
RUN apk --no-cache add curl
EXPOSE 3000
WORKDIR /app
COPY *.* ./
RUN npm ci --only=production
COPY server ./server
CMD ["node", "server/index.js"]

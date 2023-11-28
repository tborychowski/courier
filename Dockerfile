FROM node:alpine as build
WORKDIR /build
COPY ./ ./
RUN npm install gulp
RUN npm run dist

FROM node:alpine
# TODO: This needed?
RUN apk --no-cache add curl
EXPOSE 3000
WORKDIR /app
COPY *.* ./
COPY --from=build /build/package-lock.json ./
RUN npm ci --only=production
COPY --from=build /build/public ./public
COPY server ./server
CMD ["node", "server/index.js"]

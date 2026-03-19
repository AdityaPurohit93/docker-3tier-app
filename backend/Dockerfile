# Stage 1: Build stage
FROM node:18-alpine as builder

WORKDIR /app

COPY package.json ./

RUN npm install

# Stage 2: Final stage
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY --from=builder /app/node_modules ./node_modules

COPY server.js ./

COPY package.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]
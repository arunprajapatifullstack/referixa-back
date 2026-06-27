FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 4000
CMD ["node", "dist/main"]

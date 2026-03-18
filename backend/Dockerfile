FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate && npx tsc

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]

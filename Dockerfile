FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY client/package*.json client/
RUN npm --prefix client ci
COPY . .
RUN npm --prefix client run build
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", "--no-warnings", "server/src/index.js"]

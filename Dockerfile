FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY lab3/client/package*.json lab3/client/
RUN npm --prefix lab3/client ci
COPY . .
RUN npm --prefix lab3/client run build
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", "--no-warnings", "lab1/server/src/index.js"]

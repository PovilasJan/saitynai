FROM node:22-alpine
WORKDIR /app
COPY client/package*.json client/
RUN npm --prefix client ci
COPY server/package*.json server/
RUN npm --prefix server ci --omit=dev
COPY . .
RUN npm --prefix client run build
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", "--no-warnings", "server/src/index.js"]

# Stage 1: Build the React frontend
FROM node:18-alpine AS build-frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build the Node.js backend
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY server/ ./server/

# Copy frontend build to server's public folder
COPY --from=build-frontend /app/client/dist ./server/public

# Expose port and start
EXPOSE 5000
WORKDIR /app/server
CMD ["node", "index.js"]

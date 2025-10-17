# Step 1: Build the Vite app
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Serve with 'serve'
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Serve static files
CMD ["serve", "-s", "dist", "-l", "3000"]


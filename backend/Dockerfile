# Dockerfile для Backend (Express)
FROM node:18-alpine

# Устанавливаем необходимые пакеты для компиляции нативных модулей (bcrypt) и curl для healthcheck
RUN apk add --no-cache python3 make g++ curl

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (включая devDependencies для nodemon)
RUN npm ci || npm install

# Копируем весь код backend
COPY . .

# Expose порт для Express сервера
EXPOSE 5000

# Запускаем dev server с nodemon
CMD ["npm", "run", "dev"]



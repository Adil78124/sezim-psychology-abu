# Dockerfile для Backend (Express)
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код backend
COPY . .

# Expose порт для Express сервера
EXPOSE 5000

# Запускаем dev server с nodemon (если есть) или обычный start
CMD ["npm", "run", "dev"]



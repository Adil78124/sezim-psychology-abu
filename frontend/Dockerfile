# Dockerfile для Frontend (Create React App)
FROM node:18-alpine

WORKDIR /app

# Устанавливаем переменные окружения для React
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV FAST_REFRESH=false
ENV CI=false

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci || npm install

# Копируем весь код frontend
COPY . .

# Expose порт для React dev server
EXPOSE 3000

# Запускаем dev server
CMD ["npm", "start"]


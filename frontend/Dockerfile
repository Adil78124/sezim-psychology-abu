# Dockerfile для Frontend (Create React App)
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies)
# Используем npm ci для более надежной установки
RUN npm ci || npm install

# Копируем весь код frontend
COPY . .

# Expose порт для React dev server
EXPOSE 3000

# Устанавливаем переменные для hot reload в Docker
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV FAST_REFRESH=false

# Запускаем dev server
CMD ["npm", "start"]


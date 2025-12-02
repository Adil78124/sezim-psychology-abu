#!/bin/bash
# Скрипт для удаления секретов из истории Git

echo "⚠️  ВНИМАНИЕ: Этот скрипт изменит историю Git!"
echo "Убедитесь, что у вас есть резервная копия репозитория."
echo ""
read -p "Продолжить? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Отменено."
    exit 1
fi

# Список секретов для удаления
SECRETS=(
    "kairatovadil7@gmail.com"
    "qlgqiqjvoipfmzbp"
    "7982241397:AAGzinVEu6w_BgUrTOy2PPyEtyfssMVKJvU"
    "-1002854667099"
    "sezim-psychology-secret-2025"
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bW91emNibXloa3R2b3dyenRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjk5ODQsImV4cCI6MjA3NjcwNTk4NH0.0DmDT1qiHdB8BpdJGRaGFBGQRgQ3HxZISNYHwp_s8iw"
)

# Используем git filter-branch для замены секретов
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch docker-compose.yml || true' \
  --prune-empty --tag-name-filter cat -- --all

# Восстанавливаем исправленный docker-compose.yml
git checkout HEAD -- docker-compose.yml
git add docker-compose.yml
git commit --amend --no-edit

echo "✅ Секреты удалены из истории."
echo "⚠️  Теперь нужно выполнить: git push origin --force --all"

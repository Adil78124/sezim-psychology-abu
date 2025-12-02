# PowerShell скрипт для удаления секретов из истории Git
# ВНИМАНИЕ: Это изменит историю Git!

Write-Host "⚠️  ВНИМАНИЕ: Этот скрипт изменит историю Git!" -ForegroundColor Yellow
Write-Host "Убедитесь, что у вас есть резервная копия репозитория." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Продолжить? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Отменено." -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Удаляю docker-compose.yml из истории..." -ForegroundColor Cyan

# Удаляем docker-compose.yml из всех коммитов
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch docker-compose.yml' --prune-empty --tag-name-filter cat -- --all

# Восстанавливаем исправленный docker-compose.yml
git checkout HEAD -- docker-compose.yml
git add docker-compose.yml

# Создаем новый коммит с исправленным файлом
git commit --amend --no-edit

Write-Host "✅ Секреты удалены из истории." -ForegroundColor Green
Write-Host "⚠️  Теперь нужно выполнить: git push origin --force --all" -ForegroundColor Yellow

# PowerShell скрипт для очистки истории Git от секретов
# ВНИМАНИЕ: Это изменит историю Git и потребует force push!

Write-Host "🔒 Очистка истории Git от секретов" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  ВНИМАНИЕ:" -ForegroundColor Yellow
Write-Host "1. Этот скрипт изменит историю Git" -ForegroundColor Yellow
Write-Host "2. Потребуется force push (git push --force)" -ForegroundColor Yellow
Write-Host "3. Убедитесь, что у вас есть резервная копия" -ForegroundColor Yellow
Write-Host "4. Если другие люди работают с репозиторием, предупредите их!" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Продолжить? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Отменено." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Шаг 1: Сохраняю текущий исправленный docker-compose.yml..." -ForegroundColor Cyan
$safeContent = Get-Content "docker-compose.yml" -Raw

Write-Host "🔄 Шаг 2: Заменяю docker-compose.yml во всех коммитах..." -ForegroundColor Cyan

# Создаем временный файл с безопасным содержимым
$tempFile = "docker-compose-safe.yml"
Set-Content -Path $tempFile -Value $safeContent

# Используем git filter-branch для замены файла во всех коммитах
git filter-branch --force --tree-filter `
  "if [ -f docker-compose.yml ]; then cp '$tempFile' docker-compose.yml; fi" `
  --prune-empty --tag-name-filter cat -- --all

# Удаляем временный файл
Remove-Item $tempFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ История очищена!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  СЛЕДУЮЩИЕ ШАГИ:" -ForegroundColor Yellow
Write-Host "1. Проверьте историю: git log --oneline -10" -ForegroundColor White
Write-Host "2. Если все правильно, выполните:" -ForegroundColor White
Write-Host "   git push origin --force --all" -ForegroundColor Cyan
Write-Host "   git push origin --force --tags" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  ВАЖНО: После force push смените ВСЕ секреты:" -ForegroundColor Red
Write-Host "   - SMTP пароль (создайте новый App Password)" -ForegroundColor White
Write-Host "   - TELEGRAM_BOT_TOKEN (создайте нового бота)" -ForegroundColor White
Write-Host "   - ADMIN_API_KEY (сгенерируйте новый)" -ForegroundColor White

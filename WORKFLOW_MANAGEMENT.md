# Отключение проблемных workflow

Чтобы избежать конфликтов, рекомендуется:

1. **Для Vercel** - используйте только `vercel-build.yml`
2. **Для GitHub Pages** - используйте только `pages.yml`
3. **Отключите** `build-only.yml` если он вызывает проблемы

## Команды для отключения workflow:

```bash
# Переименовать файлы для отключения
mv .github/workflows/build-only.yml .github/workflows/build-only.yml.disabled
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled
mv .github/workflows/deploy-backend.yml .github/workflows/deploy-backend.yml.disabled
mv .github/workflows/deploy-own-server.yml .github/workflows/deploy-own-server.yml.disabled
```

## Активные workflow:

- ✅ `vercel-build.yml` - для Vercel
- ✅ `pages.yml` - для GitHub Pages
- ❌ `build-only.yml` - отключен (вызывает ошибки)
- ❌ `deploy.yml` - отключен (дублирует функциональность)
- ❌ `deploy-backend.yml` - отключен (не нужен для Vercel)
- ❌ `deploy-own-server.yml` - отключен (не нужен для Vercel)

# 🔄 Альтернативное решение для GitHub Pages

## 🚨 Проблема
GitHub Pages НЕ поддерживает API routes - только статические файлы.

## 🔧 Решение 1: Formspree (Рекомендуется)

### Настройка:
1. Зарегистрируйтесь на [formspree.io](https://formspree.io)
2. Создайте новую форму
3. Получите Form ID (например: `xrgjqkqw`)

### Обновление формы:
Замените в `src/pages/Contacts/Contacts.jsx`:

```javascript
// Вместо fetch('/api/contact', ...)
const response = await fetch('https://formspree.io/f/xrgjqkqw', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});
```

## 🔧 Решение 2: Netlify Forms

### Настройка:
1. Добавьте `data-netlify="true"` к форме
2. Добавьте скрытое поле:

```html
<form 
  name="contact" 
  method="POST" 
  data-netlify="true"
  netlify-honeypot="bot-field"
>
  <input type="hidden" name="form-name" value="contact" />
  <div style="display: none;">
    <input name="bot-field" />
  </div>
  <!-- остальные поля -->
</form>
```

## 🔧 Решение 3: EmailJS (уже настроен)

Используйте уже созданный `src/utils/emailService.js`:

```javascript
import { sendContactMessage, initializeEmailJS } from '../../utils/emailService';

// В handleSubmit:
await initializeEmailJS();
const result = await sendContactMessage(formData);
```

## 🎯 Рекомендация

**Лучший вариант**: Используйте **Vercel** для полной функциональности с Telegram Bot API.

**Быстрое решение**: Используйте **Formspree** для GitHub Pages.

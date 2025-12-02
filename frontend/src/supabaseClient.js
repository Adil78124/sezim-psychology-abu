// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Получаем переменные окружения (для Create React App используем process.env)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mzmouzcbmyhktvowrztm.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ REACT_APP_SUPABASE_ANON_KEY не найден! Проверьте .env файл.')
  console.error('📝 Создайте файл frontend/.env с содержимым:')
  console.error('   REACT_APP_SUPABASE_URL=https://mzmouzcbmyhktvowrztm.supabase.co')
  console.error('   REACT_APP_SUPABASE_ANON_KEY=ваш_anon_key')
  console.error('💡 Получите ключ в Supabase Dashboard: Settings → API → anon/public key')
}

// Настраиваем клиент с автоматическим обновлением токенов и обработкой ошибок
const clientOptions = {
  auth: {
    autoRefreshToken: false, // Отключаем автообновление, так как не используем Supabase Auth
    persistSession: true,
    detectSessionInUrl: false,
    // Очищаем истёкшие сессии автоматически
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  // Для публичных запросов не требуем аутентификацию
  db: {
    schema: 'public',
  },
}

// Очищаем старые Supabase Auth токены из localStorage при инициализации
// Это необходимо, так как мы перешли на кастомную систему аутентификации
if (typeof window !== 'undefined') {
  try {
    // Удаляем все ключи, связанные с Supabase Auth
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('supabase') && (key.includes('auth') || key.includes('token'))) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Игнорируем ошибки при очистке
  }
}

// Добавляем apikey в заголовки, если ключ доступен
if (supabaseKey) {
  clientOptions.global = {
    headers: {
      'apikey': supabaseKey,
    },
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey || '', clientOptions)

// Экспортируем также отдельные сервисы для совместимости
export const auth = supabase.auth
export const db = supabase
export const storage = supabase.storage

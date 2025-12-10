// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Получаем переменные окружения (для Create React App используем process.env)
// Если переменные не заданы, пытаемся получить от backend API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Начальные значения (будут обновлены, если получены от backend)
let supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mzmouzcbmyhktvowrztm.supabase.co'
let supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

// Настраиваем клиент с автоматическим обновлением токенов и обработкой ошибок
function getClientOptions(supabaseKey) {
  const options = {
    auth: {
      autoRefreshToken: false, // Отключаем автообновление, так как не используем Supabase Auth
      persistSession: true,
      detectSessionInUrl: false,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    db: {
      schema: 'public',
    },
  };

  // Добавляем apikey в заголовки, если ключ доступен
  if (supabaseKey) {
    options.global = {
      headers: {
        'apikey': supabaseKey,
      },
    };
  }

  return options;
}

// Очищаем старые Supabase Auth токены из localStorage при инициализации
if (typeof window !== 'undefined') {
  try {
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

// Создаем клиент
let supabase = null;

// Проверяем, что URL и ключ не пустые
if (supabaseUrl && supabaseKey && supabaseKey.trim() !== '') {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, getClientOptions(supabaseKey));
    console.log('✅ Supabase клиент инициализирован с переменными окружения');
  } catch (error) {
    console.error('❌ Ошибка создания Supabase клиента:', error);
    supabase = null;
  }
}

// Если ключ не задан или пустой, пытаемся получить от backend (только в браузере)
if ((!supabaseKey || supabaseKey.trim() === '') && typeof window !== 'undefined') {
  fetch(`${API_URL}/api/config`)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Не удалось получить конфигурацию');
    })
    .then(config => {
      if (config && config.supabaseAnonKey && config.supabaseAnonKey.trim() !== '') {
        supabaseUrl = config.supabaseUrl || supabaseUrl;
        supabaseKey = config.supabaseAnonKey;
        
        // Пересоздаем клиент с полученными данными
        try {
          supabase = createClient(supabaseUrl, supabaseKey, getClientOptions(supabaseKey));
          console.log('✅ Supabase клиент инициализирован с конфигурацией от backend');
        } catch (error) {
          console.error('❌ Ошибка создания Supabase клиента:', error);
          if (!supabase) {
          createFallbackClient();
          }
        }
      } else {
        if (!supabase) {
        createFallbackClient();
        }
      }
    })
    .catch(error => {
      console.warn('⚠️  Не удалось получить конфигурацию от backend:', error.message);
      console.warn('💡 Убедитесь, что backend запущен и содержит SUPABASE_ANON_KEY в .env');
      if (!supabase) {
      createFallbackClient();
      }
    });
}

// Создаем заглушку, если клиент не инициализирован
function createFallbackClient() {
  if (!supabase) {
    console.warn('⚠️  Supabase клиент не инициализирован: отсутствуют URL или ключ');
    
    // Создаем объект для цепочки запросов
    const createQueryBuilder = () => {
      const query = {
        select: (columns = '*') => ({
          ...query,
          order: (column, options = {}) => Promise.resolve({ data: [], error: null }),
          eq: (column, value) => ({
            ...query,
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase не настроен' } }),
          }),
          ilike: (column, pattern) => ({
            ...query,
            limit: (count) => Promise.resolve({ data: [], error: null }),
          }),
          or: (pattern) => ({
            ...query,
            limit: (count) => Promise.resolve({ data: [], error: null }),
          }),
        }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase не настроен' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase не настроен' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase не настроен' } }),
      };
      return query;
    };
    
    supabase = {
      from: (table) => createQueryBuilder(),
      channel: (name) => ({
        on: () => ({
          subscribe: () => ({
            unsubscribe: () => {},
          }),
        }),
      }),
      auth: { 
        signOut: async () => {},
        getSession: async () => ({ data: { session: null } }),
      },
      storage: { 
        from: () => ({ 
          upload: async () => ({ data: null, error: { message: 'Supabase не настроен' } }),
          getPublicUrl: () => ({ publicUrl: '' }),
        }) 
      },
    };
  }
}

// Если клиент все еще не создан, создаем заглушку
if (!supabase) {
  createFallbackClient();
}

// Экспортируем также отдельные сервисы для совместимости
export const auth = supabase.auth
export const db = supabase
export const storage = supabase.storage

export { supabase }

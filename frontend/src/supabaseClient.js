// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Получаем переменные окружения (для Create React App используем process.env)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mzmouzcbmyhktvowrztm.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bW91emNibXloa3R2b3dyenRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjk5ODQsImV4cCI6MjA3NjcwNTk4NH0.0DmDT1qiHdB8BpdJGRaGFBGQRgQ3HxZISNYHwp_s8iw'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Экспортируем также отдельные сервисы для совместимости
export const auth = supabase.auth
export const db = supabase
export const storage = supabase.storage

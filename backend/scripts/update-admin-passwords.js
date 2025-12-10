/**
 * Скрипт для обновления паролей существующих администраторов
 * Генерирует новые безопасные пароли для всех админов
 * 
 * Использование:
 * node scripts/update-admin-passwords.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mzmouzcbmyhktvowrztm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY не установлен в .env файле');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Функция для генерации безопасного пароля
function generateSecurePassword(length = 16) {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function updatePasswords() {
  console.log('🔄 Начинаю обновление паролей администраторов...\n');

  try {
    // Получаем всех админов
    const { data: admins, error: fetchError } = await supabase
      .from('admins')
      .select('*');

    if (fetchError) {
      throw fetchError;
    }

    if (!admins || admins.length === 0) {
      console.log('⚠️  Администраторы не найдены. Сначала создайте их через create-admin.js');
      return;
    }

    const passwords = [];

    for (const admin of admins) {
      try {
        // Генерируем новый пароль
        const newPassword = generateSecurePassword(16);
        
        // Хешируем пароль
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Обновляем пароль в базе
        const { error: updateError } = await supabase
          .from('admins')
          .update({ 
            password: passwordHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', admin.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Обновлен пароль для: ${admin.full_name || admin.username}`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Новый пароль: ${newPassword}\n`);

        passwords.push({
          username: admin.username,
          full_name: admin.full_name || 'Не указано',
          role: admin.role || 'admin',
          password: newPassword
        });
      } catch (error) {
        console.error(`❌ Ошибка при обновлении пароля для "${admin.username}":`, error.message);
      }
    }

    // Сохраняем пароли в файл
    if (passwords.length > 0) {
      const passwordsFile = path.join(__dirname, '..', 'ADMIN_PASSWORDS.txt');
      let content = '═══════════════════════════════════════════════════════════\n';
      content += '  ПАРОЛИ АДМИНИСТРАТОРОВ (ОБНОВЛЕНО)\n';
      content += '═══════════════════════════════════════════════════════════\n\n';
      content += '⚠️  ВАЖНО: Сохраните этот файл в безопасном месте!\n';
      content += '⚠️  НЕ передавайте пароли третьим лицам!\n\n';
      content += '═══════════════════════════════════════════════════════════\n\n';
      
      passwords.forEach(admin => {
        content += `👤 ${admin.full_name}\n`;
        content += `   Username: ${admin.username}\n`;
        content += `   Role: ${admin.role}\n`;
        content += `   Password: ${admin.password}\n\n`;
      });
      
      content += '═══════════════════════════════════════════════════════════\n';
      content += `Дата обновления: ${new Date().toLocaleString('ru-RU')}\n`;
      content += '═══════════════════════════════════════════════════════════\n';
      
      try {
        fs.writeFileSync(passwordsFile, content, 'utf8');
        console.log(`\n📄 Пароли сохранены в файл: ${passwordsFile}`);
        console.log('⚠️  ВАЖНО: Сохраните этот файл в безопасном месте!\n');
      } catch (error) {
        console.error('⚠️  Не удалось сохранить пароли в файл:', error.message);
      }
    }

    console.log('✨ Готово! Все пароли обновлены.');
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

updatePasswords()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });


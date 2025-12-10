/**
 * Скрипт для создания администраторов
 * Создает новых администраторов в базе данных
 * 
 * Использование:
 * node scripts/create-admin.js
 * 
 * Или с параметрами:
 * node scripts/create-admin.js --username admin --password secret123 --full-name "Admin Name" --role admin
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Функция для чтения ввода из консоли
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// Парсинг аргументов командной строки
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        result[key] = value;
        i++;
      } else {
        result[key] = true;
      }
    }
  }
  
  return result;
}

async function createAdmin() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  СОЗДАНИЕ НОВОГО АДМИНИСТРАТОРА');
  console.log('═══════════════════════════════════════════════════════════\n');

  const args = parseArgs();
  let username, password, fullName, role;

  // Если параметры переданы через командную строку
  if (args.username) {
    username = args.username;
    password = args.password || generateSecurePassword(16);
    fullName = args['full-name'] || args.fullName || username;
    role = args.role || 'admin';
  } else {
    // Интерактивный режим
    console.log('Введите данные для нового администратора:\n');
    
    username = await askQuestion('Username (логин): ');
    if (!username || username.trim() === '') {
      console.error('❌ Username обязателен!');
      process.exit(1);
    }
    username = username.trim();

    // Проверяем, не существует ли уже такой username
    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('username', username)
      .single();
    
    if (existing) {
      console.error(`❌ Администратор с username "${username}" уже существует!`);
      process.exit(1);
    }

    const generatePassword = await askQuestion('Сгенерировать пароль автоматически? (y/n, по умолчанию y): ');
    if (generatePassword.toLowerCase() === 'n' || generatePassword.toLowerCase() === 'no') {
      password = await askQuestion('Введите пароль: ');
      if (!password || password.trim() === '') {
        console.error('❌ Пароль обязателен!');
        process.exit(1);
      }
      password = password.trim();
    } else {
      password = generateSecurePassword(16);
      console.log(`\n✅ Сгенерирован пароль: ${password}`);
    }

    fullName = await askQuestion('Полное имя (необязательно, по умолчанию = username): ');
    fullName = fullName.trim() || username;

    role = await askQuestion('Роль (admin/superadmin, по умолчанию admin): ');
    role = role.trim() || 'admin';
  }

  try {
    // Хешируем пароль
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создаем админа в базе
    const { data: newAdmin, error: insertError } = await supabase
      .from('admins')
      .insert({
        username: username,
        password: passwordHash,
        full_name: fullName,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('\n✅ Администратор успешно создан!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`👤 Полное имя: ${fullName}`);
    console.log(`   Username: ${username}`);
    console.log(`   Role: ${role}`);
    console.log(`   Password: ${password}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Сохраняем пароль в файл
    const passwordsFile = path.join(__dirname, '..', 'ADMIN_PASSWORDS.txt');
    let content = '';
    
    // Если файл существует, читаем его содержимое
    if (fs.existsSync(passwordsFile)) {
      content = fs.readFileSync(passwordsFile, 'utf8');
      // Удаляем старый заголовок, если есть
      content = content.replace(/═══════════════════════════════════════════════════════════[\s\S]*?═══════════════════════════════════════════════════════════\n\n/, '');
    }
    
    // Добавляем нового админа в начало
    const newEntry = `═══════════════════════════════════════════════════════════
  ПАРОЛИ АДМИНИСТРАТОРОВ
═══════════════════════════════════════════════════════════

⚠️  ВАЖНО: Сохраните этот файл в безопасном месте!
⚠️  НЕ передавайте пароли третьим лицам!

═══════════════════════════════════════════════════════════

👤 ${fullName}
   Username: ${username}
   Role: ${role}
   Password: ${password}

${content}`;

    try {
      fs.writeFileSync(passwordsFile, newEntry, 'utf8');
      console.log(`📄 Пароль сохранен в файл: ${passwordsFile}`);
      console.log('⚠️  ВАЖНО: Сохраните этот файл в безопасном месте!\n');
    } catch (error) {
      console.error('⚠️  Не удалось сохранить пароль в файл:', error.message);
    }

    console.log('✨ Готово!');
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    if (error.code === '23505') {
      console.error('   Администратор с таким username уже существует!');
    }
    process.exit(1);
  }
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });

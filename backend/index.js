require('dotenv').config();
const express = require('express');
const https = require('https');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Supabase (для работы с таблицей appointments и др.)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mzmouzcbmyhktvowrztm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY не установлен. Эндпоинты для записей будут недоступны.');
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

// SMTP (email)
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false') === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';

let mailer = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  mailer = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
  console.log('📨 SMTP настроен для отправки email');
} else {
  console.warn('⚠️  SMTP переменные не заданы. Email уведомления отправляться не будут.');
}

async function sendEmail(to, subject, text, html) {
  if (!mailer) {
    console.warn('SMTP не настроен, пропускаю отправку email:', subject);
    return;
  }
  try {
    console.log(`📨 Отправка email → ${to}; subject: "${subject}"`);
    const info = await mailer.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html: html || `<pre style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial">${text}</pre>`
    });
    console.log('✅ Email отправлен:', info?.messageId || '(no id)');
  } catch (e) {
    console.error('❌ Ошибка отправки email:', e?.message || e);
  }
}

// Ограничение запросов — защита от абуза
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 10,             // максимум 10 запросов в минуту с одного IP
  message: { error: "Слишком много запросов. Подождите немного." }
});
app.use("/api/", limiter);

// Функция для отправки сообщения в Telegram
function sendToTelegram(token, chatId, text) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      chat_id: chatId,
      text: text
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString())
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log('📥 Ответ от Telegram:', parsed.ok ? '✅ OK' : '❌ ' + parsed.description);
          if (parsed.ok) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.description || 'Telegram API error'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(params.toString());
    req.end();
  });
}

// Проверка настроек Telegram при старте
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('❌ TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены в .env файле');
  console.log('⚠️  Добавьте их для работы отправки сообщений');
} else {
  console.log('✅ Telegram Bot настроен и готов к отправке сообщений');
  console.log(`📱 Chat ID: ${CHAT_ID}`);
}

// JWT секрет для токенов администраторов
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    status: 'Backend работает!',
    timestamp: new Date().toISOString()
  });
});

// Endpoint для логина администратора
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: "Поля username и password обязательны" 
      });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase не настроен' });
    }

    // Ищем админа в таблице
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('❌ Ошибка поиска админа:', error);
      return res.status(401).json({ 
        error: "Неверное имя пользователя или пароль" 
      });
    }

    if (!admin) {
      console.log('⚠️ Админ не найден:', username);
      return res.status(401).json({ 
        error: "Неверное имя пользователя или пароль" 
      });
    }

    // Проверяем пароль
    // Если пароль не захеширован (старая версия), проверяем напрямую
    // Иначе используем bcrypt
    let passwordMatch = false;
    if (!admin.password) {
      return res.status(401).json({ 
        error: "Неверное имя пользователя или пароль" 
      });
    }
    
    if (admin.password.startsWith('$2b$') || admin.password.startsWith('$2a$')) {
      // Пароль захеширован с помощью bcrypt
      passwordMatch = await bcrypt.compare(password, admin.password);
    } else {
      // Пароль хранится в открытом виде (для совместимости)
      passwordMatch = admin.password === password;
    }

    if (!passwordMatch) {
      return res.status(401).json({ 
        error: "Неверное имя пользователя или пароль" 
      });
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username,
        role: admin.role,
        fullName: admin.full_name
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Токен действителен 7 дней
    );

    // Возвращаем токен и информацию об админе
    res.json({ 
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('❌ /admin/login ошибка:', err);
    console.error('❌ Stack trace:', err.stack);
    return res.status(500).json({ 
      error: "Ошибка при входе в систему", 
      details: process.env.NODE_ENV === 'development' ? err.message : 'Внутренняя ошибка сервера'
    });
  }
});

// Middleware для проверки токена администратора
function verifyAdminToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  const token = authHeader.substring(7); // Убираем "Bearer "

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}

// Endpoint для проверки токена (опционально)
app.get('/admin/verify', verifyAdminToken, (req, res) => {
  res.json({ 
    ok: true, 
    admin: req.admin 
  });
});

// Endpoint для отправки сообщений (сохранение в Supabase + опциональная отправка в Telegram)
app.post('/api/send', async (req, res) => {
  const { email, subject, message, name, phone } = req.body || {};
  
  // Валидация обязательных полей
  if (!email || !subject || !message) {
    return res.status(400).json({ 
      error: "Поля email, subject и message обязательны" 
    });
  }

  // Валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: "Некорректный email адрес" 
    });
  }

  // Проверка наличия Supabase
  if (!supabase) {
    return res.status(500).json({ 
      error: "База данных не настроена" 
    });
  }

  try {
    // Сохраняем сообщение в Supabase
    const { data: savedMessage, error: dbError } = await supabase
      .from('contact_messages')
      .insert([{
        name: name || null,
        email: email,
        phone: phone || null,
        subject: subject,
        message: message,
        status: 'new'
      }])
      .select()
      .single();

    if (dbError) {
      console.error('❌ Ошибка сохранения в Supabase:', dbError);
      // Продолжаем выполнение, даже если не удалось сохранить в БД
      // (попробуем отправить в Telegram, если настроен)
    } else {
      console.log('✅ Сообщение сохранено в Supabase:', savedMessage.id);
    }

    // Опциональная отправка в Telegram (если настроен)
    let telegramResult = null;
    if (BOT_TOKEN && CHAT_ID) {
      try {
        // Формируем простое текстовое сообщение для Telegram
        const telegramMessage = `📩 Новое сообщение с сайта Sezim Psychology

👤 Имя: ${name || 'Не указано'}
📧 Email: ${email}
${phone ? `📞 Телефон: ${phone}\n` : ''}🎯 Тема: ${subject}

💬 Сообщение:
${message}

⏰ Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`;

        console.log('📤 Отправляю сообщение в Telegram...');
        
        // Отправляем в Telegram
        telegramResult = await sendToTelegram(BOT_TOKEN, CHAT_ID, telegramMessage);
        
        console.log('✅ Сообщение успешно отправлено в Telegram');
        console.log(`   От: ${name || 'Аноним'} (${email})`);
        console.log(`   Тема: ${subject}`);
      } catch (telegramErr) {
        console.error("⚠️ Ошибка отправки в Telegram (продолжаем работу):", telegramErr.message);
        // Не прерываем выполнение, если Telegram не работает
      }
    } else {
      console.log('ℹ️ Telegram не настроен, сообщение сохранено только в БД');
    }
    
    return res.json({ 
      ok: true, 
      message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.',
      messageId: savedMessage?.id,
      telegramMessageId: telegramResult?.result?.message_id || null
    });
    
  } catch (err) {
    console.error("❌ Общая ошибка при обработке сообщения:", err.message);
    return res.status(500).json({ 
      error: "Не удалось обработать сообщение", 
      details: err.message 
    });
  }
});

/**
 * =============================
 * Endpoints управления записями
 * =============================
 */
// Список записей (для админа)
app.get('/api/appointments', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase не настроен' });
    const { status, from, to } = req.query || {};

    let query = supabase
      .from('appointments')
      .select(`
        *,
        psychologists:psychologist_id ( id, name_ru, name_kz, image_url )
      `)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (status) query = query.eq('status', status);
    if (from) query = query.gte('appointment_date', from);
    if (to) query = query.lte('appointment_date', to);

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ ok: true, data });
  } catch (err) {
    console.error('❌ /api/appointments:', err);
    return res.status(500).json({ error: err.message || 'Ошибка загрузки записей' });
  }
});

// Хелпер: загрузить запись с привязкой к психологу
async function fetchAppointmentFull(appointmentId) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id, appointment_date, appointment_time, status, notes,
      client_name, client_phone, client_email,
      psychologists:psychologist_id ( id, name_ru, name_kz )
    `)
    .eq('id', appointmentId)
    .single();
  if (error) throw error;
  return data;
}

// Email уведомления по событиям записи
function buildEmailCreated(a) {
  const time = (a.appointment_time || '').slice(0, 5);
  const psych = a.psychologists?.name_ru || 'Психолог';
  const base = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${base.replace(/\/+$/,'')}/appointment-status/${a.id}`;
  const lines = [
    'Ваша заявка на консультацию принята.',
    '',
    `Психолог: ${psych}`,
    `Дата: ${a.appointment_date}`,
    `Время: ${time}`,
    '',
    'Статус: Ожидает подтверждения.',
    `Проверить статус: ${link}`,
    '',
    'Мы свяжемся с вами для подтверждения.'
  ];
  return {
    subject: 'Sezim.abu — заявка принята',
    text: lines.join('\n')
  };
}

function buildEmailConfirmed(a) {
  const time = (a.appointment_time || '').slice(0, 5);
  const psych = a.psychologists?.name_ru || 'Психолог';
  const base = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${base.replace(/\/+$/,'')}/appointment-status/${a.id}`;
  const lines = [
    'Ваша запись подтверждена! ✅',
    '',
    `Психолог: ${psych}`,
    `Дата: ${a.appointment_date}`,
    `Время: ${time}`,
    `Проверить статус: ${link}`,
    '',
    'Ждём вас в центре психологической поддержки Sezim.abu.'
  ];
  return {
    subject: 'Sezim.abu — запись подтверждена',
    text: lines.join('\n')
  };
}

function buildEmailCancelled(a, reason, cancelledBy = 'admin', cancelledByName = null) {
  const time = (a.appointment_time || '').slice(0, 5);
  const psych = a.psychologists?.name_ru || 'Психолог';
  const base = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${base.replace(/\/+$/,'')}/appointment-status/${a.id}`;
  
  let cancelledByText = '';
  if (cancelledBy === 'client') {
    cancelledByText = 'Вы отменили запись на консультацию. ❌';
  } else if (cancelledBy === 'admin') {
    cancelledByText = cancelledByName 
      ? `К сожалению, ваша запись отменена администратором (${cancelledByName}). ❌`
      : 'К сожалению, ваша запись отменена администратором. ❌';
  } else if (cancelledBy === 'psychologist') {
    cancelledByText = cancelledByName 
      ? `К сожалению, ваша запись отменена психологом (${cancelledByName}). ❌`
      : `К сожалению, ваша запись отменена психологом (${psych}). ❌`;
  } else {
    cancelledByText = 'К сожалению, ваша запись отменена. ❌';
  }
  
  const lines = [
    cancelledByText,
    '',
    `Психолог: ${psych}`,
    `Дата: ${a.appointment_date}`,
    `Время: ${time}`,
    reason ? `Причина: ${reason}` : '',
    `Проверить статус: ${link}`,
    '',
    cancelledBy === 'client' 
      ? 'Если вы передумали, вы можете выбрать другой день/время и оформить новую запись.'
      : 'Вы можете выбрать другой день/время и оформить новую запись.'
  ].filter(Boolean);
  return {
    subject: 'Sezim.abu — запись отменена',
    text: lines.join('\n')
  };
}

// Подтвердить запись
app.post('/api/appointments/:id/confirm', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase не настроен' });
    const { id } = req.params;

    const { data: updated, error } = await supabase
      .from('appointments')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Telegram уведомление
    if (BOT_TOKEN && CHAT_ID) {
      const full = await fetchAppointmentFull(id);
      const date = full.appointment_date;
      const time = (full.appointment_time || '').slice(0, 5);
      const psych = full.psychologists?.name_ru || '—';
      const client = `${full.client_name || 'Не указано'}${full.client_phone ? `, ${full.client_phone}` : ''}`;
      const msg = `☑ Запись подтверждена\n\nДата: ${date}\nВремя: ${time}\nПсихолог: ${psych}\nКлиент: ${client}`;
      await sendToTelegram(BOT_TOKEN, CHAT_ID, msg);

      // Email клиенту
      if (full.client_email) {
        const { subject, text } = buildEmailConfirmed(full);
        await sendEmail(full.client_email, subject, text);
      }
    }

    return res.json({ ok: true, data: updated });
  } catch (err) {
    console.error('❌ /api/appointments/:id/confirm:', err);
    return res.status(500).json({ error: err.message || 'Ошибка подтверждения' });
  }
});

// Отменить запись (с опциональной причиной)
app.post('/api/appointments/:id/cancel', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase не настроен' });
    const { id } = req.params;
    const { reason, cancelledBy = 'admin', cancelledByName = null } = req.body || {}; // 'client', 'admin', 'psychologist'

    // Получаем текущую запись для получения данных
    const { data: existing } = await supabase.from('appointments').select('*').eq('id', id).single();
    if (!existing) return res.status(404).json({ error: 'Запись не найдена' });

    // Допишем причину в notes
    let notesPatch = null;
    if (typeof reason === 'string' && reason.trim()) {
      const prefix = existing.notes ? `${existing.notes}\n` : '';
      let cancelledByText = 'Отмена';
      if (cancelledBy === 'client') {
        cancelledByText = 'Клиент отменил';
      } else if (cancelledBy === 'admin') {
        cancelledByText = cancelledByName ? `Администратор (${cancelledByName}) отменил` : 'Администратор отменил';
      } else if (cancelledBy === 'psychologist') {
        cancelledByText = cancelledByName ? `Психолог (${cancelledByName}) отменил` : 'Психолог отменил';
      }
      notesPatch = `${prefix}${cancelledByText}: ${reason.trim()}`;
    }

    const updatePayload = { 
      status: 'cancelled', 
      cancelled_by: cancelledBy,
      updated_at: new Date().toISOString() 
    };
    if (notesPatch !== null) updatePayload.notes = notesPatch;
    if (cancelledByName) updatePayload.cancelled_by_name = cancelledByName;

    const { data: updated, error } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Получаем полные данные для уведомлений
    const full = await fetchAppointmentFull(id);
    const date = full.appointment_date;
    const time = (full.appointment_time || '').slice(0, 5);
    const psych = full.psychologists?.name_ru || '—';
    const client = `${full.client_name || 'Не указано'}${full.client_phone ? `, ${full.client_phone}` : ''}`;
    const reasonText = reason && reason.trim() ? `\nПричина: ${reason.trim()}` : '';
    
    // Формируем текст для Telegram
    let cancelledByText = '';
    if (cancelledBy === 'client') {
      cancelledByText = `❌ Клиент (${full.client_name || 'Клиент'}) отменил запись`;
    } else if (cancelledBy === 'admin') {
      cancelledByText = cancelledByName 
        ? `❌ Администратор (${cancelledByName}) отменил запись`
        : '❌ Запись отменена администратором';
    } else if (cancelledBy === 'psychologist') {
      cancelledByText = cancelledByName 
        ? `❌ Психолог (${cancelledByName}) отменил запись`
        : `❌ Психолог (${psych}) отменил запись`;
    }

    // Telegram уведомление
    if (BOT_TOKEN && CHAT_ID) {
      try {
        const msg = `${cancelledByText}\n\nДата: ${date}\nВремя: ${time}\nПсихолог: ${psych}\nКлиент: ${client}${reasonText}`;
        await sendToTelegram(BOT_TOKEN, CHAT_ID, msg);
        console.log('✅ Уведомление об отмене отправлено в Telegram');
      } catch (telegramErr) {
        console.error('⚠️ Ошибка отправки в Telegram:', telegramErr.message);
      }
    }

    // Email клиенту
    if (full.client_email) {
      try {
        const { subject, text } = buildEmailCancelled(full, reason, cancelledBy, cancelledByName);
        await sendEmail(full.client_email, subject, text);
        console.log('✅ Email об отмене отправлен клиенту');
      } catch (emailErr) {
        console.error('⚠️ Ошибка отправки email:', emailErr.message);
      }
    }

    return res.json({ ok: true, data: updated });
  } catch (err) {
    console.error('❌ /api/appointments/:id/cancel:', err);
    return res.status(500).json({ error: err.message || 'Ошибка отмены' });
  }
});

// Изменение времени записи (reschedule)
app.post('/api/appointments/:id/reschedule', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase не настроен' });
    const { id } = req.params;
    const { oldDate, oldTime, newDate, newTime, clientName } = req.body || {};

    // Telegram уведомление
    if (BOT_TOKEN && CHAT_ID) {
      const full = await fetchAppointmentFull(id);
      const psych = full.psychologists?.name_ru || '—';
      const client = clientName || full.client_name || 'Клиент';
      const clientPhone = full.client_phone ? `, ${full.client_phone}` : '';
      
      const msg = `✏️ Клиент (${client}${clientPhone}) изменил время записи\n\n` +
        `Психолог: ${psych}\n` +
        `Было:\n` +
        `  Дата: ${oldDate || full.appointment_date}\n` +
        `  Время: ${oldTime || (full.appointment_time ? full.appointment_time.slice(0, 5) : '—')}\n` +
        `Стало:\n` +
        `  Дата: ${newDate || full.appointment_date}\n` +
        `  Время: ${newTime || (full.appointment_time ? full.appointment_time.slice(0, 5) : '—')}\n\n` +
        `Запись ожидает подтверждения.`;
      
      await sendToTelegram(BOT_TOKEN, CHAT_ID, msg);

      // Email клиенту
      if (full.client_email) {
        const subject = 'Sezim.abu — время записи изменено';
        const base = process.env.FRONTEND_URL || 'http://localhost:3000';
        const link = `${base.replace(/\/+$/,'')}/appointment-status/${id}`;
        const text = [
          'Вы изменили время записи на консультацию. ✏️',
          '',
          `Психолог: ${psych}`,
          `Новая дата: ${newDate || full.appointment_date}`,
          `Новое время: ${newTime || (full.appointment_time ? full.appointment_time.slice(0, 5) : '—')}`,
          '',
          `Проверить статус: ${link}`,
          '',
          'Запись ожидает подтверждения. Мы свяжемся с вами для подтверждения нового времени.'
        ].join('\n');
        await sendEmail(full.client_email, subject, text);
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('❌ /api/appointments/:id/reschedule:', err);
    return res.status(500).json({ error: err.message || 'Ошибка отправки уведомления' });
  }
});

// Ручная отправка email (создана/любой другой эвент)
app.post('/api/appointments/:id/email', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase не настроен' });
    const { id } = req.params;
    const { type = 'created', reason, cancelledBy = 'admin' } = req.body || {};
    const a = await fetchAppointmentFull(id);
    if (!a?.client_email) return res.json({ ok: true, skipped: true });
    let payload;
    if (type === 'confirmed') payload = buildEmailConfirmed(a);
    else if (type === 'cancelled') payload = buildEmailCancelled(a, reason, cancelledBy);
    else payload = buildEmailCreated(a);
    await sendEmail(a.client_email, payload.subject, payload.text);
    return res.json({ ok: true });
  } catch (err) {
    console.error('❌ /api/appointments/:id/email:', err);
    return res.status(500).json({ error: err.message || 'Ошибка отправки email' });
  }
});

// Endpoint для массовой рассылки в Telegram (опционально, с защитой)
app.post('/api/send-bulk', async (req, res) => {
  const { message } = req.body || {};
  
  // Дополнительная защита - требуем API ключ
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ 
      error: "Доступ запрещен. Требуется API ключ администратора" 
    });
  }

  if (!message) {
    return res.status(400).json({ 
      error: "Поле message обязательно" 
    });
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ 
      error: "Telegram не настроен на сервере" 
    });
  }

  try {
    // Формируем сообщение для массовой рассылки
    const telegramMessage = `📢 Рассылка от Sezim Psychology

${message}

⏰ ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`;

    // Отправляем в Telegram
    await sendToTelegram(BOT_TOKEN, CHAT_ID, telegramMessage);
    
    console.log('✅ Массовая рассылка отправлена в Telegram');
    
    return res.json({ 
      ok: true, 
      message: 'Рассылка успешно отправлена в группу'
    });
    
  } catch (err) {
    console.error("❌ Ошибка массовой рассылки:", err);
    return res.status(500).json({ 
      error: "Ошибка при массовой рассылке", 
      details: err.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint не найден" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Backend запущен на ${HOST}:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📬 Send endpoint: http://localhost:${PORT}/api/send\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Ошибка: Порт ${PORT} уже занят!`);
    console.error(`   Остановите другой процесс на порту ${PORT} или измените PORT в .env файле\n`);
    process.exit(1);
  } else {
    console.error('❌ Ошибка сервера:', err);
    process.exit(1);
  }
});


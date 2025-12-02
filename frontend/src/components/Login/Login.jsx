import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import "./Login.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Login({ onLogin }) {
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      // Сохраняем токен и информацию об админе в localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.admin));

      // Вызываем callback с данными админа
      onLogin(data.admin);
    } catch (e) {
      setErr(t({ 
        ru: e.message || "Неверное имя пользователя или пароль", 
        kz: e.message || "Қате пайдаланушы аты немесе құпия сөз" 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>{t({ ru: "Вход в панель администратора", kz: "Әкімші панеліне кіру" })}</h2>
            <p>{t({ ru: "Введите свои учетные данные", kz: "Жеке деректеріңізді енгізіңіз" })}</p>
          </div>
          
          <form onSubmit={submit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">{t({ ru: "Имя пользователя", kz: "Пайдаланушы аты" })}</label>
              <input
                id="username"
                type="text"
                placeholder={t({ ru: "Введите имя пользователя", kz: "Пайдаланушы атын енгізіңіз" })}
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t({ ru: "Пароль", kz: "Құпия сөз" })}</label>
              <input
                id="password"
                type="password"
                placeholder={t({ ru: "Введите пароль", kz: "Құпия сөзді енгізіңіз" })}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {err && <div className="error-message">{err}</div>}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? t({ ru: "Вход...", kz: "Кіруде..." }) : t({ ru: "Войти", kz: "Кіру" })}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


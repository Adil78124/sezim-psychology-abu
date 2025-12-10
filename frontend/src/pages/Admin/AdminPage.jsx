import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import Login from "../../components/Login/Login";
import AdminPanel from "../../components/AdminPanel/AdminPanel";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем наличие токена и валидность
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');

      if (!token || !adminData) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Проверяем токен на сервере
        const response = await fetch(`${API_URL}/admin/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setUser(JSON.parse(adminData));
        } else {
          // Токен недействителен, очищаем
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          setUser(null);
        }
      } catch (error) {
        console.error('Ошибка проверки токена:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (adminData) => {
    setUser(adminData);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <p>{t({ ru: 'Загрузка...', kz: 'Жүктелуде...' })}</p>
      </div>
    );
  }

  return (
    <div>
      {user ? <AdminPanel user={user} /> : <Login onLogin={handleLogin} />}
    </div>
  );
}


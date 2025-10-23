import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('Проверяем...');
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('Подключаемся к Supabase...');
      
      // Тестируем подключение к таблице news
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .limit(5);

      if (error) {
        throw error;
      }

      setConnectionStatus('✅ Подключение успешно!');
      setNews(data || []);
      setError(null);
    } catch (err) {
      setConnectionStatus('❌ Ошибка подключения');
      setError(err.message);
      console.error('Ошибка Supabase:', err);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🧪 Тест подключения к Supabase</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Статус:</strong> {connectionStatus}
      </div>

      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      {news.length > 0 && (
        <div>
          <h4>📰 Новости из Supabase ({news.length}):</h4>
          {news.map(item => (
            <div key={item.id} style={{ 
              border: '1px solid #eee', 
              padding: '10px', 
              margin: '5px 0',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}>
              <strong>{item.title}</strong>
              <p>{item.content}</p>
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              )}
              <small style={{ color: '#666' }}>
                {new Date(item.created_at).toLocaleString('ru-RU')}
              </small>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={testConnection}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔄 Повторить тест
      </button>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [news, setNews] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [addingNews, setAddingNews] = useState(false);
  
  // Состояния для загрузки файлов
  const [imageMode, setImageMode] = useState("url"); // "url" или "upload"
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  useEffect(() => {
    // Получаем текущего пользователя
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Ошибка получения пользователя:', error);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      setUser(user);
      if (user) {
        // Проверяем, является ли пользователь админом
        // В Supabase это можно сделать через RLS или проверку email
        const adminEmails = ['kairatovadil7@gmail.com', 'haval.semey@mail.ru'];
        setIsAdmin(adminEmails.includes(user.email));
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    getCurrentUser();

    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const adminEmails = ['kairatovadil7@gmail.com', 'haval.semey@mail.ru'];
        setIsAdmin(adminEmails.includes(session.user.email));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
      }
    });

    // Загружаем новости из Supabase
    const loadNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Ошибка загрузки новостей:', error);
      } else {
        setNews(data || []);
      }
    };

    loadNews();

    // Подписываемся на изменения в таблице news
    const newsSubscription = supabase
      .channel('news_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'news' },
        () => {
          loadNews(); // Перезагружаем новости при изменениях
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
      newsSubscription.unsubscribe();
    };
  }, []);

  // Загрузка файла в Supabase Storage
  const uploadImage = async (file) => {
    if (!file) {
      throw new Error("Файл не выбран");
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      throw new Error("Пожалуйста, выберите изображение");
    }

    try {
      // Создаем уникальное имя файла
      const timestamp = Date.now();
      const fileName = `news/${timestamp}_${file.name}`;

      // Загружаем файл в Supabase Storage
      const { data, error } = await supabase.storage
        .from('news-images')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Получаем публичный URL
      const { data: publicUrl } = supabase.storage
        .from('news-images')
        .getPublicUrl(fileName);

      setUploadProgress(0);
      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      throw error;
    }
  };

  const addNews = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert("Нет прав");
    if (!title || !content) return alert("Заполните все поля");
    
    setAddingNews(true);
    try {
      let finalImageUrl = "";

      // Определяем URL изображения в зависимости от режима
      if (imageMode === "upload" && imageFile) {
        // Загружаем файл в Supabase Storage
        finalImageUrl = await uploadImage(imageFile);
      } else if (imageMode === "url" && imageUrl.trim()) {
        // Используем введенный URL
        finalImageUrl = imageUrl.trim();
      }

      // Добавляем новость в Supabase
      const { error } = await supabase
        .from('news')
        .insert({
          title,
          content,
          image_url: finalImageUrl || null,
          link: link.trim() || null,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }
      
      // Очищаем форму
      setTitle("");
      setContent("");
      setImageUrl("");
      setLink("");
      setImageFile(null);
      setUploadedImageUrl("");
      setUploadProgress(0);
      
      alert("✅ Новость успешно добавлена!");
    } catch (error) {
      alert("Ошибка при добавлении новости: " + error.message);
      console.error(error);
    } finally {
      setAddingNews(false);
    }
  };

  const remove = async (id) => {
    if (!isAdmin) return alert("Нет прав");
    if (!window.confirm("Вы уверены, что хотите удалить эту новость?")) return;
    
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      alert("Ошибка при удалении: " + error.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-error">
        <h3>⚠️ Требуется авторизация</h3>
        <p>Пожалуйста, войдите в систему</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-error">
        <h3>🚫 Доступ запрещён</h3>
        <p>У вас нет прав администратора</p>
        <button onClick={logout} className="btn btn-secondary">Выйти</button>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div>
              <h1>Панель управления</h1>
              <p>Добро пожаловать, {user.email}</p>
            </div>
            <button onClick={logout} className="btn btn-secondary">
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          {/* Форма добавления новости */}
          <section className="admin-section">
            <h2 className="section-title">Добавить новость</h2>
            <div className="add-news-card">
              <form onSubmit={addNews} className="news-form">
                <div className="form-group">
                  <label htmlFor="news-title">Заголовок</label>
                  <input
                    id="news-title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Введите заголовок новости"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="news-content">Содержание</label>
                  <textarea
                    id="news-content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Введите текст новости"
                    rows="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Изображение (необязательно)</label>
                  
                  {/* Переключатель режима */}
                  <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`mode-btn ${imageMode === "url" ? "active" : ""}`}
                      style={{
                        padding: '8px 16px',
                        border: imageMode === "url" ? '2px solid #667eea' : '2px solid #ddd',
                        borderRadius: '8px',
                        background: imageMode === "url" ? '#f0f2ff' : 'white',
                        color: imageMode === "url" ? '#667eea' : '#666',
                        cursor: 'pointer',
                        fontWeight: imageMode === "url" ? 'bold' : 'normal',
                        transition: 'all 0.3s'
                      }}
                    >
                      🔗 Вставить URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`mode-btn ${imageMode === "upload" ? "active" : ""}`}
                      style={{
                        padding: '8px 16px',
                        border: imageMode === "upload" ? '2px solid #667eea' : '2px solid #ddd',
                        borderRadius: '8px',
                        background: imageMode === "upload" ? '#f0f2ff' : 'white',
                        color: imageMode === "upload" ? '#667eea' : '#666',
                        cursor: 'pointer',
                        fontWeight: imageMode === "upload" ? 'bold' : 'normal',
                        transition: 'all 0.3s'
                      }}
                    >
                      📤 Загрузить файл
                    </button>
                  </div>

                  {/* Поле URL */}
                  {imageMode === "url" && (
                    <>
                      <input
                        id="news-image-url"
                        type="url"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                      <p className="field-hint" style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                        💡 Можно загрузить на <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer">Imgur</a> или <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer">Cloudinary</a>
                      </p>
                    </>
                  )}

                  {/* Поле загрузки файла */}
                  {imageMode === "upload" && (
                    <>
                      <input
                        id="news-image-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setImageFile(file);
                          if (file) {
                            // Показываем превью
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setUploadedImageUrl(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px dashed #667eea',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: '#f8f9ff'
                        }}
                      />
                      <p className="field-hint" style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                        📁 Выберите изображение с вашего компьютера (JPG, PNG, GIF)
                      </p>

                      {/* Превью изображения */}
                      {uploadedImageUrl && (
                        <div style={{ marginTop: '15px' }}>
                          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Превью:</p>
                          <img
                            src={uploadedImageUrl}
                            alt="Превью"
                            style={{
                              maxWidth: '300px',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              border: '1px solid #ddd'
                            }}
                          />
                        </div>
                      )}

                      {/* Прогресс-бар загрузки */}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div style={{ marginTop: '15px' }}>
                          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                            Загрузка: {Math.round(uploadProgress)}%
                          </p>
                          <div style={{
                            width: '100%',
                            height: '8px',
                            background: '#e0e0e0',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${uploadProgress}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #667eea, #764ba2)',
                              transition: 'width 0.3s'
                            }}></div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="news-link">Внешняя ссылка (необязательно)</label>
                  <input
                    id="news-link"
                    type="url"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    placeholder="https://example.com"
                  />
                  <p className="field-hint">📎 Ссылка на источник, статью, Instagram и т.д.</p>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={addingNews || (uploadProgress > 0 && uploadProgress < 100)}
                >
                  {uploadProgress > 0 && uploadProgress < 100
                    ? `Загрузка изображения ${Math.round(uploadProgress)}%...`
                    : addingNews
                    ? "Добавление новости..."
                    : "➕ Добавить новость"}
                </button>
              </form>
            </div>
          </section>

          {/* Список новостей */}
          <section className="admin-section">
            <h2 className="section-title">
              Все новости ({news.length})
            </h2>
            
            {news.length === 0 ? (
              <div className="empty-state">
                <p>📰 Пока нет опубликованных новостей</p>
              </div>
            ) : (
              <div className="news-list">
                {news.map(n => (
                  <div key={n.id} className="news-item">
                    <div className="news-item-header">
                      <h3>{n.title}</h3>
                      <span className="news-date">
                        {n.created_at ? new Date(n.created_at).toLocaleString('ru-RU') : "Только что"}
                      </span>
                    </div>
                    
                    {n.image_url && (
                      <div className="news-item-image">
                        <img src={n.image_url} alt={n.title} />
                      </div>
                    )}
                    
                    <p className="news-text">{n.content}</p>
                    
                    {n.link && (
                      <div className="news-item-link">
                        <a href={n.link} target="_blank" rel="noopener noreferrer" className="external-link">
                          🔗 Перейти по ссылке →
                        </a>
                      </div>
                    )}
                    
                    <div className="news-actions">
                      <button 
                        onClick={() => remove(n.id)} 
                        className="btn-delete"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}


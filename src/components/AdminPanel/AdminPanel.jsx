import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [news, setNews] = useState([]);
  const [title, setTitle] = useState("");
  const [shortContent, setShortContent] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [isMain, setIsMain] = useState(false);
  const [addingNews, setAddingNews] = useState(false);
  const [editingId, setEditingId] = useState(null); // ID новости, которую редактируем
  
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
      const { error } = await supabase.storage
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
    if (!title || !shortContent || !fullContent) return alert("Заполните все поля");
    
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

      // Если эта новость должна быть главной, сбрасываем главную у всех остальных
      if (isMain) {
        const { error: updateError } = await supabase
          .from('news')
          .update({ is_main: false })
          .eq('is_main', true)
          .neq('id', editingId || 0); // Исключаем текущую редактируемую новость
        
        if (updateError) {
          console.error('Ошибка обновления главной новости:', updateError);
          // Продолжаем все равно
        }
      }

      const newsData = {
        title,
        short_content: shortContent,
        full_content: fullContent,
        link: link.trim() || null,
        is_main: isMain,
      };

      // Если указан URL изображения, добавляем его
      if (finalImageUrl) {
        newsData.image_url = finalImageUrl;
      }

      let error;
      if (editingId) {
        // Обновляем существующую новость
        const { error: updateError } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingId);
        error = updateError;
      } else {
        // Добавляем новую новость
        newsData.created_at = new Date().toISOString();
        const { error: insertError } = await supabase
          .from('news')
          .insert(newsData);
        error = insertError;
      }

      if (error) {
        throw error;
      }
      
      // Очищаем форму
      resetForm();
      
      alert(editingId ? "✅ Новость успешно обновлена!" : "✅ Новость успешно добавлена!");
    } catch (error) {
      alert(`Ошибка при ${editingId ? 'обновлении' : 'добавлении'} новости: ` + error.message);
      console.error(error);
    } finally {
      setAddingNews(false);
    }
  };

  // Функция для загрузки новости в форму редактирования
  const editNews = (newsItem) => {
    setEditingId(newsItem.id);
    setTitle(newsItem.title || "");
    setShortContent(newsItem.short_content || newsItem.content || "");
    setFullContent(newsItem.full_content || newsItem.content || "");
    setImageUrl(newsItem.image_url || "");
    setLink(newsItem.link || "");
    setIsMain(newsItem.is_main || false);
    setImageMode("url"); // Сбрасываем режим загрузки
    setImageFile(null);
    setUploadedImageUrl("");
    setUploadProgress(0);
    
    // Прокручиваем к форме
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Функция для очистки формы (отмена редактирования)
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setShortContent("");
    setFullContent("");
    setImageUrl("");
    setLink("");
    setIsMain(false);
    setImageMode("url");
    setImageFile(null);
    setUploadedImageUrl("");
    setUploadProgress(0);
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

  const setAsMain = async (id) => {
    if (!isAdmin) return alert("Нет прав");
    if (!window.confirm("Сделать эту новость главной? Прежняя главная новость станет обычной.")) return;
    
    try {
      // Сначала сбрасываем главную у всех новостей
      const { error: updateError } = await supabase
        .from('news')
        .update({ is_main: false })
        .eq('is_main', true);
      
      if (updateError) {
        console.error('Ошибка сброса главной новости:', updateError);
      }

      // Теперь устанавливаем эту новость как главную
      const { error } = await supabase
        .from('news')
        .update({ is_main: true })
        .eq('id', id);

      if (error) {
        throw error;
      }

      alert("✅ Новость теперь главная!");
    } catch (error) {
      alert("Ошибка при установке главной новости: " + error.message);
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
          {/* Форма добавления/редактирования новости */}
          <section className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="section-title">
                {editingId ? '✏️ Редактировать новость' : '➕ Добавить новость'}
              </h2>
              {editingId && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  ❌ Отменить редактирование
                </button>
              )}
            </div>
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
                  <label htmlFor="news-short-content">Короткое описание (для карточки новости)</label>
                  <textarea
                    id="news-short-content"
                    value={shortContent}
                    onChange={e => setShortContent(e.target.value)}
                    placeholder="Введите краткое описание новости (2-3 предложения). Этот текст будет отображаться в карточке новости на главной странице."
                    rows="4"
                    required
                    style={{ minHeight: '100px', fontSize: '14px' }}
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    💡 Используется для краткого превью в списке новостей
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="news-full-content">Полное содержание (для страницы "Подробнее")</label>
                  <textarea
                    id="news-full-content"
                    value={fullContent}
                    onChange={e => setFullContent(e.target.value)}
                    placeholder="Введите полный текст новости. Этот текст будет отображаться на странице с подробной информацией о новости."
                    rows="15"
                    required
                    style={{ minHeight: '300px', fontSize: '14px' }}
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    💡 Совет: Можете использовать несколько абзацев для лучшей читаемости текста
                  </small>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isMain}
                      onChange={(e) => setIsMain(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: '500' }}>⭐ Сделать главной новостью</span>
                  </label>
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block', marginLeft: '28px' }}>
                    💡 Если отметить, эта новость будет отображаться как главная на главной странице. Прежняя главная новость автоматически станет обычной.
                  </small>
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
                    ? (editingId ? "Сохранение изменений..." : "Добавление новости...")
                    : (editingId ? "💾 Сохранить изменения" : "➕ Добавить новость")}
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
                    
                    <p className="news-text">{n.short_content || n.content || 'Нет описания'}</p>
                    
                    {n.link && (
                      <div className="news-item-link">
                        <a href={n.link} target="_blank" rel="noopener noreferrer" className="external-link">
                          🔗 Перейти по ссылке →
                        </a>
                      </div>
                    )}
                    
                    <div className="news-actions">
                      <button 
                        onClick={() => editNews(n)} 
                        className="btn-secondary"
                        style={{ 
                          marginRight: '10px',
                          padding: '8px 16px',
                          background: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✏️ Редактировать
                      </button>
                      {n.is_main ? (
                        <span style={{ 
                          marginRight: '10px',
                          padding: '8px 16px', 
                          background: '#4CAF50', 
                          color: 'white', 
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          ⭐ Главная новость
                        </span>
                      ) : (
                        <button 
                          onClick={() => setAsMain(n.id)} 
                          className="btn-secondary"
                          style={{ 
                            marginRight: '10px',
                            padding: '8px 16px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          ⭐ Сделать главной
                        </button>
                      )}
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


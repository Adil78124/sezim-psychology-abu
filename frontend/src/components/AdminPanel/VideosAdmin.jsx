import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./PsychologistsAdmin.css";

export default function VideosAdmin() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingVideo, setAddingVideo] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Состояния формы
  const [titleRu, setTitleRu] = useState("");
  const [titleKz, setTitleKz] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  const [descriptionKz, setDescriptionKz] = useState("");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      
      // Очищаем старые Supabase Auth сессии
      try {
        await supabase.auth.signOut();
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('supabase') && key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Игнорируем ошибки
      }
      
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      setVideos(data || []);
    } catch (error) {
      console.error('Ошибка загрузки видеороликов:', error);
      alert("Ошибка загрузки видеороликов: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitleRu("");
    setTitleKz("");
    setDescriptionRu("");
    setDescriptionKz("");
    setUrl("");
    setPlatform("YouTube");
    setOrderIndex(0);
  };

  const editVideo = (video) => {
    setEditingId(video.id);
    setTitleRu(video.title_ru || "");
    setTitleKz(video.title_kz || "");
    setDescriptionRu(video.description_ru || "");
    setDescriptionKz(video.description_kz || "");
    setUrl(video.url || "");
    setPlatform(video.platform || "YouTube");
    setOrderIndex(video.order_index || 0);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveVideo = async (e) => {
    e.preventDefault();
    
    if (!titleRu || !titleKz || !url) {
      return alert("Заполните название на обоих языках и URL");
    }

    setAddingVideo(true);
    try {
      // Очищаем старые Supabase Auth сессии перед записью
      try {
        await supabase.auth.signOut();
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('supabase') && key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Игнорируем ошибки
      }
      
      const videoData = {
        title_ru: titleRu.trim(),
        title_kz: titleKz.trim(),
        description_ru: descriptionRu.trim() || null,
        description_kz: descriptionKz.trim() || null,
        url: url.trim(),
        platform: platform || "YouTube",
        order_index: orderIndex || 0,
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('videos')
          .update(videoData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('videos')
          .insert(videoData);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      resetForm();
      loadVideos();
      alert(editingId ? "Видеоролик обновлен!" : "Видеоролик добавлен!");
    } catch (error) {
      alert("Ошибка при сохранении: " + error.message);
      console.error(error);
    } finally {
      setAddingVideo(false);
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот видеоролик?")) {
      return;
    }

    try {
      // Очищаем старые Supabase Auth сессии перед удалением
      try {
        await supabase.auth.signOut();
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('supabase') && key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Игнорируем ошибки
      }
      
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      loadVideos();
      alert("Видеоролик удален!");
    } catch (error) {
      alert("Ошибка при удалении: " + error.message);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка видеороликов...</p>
      </div>
    );
  }

  return (
    <div>
      <section className="admin-section">
        <h2 className="section-title">
          {editingId ? "✏️ Редактировать видеоролик" : "➕ Добавить видеоролик"}
        </h2>
        <form onSubmit={saveVideo}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="title-ru">Название (Русский) *</label>
              <input
                id="title-ru"
                type="text"
                value={titleRu}
                onChange={e => setTitleRu(e.target.value)}
                placeholder="Душа и выбор в технологичном мире"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="title-kz">Название (Казахский) *</label>
              <input
                id="title-kz"
                type="text"
                value={titleKz}
                onChange={e => setTitleKz(e.target.value)}
                placeholder="Технологиялық әлемдегі жан мен таңдау"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="description-ru">Описание (Русский)</label>
              <textarea
                id="description-ru"
                value={descriptionRu}
                onChange={e => setDescriptionRu(e.target.value)}
                placeholder="Короткометражный фильм о жизни в технологичном мире..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description-kz">Описание (Казахский)</label>
              <textarea
                id="description-kz"
                value={descriptionKz}
                onChange={e => setDescriptionKz(e.target.value)}
                placeholder="Технологиялық әлемдегі өмір туралы қысқаметражды фильм..."
                rows="4"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="url">URL видео *</label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="platform">Платформа</label>
              <select
                id="platform"
                value={platform}
                onChange={e => setPlatform(e.target.value)}
              >
                <option value="YouTube">YouTube</option>
                <option value="Vimeo">Vimeo</option>
                <option value="Другое">Other / Басқа</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="order-index">Порядок отображения</label>
              <input
                id="order-index"
                type="number"
                value={orderIndex}
                onChange={e => setOrderIndex(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={addingVideo}
          >
            {addingVideo
              ? (editingId ? "Сохранение..." : "Добавление...")
              : (editingId ? "💾 Сохранить изменения" : "➕ Добавить видеоролик")}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary"
              style={{ marginLeft: '10px' }}
            >
              Отмена
            </button>
          )}
        </form>
      </section>

      <section className="admin-section">
        <h2 className="section-title">
          Все видеоролики ({videos.length})
        </h2>

        {videos.length === 0 ? (
          <div className="empty-state">
            <p>🎥 Пока нет добавленных видеороликов</p>
          </div>
        ) : (
          <div className="psychologists-list">
            {videos.map(video => (
              <div key={video.id} className="psychologist-item">
                <div className="psychologist-item-header">
                  <div>
                    <h3>{video.title_ru}</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>{video.title_kz}</p>
                    <p style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>
                      📺 {video.platform}
                    </p>
                  </div>
                </div>

                <div className="psychologist-item-content">
                  {video.description_ru && (
                    <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                      {video.description_ru.substring(0, 200)}...
                    </p>
                  )}
                  {video.url && (
                    <p style={{ marginTop: '10px', fontSize: '14px' }}>
                      <strong>Ссылка:</strong> <a href={video.url} target="_blank" rel="noopener noreferrer">{video.url.substring(0, 60)}...</a>
                    </p>
                  )}
                </div>

                <div className="psychologist-actions">
                  <button
                    onClick={() => editVideo(video)}
                    className="btn-secondary"
                    style={{
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
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="btn-delete"
                    style={{
                      padding: '8px 16px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
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
  );
}


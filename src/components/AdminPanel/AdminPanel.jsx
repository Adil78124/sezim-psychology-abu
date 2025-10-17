import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { 
  addDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { signOut } from "firebase/auth";
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

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // обновляем токен и читаем claims
      const tokenRes = await u.getIdTokenResult(true);
      setIsAdmin(!!tokenRes.claims?.admin);
      setLoading(false);
    });

    // слушаем новости в реальном времени
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsubNews = onSnapshot(q, (snap) => {
      setNews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { 
      unsub(); 
      unsubNews(); 
    };
  }, []);

  const addNews = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert("Нет прав");
    if (!title || !content) return alert("Заполните все поля");
    
    setAddingNews(true);
    try {
      await addDoc(collection(db, "news"), {
        title,
        content,
        imageUrl: imageUrl.trim() || null,
        link: link.trim() || null,
        createdAt: serverTimestamp()
      });
      
      setTitle("");
      setContent("");
      setImageUrl("");
      setLink("");
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
      await deleteDoc(doc(db, "news", id));
    } catch (error) {
      alert("Ошибка при удалении: " + error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
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
                  <label htmlFor="news-image-url">URL изображения (необязательно)</label>
                  <input
                    id="news-image-url"
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="field-hint">
                    💡 Можно загрузить на <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer">Imgur</a> или <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer">Cloudinary</a>
                  </p>
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
                  disabled={addingNews}
                >
                  {addingNews ? "Добавление..." : "➕ Добавить новость"}
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
                        {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString('ru-RU') : "Только что"}
                      </span>
                    </div>
                    
                    {n.imageUrl && (
                      <div className="news-item-image">
                        <img src={n.imageUrl} alt={n.title} />
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


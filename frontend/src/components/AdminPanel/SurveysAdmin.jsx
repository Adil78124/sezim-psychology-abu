import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./PsychologistsAdmin.css";

export default function SurveysAdmin() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingSurvey, setAddingSurvey] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Состояния формы
  const [icon, setIcon] = useState("📝");
  const [titleRu, setTitleRu] = useState("");
  const [titleKz, setTitleKz] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  const [descriptionKz, setDescriptionKz] = useState("");
  const [duration, setDuration] = useState("10");
  const [questions, setQuestions] = useState("10");
  const [externalLink, setExternalLink] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      setSurveys(data || []);
    } catch (error) {
      console.error('Ошибка загрузки опросников:', error);
      alert("Ошибка загрузки опросников: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setIcon("📝");
    setTitleRu("");
    setTitleKz("");
    setDescriptionRu("");
    setDescriptionKz("");
    setDuration("10");
    setQuestions("10");
    setExternalLink("");
    setOrderIndex(0);
  };

  const editSurvey = (survey) => {
    setEditingId(survey.id);
    setIcon(survey.icon || "📝");
    setTitleRu(survey.title_ru || "");
    setTitleKz(survey.title_kz || "");
    setDescriptionRu(survey.description_ru || "");
    setDescriptionKz(survey.description_kz || "");
    setDuration(survey.duration || "10");
    setQuestions(survey.questions || "10");
    setExternalLink(survey.external_link || "");
    setOrderIndex(survey.order_index || 0);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveSurvey = async (e) => {
    e.preventDefault();
    
    if (!titleRu || !titleKz) {
      return alert("Заполните название на русском и казахском языках");
    }

    setAddingSurvey(true);
    try {
      const surveyData = {
        icon: icon || "📝",
        title_ru: titleRu.trim(),
        title_kz: titleKz.trim(),
        description_ru: descriptionRu.trim() || null,
        description_kz: descriptionKz.trim() || null,
        duration: duration ? parseInt(duration) : 10,
        questions: questions ? parseInt(questions) : 10,
        external_link: externalLink.trim() || null,
        order_index: orderIndex || 0,
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('surveys')
          .update(surveyData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('surveys')
          .insert(surveyData);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      resetForm();
      loadSurveys();
      alert(editingId ? "Опросник обновлен!" : "Опросник добавлен!");
    } catch (error) {
      alert("Ошибка при сохранении: " + error.message);
      console.error(error);
    } finally {
      setAddingSurvey(false);
    }
  };

  const deleteSurvey = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот опросник?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      loadSurveys();
      alert("Опросник удален!");
    } catch (error) {
      alert("Ошибка при удалении: " + error.message);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка опросников...</p>
      </div>
    );
  }

  return (
    <div>
      <section className="admin-section">
        <h2 className="section-title">
          {editingId ? "✏️ Редактировать опросник" : "➕ Добавить опросник"}
        </h2>
        <form onSubmit={saveSurvey}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="icon">Иконка (эмодзи)</label>
              <input
                id="icon"
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder="📝"
                maxLength="2"
              />
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="title-ru">Название (Русский) *</label>
              <input
                id="title-ru"
                type="text"
                value={titleRu}
                onChange={e => setTitleRu(e.target.value)}
                placeholder="Тест адаптации к студенчеству"
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
                placeholder="Студенттікке бейімделу тесті"
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
                placeholder="Выявление уровня социальной, учебной и психологической адаптации..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description-kz">Описание (Казахский)</label>
              <textarea
                id="description-kz"
                value={descriptionKz}
                onChange={e => setDescriptionKz(e.target.value)}
                placeholder="Әлеуметтік, оқу және психологиялық бейімделу деңгейін анықтау..."
                rows="4"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="duration">Длительность (минуты)</label>
              <input
                id="duration"
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="questions">Количество вопросов</label>
              <input
                id="questions"
                type="number"
                value={questions}
                onChange={e => setQuestions(e.target.value)}
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="external-link">Внешняя ссылка</label>
              <input
                id="external-link"
                type="url"
                value={externalLink}
                onChange={e => setExternalLink(e.target.value)}
                placeholder="https://psytests.org/..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={addingSurvey}
          >
            {addingSurvey
              ? (editingId ? "Сохранение..." : "Добавление...")
              : (editingId ? "💾 Сохранить изменения" : "➕ Добавить опросник")}
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
          Все опросники ({surveys.length})
        </h2>

        {surveys.length === 0 ? (
          <div className="empty-state">
            <p>📝 Пока нет добавленных опросников</p>
          </div>
        ) : (
          <div className="psychologists-list">
            {surveys.map(survey => (
              <div key={survey.id} className="psychologist-item">
                <div className="psychologist-item-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '2rem' }}>{survey.icon || "📝"}</span>
                    <div>
                      <h3>{survey.title_ru}</h3>
                      <p style={{ color: '#666', fontSize: '14px' }}>{survey.title_kz}</p>
                      <p style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>
                        ⏱ {survey.duration} мин | 📝 {survey.questions} вопросов
                      </p>
                    </div>
                  </div>
                </div>

                <div className="psychologist-item-content">
                  {survey.description_ru && (
                    <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                      {survey.description_ru.substring(0, 200)}...
                    </p>
                  )}
                  {survey.external_link && (
                    <p style={{ marginTop: '10px', fontSize: '14px' }}>
                      <strong>Ссылка:</strong> <a href={survey.external_link} target="_blank" rel="noopener noreferrer">{survey.external_link}</a>
                    </p>
                  )}
                </div>

                <div className="psychologist-actions">
                  <button
                    onClick={() => editSurvey(survey)}
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
                    onClick={() => deleteSurvey(survey.id)}
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


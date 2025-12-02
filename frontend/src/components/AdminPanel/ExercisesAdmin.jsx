import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./PsychologistsAdmin.css";

export default function ExercisesAdmin() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingExercise, setAddingExercise] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Состояния формы
  const [titleRu, setTitleRu] = useState("");
  const [titleKz, setTitleKz] = useState("");
  const [goalRu, setGoalRu] = useState("");
  const [goalKz, setGoalKz] = useState("");
  const [stepsRu, setStepsRu] = useState("");
  const [stepsKz, setStepsKz] = useState("");
  const [effectRu, setEffectRu] = useState("");
  const [effectKz, setEffectKz] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      setExercises(data || []);
    } catch (error) {
      console.error('Ошибка загрузки упражнений:', error);
      alert("Ошибка загрузки упражнений: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitleRu("");
    setTitleKz("");
    setGoalRu("");
    setGoalKz("");
    setStepsRu("");
    setStepsKz("");
    setEffectRu("");
    setEffectKz("");
    setOrderIndex(0);
  };

  const editExercise = (exercise) => {
    setEditingId(exercise.id);
    setTitleRu(exercise.title_ru || "");
    setTitleKz(exercise.title_kz || "");
    setGoalRu(exercise.goal_ru || "");
    setGoalKz(exercise.goal_kz || "");
    setStepsRu(Array.isArray(exercise.steps_ru) ? exercise.steps_ru.join('\n') : (exercise.steps_ru || ""));
    setStepsKz(Array.isArray(exercise.steps_kz) ? exercise.steps_kz.join('\n') : (exercise.steps_kz || ""));
    setEffectRu(exercise.effect_ru || "");
    setEffectKz(exercise.effect_kz || "");
    setOrderIndex(exercise.order_index || 0);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveExercise = async (e) => {
    e.preventDefault();
    
    if (!titleRu || !titleKz) {
      return alert("Заполните название на русском и казахском языках");
    }

    setAddingExercise(true);
    try {
      // Преобразуем шаги из текста в массив
      const stepsRuArray = stepsRu.split('\n').filter(s => s.trim());
      const stepsKzArray = stepsKz.split('\n').filter(s => s.trim());

      const exerciseData = {
        title_ru: titleRu.trim(),
        title_kz: titleKz.trim(),
        goal_ru: goalRu.trim() || null,
        goal_kz: goalKz.trim() || null,
        steps_ru: stepsRuArray.length > 0 ? stepsRuArray : null,
        steps_kz: stepsKzArray.length > 0 ? stepsKzArray : null,
        effect_ru: effectRu.trim() || null,
        effect_kz: effectKz.trim() || null,
        order_index: orderIndex || 0,
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('exercises')
          .update(exerciseData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('exercises')
          .insert(exerciseData);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      resetForm();
      loadExercises();
      alert(editingId ? "Упражнение обновлено!" : "Упражнение добавлено!");
    } catch (error) {
      alert("Ошибка при сохранении: " + error.message);
      console.error(error);
    } finally {
      setAddingExercise(false);
    }
  };

  const deleteExercise = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить это упражнение?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      loadExercises();
      alert("Упражнение удалено!");
    } catch (error) {
      alert("Ошибка при удалении: " + error.message);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка упражнений...</p>
      </div>
    );
  }

  return (
    <div>
      <section className="admin-section">
        <h2 className="section-title">
          {editingId ? "✏️ Редактировать упражнение" : "➕ Добавить упражнение"}
        </h2>
        <form onSubmit={saveExercise}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="title-ru">Название (Русский) *</label>
              <input
                id="title-ru"
                type="text"
                value={titleRu}
                onChange={e => setTitleRu(e.target.value)}
                placeholder="Метод Pomodoro"
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
                placeholder="Pomodoro әдісі"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="goal-ru">Цель (Русский)</label>
              <textarea
                id="goal-ru"
                value={goalRu}
                onChange={e => setGoalRu(e.target.value)}
                placeholder="Повысить концентрацию и бороться с прокрастинацией"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="goal-kz">Цель (Казахский)</label>
              <textarea
                id="goal-kz"
                value={goalKz}
                onChange={e => setGoalKz(e.target.value)}
                placeholder="Шоғырлануды арттыру және кешіктіруге қарсы күресу"
                rows="2"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="steps-ru">Шаги (Русский) - каждый шаг с новой строки</label>
              <textarea
                id="steps-ru"
                value={stepsRu}
                onChange={e => setStepsRu(e.target.value)}
                placeholder="Поставь таймер на 25 минут...&#10;После — 5 минут перерыва..."
                rows="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="steps-kz">Шаги (Казахский) - каждый шаг с новой строки</label>
              <textarea
                id="steps-kz"
                value={stepsKz}
                onChange={e => setStepsKz(e.target.value)}
                placeholder="Таймерді 25 минутқа қойып..."
                rows="6"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="effect-ru">Эффект (Русский)</label>
              <textarea
                id="effect-ru"
                value={effectRu}
                onChange={e => setEffectRu(e.target.value)}
                placeholder="Работа в ритме снижает тревожность..."
                rows="2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="effect-kz">Эффект (Казахский)</label>
              <textarea
                id="effect-kz"
                value={effectKz}
                onChange={e => setEffectKz(e.target.value)}
                placeholder="Ритмде жұмыс істеу мазасыздықты азайтады..."
                rows="2"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="order-index">Порядок отображения</label>
            <input
              id="order-index"
              type="number"
              value={orderIndex}
              onChange={e => setOrderIndex(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={addingExercise}
          >
            {addingExercise
              ? (editingId ? "Сохранение..." : "Добавление...")
              : (editingId ? "💾 Сохранить изменения" : "➕ Добавить упражнение")}
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
          Все упражнения ({exercises.length})
        </h2>

        {exercises.length === 0 ? (
          <div className="empty-state">
            <p>💪 Пока нет добавленных упражнений</p>
          </div>
        ) : (
          <div className="psychologists-list">
            {exercises.map(exercise => (
              <div key={exercise.id} className="psychologist-item">
                <div className="psychologist-item-header">
                  <div>
                    <h3>{exercise.title_ru}</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>{exercise.title_kz}</p>
                    {exercise.goal_ru && (
                      <p style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>
                        <strong>Цель:</strong> {exercise.goal_ru.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>

                <div className="psychologist-item-content">
                  {exercise.steps_ru && Array.isArray(exercise.steps_ru) && (
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                      <strong>Шаги:</strong>
                      <ol style={{ marginLeft: '20px', marginTop: '5px' }}>
                        {exercise.steps_ru.slice(0, 3).map((step, i) => (
                          <li key={i}>{step.substring(0, 80)}...</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                <div className="psychologist-actions">
                  <button
                    onClick={() => editExercise(exercise)}
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
                    onClick={() => deleteExercise(exercise.id)}
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


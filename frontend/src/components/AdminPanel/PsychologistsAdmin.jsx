import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./PsychologistsAdmin.css";

export default function PsychologistsAdmin() {
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingPsychologist, setAddingPsychologist] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Состояния формы
  const [nameRu, setNameRu] = useState("");
  const [nameKz, setNameKz] = useState("");
  const [positionRu, setPositionRu] = useState("");
  const [positionKz, setPositionKz] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [therapyRu, setTherapyRu] = useState("");
  const [therapyKz, setTherapyKz] = useState("");
  const [aboutRu, setAboutRu] = useState("");
  const [aboutKz, setAboutKz] = useState("");
  const [specializationRu, setSpecializationRu] = useState("");
  const [specializationKz, setSpecializationKz] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Состояния для загрузки изображений
  const [imageMode, setImageMode] = useState("url");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadPsychologists();
  }, []);

  const loadPsychologists = async () => {
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
        .from('psychologists')
        .select('*')
        .order('name_ru', { ascending: true });

      if (error) {
        // Если ошибка JWT, пробуем еще раз после очистки
        if (error.code === 'PGRST303' || error.message?.includes('JWT')) {
          await supabase.auth.signOut();
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.includes('supabase') && key.includes('auth')) {
              localStorage.removeItem(key);
            }
          });
          
          const { data: retryData, error: retryError } = await supabase
            .from('psychologists')
            .select('*')
            .order('name_ru', { ascending: true });
          
          if (retryError) {
            throw retryError;
          }
          
          setPsychologists(retryData || []);
          return;
        }
        throw error;
      }

      setPsychologists(data || []);
    } catch (error) {
      console.error('Ошибка загрузки психологов:', error);
      alert('Ошибка загрузки психологов: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Функция для создания безопасного имени файла
  const getSafeFileName = (originalName) => {
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    
    const transliterate = (str) => {
      const ru = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
      const en = 'abvgdeezziyklmnoprstufhccss_y_eua';
      
      return str.toLowerCase().split('').map(char => {
        const index = ru.indexOf(char);
        return index !== -1 ? en[index] : char;
      }).join('');
    };
    
    const safeName = transliterate(nameWithoutExt)
      .replace(/[^\w.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
    
    const finalName = safeName || 'psychologist';
    return `${finalName}${extension}`;
  };

  // Загрузка изображения в Supabase Storage
  const uploadImage = async (file) => {
    if (!file) {
      throw new Error("Файл не выбран");
    }

    if (!file.type.startsWith('image/')) {
      throw new Error("Пожалуйста, выберите изображение");
    }

    try {
      const timestamp = Date.now();
      const safeFileName = getSafeFileName(file.name);
      const fileName = `psychologists/${timestamp}_${safeFileName}`;

      // Используем тот же bucket, что и для новостей, но в папке psychologists
      const { error } = await supabase.storage
        .from('news-images')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

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

  const resetForm = () => {
    setEditingId(null);
    setNameRu("");
    setNameKz("");
    setPositionRu("");
    setPositionKz("");
    setPhone("");
    setEmail("");
    setTherapyRu("");
    setTherapyKz("");
    setAboutRu("");
    setAboutKz("");
    setSpecializationRu("");
    setSpecializationKz("");
    setIsActive(true);
    setImageUrl("");
    setImageFile(null);
    setUploadedImageUrl("");
    setImageMode("url");
    setUploadProgress(0);
  };

  const editPsychologist = (psychologist) => {
    setEditingId(psychologist.id);
    setNameRu(psychologist.name_ru || "");
    setNameKz(psychologist.name_kz || "");
    setPositionRu(psychologist.position_ru || "");
    setPositionKz(psychologist.position_kz || "");
    setPhone(psychologist.phone || "");
    setEmail(psychologist.email || "");
    setTherapyRu(psychologist.therapy_ru || "");
    setTherapyKz(psychologist.therapy_kz || "");
    setAboutRu(psychologist.about_ru || "");
    setAboutKz(psychologist.about_kz || "");
    setSpecializationRu(psychologist.specialization_ru || "");
    setSpecializationKz(psychologist.specialization_kz || "");
    setIsActive(psychologist.is_active !== false);
    setImageUrl(psychologist.image_url || "");
    setImageFile(null);
    setUploadedImageUrl(psychologist.image_url || "");
    setImageMode("url");
    setUploadProgress(0);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const savePsychologist = async (e) => {
    e.preventDefault();
    
    if (!nameRu || !nameKz) {
      return alert("Заполните имя на русском и казахском языках");
    }

    setAddingPsychologist(true);
    try {
      let finalImageUrl = "";

      if (imageMode === "upload" && imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      } else if (imageMode === "url" && imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
      } else if (editingId && imageUrl) {
        // При редактировании сохраняем существующий URL, если новый не указан
        finalImageUrl = imageUrl;
      }

      const psychologistData = {
        name_ru: nameRu.trim(),
        name_kz: nameKz.trim(),
        position_ru: positionRu.trim() || null,
        position_kz: positionKz.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        therapy_ru: therapyRu.trim() || null,
        therapy_kz: therapyKz.trim() || null,
        about_ru: aboutRu.trim() || null,
        about_kz: aboutKz.trim() || null,
        specialization_ru: specializationRu.trim() || null,
        specialization_kz: specializationKz.trim() || null,
        is_active: isActive,
      };

      if (finalImageUrl) {
        psychologistData.image_url = finalImageUrl;
      }

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('psychologists')
          .update(psychologistData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('psychologists')
          .insert(psychologistData);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      resetForm();
      loadPsychologists();
      alert(editingId ? "✅ Психолог успешно обновлён!" : "✅ Психолог успешно добавлен!");
    } catch (error) {
      alert(`Ошибка при ${editingId ? 'обновлении' : 'добавлении'} психолога: ` + error.message);
      console.error(error);
    } finally {
      setAddingPsychologist(false);
    }
  };

  const deletePsychologist = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этого психолога?")) return;

    try {
      const { error } = await supabase
        .from('psychologists')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      loadPsychologists();
      alert("✅ Психолог успешно удалён!");
    } catch (error) {
      alert("Ошибка при удалении: " + error.message);
      console.error(error);
    }
  };


  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка психологов...</p>
      </div>
    );
  }

  return (
    <div className="psychologists-admin">
      {/* Форма добавления/редактирования */}
      <section className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="section-title">
            {editingId ? '✏️ Редактировать психолога' : '➕ Добавить психолога'}
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

        <div className="add-psychologist-card">
          <form onSubmit={savePsychologist} className="psychologist-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="name-ru">Имя (Русский) *</label>
                <input
                  id="name-ru"
                  type="text"
                  value={nameRu}
                  onChange={e => setNameRu(e.target.value)}
                  placeholder="Иван Иванов"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name-kz">Имя (Казахский) *</label>
                <input
                  id="name-kz"
                  type="text"
                  value={nameKz}
                  onChange={e => setNameKz(e.target.value)}
                  placeholder="Иван Иванов"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="position-ru">Должность (Русский)</label>
                <input
                  id="position-ru"
                  type="text"
                  value={positionRu}
                  onChange={e => setPositionRu(e.target.value)}
                  placeholder="Психолог-консультант"
                />
              </div>

              <div className="form-group">
                <label htmlFor="position-kz">Должность (Казахский)</label>
                <input
                  id="position-kz"
                  type="text"
                  value={positionKz}
                  onChange={e => setPositionKz(e.target.value)}
                  placeholder="Психолог-консультант"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="phone">Телефон</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="therapy-ru">Терапия (Русский)</label>
                <input
                  id="therapy-ru"
                  type="text"
                  value={therapyRu}
                  onChange={e => setTherapyRu(e.target.value)}
                  placeholder="Когнитивно-поведенческая терапия"
                />
              </div>

              <div className="form-group">
                <label htmlFor="therapy-kz">Терапия (Казахский)</label>
                <input
                  id="therapy-kz"
                  type="text"
                  value={therapyKz}
                  onChange={e => setTherapyKz(e.target.value)}
                  placeholder="Когнитивно-поведенческая терапия"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="about-ru">О себе (Русский)</label>
                <textarea
                  id="about-ru"
                  value={aboutRu}
                  onChange={e => setAboutRu(e.target.value)}
                  placeholder="Краткое описание психолога..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="about-kz">О себе (Казахский)</label>
                <textarea
                  id="about-kz"
                  value={aboutKz}
                  onChange={e => setAboutKz(e.target.value)}
                  placeholder="Краткое описание психолога..."
                  rows="4"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="specialization-ru">Специализация (Русский)</label>
                <textarea
                  id="specialization-ru"
                  value={specializationRu}
                  onChange={e => setSpecializationRu(e.target.value)}
                  placeholder="Работа со следующими запросами..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialization-kz">Специализация (Казахский)</label>
                <textarea
                  id="specialization-kz"
                  value={specializationKz}
                  onChange={e => setSpecializationKz(e.target.value)}
                  placeholder="Работа со следующими запросами..."
                  rows="4"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Фотография</label>
              
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
                  }}
                >
                  📤 Загрузить файл
                </button>
              </div>

              {imageMode === "url" && (
                <>
                  <input
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
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Превью"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        marginTop: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </>
              )}

              {imageMode === "upload" && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setImageFile(file);
                      if (file) {
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
                  {uploadedImageUrl && (
                    <img
                      src={uploadedImageUrl}
                      alt="Превью"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        marginTop: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                    />
                  )}
                </>
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500' }}>✅ Активен (отображается на сайте)</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={addingPsychologist}
            >
              {addingPsychologist
                ? (editingId ? "Сохранение..." : "Добавление...")
                : (editingId ? "💾 Сохранить изменения" : "➕ Добавить психолога")}
            </button>
          </form>
        </div>
      </section>

      {/* Список психологов */}
      <section className="admin-section">
        <h2 className="section-title">
          Все психологи ({psychologists.length})
        </h2>

        {psychologists.length === 0 ? (
          <div className="empty-state">
            <p>👥 Пока нет добавленных психологов</p>
          </div>
        ) : (
          <div className="psychologists-list">
            {psychologists.map(psychologist => (
              <div key={psychologist.id} className="psychologist-item">
                <div className="psychologist-item-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {psychologist.image_url && (
                      <img
                        src={psychologist.image_url}
                        alt={psychologist.name_ru}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #ddd'
                        }}
                      />
                    )}
                    <div>
                      <h3>{psychologist.name_ru}</h3>
                      <p style={{ color: '#666', fontSize: '14px' }}>{psychologist.name_kz}</p>
                      {psychologist.position_ru && (
                        <p style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>
                          {psychologist.position_ru}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {psychologist.is_active ? (
                      <span style={{
                        padding: '6px 12px',
                        background: '#4CAF50',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ✅ Активен
                      </span>
                    ) : (
                      <span style={{
                        padding: '6px 12px',
                        background: '#999',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ⏸️ Неактивен
                      </span>
                    )}
                  </div>
                </div>

                <div className="psychologist-item-content">
                  {psychologist.phone && (
                    <p><strong>Телефон:</strong> {psychologist.phone}</p>
                  )}
                  {psychologist.email && (
                    <p><strong>Email:</strong> {psychologist.email}</p>
                  )}
                  {psychologist.about_ru && (
                    <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                      {psychologist.about_ru.substring(0, 150)}...
                    </p>
                  )}
                </div>

                <div className="psychologist-actions">
                  <button
                    onClick={() => editPsychologist(psychologist)}
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
                    onClick={() => deletePsychologist(psychologist.id)}
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


import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./PsychologistsAdmin.css";

export default function AlphabetAdmin() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingTerm, setAddingTerm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Состояния формы
  const [letter, setLetter] = useState("А");
  const [termRu, setTermRu] = useState("");
  const [termKz, setTermKz] = useState("");
  const [image, setImage] = useState("");
  const [definitionRu, setDefinitionRu] = useState("");
  const [definitionKz, setDefinitionKz] = useState("");
  const [fullContentJson, setFullContentJson] = useState("{}");
  const [orderIndex, setOrderIndex] = useState(0);
  const [imageMode, setImageMode] = useState("url"); // "url" или "upload"
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setLoading(true);
      console.log('Загрузка терминов из Supabase...');
      const { data, error } = await supabase
        .from('alphabet_items')
        .select('*')
        .order('letter', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Ошибка Supabase:', error);
        throw error;
      }

      console.log('Загружено терминов:', data?.length || 0);
      
      // Сортировка на клиенте для правильного порядка
      const sortedData = (data || []).sort((a, b) => {
        // Сначала по букве
        if (a.letter !== b.letter) {
          return a.letter.localeCompare(b.letter);
        }
        
        // Затем по order_index (если он задан и > 0)
        const orderA = a.order_index || 0;
        const orderB = b.order_index || 0;
        
        // Если оба имеют order_index > 0, сортируем по нему
        if (orderA > 0 && orderB > 0) {
          return orderA - orderB;
        }
        
        // Если только один имеет order_index > 0, он идет первым
        if (orderA > 0 && orderB === 0) return -1;
        if (orderA === 0 && orderB > 0) return 1;
        
        // Если оба имеют order_index = 0 или одинаковый, сортируем по алфавиту терминов
        const termA = (a.term_ru || '').toLowerCase();
        const termB = (b.term_ru || '').toLowerCase();
        return termA.localeCompare(termB);
      });
      
      setTerms(sortedData);
    } catch (error) {
      console.error('Ошибка загрузки терминов:', error);
      alert("Ошибка загрузки терминов: " + error.message);
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
    
    const finalName = safeName || 'alphabet';
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
      setUploadProgress(10);
      const timestamp = Date.now();
      const safeFileName = getSafeFileName(file.name);
      const fileName = `alphabet/${timestamp}_${safeFileName}`;

      setUploadProgress(30);
      
      // Используем тот же bucket, что и для новостей, но в папке alphabet
      // Используем upsert: true, чтобы перезаписывать файлы с одинаковым именем
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Ошибка загрузки в Storage:", uploadError);
        // Если файл уже существует, попробуем получить его URL
        if (uploadError.message && uploadError.message.includes('already exists')) {
          console.log("Файл уже существует, получаем URL...");
        } else {
          throw uploadError;
        }
      }

      setUploadProgress(70);

      // Получаем публичный URL
      const pathToUse = uploadData?.path || fileName;
      console.log("Путь к файлу:", pathToUse);
      
      const { data: publicUrlData } = supabase.storage
        .from('news-images')
        .getPublicUrl(pathToUse);

      setUploadProgress(90);
      
      let finalUrl = publicUrlData?.publicUrl;
      
      // Если не получили URL через getPublicUrl, формируем вручную
      if (!finalUrl) {
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mzmouzcbmyhktvowrztm.supabase.co';
        finalUrl = `${supabaseUrl}/storage/v1/object/public/news-images/${pathToUse}`;
        console.log("Используем ручной URL:", finalUrl);
      }

      console.log("Изображение успешно загружено, финальный URL:", finalUrl);
      
      // Проверяем, что URL валидный
      if (!finalUrl || !finalUrl.startsWith('http')) {
        throw new Error("Не удалось получить валидный URL для изображения");
      }
      
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
      return finalUrl;
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      setUploadProgress(0);
      throw error;
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setLetter("А");
    setTermRu("");
    setTermKz("");
    setImage("");
    setDefinitionRu("");
    setDefinitionKz("");
    setFullContentJson("{}");
    setOrderIndex(0);
    setImageUrl("");
    setImageFile(null);
    setUploadedImageUrl("");
    setImageMode("url");
    setUploadProgress(0);
  };

  const editTerm = (term) => {
    setEditingId(term.id);
    setLetter(term.letter || "А");
    setTermRu(term.term_ru || "");
    setTermKz(term.term_kz || "");
    setImage(term.image || "");
    setDefinitionRu(term.definition_ru || "");
    setDefinitionKz(term.definition_kz || "");
    setFullContentJson(term.full_content ? JSON.stringify(term.full_content, null, 2) : "{}");
    setOrderIndex(term.order_index || 0);
    setImageUrl(term.image || "");
    setImageFile(null);
    setUploadedImageUrl(term.image || "");
    setImageMode(term.image && term.image.startsWith('http') ? "url" : "upload");
    setUploadProgress(0);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveTerm = async (e) => {
    e.preventDefault();
    
    if (!termRu || !termKz || !letter) {
      return alert("Заполните термин на обоих языках и букву");
    }

    setAddingTerm(true);
    try {
      // Определяем URL изображения в зависимости от режима
      let finalImageUrl = "";
      if (imageMode === "upload" && imageFile) {
        // Загружаем файл в Supabase Storage
        console.log("Загрузка изображения...");
        finalImageUrl = await uploadImage(imageFile);
        console.log("Изображение загружено, URL:", finalImageUrl);
      } else if (imageMode === "url" && imageUrl.trim()) {
        // Используем введенный URL
        finalImageUrl = imageUrl.trim();
      } else if (imageMode === "url" && image.trim()) {
        // Используем старое поле image (для обратной совместимости)
        finalImageUrl = image.trim();
      } else if (uploadedImageUrl && uploadedImageUrl.startsWith('http')) {
        // Если есть уже загруженное изображение (при редактировании)
        finalImageUrl = uploadedImageUrl;
      }

      // Парсим JSON для fullContent
      let fullContent = {};
      try {
        fullContent = JSON.parse(fullContentJson);
      } catch (e) {
        console.warn("Ошибка парсинга fullContent, сохраняем как пустой объект");
        fullContent = {};
      }

      const termData = {
        letter: letter.toUpperCase(),
        term_ru: termRu.trim(),
        term_kz: termKz.trim(),
        image: finalImageUrl || null,
        definition_ru: definitionRu.trim() || null,
        definition_kz: definitionKz.trim() || null,
        full_content: fullContent,
        order_index: orderIndex || 0,
      };

      console.log("Сохранение термина с данными:", termData);
      console.log("URL изображения:", termData.image);
      
      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('alphabet_items')
          .update(termData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('alphabet_items')
          .insert(termData);
        error = insertError;
      }

      if (error) {
        console.error("Ошибка сохранения в БД:", error);
        throw error;
      }

      console.log("Термин успешно сохранен!");
      resetForm();
      loadTerms();
      alert(editingId ? "Термин обновлен!" : "Термин добавлен!");
    } catch (error) {
      alert("Ошибка при сохранении: " + error.message);
      console.error(error);
    } finally {
      setAddingTerm(false);
    }
  };

  const deleteTerm = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот термин?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('alphabet_items')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      loadTerms();
      alert("Термин удален!");
    } catch (error) {
      alert("Ошибка при удалении: " + error.message);
      console.error(error);
    }
  };

  // Фильтрация терминов по поисковому запросу
  const filteredTerms = terms.filter(term => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      term.term_ru?.toLowerCase().includes(query) ||
      term.term_kz?.toLowerCase().includes(query) ||
      term.letter?.toLowerCase().includes(query) ||
      term.definition_ru?.toLowerCase().includes(query) ||
      term.definition_kz?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка терминов...</p>
      </div>
    );
  }

  return (
    <div>
      <section className="admin-section">
        <h2 className="section-title">
          {editingId ? "✏️ Редактировать термин" : "➕ Добавить термин"}
        </h2>
        <form onSubmit={saveTerm}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="letter">Буква *</label>
              <input
                id="letter"
                type="text"
                value={letter}
                onChange={e => setLetter(e.target.value.toUpperCase())}
                placeholder="А"
                maxLength="1"
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="term-ru">Термин (Русский) *</label>
              <input
                id="term-ru"
                type="text"
                value={termRu}
                onChange={e => setTermRu(e.target.value)}
                placeholder="Азартные игры"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="term-kz">Термин (Казахский) *</label>
              <input
                id="term-kz"
                type="text"
                value={termKz}
                onChange={e => setTermKz(e.target.value)}
                placeholder="Азартты ойындар"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="image-mode">Режим изображения</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setImageMode("url")}
                style={{
                  padding: '8px 16px',
                  background: imageMode === "url" ? '#667eea' : '#f0f0f0',
                  color: imageMode === "url" ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                🔗 URL
              </button>
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                style={{
                  padding: '8px 16px',
                  background: imageMode === "upload" ? '#667eea' : '#f0f0f0',
                  color: imageMode === "upload" ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
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
                  id="image-url"
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg или /images/image.jpg"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <p className="field-hint" style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                  💡 Можно загрузить на <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer">Imgur</a> или использовать путь к файлу
                </p>
              </>
            )}

            {/* Поле загрузки файла */}
            {imageMode === "upload" && (
              <>
                <input
                  id="image-file"
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
                  📁 Выберите изображение с вашего компьютера (JPG, PNG, GIF). Изображение будет загружено в Supabase Storage.
                </p>

                {/* Индикатор прогресса загрузки */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        backgroundColor: '#667eea',
                        transition: 'width 0.3s ease',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                    <p style={{ marginTop: '5px', fontSize: '12px', color: '#667eea', textAlign: 'center' }}>
                      Загрузка: {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Превью изображения */}
                {uploadedImageUrl && (
                  <div style={{ marginTop: '15px' }}>
                    <img
                      src={uploadedImageUrl}
                      alt="Превью"
                      style={{
                        maxWidth: '300px',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        console.error("Ошибка загрузки изображения:", uploadedImageUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                    {uploadedImageUrl.startsWith('http') && (
                      <p style={{ marginTop: '5px', fontSize: '12px', color: '#4caf50' }}>
                        ✅ Изображение готово к сохранению
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="definition-ru">Определение (Русский)</label>
              <textarea
                id="definition-ru"
                value={definitionRu}
                onChange={e => setDefinitionRu(e.target.value)}
                placeholder="Деятельность, основанная на риске..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="definition-kz">Определение (Казахский)</label>
              <textarea
                id="definition-kz"
                value={definitionKz}
                onChange={e => setDefinitionKz(e.target.value)}
                placeholder="Тәуекелге және жеңіске ұмтылысқа негізделген қызмет..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="full-content">Полное содержание (JSON)</label>
            <textarea
              id="full-content"
              value={fullContentJson}
              onChange={e => setFullContentJson(e.target.value)}
              placeholder='{"ru": {"description": "...", "example": "...", "explanation": "...", "symptoms": [...], "advice": [...]}, "kz": {...}}'
              rows="15"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <p className="field-hint">
              💡 Полное содержание в формате JSON. Можно оставить пустым объектом {} и заполнить позже.
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="order-index">Порядок отображения</label>
            <input
              id="order-index"
              type="number"
              value={orderIndex}
              onChange={e => setOrderIndex(parseInt(e.target.value) || 0)}
              min="0"
              placeholder="0"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <div style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#f0f7ff',
              border: '1px solid #b3d9ff',
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              <strong>📋 Как это работает:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li><strong>0</strong> = автоматический порядок (по алфавиту терминов)</li>
                <li><strong>1, 2, 3...</strong> = ручной порядок (меньше число = выше в списке)</li>
                <li>Термины с числами всегда идут перед терминами с 0</li>
              </ul>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                <strong>Пример:</strong> Если у буквы "П" есть термины с порядком 1, 5, 10, 0, 0 - 
                они отобразятся как: 1 → 5 → 10 → (остальные по алфавиту)
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={addingTerm}
          >
            {addingTerm
              ? (editingId ? "Сохранение..." : "Добавление...")
              : (editingId ? "💾 Сохранить изменения" : "➕ Добавить термин")}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            Все термины ({filteredTerms.length} {searchQuery ? `из ${terms.length}` : ''})
          </h2>
          <div style={{ position: 'relative', minWidth: '300px', flex: '1', maxWidth: '500px' }}>
            <input
              type="text"
              placeholder="🔍 Поиск по терминам, буквам, определениям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 15px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#999',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Очистить поиск"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {terms.length === 0 ? (
          <div className="empty-state">
            <p>📚 Пока нет добавленных терминов</p>
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="empty-state">
            <p>🔍 По запросу "{searchQuery}" ничего не найдено</p>
            <button
              onClick={() => setSearchQuery("")}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Очистить поиск
            </button>
          </div>
        ) : (
          <div className="psychologists-list">
            {filteredTerms.map(term => (
              <div key={term.id} className="psychologist-item">
                <div className="psychologist-item-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                      {term.letter}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <h3 style={{ margin: 0 }}>{term.term_ru}</h3>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: term.order_index > 0 ? '#e3f2fd' : '#f5f5f5',
                          color: term.order_index > 0 ? '#1976d2' : '#666',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          border: `1px solid ${term.order_index > 0 ? '#90caf9' : '#ddd'}`
                        }}>
                          Порядок: {term.order_index || 0}
                        </span>
                      </div>
                      <p style={{ color: '#666', fontSize: '14px' }}>{term.term_kz}</p>
                      {term.definition_ru && (
                        <p style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>
                          {term.definition_ru.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="psychologist-item-content">
                  {term.image && (
                    <p style={{ marginTop: '10px', fontSize: '14px' }}>
                      <strong>Изображение:</strong> {term.image}
                    </p>
                  )}
                </div>

                <div className="psychologist-actions">
                  <button
                    onClick={() => editTerm(term)}
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
                    onClick={() => deleteTerm(term.id)}
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


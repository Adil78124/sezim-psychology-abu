import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useContacts } from "../../context/ContactsContext";
import "./AdminPanel.css";

export default function ContactsAdmin() {
  const { refreshContacts } = useContacts();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  // Состояния формы
  const [addressRu, setAddressRu] = useState("");
  const [addressKz, setAddressKz] = useState("");
  const [buildingRu, setBuildingRu] = useState("");
  const [buildingKz, setBuildingKz] = useState("");
  const [phoneMain, setPhoneMain] = useState("");
  const [phoneTrust1307, setPhoneTrust1307] = useState("");
  const [phoneTrust111, setPhoneTrust111] = useState("");
  const [socialInstagramUrl, setSocialInstagramUrl] = useState("");
  const [socialInstagramHandle, setSocialInstagramHandle] = useState("");
  const [workingHoursRu, setWorkingHoursRu] = useState("");
  const [workingHoursKz, setWorkingHoursKz] = useState("");
  const [workingDaysOffRu, setWorkingDaysOffRu] = useState("");
  const [workingDaysOffKz, setWorkingDaysOffKz] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
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
        .from('contacts')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        // Если записи нет, создаем с дефолтными значениями
        if (error.code === 'PGRST116') {
          await createDefaultContacts();
          return;
        }
        
        // Если ошибка JWT, пробуем еще раз
        if (error.code === 'PGRST303' || error.message?.includes('JWT')) {
          await supabase.auth.signOut();
          const { data: retryData, error: retryError } = await supabase
            .from('contacts')
            .select('*')
            .limit(1)
            .single();
          
          if (retryError && retryError.code !== 'PGRST116') {
            throw retryError;
          }
          
          if (retryData) {
            populateForm(retryData);
            return;
          }
        } else {
          throw error;
        }
      } else if (data) {
        populateForm(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки контактов:', error);
      setMessage(`❌ Ошибка загрузки: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultContacts = async () => {
    try {
      const defaultData = {
        address_ru: 'Область Абай, город Семей, улица Шмидта 44',
        address_kz: 'Абай облысы, Семей қаласы, Шмидт көшесі 44',
        building_ru: '3 корпус Alikhan Bokeikhan University, 14 кабинет',
        building_kz: 'Alikhan Bokeikhan University 3 корпус, 14 кабинет',
        phone_main: '8 (777) 285-21-33',
        phone_trust_1307: '1307',
        phone_trust_111: '111',
        social_instagram_url: 'https://www.instagram.com/pp_gumfac_bokeikhan?igsh=ZmN1cnhqMnl5ZGoy',
        social_instagram_handle: '@pp_gumfac_bokeikhan',
        working_hours_ru: 'Вторник-Четверг: 10:00-16:00',
        working_hours_kz: 'Сейсенбі-Бейсенбі: 10:00-16:00',
        working_days_off_ru: 'Выходные: суббота, воскресенье',
        working_days_off_kz: 'Демалыс: сенбі, жексенбі',
        google_maps_url: 'https://www.google.com/maps?q=ул.+Шмидта,+44,+Семей,+Абайская+область,+Казахстан&output=embed&hl=ru&z=17'
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([defaultData])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        populateForm(data);
      }
    } catch (error) {
      console.error('Ошибка создания контактов:', error);
      setMessage(`❌ Ошибка создания: ${error.message}`);
    }
  };

  const populateForm = (data) => {
    setAddressRu(data.address_ru || "");
    setAddressKz(data.address_kz || "");
    setBuildingRu(data.building_ru || "");
    setBuildingKz(data.building_kz || "");
    setPhoneMain(data.phone_main || "");
    setPhoneTrust1307(data.phone_trust_1307 || "");
    setPhoneTrust111(data.phone_trust_111 || "");
    setSocialInstagramUrl(data.social_instagram_url || "");
    setSocialInstagramHandle(data.social_instagram_handle || "");
    setWorkingHoursRu(data.working_hours_ru || "");
    setWorkingHoursKz(data.working_hours_kz || "");
    setWorkingDaysOffRu(data.working_days_off_ru || "");
    setWorkingDaysOffKz(data.working_days_off_kz || "");
    setGoogleMapsUrl(data.google_maps_url || "");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setMessage("");

      // Сначала проверяем, есть ли запись
      const { data: existingData } = await supabase
        .from('contacts')
        .select('id')
        .limit(1)
        .single();

      const updateData = {
        address_ru: addressRu,
        address_kz: addressKz,
        building_ru: buildingRu,
        building_kz: buildingKz,
        phone_main: phoneMain,
        phone_trust_1307: phoneTrust1307,
        phone_trust_111: phoneTrust111,
        social_instagram_url: socialInstagramUrl,
        social_instagram_handle: socialInstagramHandle,
        working_hours_ru: workingHoursRu,
        working_hours_kz: workingHoursKz,
        working_days_off_ru: workingDaysOffRu,
        working_days_off_kz: workingDaysOffKz,
        google_maps_url: googleMapsUrl,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingData) {
        // Обновляем существующую запись
        const { data, error } = await supabase
          .from('contacts')
          .update(updateData)
          .eq('id', existingData.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Создаем новую запись
        const { data, error } = await supabase
          .from('contacts')
          .insert([updateData])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      setMessage("✅ Контактная информация успешно сохранена!");
      
      // Обновляем глобальный контекст контактов, чтобы изменения сразу отобразились везде
      await refreshContacts();
      
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setMessage(`❌ Ошибка сохранения: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-section">
        <h2>Управление контактами</h2>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h2>Управление контактами</h2>
      <p className="field-hint">
        Редактируйте контактную информацию, которая отображается на странице "Контакты"
      </p>

      {message && (
        <div className={`status-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="admin-form">
        {/* Адрес */}
        <div className="form-section">
          <h3>📍 Адрес</h3>
          
          <div className="form-group">
            <label>Адрес (русский) *</label>
            <input
              type="text"
              value={addressRu}
              onChange={(e) => setAddressRu(e.target.value)}
              placeholder="Область Абай, город Семей, улица Шмидта 44"
              required
            />
          </div>

          <div className="form-group">
            <label>Адрес (казахский) *</label>
            <input
              type="text"
              value={addressKz}
              onChange={(e) => setAddressKz(e.target.value)}
              placeholder="Абай облысы, Семей қаласы, Шмидт көшесі 44"
              required
            />
          </div>

          <div className="form-group">
            <label>Здание/Корпус (русский) *</label>
            <input
              type="text"
              value={buildingRu}
              onChange={(e) => setBuildingRu(e.target.value)}
              placeholder="3 корпус Alikhan Bokeikhan University, 14 кабинет"
              required
            />
          </div>

          <div className="form-group">
            <label>Здание/Корпус (казахский) *</label>
            <input
              type="text"
              value={buildingKz}
              onChange={(e) => setBuildingKz(e.target.value)}
              placeholder="Alikhan Bokeikhan University 3 корпус, 14 кабинет"
              required
            />
          </div>
        </div>

        {/* Телефоны */}
        <div className="form-section">
          <h3>📞 Телефоны</h3>
          
          <div className="form-group">
            <label>Основной телефон *</label>
            <input
              type="text"
              value={phoneMain}
              onChange={(e) => setPhoneMain(e.target.value)}
              placeholder="8 (777) 285-21-33"
              required
            />
          </div>

          <div className="form-group">
            <label>Телефон доверия 1307 *</label>
            <input
              type="text"
              value={phoneTrust1307}
              onChange={(e) => setPhoneTrust1307(e.target.value)}
              placeholder="1307"
              required
            />
          </div>

          <div className="form-group">
            <label>Телефон доверия 111 *</label>
            <input
              type="text"
              value={phoneTrust111}
              onChange={(e) => setPhoneTrust111(e.target.value)}
              placeholder="111"
              required
            />
          </div>
        </div>

        {/* Социальные сети */}
        <div className="form-section">
          <h3>📱 Социальные сети</h3>
          
          <div className="form-group">
            <label>Instagram URL *</label>
            <input
              type="url"
              value={socialInstagramUrl}
              onChange={(e) => setSocialInstagramUrl(e.target.value)}
              placeholder="https://www.instagram.com/username"
              required
            />
          </div>

          <div className="form-group">
            <label>Instagram Handle *</label>
            <input
              type="text"
              value={socialInstagramHandle}
              onChange={(e) => setSocialInstagramHandle(e.target.value)}
              placeholder="@username"
              required
            />
          </div>
        </div>

        {/* Режим работы */}
        <div className="form-section">
          <h3>⏰ Режим работы</h3>
          
          <div className="form-group">
            <label>Режим работы (русский) *</label>
            <input
              type="text"
              value={workingHoursRu}
              onChange={(e) => setWorkingHoursRu(e.target.value)}
              placeholder="Вторник-Четверг: 10:00-16:00"
              required
            />
          </div>

          <div className="form-group">
            <label>Режим работы (казахский) *</label>
            <input
              type="text"
              value={workingHoursKz}
              onChange={(e) => setWorkingHoursKz(e.target.value)}
              placeholder="Сейсенбі-Бейсенбі: 10:00-16:00"
              required
            />
          </div>

          <div className="form-group">
            <label>Выходные (русский) *</label>
            <input
              type="text"
              value={workingDaysOffRu}
              onChange={(e) => setWorkingDaysOffRu(e.target.value)}
              placeholder="Выходные: суббота, воскресенье"
              required
            />
          </div>

          <div className="form-group">
            <label>Выходные (казахский) *</label>
            <input
              type="text"
              value={workingDaysOffKz}
              onChange={(e) => setWorkingDaysOffKz(e.target.value)}
              placeholder="Демалыс: сенбі, жексенбі"
              required
            />
          </div>
        </div>

        {/* Google Maps */}
        <div className="form-section">
          <h3>🗺️ Карта</h3>
          
          <div className="form-group">
            <label>Google Maps Embed URL *</label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://www.google.com/maps?q=..."
              required
            />
            <p className="field-hint">
              Получите embed URL из Google Maps: Поделиться → Встроить карту
            </p>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Сохранение..." : "💾 Сохранить контакты"}
        </button>
      </form>
    </div>
  );
}

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const ContactsContext = createContext();

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts must be used within ContactsProvider');
  }
  return context;
};

export const ContactsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState({
    addressRu: 'Область Абай, город Семей, улица Шмидта 44',
    addressKz: 'Абай облысы, Семей қаласы, Шмидт көшесі 44',
    buildingRu: '3 корпус Alikhan Bokeikhan University, 14 кабинет',
    buildingKz: 'Alikhan Bokeikhan University 3 корпус, 14 кабинет',
    phoneMain: '8 (777) 285-21-33',
    phoneTrust1307: '1307',
    phoneTrust111: '111',
    socialInstagramUrl: 'https://www.instagram.com/pp_gumfac_bokeikhan?igsh=ZmN1cnhqMnl5ZGoy',
    socialInstagramHandle: '@pp_gumfac_bokeikhan',
    workingHoursRu: 'Вторник-Четверг: 10:00-16:00',
    workingHoursKz: 'Сейсенбі-Бейсенбі: 10:00-16:00',
    workingDaysOffRu: 'Выходные: суббота, воскресенье',
    workingDaysOffKz: 'Демалыс: сенбі, жексенбі',
    googleMapsUrl: 'https://www.google.com/maps?q=ул.+Шмидта,+44,+Семей,+Абайская+область,+Казахстан&output=embed&hl=ru&z=17'
  });

  const updateContactInfo = useCallback((data) => {
    setContactInfo(prev => ({
      addressRu: data.address_ru || prev.addressRu,
      addressKz: data.address_kz || prev.addressKz,
      buildingRu: data.building_ru || prev.buildingRu,
      buildingKz: data.building_kz || prev.buildingKz,
      phoneMain: data.phone_main || prev.phoneMain,
      phoneTrust1307: data.phone_trust_1307 || prev.phoneTrust1307,
      phoneTrust111: data.phone_trust_111 || prev.phoneTrust111,
      socialInstagramUrl: data.social_instagram_url || prev.socialInstagramUrl,
      socialInstagramHandle: data.social_instagram_handle || prev.socialInstagramHandle,
      workingHoursRu: data.working_hours_ru || prev.workingHoursRu,
      workingHoursKz: data.working_hours_kz || prev.workingHoursKz,
      workingDaysOffRu: data.working_days_off_ru || prev.workingDaysOffRu,
      workingDaysOffKz: data.working_days_off_kz || prev.workingDaysOffKz,
      googleMapsUrl: data.google_maps_url || prev.googleMapsUrl
    }));
  }, []);

  const loadContacts = useCallback(async () => {
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
        // Если записи нет, используем дефолтные значения
        if (error.code === 'PGRST116') {
          console.log('Контакты не найдены, используются значения по умолчанию');
          setLoading(false);
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
            console.error('Ошибка загрузки контактов:', retryError);
            setLoading(false);
            return;
          }
          
          if (retryData) {
            updateContactInfo(retryData);
          }
          setLoading(false);
          return;
        }
        
        console.error('Ошибка загрузки контактов:', error);
        setLoading(false);
        return;
      }
      
      if (data) {
        updateContactInfo(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки контактов:', error);
    } finally {
      setLoading(false);
    }
  }, [updateContactInfo]);

  const refreshContacts = async () => {
    await loadContacts();
  };

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  return (
    <ContactsContext.Provider value={{ contactInfo, loading, refreshContacts }}>
      {children}
    </ContactsContext.Provider>
  );
};

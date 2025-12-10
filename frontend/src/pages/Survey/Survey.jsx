import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // Removed unused import
import { useLanguage } from '../../context/LanguageContext';
// import { openWhatsAppForGeneralAppointment } from '../../utils/whatsapp'; // Removed unused import
import { initScrollAnimations } from '../../utils/animations';
import TestModal from '../../components/TestModal/TestModal';
import { supabase } from '../../supabaseClient';
// import { testsData } from '../../data/testsData'; // Removed unused import
import './Survey.css';

const Survey = () => {
  const { t } = useLanguage(); // Removed unused language variable
  const [activeTest, setActiveTest] = useState(null);
  
  // Fallback данные, если таблица пуста или недоступна
  const defaultTests = [
    {
      id: 'adaptation',
      icon: '🎓',
      title: { ru: 'Тест адаптации к студенчеству (ТАС)', kz: 'Студенттікке бейімделу тесті (ТАС)' },
      description: {
        ru: 'Выявление уровня социальной, учебной и психологической адаптации первокурсников к условиям вузовской среды',
        kz: 'Бірінші курс студенттерінің жоғары оқу орнының жағдайларына әлеуметтік, оқу және психологиялық бейімделу деңгейін анықтау',
      },
      duration: '15',
      questions: '40',
      externalLink: 'https://psytests.org/work/asvvuz.html',
    },
    {
      id: 'burnout',
      icon: '💪',
      title: { ru: 'Диагностика эмоционального выгорания (В.В. Бойко)', kz: 'Эмоционалды өртенуді диагностикалау (В.В. Бойко)' },
      description: {
        ru: 'Определение признаков эмоционального истощения, особенно у старшекурсников и студентов с высокой нагрузкой',
        kz: 'Эмоционалды шаршау белгілерін анықтау, әсіресе жоғары курс студенттері мен жоғары жүктемесі бар студенттерде',
      },
      duration: '20',
      questions: '84',
      externalLink: 'https://psytests.org/boyko/boburn.html',
    },
    {
      id: 'anxiety',
      icon: '😊',
      title: { ru: 'Опросник тревожности Спилбергера-Ханина', kz: 'Спилбергер-Ханин мазасыздық сауалнамасы' },
      description: {
        ru: 'Диагностика уровня тревожности студента в данный момент (ситуативной) и в целом (личностной)',
        kz: 'Студенттің қазіргі сәттегі (жағдайлық) және жалпы (жеке) мазасыздық деңгейін диагностикалау',
      },
      duration: '10',
      questions: '40',
      externalLink: 'https://psytests.org/anxiety/stai-run.html',
    },
    {
      id: 'self-esteem',
      icon: '🎯',
      title: { ru: 'Методика Дембо-Рубинштейн (самооценка)', kz: 'Дембо-Рубинштейн әдісі (өзін-өзі бағалау)' },
      description: {
        ru: 'Оценка уровня и адекватности самооценки студента по различным параметрам личности',
        kz: 'Тұлғаның әртүрлі параметрлері бойынша студенттің өзін-өзі бағалау деңгейі мен дұрыстығын бағалау',
      },
      duration: '10',
      questions: '7',
      externalLink: 'https://psytests.org/trait/demborp.html',
    },
    {
      id: 'coping',
      icon: '🛡️',
      title: { ru: 'Стратегии совладания (Лазарус и Фолькман)', kz: 'Күресу стратегиялары (Лазарус және Фолькман)' },
      description: {
        ru: 'Выявление предпочтительных стратегий преодоления трудных жизненных ситуаций',
        kz: 'Қиын өмірлік жағдайларды жеңудің басым стратегияларын анықтау',
      },
      duration: '15',
      questions: '50',
      externalLink: 'https://psytests.org/coping/wcq-run.html',
    },
    {
      id: 'motivation',
      icon: '📚',
      title: { ru: 'Опросник мотивации учения (Т.И. Ильина)', kz: 'Оқу мотивациясы сауалнамасы (Т.И. Ильина)' },
      description: {
        ru: 'Определение ведущих мотивов учебной деятельности студентов',
        kz: 'Студенттердің оқу қызметінің жетекші мотивтерін анықтау',
      },
      duration: '10',
      questions: '50',
      externalLink: 'https://psytests.org/emvol/ilmov.html',
    },
    {
      id: 'depression',
      icon: '🌧️',
      title: { ru: 'Шкала депрессии Бека (BDI)', kz: 'Бек депрессия шкаласы (BDI)' },
      description: {
        ru: 'Выявление признаков депрессии и определение степени её выраженности',
        kz: 'Депрессия белгілерін анықтау және оның көрінісінің дәрежесін анықтау',
      },
      duration: '10',
      questions: '21',
      externalLink: 'https://psytests.org/depr/bdi-run.html',
    },
  ];

  const [tests, setTests] = useState(defaultTests); // Инициализируем с fallback данными
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const observer = initScrollAnimations();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('surveys')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Ошибка Supabase:', error);
          // Если таблица не существует или другая ошибка - используем fallback
          setTests(defaultTests);
          setLoading(false);
          return;
        }

        // Преобразуем данные из Supabase в формат компонента
        const formattedTests = (data || []).map(survey => {
          // Проверяем, что обязательные поля есть
          if (!survey.title_ru || !survey.title_kz) {
            console.warn('Пропущен тест с неполными данными:', survey);
            return null;
          }
          return {
            id: survey.id || `test-${Math.random()}`,
            icon: survey.icon || '📝',
            title: { ru: survey.title_ru, kz: survey.title_kz },
            description: { ru: survey.description_ru || '', kz: survey.description_kz || '' },
            duration: survey.duration?.toString() || '10',
            questions: survey.questions?.toString() || '10',
            externalLink: survey.external_link || null,
          };
        }).filter(Boolean); // Удаляем null значения

        // Если данных нет, используем fallback
        if (formattedTests.length === 0) {
          console.warn('Таблица surveys пуста, используем fallback данные');
          setTests(defaultTests);
        } else {
          setTests(formattedTests);
        }
      } catch (error) {
        console.error('Ошибка загрузки тестов:', error);
        // Fallback на статические данные при ошибке
        console.warn('Используем fallback данные из-за ошибки загрузки');
        setTests(defaultTests);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTest = (testId) => {
    setActiveTest(testId);
  };

  const closeTest = () => {
    setActiveTest(null);
  };

  return (
    <div className="survey-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>{t({ ru: 'Психологические тесты', kz: 'Психологиялық тесттер' })}</h1>
          <p style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '1rem' }}>
            {t({
              ru: 'Понять себя - первый шаг к внутреннему балансу',
              kz: 'Өзін түсіну - ішкі тепе-теңдікке бірінші қадам',
            })}
          </p>
          <p>
            {t({
              ru: 'Этот раздел - для тех, кто хочет разобраться в себе, своих эмоциях, мотивации и способах преодоления стресса. Это не экзамен и не приговор. Просто честный разговор с самим собой — в удобном и безопасном формате.',
              kz: 'Бұл бөлім өзін, эмоцияларын, мотивациясын және стрессті жеңу жолдарын түсінгісі келетіндерге арналған. Бұл емтихан да, үкім де емес. Тек өзіңізбен ыңғайлы және қауіпсіз форматта шынайы әңгіме.',
            })}
          </p>
        </div>
      </section>

      {/* Tests List */}
      <section className="tests">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>{t({ ru: 'Загрузка...', kz: 'Жүктелуде...' })}</p>
            </div>
          ) : tests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>{t({ ru: 'Пока нет доступных тестов', kz: 'Қолжетімді тесттер жоқ' })}</p>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                Debug: tests.length = {tests.length}
              </p>
            </div>
          ) : (
            <div className="tests-grid">
              {tests.map((test, index) => (
              <div 
                key={test.id} 
                className="test-card animate-on-scroll animated"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="test-icon">{test.icon}</div>
                <h3>{t(test.title)}</h3>
                <p>{t(test.description)}</p>
                <div className="test-meta">
                  <span>⏱ {test.duration} мин</span>
                  <span>
                    📝 {test.questions} {t({ ru: 'вопросов', kz: 'сұрақ' })}
                  </span>
                </div>
                {test.externalLink ? (
                  <a 
                    href={test.externalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    {t({ ru: 'Пройти тест', kz: 'Тестілеуден өту' })} →
                  </a>
                ) : (
                  <button className="btn btn-primary" onClick={() => startTest(test.id)}>
                    {t({ ru: 'Пройти тест', kz: 'Тестілеуден өту' })}
                  </button>
                )}
              </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Test Modal */}
      {activeTest && <TestModal testId={activeTest} onClose={closeTest} />}
    </div>
  );
};

export default Survey;


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { openWhatsAppForGeneralAppointment } from '../../utils/whatsapp';
import { testsData } from '../../data/testsData';
import './TestModal.css';

const TestModal = ({ testId, onClose }) => {
  const { t, language } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  const testData = testsData[testId];

  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!testData) return null;

  const currentQuestion = testData.questions[currentQuestionIndex];
  const totalQuestions = testData.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (score) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = score;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[currentQuestionIndex] === undefined) {
      alert(t({ ru: 'Пожалуйста, выберите ответ', kz: 'Жауапты таңдаңыз' }));
      return;
    }
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (answers[currentQuestionIndex] === undefined) {
      alert(t({ ru: 'Пожалуйста, выберите ответ', kz: 'Жауапты таңдаңыз' }));
      return;
    }

    const totalScore = answers.reduce((sum, score) => sum + score, 0);
    const testResult = testData.results.find((r) => totalScore >= r.min && totalScore <= r.max);

    setResult({ score: totalScore, data: testResult });
    setShowResult(true);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="test-modal active" onClick={handleOverlayClick}>
      <div className="modal-overlay"></div>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">
          &times;
        </button>

        {!showResult ? (
          <div className="test-container">
            <div className="test-header">
              <h2>{t(testData.title)}</h2>
              <div className="test-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="progress-text">
                  {language === 'ru'
                    ? `Вопрос ${currentQuestionIndex + 1} из ${totalQuestions}`
                    : `${currentQuestionIndex + 1} сұрақ, барлығы ${totalQuestions}`}
                </span>
              </div>
            </div>

            <div className="test-body">
              <div className="question active">
                <h3>{t(currentQuestion)}</h3>
                <div className="answers">
                  {currentQuestion.answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`answer-option ${
                        answers[currentQuestionIndex] === answer.score ? 'selected' : ''
                      }`}
                      onClick={() => handleAnswerSelect(answer.score)}
                    >
                      <input
                        type="radio"
                        id={`answer-${index}`}
                        name="answer"
                        value={answer.score}
                        checked={answers[currentQuestionIndex] === answer.score}
                        onChange={() => handleAnswerSelect(answer.score)}
                      />
                      <label htmlFor={`answer-${index}`}>{t(answer)}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="test-navigation">
              {currentQuestionIndex > 0 && (
                <button className="btn btn-secondary" onClick={handlePrevious}>
                  {t({ ru: 'Назад', kz: 'Артқа' })}
                </button>
              )}
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button className="btn btn-primary" onClick={handleNext}>
                  {t({ ru: 'Далее', kz: 'Келесі' })}
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit}>
                  {t({ ru: 'Завершить тест', kz: 'Тестілеуді аяқтау' })}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="test-result">
            <div className="result-header">
              <div className="result-icon">{testData.resultIcon || '📊'}</div>
              <h2 className="result-title">{language === 'ru' ? result.data.ru.title : result.data.kz.title}</h2>
              <div className="result-score-badge">
                <span className="score-label">{t({ ru: 'Ваш балл:', kz: 'Сіздің балыңыз:' })}</span>
                <span className="score-value">{result.score} / {testData.maxScore || (totalQuestions * 4)}</span>
              </div>
            </div>

            <div className="result-body">
              <div className="result-summary">
                <h3>{t({ ru: 'Интерпретация результатов', kz: 'Нәтижелерді түсіндіру' })}</h3>
                <p className="result-description">{language === 'ru' ? result.data.ru.description : result.data.kz.description}</p>
              </div>

              {result.data.ru.details && (
                <div className="result-details">
                  <h3>{t({ ru: 'Что это значит?', kz: 'Бұл не дегенді білдіреді?' })}</h3>
                  <p>{language === 'ru' ? result.data.ru.details : result.data.kz.details}</p>
                </div>
              )}

              {result.data.ru.recommendations && (
                <div className="result-recommendations">
                  <h3>{t({ ru: 'Рекомендации', kz: 'Ұсыныстар' })}</h3>
                  <ul>
                    {(language === 'ru' ? result.data.ru.recommendations : result.data.kz.recommendations).map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.data.ru.warning && (
                <div className="result-warning">
                  <strong>⚠️ {t({ ru: 'Обратите внимание:', kz: 'Назар аударыңыз:' })}</strong>
                  <p>{language === 'ru' ? result.data.ru.warning : result.data.kz.warning}</p>
                </div>
              )}
            </div>

            <div className="result-actions">
              <button className="btn btn-primary" onClick={onClose}>
                {t({ ru: 'Закрыть', kz: 'Жабу' })}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  const currentLanguage = language || 'ru';
                  openWhatsAppForGeneralAppointment(currentLanguage);
                }}
              >
                {t({ ru: 'Записаться на консультацию', kz: 'Кеңеске жазылу' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestModal;


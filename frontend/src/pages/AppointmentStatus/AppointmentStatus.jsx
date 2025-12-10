import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import './AppointmentStatus.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AppointmentStatus() {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          psychologists:psychologist_id ( id, name_ru, name_kz, image_url, position_ru, position_kz )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      setData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const statusText = (s) => {
    if (s === 'confirmed') return t({ ru: 'Запись подтверждена ✅', kz: 'Жазылым расталды ✅' });
    if (s === 'cancelled') return t({ ru: 'Запись отменена ❌', kz: 'Жазылым болдырылды ❌' });
    if (s === 'completed') return t({ ru: 'Запись завершена', kz: 'Жазылым аяқталды' });
    return t({ ru: 'Заявка подана — ожидает подтверждения', kz: 'Өтініш берілді — растауды күтуде' });
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const resp = await fetch(`${API_URL}/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: cancelReason.trim() || undefined,
          cancelledBy: 'client' // Указываем, что отмена выполнена клиентом
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.ok) throw new Error(json?.error || t({ ru: 'Не удалось отменить', kz: 'Болдыру мүмкін болмады' }));
      
      // Обновляем данные после отмены - принудительно перезагружаем
      await loadData();
      
      // Дополнительная проверка - перезагружаем еще раз через небольшую задержку
      setTimeout(async () => {
        await loadData();
      }, 500);
      
      setShowCancelModal(false);
      setCancelReason('');
      
      // Небольшая задержка для обновления UI перед показом алерта
      setTimeout(() => {
        alert(t({ ru: '✅ Запись успешно отменена', kz: '✅ Жазылым сәтті болдырылды' }));
      }, 300);
    } catch (err) {
      alert(t({ ru: 'Ошибка: ', kz: 'Қате: ' }) + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const canCancelOrReschedule = data && (data.status === 'pending' || data.status === 'confirmed');

  if (loading) return <div className="container" style={{ padding: '2rem' }}>{t({ ru: 'Загрузка…', kz: 'Жүктелуде…' })}</div>;
  if (error) return <div className="container" style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!data) return <div className="container" style={{ padding: '2rem' }}>{t({ ru: 'Заявка не найдена', kz: 'Өтініш табылмады' })}</div>;

  const time = (data.appointment_time || '').slice(0, 5);
  const psych = data.psychologists;
  const fullUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="appointment-status-page">
      <div className="container">
        <div className="status-card">
          <h1>{t({ ru: 'Статус записи', kz: 'Жазылым статусы' })}</h1>
          <p className="status-line">{statusText(data.status)}</p>
          {data.status === 'cancelled' && data.cancelled_by && (
            <div style={{ 
              marginTop: '12px', 
              padding: '12px', 
              background: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: '8px',
              fontSize: '14px',
              color: '#856404'
            }}>
              {data.cancelled_by === 'client' && (
                <span>ℹ️ {t({ ru: 'Запись отменена вами', kz: 'Жазылым сізбен болдырылды' })}</span>
              )}
              {data.cancelled_by === 'admin' && (
                <span>ℹ️ {t({ 
                  ru: data.cancelled_by_name 
                    ? `Запись отменена администратором (${data.cancelled_by_name})` 
                    : 'Запись отменена администратором',
                  kz: data.cancelled_by_name 
                    ? `Жазылым әкімшімен болдырылды (${data.cancelled_by_name})` 
                    : 'Жазылым әкімшімен болдырылды'
                })}</span>
              )}
              {data.cancelled_by === 'psychologist' && (
                <span>ℹ️ {t({ 
                  ru: data.cancelled_by_name 
                    ? `Запись отменена психологом (${data.cancelled_by_name})` 
                    : 'Запись отменена психологом',
                  kz: data.cancelled_by_name 
                    ? `Жазылым психологпен болдырылды (${data.cancelled_by_name})` 
                    : 'Жазылым психологпен болдырылды'
                })}</span>
              )}
            </div>
          )}
          {/* Ссылка для копирования */}
          <div className="copy-link">
            <div className="label">{t({ ru: 'Ссылка на статус', kz: 'Статус сілтемесі' })}</div>
            <div className="copy-row">
              <input
                className="copy-input"
                type="text"
                readOnly
                value={fullUrl}
                onFocus={(e) => e.target.select()}
              />
              <button
                className="btn btn-secondary btn-small"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(fullUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    // ignore
                  }
                }}
              >
                {copied ? t({ ru: 'Скопировано', kz: 'Көшірілді' }) : t({ ru: 'Копировать', kz: 'Көшіру' })}
              </button>
            </div>
          </div>
          <div className="status-grid">
            <div>
              <div className="label">{t({ ru: 'Дата', kz: 'Күні' })}</div>
              <div className="value">{data.appointment_date}</div>
            </div>
            <div>
              <div className="label">{t({ ru: 'Время', kz: 'Уақыты' })}</div>
              <div className="value">{time}</div>
            </div>
            <div>
              <div className="label">{t({ ru: 'Психолог', kz: 'Психолог' })}</div>
              <div className="value">{language === 'kz' ? (psych?.name_kz || psych?.name_ru || '—') : (psych?.name_ru || '—')}</div>
            </div>
            <div>
              <div className="label">{t({ ru: 'Клиент', kz: 'Клиент' })}</div>
              <div className="value">{data.client_name || '—'}</div>
            </div>
          </div>
          {data.notes ? (
            <div className="notes">
              <div className="label">{t({ ru: 'Комментарий', kz: 'Пікір' })}</div>
              <div className="value" style={{ whiteSpace: 'pre-wrap' }}>{data.notes}</div>
            </div>
          ) : null}
          
          {/* Кнопки действий */}
          {canCancelOrReschedule && (
            <div className="action-buttons" style={{ 
              marginTop: '24px', 
              display: 'flex', 
              gap: '12px', 
              flexWrap: 'wrap'
            }}>
              <button
                className="btn btn-danger"
                onClick={() => setShowCancelModal(true)}
                disabled={cancelling}
                style={{
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  opacity: cancelling ? 0.6 : 1,
                  boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!cancelling) {
                    e.target.style.background = '#c82333';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!cancelling) {
                    e.target.style.background = '#dc3545';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                  }
                }}
              >
                ❌ {t({ ru: 'Отменить запись', kz: 'Жазылымды болдыру' })}
              </button>
              <Link
                to={`/appointment?psychologist=${data.psychologist_id}&reschedule=${id}`}
                className="btn btn-primary"
                style={{
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: 'var(--primary-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 8px rgba(107, 163, 214, 0.3)'
                }}
              >
                ✏️ {t({ ru: 'Изменить время', kz: 'Уақытты өзгерту' })}
              </Link>
            </div>
          )}
          
          <div style={{ marginTop: 24 }}>
            <Link to="/psychologists" className="btn btn-secondary">{t({ ru: 'Вернуться к списку психологов', kz: 'Психологтар тізіміне оралу' })}</Link>
          </div>
        </div>
      </div>

      {/* Модальное окно отмены */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => !cancelling && setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowCancelModal(false)}
              disabled={cancelling}
            >
              ×
            </button>
            <h2>{t({ ru: 'Отмена записи', kz: 'Жазылымды болдыру' })}</h2>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              {t({ 
                ru: 'Вы уверены, что хотите отменить эту запись? Укажите причину (необязательно):', 
                kz: 'Бұл жазылымды болдырғыңыз келетініне сенімдісіз бе? Себебін көрсетіңіз (міндетті емес):' 
              })}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={t({ 
                ru: 'Причина отмены...', 
                kz: 'Болдыру себебі...' 
              })}
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '16px'
              }}
              disabled={cancelling}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                disabled={cancelling}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '2px solid #ddd',
                  background: 'white',
                  color: '#666',
                  borderRadius: '8px',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {t({ ru: 'Отмена', kz: 'Болдыру' })}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  opacity: cancelling ? 0.6 : 1,
                  boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (!cancelling) {
                    e.target.style.background = '#c82333';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!cancelling) {
                    e.target.style.background = '#dc3545';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                  }
                }}
              >
                {cancelling 
                  ? t({ ru: 'Отмена...', kz: 'Болдыру...' })
                  : t({ ru: '✅ Подтвердить отмену', kz: '✅ Болдыруды растау' })
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



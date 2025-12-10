import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function StatusTag({ status }) {
  const map = {
    pending:   { text: 'В ожидании',  color: '#8a6d3b', bg: '#fff3cd', border: '#ffe8a1', icon: '⏳' },
    confirmed: { text: 'Подтверждена', color: '#1b5e20', bg: '#e8f5e9', border: '#c8e6c9', icon: '✅' },
    cancelled: { text: 'Отменена',     color: '#b71c1c', bg: '#ffebee', border: '#ffcdd2', icon: '❌' },
    completed: { text: 'Завершена',    color: '#0d47a1', bg: '#e3f2fd', border: '#bbdefb', icon: '✔'  },
  };
  const s = map[status] || { text: status, color: '#37474f', bg: '#eceff1', border: '#cfd8dc', icon: '•' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 9999,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontSize: 12,
        fontWeight: 700,
        minWidth: 128,
        justifyContent: 'center'
      }}
      title={s.text}
    >
      <span aria-hidden="true">{s.icon}</span>
      {s.text}
    </span>
  );
}

export default function AppointmentsAdmin() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const FILTER_OPTIONS = [
    { value: '', label: 'Все' },
    { value: 'pending', label: 'В ожидании' },
    { value: 'confirmed', label: 'Подтверждённые' },
    { value: 'cancelled', label: 'Отменённые' },
  ];

  function FilterSelect({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const onClick = (e) => {
        if (!ref.current) return;
        if (!ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onClick);
      return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const currentLabel = FILTER_OPTIONS.find(o => o.value === value)?.label || 'Все';

    return (
      <div ref={ref} className={`filter-select ${open ? 'open' : ''}`}>
        <button type="button" className="filter-select__control" onClick={() => setOpen(o => !o)}>
          <span>{currentLabel}</span>
          <span className="filter-select__arrow" aria-hidden="true">▾</span>
        </button>
        {open && (
          <div className="filter-select__menu" role="listbox" aria-activedescendant={`opt-${value || 'all'}`} tabIndex={0}>
            {FILTER_OPTIONS.map(o => (
              <div
                key={o.value || 'all'}
                id={`opt-${o.value || 'all'}`}
                role="option"
                aria-selected={o.value === value}
                className={`filter-select__option ${o.value === value ? 'is-selected' : ''}`}
                tabIndex={0}
                onClick={() => { onChange(o.value); setOpen(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onChange(o.value); setOpen(false); } }}
              >
                {o.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const qs = new URLSearchParams();
      if (statusFilter) qs.set('status', statusFilter);
      const resp = await fetch(`${API_URL}/api/appointments?` + qs.toString());
      const json = await resp.json();
      if (!resp.ok || !json?.ok) throw new Error(json?.error || 'Ошибка загрузки');
      setItems(json.data || []);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const confirm = async (id) => {
    if (!window.confirm('Подтвердить запись?')) return;
    try {
      setLoading(true);
      const resp = await fetch(`${API_URL}/api/appointments/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.ok) throw new Error(json?.error || 'Не удалось подтвердить');
      await load();
      alert('✅ Запись подтверждена. Уведомление отправлено в Telegram.');
    } catch (e) {
      alert('Ошибка: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (id, appointmentData = null) => {
    // Показываем модальное окно для выбора типа отмены
    const cancelType = window.prompt(
      'Кто отменяет запись?\n' +
      '1 - Администратор\n' +
      '2 - Психолог\n' +
      'Введите номер (1 или 2):'
    );
    
    if (!cancelType || (cancelType !== '1' && cancelType !== '2')) {
      return; // Отмена операции
    }
    
    const cancelledBy = cancelType === '1' ? 'admin' : 'psychologist';
    const cancelledByLabel = cancelType === '1' ? 'администратора' : 'психолога';
    
    // Запрашиваем имя
    const cancelledByName = window.prompt(`Введите имя ${cancelledByLabel} (необязательно):`);
    
    // Запрашиваем причину
    const reason = window.prompt('Причина отмены? (необязательно)');
    
    if (!window.confirm('Отменить запись?')) return;
    
    try {
      setLoading(true);
      const resp = await fetch(`${API_URL}/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: reason || undefined,
          cancelledBy,
          cancelledByName: cancelledByName || undefined
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.ok) throw new Error(json?.error || 'Не удалось отменить');
      await load(); // Обновляем список после отмены
      alert('❌ Запись отменена. Уведомление отправлено в Telegram и на email.');
    } catch (e) {
      alert('Ошибка: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map();
    for (const a of items) {
      const key = a.appointment_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  return (
    <section className="admin-section">
      <div className="appointments-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 className="section-title">Заявки на консультацию</h2>
        <div className="appointments-controls" style={{ display: 'flex', gap: 8 }}>
          <FilterSelect value={statusFilter} onChange={setStatusFilter} />
          <button className="btn btn-secondary" onClick={load} disabled={loading}>Обновить</button>
        </div>
      </div>
      {error && <div className="message error" style={{ marginBottom: 12 }}>{error}</div>}
      {loading && <div>Загрузка…</div>}
      {!loading && grouped.length === 0 && <div className="empty-state">Нет записей</div>}
      {!loading && grouped.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {grouped.map(([date, list]) => (
            <div key={date} className="appointment-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 className="card-title" style={{ marginBottom: 0 }}>Дата: {date}</h3>
                <span style={{ color: '#607d8b' }}>Всего: {list.length}</span>
              </div>
              <div className="appointments-list">
                {list.map(a => (
                  <div key={a.id} className="appointment-row">
                    <div>
                      <div style={{ fontWeight: 600 }}>{(a.appointment_time || '').slice(0,5)}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{a.psychologists?.name_ru || 'Психолог'}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.client_name || 'Без имени'}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{a.client_phone || a.client_email || '—'}</div>
                    </div>
                    <div>
                      <StatusTag status={a.status} />
                      {a.notes ? (<div style={{ fontSize: 12, color: '#888', marginTop: 4, whiteSpace: 'pre-wrap' }}>{a.notes}</div>) : null}
                    </div>
                    <div className="appointment-actions">
                      {a.status !== 'confirmed' && (
                        <button className="btn btn-primary btn-small" onClick={() => confirm(a.id)}>Подтвердить</button>
                      )}
                      {a.status !== 'cancelled' && (
                        <button className="btn btn-secondary btn-small" onClick={() => cancel(a.id)}>Отменить</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}



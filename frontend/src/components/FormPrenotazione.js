import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FormPrenotazione = ({ piazzola, prenotazioneEsistente, stato, onSave, onClose }) => {
  const oggi = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    nome_cliente: '',
    telefono: '',
    email: '',
    data_arrivo: oggi,
    data_partenza: '',
    pagato: 0,
    note: ''
  });

  const isModifica = !!prenotazioneEsistente;

  useEffect(() => {
    const oggi = new Date().toISOString().split("T")[0];
    if (prenotazioneEsistente) {
      setForm({
        nome_cliente: prenotazioneEsistente.nome_cliente || '',
        telefono: prenotazioneEsistente.telefono || '',
        email: prenotazioneEsistente.email || '',
        data_arrivo: prenotazioneEsistente.data_arrivo || oggi,
        data_partenza: prenotazioneEsistente.data_partenza || '',
        pagato: prenotazioneEsistente.pagato || 0,
        note: prenotazioneEsistente.note || ''
      });
    }
  }, [prenotazioneEsistente]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const dati = {
        piazzola_id: piazzola.id,
        ...form,
        pagato: form.pagato === true || form.pagato === 1 || form.pagato === '1' ? 1 : 0,
        importo: 0
      };

     const API = "https://gestionale-agricampeggio-monaci-production.up.railway.app/api/prenotazioni";

if (isModifica) {
  await axios.put(`${API}/${prenotazioneEsistente.id}`, dati, {
    headers: { Authorization: `Bearer ${token}` }
  });
  alert('Prenotazione aggiornata!');
} else {
  await axios.post(API, dati, {
    headers: { Authorization: `Bearer ${token}` }
  });
  alert('Prenotazione salvata!');
}

      onSave();
    } catch (err) {
      alert('Errore nel salvataggio');
      console.error(err);
    }
  };

const handleElimina = async () => {
  if (!window.confirm('Sei sicuro di voler eliminare questa prenotazione?')) return;

  try {
    const token = localStorage.getItem('token');

    await axios.delete(
      `https://gestionale-agricampeggio-monaci-production.up.railway.app/api/prenotazioni/${prenotazioneEsistente.id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    alert('Prenotazione eliminata!');
    onSave();

  } catch (err) {
    alert('Errore eliminazione');
  }
};


  const getBorderColor = () => {
    if (stato === 'occupata') return '#ef4444';
    if (stato === 'non_pagata') return '#3b82f6';
    return '#22c55e';
  };

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: `4px solid ${getBorderColor()}` }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>
          {isModifica ? `✏️ Piazzola #${piazzola.numero}` : `➕ Nuova prenotazione #${piazzola.numero}`}
        </h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome_cliente"
          placeholder="Nome cliente *"
          value={form.nome_cliente}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Telefono"
          value={form.telefono}
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={inputStyle}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={labelStyle}>Arrivo</label>
            <input
              type="date"
              name="data_arrivo"
              value={form.data_arrivo}
              min={oggi}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Partenza</label>
            <input
              type="date"
              name="data_partenza"
              value={form.data_partenza}
              min={form.data_arrivo || oggi}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
        </div>

        {/* Checkbox pagato */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '10px', background: form.pagato ? '#dcfce7' : '#fef3c7', borderRadius: '6px' }}>
          <input
            type="checkbox"
            id="pagato"
            checked={form.pagato === 1 || form.pagato === true || form.pagato === '1'}
            onChange={(e) => setForm({ ...form, pagato: e.target.checked ? 1 : 0 })}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="pagato" style={{ cursor: 'pointer', fontWeight: 'bold', color: form.pagato ? '#16a34a' : '#d97706' }}>
            {form.pagato ? '✅ Pagato' : '⚠️ Non pagato'}
          </label>
        </div>

        <textarea
          name="note"
          placeholder="Note"
          value={form.note}
          onChange={handleChange}
          style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
        />

        {/* Bottoni */}
        <button type="submit" style={{ width: '100%', padding: '12px', background: isModifica ? '#f59e0b' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px', fontSize: '15px' }}>
          {isModifica ? '💾 Aggiorna prenotazione' : '✅ Salva prenotazione'}
        </button>

        {isModifica && (
          <button type="button" onClick={handleElimina} style={{ width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            🗑️ Elimina prenotazione
          </button>
        )}
      </form>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '9px',
  marginBottom: '10px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const labelStyle = {
  fontSize: '12px',
  color: '#6b7280',
  marginBottom: '4px',
  display: 'block'
};

export default FormPrenotazione;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const MappaInterattiva = ({ onPiazzolaClick, refresh }) => {
  const [piazzole, setPiazzole] = useState([]);
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [tooltip, setTooltip] = useState(null);

  const caricaDati = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      const [resPiazzole, resPrenotazioni] = await Promise.all([
        axios.get(`${API_URL}/api/piazzole`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/prenotazioni`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPiazzole((resPiazzole.data || []).sort((a, b) => a.numero - b.numero));
      setPrenotazioni(resPrenotazioni.data || []);
    } catch (err) {
      console.error('Errore caricamento mappa:', err);
    }
  }, []);

  useEffect(() => {
    caricaDati();
  }, [caricaDati, refresh]);

  const getPrenotazioneAttiva = (piazzolaId) => {
    const oggi = new Date().toISOString().split('T')[0];
    return prenotazioni.find(p =>
      p.piazzola_id === piazzolaId &&
      p.data_arrivo <= oggi &&
      p.data_partenza >= oggi
    );
  };

  const getStato = (piazzolaId) => {
    const p = getPrenotazioneAttiva(piazzolaId);
    if (!p) return 'libera';
    if (p.pagato === 1 || p.pagato === '1') return 'occupata';
    return 'non_pagata';
  };

  const getColore = (stato) => {
    switch (stato) {
      case 'libera': return '#22c55e';
      case 'occupata': return '#ef4444';
      case 'non_pagata': return '#3b82f6';
      default: return '#22c55e';
    }
  };

  const piazzoleSinistra = piazzole.filter(p => p.numero >= 1 && p.numero <= 10);
  const piazzoleDestra = piazzole.filter(p => p.numero >= 11 && p.numero <= 20);

  const handleClick = (piazzola) => {
    const stato = getStato(piazzola.id);
    const prenotazione = getPrenotazioneAttiva(piazzola.id);
    onPiazzolaClick(piazzola, prenotazione || null, stato);
  };

  const PiazzolaBox = ({ piazzola }) => {
    const stato = getStato(piazzola.id);
    const colore = getColore(stato);
    const prenotazione = getPrenotazioneAttiva(piazzola.id);

    return (
      <div
        onClick={() => handleClick(piazzola)}
        onMouseEnter={() => setTooltip({ piazzola, stato, prenotazione })}
        onMouseLeave={() => setTooltip(null)}
        style={{
          background: colore,
          color: 'white',
          borderRadius: '8px',
          padding: '10px 6px',
          textAlign: 'center',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          userSelect: 'none',
          minWidth: '60px',
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
          setTooltip(null);
        }}
      >
        <div style={{ fontSize: '18px' }}>🏕️</div>
        <div>#{piazzola.numero}</div>
        <div style={{ fontSize: '10px', fontWeight: 'normal', marginTop: '2px', opacity: 0.9 }}>
          {stato === 'libera' ? 'Libera' : stato === 'occupata' ? 'Pagata' : 'Non pagata'}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'relative' }}>
      <h3 style={{ margin: '0 0 20px', color: '#1f2937' }}>🗺️ Mappa Campeggio</h3>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
        {[['#22c55e', 'Libera'], ['#ef4444', 'Occupata (pagata)'], ['#3b82f6', 'Non pagata']].map(([col, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', background: col, borderRadius: '3px' }}></div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div style={{
        background: '#d1fae5',
        borderRadius: '12px',
        padding: '20px',
        border: '2px solid #6ee7b7',
        position: 'relative',
        minHeight: '420px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '12px', color: '#065f46', fontWeight: 'bold', fontSize: '13px' }}>
          🚗 INGRESSO
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#065f46', fontWeight: 'bold', marginBottom: '4px' }}>
              FILA SINISTRA
            </div>
            {piazzoleSinistra.map(p => <PiazzolaBox key={p.id} piazzola={p} />)}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '60px',
          }}>
            <div style={{
              background: '#fcd34d',
              width: '40px',
              flex: 1,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              writingMode: 'vertical-rl',
              fontSize: '11px',
              color: '#92400e',
              fontWeight: 'bold',
              letterSpacing: '2px',
              minHeight: '300px'
            }}>
              STRADA
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#065f46', fontWeight: 'bold', marginBottom: '4px' }}>
              FILA DESTRA
            </div>
            {piazzoleDestra.map(p => <PiazzolaBox key={p.id} piazzola={p} />)}
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: '#bfdbfe', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#1e40af' }}>🚿 Bagni/Docce</div>
          <div style={{ background: '#bfdbfe', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#1e40af' }}>🔌 Colonnine luce</div>
          <div style={{ background: '#bfdbfe', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#1e40af' }}>💧 Acqua</div>
        </div>
      </div>

      {tooltip && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#1f2937',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '200px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Piazzola #{tooltip.piazzola.numero}</div>
          {tooltip.prenotazione ? (
            <>
              <div>👤 {tooltip.prenotazione.nome_cliente}</div>
              <div>📅 {tooltip.prenotazione.data_arrivo} → {tooltip.prenotazione.data_partenza}</div>
              <div>💶 €{tooltip.prenotazione.importo || 0} — {tooltip.stato === 'occupata' ? '✅ Pagato' : '⚠️ Non pagato'}</div>
            </>
          ) : (
            <div>✅ Libera — clicca per prenotare</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MappaInterattiva;

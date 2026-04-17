import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const MapPiazzole = ({ onPiazzoleClick, refresh }) => {
  const [piazzole, setPiazzole] = useState([]);
  const [prenotazioni, setPrenotazioni] = useState([]);

  const caricaDati = useCallback(async () => {
    try {
      const [resPiazzole, resPrenotazioni] = await Promise.all([
        axios.get(`${API_URL}/api/piazzole`),
        axios.get(`${API_URL}/api/prenotazioni`)
      ]);

      const ordinate = (resPiazzole.data || []).sort((a, b) => a.numero - b.numero);
      setPiazzole(ordinate);
      setPrenotazioni(resPrenotazioni.data || []);

    } catch (err) {
      console.error('Errore caricamento:', err);
    }
  }, []);

  useEffect(() => {
    caricaDati();
  }, [caricaDati, refresh]);

  const getStato = (piazzolaId) => {
    const oggi = new Date().toISOString().split('T')[0];

    const attiva = prenotazioni.find(p =>
      p.piazzola_id === piazzolaId &&
      p.data_arrivo <= oggi &&
      p.data_partenza >= oggi
    );

    if (!attiva) return 'libera';
    if (attiva.pagato === 1 || attiva.pagato === '1') return 'occupata';
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

  const getEtichetta = (stato) => {
    switch (stato) {
      case 'libera': return 'Libera';
      case 'occupata': return 'Occupata ✓';
      case 'non_pagata': return 'Non pagata ⚠️';
      default: return 'Libera';
    }
  };

  const handleClick = (piazzola) => {
    const stato = getStato(piazzola.id);
    onPiazzoleClick(piazzola, null, stato);
  };

  const libere = piazzole.filter(p => getStato(p.id) === 'libera').length;
  const occupate = piazzole.filter(p => getStato(p.id) === 'occupata').length;
  const nonPagate = piazzole.filter(p => getStato(p.id) === 'non_pagata').length;
  const totaleOccupate = occupate + nonPagate;

  return (
    <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', background: '#22c55e', borderRadius: '4px' }}></div>
          <span>Libera</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', background: '#ef4444', borderRadius: '4px' }}></div>
          <span>Occupata (pagata)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', background: '#3b82f6', borderRadius: '4px' }}></div>
          <span>Occupata (non pagata)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {piazzole.length === 0 ? (
          <p style={{ color: '#6b7280', gridColumn: '1/-1' }}>Nessuna piazzola trovata.</p>
        ) : (
          piazzole.map(piazzola => {
            const stato = getStato(piazzola.id);
            const colore = getColore(stato);
            return (
              <div
                key={piazzola.id}
                onClick={() => handleClick(piazzola)}
                style={{
                  background: colore,
                  color: 'white',
                  padding: '16px 8px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  transition: 'transform 0.1s',
                  userSelect: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div>#{piazzola.numero}</div>
                <div style={{ fontSize: '11px', fontWeight: 'normal', marginTop: '4px' }}>
                  {getEtichetta(stato)}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '12px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px' }}>
        <span>🟢 Libere: <strong>{libere}</strong></span>
        <span>🔴 Pagate: <strong>{occupate}</strong></span>
        <span>🔵 Non pagate: <strong>{nonPagate}</strong></span>
        <span>🏕️ Occupate totali: <strong>{totaleOccupate}</strong></span>
        <span>📊 Totale: <strong>{piazzole.length}</strong></span>
      </div>
    </div>
  );
};

export default MapPiazzole;

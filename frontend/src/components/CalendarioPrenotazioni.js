import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

const COLORS = {
  occupied: '#e74c3c',
  free: '#27ae60',
  today: '#2980b9',
  header: '#2c3e50',
  bg: '#f5f6fa',
  white: '#ffffff',
  border: '#dfe6e9',
  text: '#2d3436',
  textLight: '#636e72',
};

const GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MESI = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

export default function CalendarioPrenotazioni() {
  const [vista, setVista] = useState('mese');
  const [dataCorrente, setDataCorrente] = useState(new Date());
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);
  const [prenotazioneSelezionata, setPrenotazioneSelezionata] = useState(null);

  useEffect(() => {
    fetchPrenotazioni();
  }, []);

  const fetchPrenotazioni = () => {
    setLoading(true);
    setErrore(null);
    fetch(`${API_URL}/api/prenotazioni`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => {
        setPrenotazioni(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setErrore('Errore caricamento prenotazioni');
        setLoading(false);
      });
  };

  const toDate = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split('T')[0].split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  };

  const isStessoGiorno = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const prenotazioniDelGiorno = (giorno) =>
    prenotazioni.filter(p => {
      const arrivo = toDate(p.data_arrivo);
      const partenza = toDate(p.data_partenza);
      if (!arrivo || !partenza) return false;
      const g = new Date(giorno.getFullYear(), giorno.getMonth(), giorno.getDate());
      return g >= arrivo && g <= partenza;
    });

  const formataData = (str) => {
    if (!str) return '';
    const d = toDate(str);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const precedente = () => {
    const d = new Date(dataCorrente);
    if (vista === 'mese') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setDataCorrente(d);
  };

  const successivo = () => {
    const d = new Date(dataCorrente);
    if (vista === 'mese') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setDataCorrente(d);
  };

  const titoloHeader = () => {
    if (vista === 'mese') return `${MESI[dataCorrente.getMonth()]} ${dataCorrente.getFullYear()}`;
    const inizio = new Date(dataCorrente);
    inizio.setDate(inizio.getDate() - inizio.getDay());
    const fine = new Date(inizio);
    fine.setDate(fine.getDate() + 6);
    return `${inizio.getDate()} ${MESI[inizio.getMonth()].slice(0,3)} - ${fine.getDate()} ${MESI[fine.getMonth()].slice(0,3)} ${fine.getFullYear()}`;
  };

  const eliminaPrenotazione = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa prenotazione?')) return;
    try {
      const res = await fetch(`${API_URL}/api/prenotazioni/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setPrenotazioni(prev => prev.filter(p => p.id !== id));
        setPrenotazioneSelezionata(prev => {
          if (!prev) return null;
          const aggiornate = prev.prenotazioni.filter(p => p.id !== id);
          if (aggiornate.length === 0) return null;
          return { ...prev, prenotazioni: aggiornate };
        });
      } else {
        alert('Errore durante l\'eliminazione');
      }
    } catch {
      alert('Errore di connessione');
    }
  };

  const Legenda = () => (
    <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' }}>
      {[
        { colore: COLORS.free, label: 'Libero' },
        { colore: COLORS.occupied, label: 'Occupato' },
        { colore: COLORS.today, label: 'Oggi' },
      ].map(({ colore, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: colore }} />
          <span style={{ color: COLORS.textLight }}>{label}</span>
        </div>
      ))}
    </div>
  );

  const renderVistaMese = () => {
    const anno = dataCorrente.getFullYear();
    const mese = dataCorrente.getMonth();
    const primoGiorno = new Date(anno, mese, 1).getDay();
    const giorniNelMese = new Date(anno, mese + 1, 0).getDate();
    const oggi = new Date();
    const celle = [];
    for (let i = 0; i < primoGiorno; i++) celle.push(null);
    for (let i = 1; i <= giorniNelMese; i++) celle.push(new Date(anno, mese, i));
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
          {GIORNI.map(g => (
            <div key={g} style={{ textAlign: 'center', fontWeight: 700, fontSize: 12, color: COLORS.textLight, padding: '6px 0' }}>{g}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {celle.map((giorno, idx) => {
            if (!giorno) return <div key={idx} />;
            const pren = prenotazioniDelGiorno(giorno);
            const isOggi = isStessoGiorno(giorno, oggi);
            return (
              <div
                key={idx}
                onClick={() => pren.length > 0 && setPrenotazioneSelezionata({ giorno, prenotazioni: pren })}
                style={{
                  minHeight: 64, borderRadius: 6, padding: '6px 4px',
                  background: isOggi ? '#ebf5fb' : COLORS.bg,
                  border: `2px solid ${isOggi ? COLORS.today : COLORS.border}`,
                  cursor: pren.length > 0 ? 'pointer' : 'default',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: isOggi ? COLORS.today : COLORS.text, marginBottom: 4 }}>
                  {giorno.getDate()}
                </div>
                {pren.slice(0, 2).map((p, i) => (
                  <div key={i} style={{ fontSize: 10, background: COLORS.occupied, color: '#fff', borderRadius: 3, padding: '1px 4px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.nome_cliente}
                  </div>
                ))}
                {pren.length > 2 && <div style={{ fontSize: 10, color: COLORS.textLight }}>+{pren.length - 2} altri</div>}
              </div>
            );
          })}
        </div>
        <Legenda />
      </div>
    );
  };

  const renderVistaSettimana = () => {
    const inizio = new Date(dataCorrente);
    inizio.setDate(inizio.getDate() - inizio.getDay());
    const giorni = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inizio);
      d.setDate(inizio.getDate() + i);
      return d;
    });
    const oggi = new Date();
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {giorni.map((giorno, idx) => {
            const pren = prenotazioniDelGiorno(giorno);
            const isOggi = isStessoGiorno(giorno, oggi);
            return (
              <div key={idx} style={{ borderRadius: 8, overflow: 'hidden', border: `2px solid ${isOggi ? COLORS.today : COLORS.border}` }}>
                <div style={{ background: isOggi ? COLORS.today : COLORS.header, color: '#fff', textAlign: 'center', padding: '8px 4px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{GIORNI[giorno.getDay()]}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{giorno.getDate()}</div>
                </div>
                <div style={{ background: COLORS.bg, minHeight: 120, padding: 4 }}>
                  {pren.length === 0 ? (
                    <div style={{ textAlign: 'center', color: COLORS.free, fontSize: 11, marginTop: 12 }}>Libero</div>
                  ) : pren.map((p, i) => (
                    <div
                      key={i}
                      onClick={() => setPrenotazioneSelezionata({ giorno, prenotazioni: pren })}
                      style={{ fontSize: 11, background: COLORS.occupied, color: '#fff', borderRadius: 4, padding: '4px 6px', marginBottom: 4, cursor: 'pointer' }}
                    >
                      👤 {p.nome_cliente}<br />
                      <span style={{ opacity: 0.8 }}>#{p.piazzola_id}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <Legenda />
      </div>
    );
  };

  const renderModale = () => {
    if (!prenotazioneSelezionata) return null;
    const { giorno, prenotazioni: prenSel } = prenotazioneSelezionata;
    return (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        onClick={() => setPrenotazioneSelezionata(null)}
      >
        <div
          style={{ background: COLORS.white, borderRadius: 12, padding: 24, minWidth: 340, maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '80vh', overflowY: 'auto' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: COLORS.header, fontSize: 18 }}>
              📅 {giorno.getDate()} {MESI[giorno.getMonth()]} {giorno.getFullYear()}
            </h3>
            <button onClick={() => setPrenotazioneSelezionata(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: COLORS.textLight }}>✕</button>
          </div>
          <div style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 12 }}>
            {prenSel.length} prenotazione{prenSel.length > 1 ? 'i' : ''} attiva{prenSel.length > 1 ? '' : ''}
          </div>
          {prenSel.map((p, idx) => (
            <div key={idx} style={{ background: COLORS.bg, borderRadius: 8, padding: 14, marginBottom: 10, borderLeft: `4px solid ${COLORS.occupied}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.text }}>👤 {p.nome_cliente}</div>
                <button
                  onClick={() => eliminaPrenotazione(p.id)}
                  style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
                >
                  🗑️ Elimina
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                <div><span style={{ color: COLORS.textLight }}>Piazzola:</span> <strong>#{p.piazzola_id}</strong></div>
                <div><span style={{ color: COLORS.textLight }}>Arrivo:</span> <strong>{formataData(p.data_arrivo)}</strong></div>
                <div><span style={{ color: COLORS.textLight }}>Partenza:</span> <strong>{formataData(p.data_partenza)}</strong></div>
                {p.telefono && <div><span style={{ color: COLORS.textLight }}>Tel:</span> <strong>{p.telefono}</strong></div>}
                {p.email && <div style={{ gridColumn: '1/-1' }}><span style={{ color: COLORS.textLight }}>Email:</span> <strong>{p.email}</strong></div>}
                {p.importo != null && <div><span style={{ color: COLORS.textLight }}>Importo:</span> <strong>€{p.importo}</strong></div>}
                <div>
                  <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: p.pagato ? '#27ae6022' : '#e74c3c22', color: p.pagato ? COLORS.free : COLORS.occupied }}>
                    {p.pagato ? '✓ Pagato' : '✗ Non pagato'}
                  </span>
                </div>
                {p.note && <div style={{ gridColumn: '1/-1' }}><span style={{ color: COLORS.textLight }}>Note:</span> {p.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{
        background: COLORS.white, borderRadius: 12, padding: '14px 18px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={precedente} style={btnStyle}>‹</button>
          <button onClick={() => setDataCorrente(new Date())} style={{ ...btnStyle, fontSize: 12, padding: '6px 12px' }}>Oggi</button>
          <button onClick={successivo} style={btnStyle}>›</button>
          <h2 style={{ margin: 0, fontSize: 17, color: COLORS.header }}>{titoloHeader()}</h2>
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#f0f0f0', borderRadius: 8, padding: 3 }}>
          {['mese', 'settimana'].map(v => (
            <button key={v} onClick={() => setVista(v)} style={{
              padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
              background: vista === v ? COLORS.header : 'transparent',
              color: vista === v ? COLORS.white : COLORS.textLight,
              transition: 'all 0.2s',
            }}>
              {v === 'mese' ? '📅 Mese' : '📋 Settimana'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: COLORS.white, borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: COLORS.textLight, fontSize: 16 }}>⏳ Caricamento...</div>
        ) : errore ? (
          <div style={{ textAlign: 'center', padding: 40, color: COLORS.occupied }}>
            ❌ {errore}<br /><br />
            <button onClick={fetchPrenotazioni} style={{ ...btnStyle, fontSize: 13 }}>Riprova</button>
          </div>
        ) : vista === 'mese' ? renderVistaMese() : renderVistaSettimana()}
      </div>

      {renderModale()}
    </div>
  );
}

const btnStyle = {
  padding: '6px 14px', borderRadius: 6, border: '1px solid #dfe6e9',
  background: '#fff', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#2c3e50',
};
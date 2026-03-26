import React, { useState, useEffect } from 'react';

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
const ORE = Array.from({ length: 14 }, (_, i) => i + 7);

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
    fetch('http://localhost:5000/api/prenotazioni', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => {
        setPrenotazioni(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setErrore('Errore caricamento prenotazioni');
        setLoading(false);
      });
  };

  // Converte una data stringa "2026-06-01" in oggetto Date senza problemi di fuso orario
  const toDate = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split('T')[0].split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  };

  const isStesoGiorno = (d1, d2) =>
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

  // ---- VISTA MESE ----
  const renderVistaMese = () => {
    const anno = dataCorrente.getFullYear();
    const mese = dataCorrente.getMonth();
    const primoGiorno = new Date(anno, mese, 1);
    const ultimoGiorno = new Date(anno, mese + 1, 0);
    const oggi = new Date();
    const giorni = [];
    for (let i = 0; i < primoGiorno.getDay(); i++) giorni.push(null);
    for (let d = 1; d <= ultimoGiorno.getDate(); d++) giorni.push(new Date(anno, mese, d));

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {GIORNI.map(g => (
            <div key={g} style={{ textAlign: 'center', fontWeight: 700, color: COLORS.textLight, fontSize: 13, padding: '6px 0' }}>{g}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {giorni.map((giorno, i) => {
            if (!giorno) return <div key={`e-${i}`} />;
            const isOggi = isStesoGiorno(giorno, oggi);
            const prenGiorno = prenotazioniDelGiorno(giorno);
            const occupato = prenGiorno.length > 0;
            const colore = occupato ? COLORS.occupied : COLORS.free;

            return (
              <div
                key={giorno.toISOString()}
                onClick={() => occupato && setPrenotazioneSelezionata({ giorno, prenotazioni: prenGiorno })}
                style={{
                  background: occupato ? '#ffeaea' : COLORS.white,
                  border: `2px solid ${isOggi ? COLORS.today : colore}`,
                  borderRadius: 8,
                  padding: '6px 4px',
                  minHeight: 70,
                  cursor: occupato ? 'pointer' : 'default',
                  boxShadow: isOggi ? `0 0 0 3px ${COLORS.today}44` : 'none',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => { if (occupato) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = isOggi ? `0 0 0 3px ${COLORS.today}44` : 'none'; }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: isOggi ? COLORS.today : COLORS.text, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{giorno.getDate()}</span>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: colore, display: 'inline-block', marginTop: 2 }} />
                </div>
                {prenGiorno.slice(0, 2).map((p, idx) => (
                  <div key={idx} style={{
                    background: '#e74c3c22',
                    borderLeft: `3px solid ${COLORS.occupied}`,
                    borderRadius: 3, padding: '2px 4px', fontSize: 10,
                    color: COLORS.text, marginBottom: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    P.{p.piazzola_id} – {p.nome_cliente}
                  </div>
                ))}
                {prenGiorno.length > 2 && (
                  <div style={{ fontSize: 10, color: COLORS.textLight }}>+{prenGiorno.length - 2} altri</div>
                )}
              </div>
            );
          })}
        </div>
        <Legenda />
      </div>
    );
  };

  // ---- VISTA SETTIMANA ----
  const renderVistaSettimana = () => {
    const inizio = new Date(dataCorrente);
    inizio.setDate(inizio.getDate() - inizio.getDay());
    const giorniSettimana = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inizio);
      d.setDate(d.getDate() + i);
      return d;
    });
    const oggi = new Date();

    return (
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 700 }}>
          {/* Header giorni */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            <div />
            {giorniSettimana.map(g => {
              const isOggi = isStesoGiorno(g, oggi);
              const occupato = prenotazioniDelGiorno(g).length > 0;
              return (
                <div key={g.toISOString()} style={{
                  textAlign: 'center', padding: '8px 4px', borderRadius: 6,
                  background: isOggi ? COLORS.today : (occupato ? '#ffeaea' : COLORS.free + '22'),
                  border: `2px solid ${isOggi ? COLORS.today : (occupato ? COLORS.occupied : COLORS.free)}`,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: isOggi ? COLORS.white : COLORS.text }}>{GIORNI[g.getDay()]}</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: isOggi ? COLORS.white : COLORS.text }}>{g.getDate()}</div>
                  <div style={{ fontSize: 10, color: isOggi ? '#ffffffcc' : COLORS.textLight }}>{MESI[g.getMonth()].slice(0,3)}</div>
                </div>
              );
            })}
          </div>

          {/* Righe orarie */}
          {ORE.map(ora => (
            <div key={ora} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
              <div style={{ textAlign: 'right', paddingRight: 8, paddingTop: 4, fontSize: 11, color: COLORS.textLight, fontWeight: 600 }}>
                {String(ora).padStart(2,'0')}:00
              </div>
              {giorniSettimana.map(g => {
                // Nella vista settimana mostriamo le prenotazioni su tutto il giorno
                const prenGiorno = prenotazioniDelGiorno(g);
                return (
                  <div
                    key={g.toISOString()}
                    onClick={() => prenGiorno.length > 0 && setPrenotazioneSelezionata({ giorno: g, prenotazioni: prenGiorno })}
                    style={{
                      minHeight: 32,
                      background: prenGiorno.length > 0 ? '#e74c3c22' : COLORS.free + '11',
                      border: `1px solid ${prenGiorno.length > 0 ? COLORS.occupied + '66' : COLORS.border}`,
                      borderRadius: 4, padding: '2px 4px',
                      cursor: prenGiorno.length > 0 ? 'pointer' : 'default',
                    }}
                  >
                    {ora === 7 && prenGiorno.map((p, idx) => (
                      <div key={idx} style={{
                        fontSize: 10, color: COLORS.text, fontWeight: 600,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        borderLeft: `3px solid ${COLORS.occupied}`, paddingLeft: 3,
                      }}>
                        P.{p.piazzola_id} {p.nome_cliente}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <Legenda />
      </div>
    );
  };

  // ---- LEGENDA ----
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

  // ---- ELIMINA PRENOTAZIONE ----
  const eliminaPrenotazione = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa prenotazione?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/prenotazioni/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setPrenotazioni(prev => prev.filter(p => p.id !== id));
        // Aggiorna il modale rimuovendo la prenotazione eliminata
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

  // ---- MODALE DETTAGLIO ----
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
                <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.text }}>
                  👤 {p.nome_cliente}
                </div>
                <button
                  onClick={() => eliminaPrenotazione(p.id)}
                  style={{
                    background: '#e74c3c', color: 'white', border: 'none',
                    borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
                    fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#c0392b'}
                  onMouseLeave={e => e.currentTarget.style.background = '#e74c3c'}
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
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                    background: p.pagato ? '#27ae6022' : '#e74c3c22',
                    color: p.pagato ? COLORS.free : COLORS.occupied,
                  }}>
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

  // ---- RENDER PRINCIPALE ----
  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Barra navigazione calendario */}
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

      {/* Contenuto calendario */}
      <div style={{ background: COLORS.white, borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: COLORS.textLight, fontSize: 16 }}>⏳ Caricamento...</div>
        ) : errore ? (
          <div style={{ textAlign: 'center', padding: 40, color: COLORS.occupied }}>
            ❌ {errore}
            <br /><br />
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
import React, { useState, useEffect } from 'react';
import CalendarioPrenotazioni from './components/CalendarioPrenotazioni';
import FormPrenotazione from './components/FormPrenotazione';
import MapPiazzole from './components/MapPiazzole';
import logo from './Agricampeggio.png';
import './App.css';

function App() {
  const [selectedPiazzola, setSelectedPiazzola] = useState(null);
  const [selectedPrenotazione, setSelectedPrenotazione] = useState(null);
  const [selectedStato, setSelectedStato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshMap, setRefreshMap] = useState(0);
  const [vistaAttiva, setVistaAttiva] = useState('piazzole');
  
  useEffect(() => {
  const timer = setTimeout(() => setLoading(false), 3000);
  return () => clearTimeout(timer);
}, []);

  const handlePiazzolaClick = (piazzola, prenotazione, stato) => {
    setSelectedPiazzola(piazzola);

    if (stato === 'libera') {
      setSelectedPrenotazione(null);
    } else {
      setSelectedPrenotazione(prenotazione);
    }

    setSelectedStato(stato);
  };

  const handleSave = () => {
    setSelectedPiazzola(null);
    setSelectedPrenotazione(null);
    setSelectedStato(null);
    setRefreshMap(r => r + 1);
  };

  const handleClose = () => {
    setSelectedPiazzola(null);
    setSelectedPrenotazione(null);
    setSelectedStato(null);
  };

  if (loading) {
  return (
    <div className="loader-container">
      <img src={logo} alt="Loading" className="loader-logo" />
      <p style={{ marginTop: 20, fontSize: 16, color: '#374151' }}>Caricamento...</p>
    </div>
  );
}

  return (
    <div style={{ padding: '20px', background: '#f3f4f6', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{
        background: '#1f2937',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={logo} alt="Logo" style={{ width: '90px', height: '90px', borderRadius: '8px' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '20px' }}>Gestionale Agricampeggio Monaci</h1>
            <p style={{ margin: '2px 0 0', opacity: 0.7, fontSize: '13px' }}>Gestione prenotazioni camper</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'piazzole', label: '🏕️ Piazzole' },
          { id: 'calendario', label: '📅 Calendario' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setVistaAttiva(tab.id); handleClose(); }}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 15,
              background: vistaAttiva === tab.id ? '#1f2937' : 'white',
              color: vistaAttiva === tab.id ? 'white' : '#374151',
              boxShadow: vistaAttiva === tab.id ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vista Piazzole */}
      {vistaAttiva === 'piazzole' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px'
        }}>
          <div>
            <h2 style={{ marginBottom: '12px' }}>Piazzole</h2>
            <MapPiazzole onPiazzoleClick={handlePiazzolaClick} refresh={refreshMap} />
          </div>
        </div>
      )}

      {/* MODAL FORM PRENOTAZIONE */}
      {selectedPiazzola && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '12px', textAlign: 'center' }}>
              {selectedStato === 'libera'
                ? '➕ Nuova prenotazione'
                : '📋 Dettaglio prenotazione'}
            </h2>

            <FormPrenotazione
              piazzola={selectedPiazzola}
              prenotazioneEsistente={selectedPrenotazione}
              stato={selectedStato}
              onSave={handleSave}
              onClose={handleClose}
            />
          </div>
        </div>
      )}

      {/* Vista Calendario */}
      {vistaAttiva === 'calendario' && (
        <div className="calendario-container">
          <CalendarioPrenotazioni key={refreshMap} />
        </div>
      )}

    </div>
  );
}

export default App;

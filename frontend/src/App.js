import React, { useState, useCallback } from 'react';
import MapPiazzole from './components/MapPiazzole';
import MappaInterattiva from './components/MappaInterattiva';
import FormPrenotazione from './components/FormPrenotazione';
import logo from './Agricampeggio.png';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPiazzola, setSelectedPiazzola] = useState(null);
  const [selectedPrenotazione, setSelectedPrenotazione] = useState(null);
  const [selectedStato, setSelectedStato] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [refreshMap, setRefreshMap] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
      } else {
        alert('Credenziali non valide');
      }
    } catch (err) {
      alert('Errore di connessione al server');
    }
  };

  const handlePiazzolaClick = useCallback((piazzola, prenotazione, stato) => {
    setSelectedPiazzola(piazzola);
    setSelectedPrenotazione(prenotazione);
    setSelectedStato(stato);
  }, []);

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

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f4f6' }}>
        <form onSubmit={handleLogin} style={{ padding: '40px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', width: '340px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <img src={logo} alt="Agricampeggio Monaci" style={{ width: '190px', marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '24px', color: '#1f2937' }}>Gestionale Monaci</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            required
          />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
            Accedi
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f3f4f6', minHeight: '100vh' }}>
      
      {/* Header */}
      <header style={{ background: '#1f2937', color: 'white', padding: '16px 24px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={logo} alt="Logo" style={{ width: '90px', height: '90px', borderRadius: '8px' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '20px' }}>Gestionale Agricampeggio Monaci</h1>
            <p style={{ margin: '2px 0 0', opacity: 0.7, fontSize: '13px' }}>Gestione prenotazioni camper</p>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); setIsLoggedIn(false); }} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </header>

      {/* Griglia piazzole + form */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedPiazzola ? '2fr 1fr' : '1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ marginBottom: '12px' }}>Piazzole</h2>
          <MapPiazzole onPiazzoleClick={handlePiazzolaClick} refresh={refreshMap} />
        </div>

        {selectedPiazzola && (
          <div>
            <h2 style={{ marginBottom: '12px' }}>
              {selectedStato === 'libera' ? '➕ Nuova prenotazione' : '📋 Dettaglio prenotazione'}
            </h2>
            <FormPrenotazione
              piazzola={selectedPiazzola}
              prenotazioneEsistente={selectedPrenotazione}
              stato={selectedStato}
              onSave={handleSave}
              onClose={handleClose}
            />
          </div>
        )}
      </div>

      {/* Mappa interattiva */}
      <MappaInterattiva onPiazzolaClick={handlePiazzolaClick} refresh={refreshMap} />

    </div>
  );
}

export default App;
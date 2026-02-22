import React, { useState, useEffect } from 'react';
import MapPiazzole from './components/MapPiazzole';
import FormPrenotazione from './components/FormPrenotazione';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPiazzola, setSelectedPiazzola] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
      }
    } catch (err) {
      alert('Errore login');
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <form onSubmit={handleLogin} style={{ padding: '40px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>Login Gestionale Campeggio</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            required
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Accedi
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f3f4f6', minHeight: '100vh' }}>
      <header style={{ background: '#1f2937', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>🏕️ Gestionale Campeggio</h1>
          <p>Gestione prenotazioni camper</p>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); setIsLoggedIn(false); }} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div>
          <h2>Mappa Piazzole</h2>
          <MapPiazzole onPiazzoleClick={setSelectedPiazzola} />
        </div>

        {selectedPiazzola && (
          <div>
            <FormPrenotazione piazzola={selectedPiazzola} onSave={() => setSelectedPiazzola(null)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
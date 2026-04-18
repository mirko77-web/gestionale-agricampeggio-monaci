import React, { useEffect, useState } from 'react';

function Statistiche() {
  const [prenotazioni, setPrenotazioni] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/prenotazioni`)
      .then(res => res.json())
      .then(data => setPrenotazioni(data));
  }, []);

  const totale = prenotazioni.length;

  const oggi = new Date().toISOString().split("T")[0];
  const prenotazioniOggi = prenotazioni.filter(p => p.data_inizio === oggi).length;

  const meseCorrente = new Date().getMonth() + 1;
  const prenotazioniMese = prenotazioni.filter(p => {
    const mese = new Date(p.data_inizio).getMonth() + 1;
    return mese === meseCorrente;
  }).length;

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Statistiche</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 20,
        marginTop: 20
      }}>
        
        <div style={box}>
          <h3>{totale}</h3>
          <p>Totale prenotazioni</p>
        </div>

        <div style={box}>
          <h3>{prenotazioniOggi}</h3>
          <p>Prenotazioni di oggi</p>
        </div>

        <div style={box}>
          <h3>{prenotazioniMese}</h3>
          <p>Prenotazioni mese corrente</p>
        </div>

      </div>
    </div>
  );
}

const box = {
  background: 'white',
  padding: 20,
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  textAlign: 'center'
};

export default Statistiche;

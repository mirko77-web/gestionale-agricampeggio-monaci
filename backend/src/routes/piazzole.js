const express = require('express');
const db = require('../db/database');
const router = express.Router();

// GET tutte le piazzole
router.get('/', (req, res) => {
  db.all('SELECT * FROM piazzole', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Errore nel caricamento' });
    }
    res.json(rows || []);
  });
});

// GET piazzole disponibili per una data
router.get('/disponibili/:data', (req, res) => {
  const data = req.params.data;
  
  console.log('🔍 Cercando piazzole disponibili per:', data);
  
  db.all(
    `SELECT p.* FROM piazzole p 
     WHERE p.id NOT IN (
       SELECT DISTINCT piazzola_id FROM prenotazioni 
       WHERE data_arrivo <= ? AND data_partenza >= ?
     )`,
    [data, data],
    (err, rows) => {
      if (err) {
        console.error('❌ Errore:', err);
        return res.status(500).json({ error: 'Errore nel caricamento' });
      }
      
      const disponibili = rows ? rows.length : 0;
      console.log('✅ Piazzole disponibili:', disponibili);
      
      res.json({ disponibili, piazzole: rows || [] });
    }
  );
});

module.exports = router;
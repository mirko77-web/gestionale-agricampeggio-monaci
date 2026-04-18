const express = require('express');
const db = require('../db/database.js');

const router = express.Router();

// GET tutte le piazzole
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.execute('SELECT * FROM piazzole');
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel caricamento' });
  }
});

// GET piazzole disponibili per una data
router.get('/disponibili/:data', async (req, res) => {
  const data = req.params.data;
  console.log('🔍 Cercando piazzole disponibili per:', data);

  try {
    const { rows } = await db.execute({
      sql: `SELECT p.* FROM piazzole p 
            WHERE p.id NOT IN (
              SELECT DISTINCT piazzola_id FROM prenotazioni 
              WHERE data_arrivo <= ? AND data_partenza >= ?
            )`,
      args: [data, data]
    });

    console.log('✅ Piazzole disponibili:', rows.length);
    res.json({ disponibili: rows.length, piazzole: rows || [] });

  } catch (err) {
    console.error('❌ Errore:', err);
    res.status(500).json({ error: 'Errore nel caricamento' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db/database.js');

// Normalizza data → 'YYYY-MM-DD'
// Gestisce ISO (2024-05-10T00:00:00Z), SQLite (2024-05-10 00:00:00), plain (2024-05-10)
const toDay = (d) => {
  if (!d) return '';
  return String(d).split('T')[0].split(' ')[0];
};

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.execute({ sql: 'SELECT * FROM prenotazioni ORDER BY data_arrivo DESC' });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel caricamento' });
  }
});

router.post('/', async (req, res) => {
  let { piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note } = req.body;

  try {
    const checkIn  = toDay(data_arrivo);
    const checkOut = toDay(data_partenza);

    console.log(`\n[POST] piazzola #${piazzola_id}: arrivo=${checkIn} partenza=${checkOut}`);

    if (!checkIn || !checkOut || checkIn >= checkOut) {
      return res.status(400).json({ error: 'Date non valide' });
    }

    const { rows } = await db.execute({ sql: `SELECT * FROM prenotazioni WHERE piazzola_id = ?`, args: [piazzola_id] });

    let overlap = false;
    for (const p of rows) {
      const start = toDay(p.data_arrivo);
      const end   = toDay(p.data_partenza);
      const conflitto = checkIn < end && checkOut > start;
      console.log(`  id=${p.id} (${start} → ${end}): conflitto=${conflitto}`);
      if (conflitto) { overlap = true; break; }
    }

    if (overlap) {
      console.log('  ERRORE: sovrapposizione');
      return res.status(400).json({ error: 'La piazzola è già occupata in queste date' });
    }

    const result = await db.execute({
      sql: `INSERT INTO prenotazioni (piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [piazzola_id, nome_cliente, telefono||'', email||'', checkIn, checkOut, pagato?1:0, importo||0, note||'']
    });

    res.json({ id: Number(result.lastInsertRowid), success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel salvataggio' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM prenotazioni WHERE id = ?', args: [req.params.id] });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nell'eliminazione" });
  }
});

router.put('/:id', async (req, res) => {
  let { piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note } = req.body;

  try {
    const checkIn  = toDay(data_arrivo);
    const checkOut = toDay(data_partenza);

    console.log(`\n[PUT] id=${req.params.id} piazzola #${piazzola_id}: arrivo=${checkIn} partenza=${checkOut}`);

    if (!checkIn || !checkOut || checkIn >= checkOut) {
      return res.status(400).json({ error: 'Date non valide' });
    }

    const { rows } = await db.execute({
      sql: `SELECT * FROM prenotazioni WHERE piazzola_id = ? AND id != ?`,
      args: [piazzola_id, req.params.id]
    });

    let overlap = false;
    for (const p of rows) {
      const start = toDay(p.data_arrivo);
      const end   = toDay(p.data_partenza);
      const conflitto = checkIn < end && checkOut > start;
      console.log(`  id=${p.id} (${start} → ${end}): conflitto=${conflitto}`);
      if (conflitto) { overlap = true; break; }
    }

    if (overlap) {
      console.log('  ERRORE: sovrapposizione');
      return res.status(400).json({ error: 'La piazzola è già occupata in queste date' });
    }

    await db.execute({
      sql: `UPDATE prenotazioni SET nome_cliente=?, telefono=?, email=?, data_arrivo=?, data_partenza=?, pagato=?, importo=?, note=? WHERE id=?`,
      args: [nome_cliente, telefono||'', email||'', checkIn, checkOut, pagato?1:0, importo||0, note||'', req.params.id]
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nell'aggiornamento" });
  }
});

module.exports = router;
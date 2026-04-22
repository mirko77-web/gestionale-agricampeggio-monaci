const express = require('express');
const router = express.Router();
const db = require('../db/database.js');


// =======================
// UTILITY: NORMALIZZA DATA → 'YYYY-MM-DD'
// Gestisce sia formato ISO (2024-05-10T00:00:00) che SQLite (2024-05-10 00:00:00)
// =======================
const toDay = (d) => {
  if (!d) return '';
  return String(d).split('T')[0].split(' ')[0];
};


// =======================
// GET TUTTE LE PRENOTAZIONI
// =======================
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.execute({
      sql: 'SELECT * FROM prenotazioni ORDER BY data_arrivo DESC'
    });

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel caricamento' });
  }
});


// =======================
// POST NUOVA PRENOTAZIONE
// =======================
router.post('/', async (req, res) => {
  let {
    piazzola_id,
    nome_cliente,
    telefono,
    email,
    data_arrivo,
    data_partenza,
    pagato,
    importo,
    note
  } = req.body;

  try {
    const checkIn  = toDay(data_arrivo);
    const checkOut = toDay(data_partenza);

    if (!checkIn || !checkOut || checkIn >= checkOut) {
      return res.status(400).json({ error: 'Date non valide' });
    }

    const { rows } = await db.execute({
      sql: `SELECT * FROM prenotazioni WHERE piazzola_id = ?`,
      args: [piazzola_id]
    });

    // Sovrapposizione: la nuova prenotazione si sovrappone solo se inizia PRIMA
    // che l'altra finisca E finisce DOPO che l'altra inizia.
    // Due prenotazioni adiacenti (es. 1-10 e 10-20) NON si sovrappongono
    // perché checkIn < end → "10" < "10" → false ✅
    const overlap = rows.some(p => {
      const start = toDay(p.data_arrivo);
      const end   = toDay(p.data_partenza);
      return checkIn < end && checkOut > start;
    });

    if (overlap) {
      return res.status(400).json({
        error: 'La piazzola è già occupata in queste date'
      });
    }

    const result = await db.execute({
      sql: `
        INSERT INTO prenotazioni
        (piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        piazzola_id,
        nome_cliente,
        telefono || '',
        email || '',
        checkIn,
        checkOut,
        pagato ? 1 : 0,
        importo || 0,
        note || ''
      ]
    });

    res.json({ id: Number(result.lastInsertRowid), success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel salvataggio' });
  }
});


// =======================
// DELETE PRENOTAZIONE
// =======================
router.delete('/:id', async (req, res) => {
  try {
    await db.execute({
      sql: 'DELETE FROM prenotazioni WHERE id = ?',
      args: [req.params.id]
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nell'eliminazione" });
  }
});


// =======================
// PUT MODIFICA PRENOTAZIONE
// =======================
router.put('/:id', async (req, res) => {
  let {
    piazzola_id,
    nome_cliente,
    telefono,
    email,
    data_arrivo,
    data_partenza,
    pagato,
    importo,
    note
  } = req.body;

  try {
    const checkIn  = toDay(data_arrivo);
    const checkOut = toDay(data_partenza);

    if (!checkIn || !checkOut || checkIn >= checkOut) {
      return res.status(400).json({ error: 'Date non valide' });
    }

    // Esclude la prenotazione corrente dal controllo sovrapposizione
    const { rows } = await db.execute({
      sql: `
        SELECT * FROM prenotazioni
        WHERE piazzola_id = ?
          AND id != ?
      `,
      args: [piazzola_id, req.params.id]
    });

    const overlap = rows.some(p => {
      const start = toDay(p.data_arrivo);
      const end   = toDay(p.data_partenza);
      return checkIn < end && checkOut > start;
    });

    if (overlap) {
      return res.status(400).json({
        error: 'La piazzola è già occupata in queste date'
      });
    }

    await db.execute({
      sql: `
        UPDATE prenotazioni
        SET nome_cliente=?,
            telefono=?,
            email=?,
            data_arrivo=?,
            data_partenza=?,
            pagato=?,
            importo=?,
            note=?
        WHERE id=?
      `,
      args: [
        nome_cliente,
        telefono || '',
        email || '',
        checkIn,
        checkOut,
        pagato ? 1 : 0,
        importo || 0,
        note || '',
        req.params.id
      ]
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nell'aggiornamento" });
  }
});

module.exports = router;
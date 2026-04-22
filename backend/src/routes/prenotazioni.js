const express = require('express');
const router = express.Router();
const db = require('../db/database.js');


// =======================
// UTILITY: NORMALIZZA DATA
// =======================
const toDay = (d) => new Date(d).toISOString().split('T')[0];

const toTime = (d) => new Date(d).getTime();


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
    const checkIn = toTime(data_arrivo);
    const checkOut = toTime(data_partenza);

    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Date non valide' });
    }

    const { rows } = await db.execute({
      sql: `SELECT * FROM prenotazioni WHERE piazzola_id = ?`,
      args: [piazzola_id]
    });

    const overlap = rows.some(p => {
      const start = toTime(p.data_arrivo);
      const end = toTime(p.data_partenza);

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
        data_arrivo,
        data_partenza,
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
    const checkIn = toTime(data_arrivo);
    const checkOut = toTime(data_partenza);

    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Date non valide' });
    }

    const { rows } = await db.execute({
      sql: `
        SELECT * FROM prenotazioni
        WHERE piazzola_id = ?
          AND id != ?
      `,
      args: [piazzola_id, req.params.id]
    });

    console.log("NUOVA:", data_arrivo, data_partenza);

    console.log("ESISTENTI:", rows.map(r => ({
      arrivo: r.data_arrivo,
      partenza: r.data_partenza
    })));

    const overlap = rows.some(p => {
      const start = toTime(p.data_arrivo);
      const end = toTime(p.data_partenza);

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
        data_arrivo,
        data_partenza,
        pagato ? 1 : 0,
        importo || 0,
        note || '',
        req.params.id
      ]
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nell’aggiornamento' });
  }
});

module.exports = router;
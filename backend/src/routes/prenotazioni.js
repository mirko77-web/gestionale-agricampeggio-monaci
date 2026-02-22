const express = require('express');
const db = require('../db/database');
const { inviaEmailPrenotazione } = require('../utils/email');
const router = express.Router();

// GET tutte le prenotazioni
router.get('/', (req, res) => {
  db.all('SELECT * FROM prenotazioni', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Errore nel caricamento' });
    }
    res.json(rows || []);
  });
});

// POST nuova prenotazione
router.post('/', (req, res) => {
  const { piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note } = req.body;

  console.log('📝 Ricevuta prenotazione:', { nome_cliente, email });

  db.run(
    `INSERT INTO prenotazioni (piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note],
    async function(err) {
      if (err) {
        console.error('❌ Errore INSERT:', err);
        return res.status(500).json({ error: 'Errore nel salvataggio' });
      }

      console.log('✅ Prenotazione inserita');

      // Carica i dati della piazzola
      db.get('SELECT numero FROM piazzole WHERE id = ?', [piazzola_id], async (err, piazzola) => {
        if (err) {
          console.error('❌ Errore SELECT piazzola:', err);
        }
        
        if (piazzola) {
          console.log('📍 Piazzola trovata:', piazzola.numero);
          const dati = {
            numeroPiazzola: piazzola.numero,
            nomeCliente: nome_cliente,
            dataArrivo: data_arrivo,
            dataPartenza: data_partenza,
            importo: importo,
            pagato: pagato === 1
          };

          // Invia EMAIL
          if (email) {
            console.log('📧 Invio email a:', email);
            try {
              await inviaEmailPrenotazione(email, dati);
              console.log('✅ Email inviata');
            } catch (err) {
              console.error('❌ Errore invio email:', err);
            }
          }
        }
      });

      res.json({ id: this.lastID, success: true });
    }
  );
});

// PUT modifica prenotazione
router.put('/:id', (req, res) => {
  const { nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note } = req.body;

  console.log('✏️ Modifica prenotazione:', req.params.id);

  db.run(
    `UPDATE prenotazioni SET nome_cliente=?, telefono=?, email=?, data_arrivo=?, data_partenza=?, pagato=?, importo=?, note=? WHERE id=?`,
    [nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note, req.params.id],
    (err) => {
      if (err) {
        console.error('❌ Errore UPDATE:', err);
        return res.status(500).json({ error: 'Errore nell\'aggiornamento' });
      }
      console.log('✅ Prenotazione aggiornata');
      res.json({ success: true });
    }
  );
});

// DELETE prenotazione
router.delete('/:id', (req, res) => {
  console.log('🗑️ Eliminazione prenotazione:', req.params.id);

  db.run('DELETE FROM prenotazioni WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      console.error('❌ Errore DELETE:', err);
      return res.status(500).json({ error: 'Errore nell\'eliminazione' });
    }
    console.log('✅ Prenotazione eliminata');
    res.json({ success: true });
  });
});

module.exports = router;
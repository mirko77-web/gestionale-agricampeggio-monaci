const express = require('express');
const db = require('../db/database');
const { inviaEmailPrenotazione } = require('../utils/email');
const { inviaWhatsApp } = require('../utils/sms');
const router = express.Router();

// GET tutte le prenotazioni
router.get('/', (req, res) => {
  db.all('SELECT * FROM prenotazioni', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Errore nel caricamento' });
    res.json(rows || []);
  });
});

// POST nuova prenotazione
router.post('/', (req, res) => {
  const { piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note } = req.body;

  console.log('📝 Ricevuta prenotazione:', { nome_cliente, email, telefono });

  db.run(
    `INSERT INTO prenotazioni (piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato ? 1 : 0, importo || 0, note],
    async function (err) {
      if (err) {
        console.error('❌ Errore INSERT:', err);
        return res.status(500).json({ error: 'Errore nel salvataggio' });
      }

      console.log('✅ Prenotazione inserita');

      db.get('SELECT numero FROM piazzole WHERE id = ?', [piazzola_id], async (err, piazzola) => {
        if (piazzola) {
          const dati = {
            numeroPiazzola: piazzola.numero,
            nomeCliente: nome_cliente,
            dataArrivo: data_arrivo,
            dataPartenza: data_partenza,
            importo: importo || 0,
            pagato: pagato === 1 || pagato === true
          };

          // Invia EMAIL
          if (email) {
            try {
              await inviaEmailPrenotazione(email, dati);
              console.log('✅ Email inviata a:', email);
            } catch (err) {
              console.error('❌ Errore email:', err.message);
            }
          }

          // Invia WhatsApp
          if (telefono) {
            try {
              await inviaWhatsApp(telefono, dati);
              console.log('✅ WhatsApp inviato a:', telefono);
            } catch (err) {
              console.error('❌ Errore WhatsApp:', err.message);
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

  db.run(
    `UPDATE prenotazioni SET nome_cliente=?, telefono=?, email=?, data_arrivo=?, data_partenza=?, pagato=?, importo=?, note=? WHERE id=?`,
    [nome_cliente, telefono, email, data_arrivo, data_partenza, pagato ? 1 : 0, importo || 0, note, req.params.id],
    async function (err) {
      if (err) {
        console.error('❌ Errore UPDATE:', err);
        return res.status(500).json({ error: "Errore nell'aggiornamento" });
      }

      // Se aggiornato come pagato, invia notifica
      if (pagato) {
        db.get('SELECT p.numero, pr.* FROM piazzole p JOIN prenotazioni pr ON pr.piazzola_id = p.id WHERE pr.id = ?', [req.params.id], async (err, row) => {
          if (row) {
            const dati = {
              numeroPiazzola: row.numero,
              nomeCliente: nome_cliente,
              dataArrivo: data_arrivo,
              dataPartenza: data_partenza,
              importo: importo || 0,
              pagato: true
            };
            if (email) {
              try { await inviaEmailPrenotazione(email, dati); console.log('✅ Email aggiornamento inviata'); } catch (e) { console.error('❌ Email:', e.message); }
            }
            if (telefono) {
              try { await inviaWhatsApp(telefono, dati); console.log('✅ WhatsApp aggiornamento inviato'); } catch (e) { console.error('❌ WhatsApp:', e.message); }
            }
          }
        });
      }

      res.json({ success: true });
    }
  );
});

// DELETE prenotazione
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM prenotazioni WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Errore nell'eliminazione" });
    res.json({ success: true });
  });
});

module.exports = router;
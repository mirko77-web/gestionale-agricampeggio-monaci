const twilio = require('twilio');

const inviaWhatsApp = async (telefono, dati) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Formatta il numero: rimuovi spazi e aggiungi +39 se non c'è prefisso
  let numeroFormattato = telefono.replace(/\s/g, '');
  if (!numeroFormattato.startsWith('+')) {
    numeroFormattato = '+39' + numeroFormattato;
  }

  const messaggio = 
`🏕️ *Agricampeggio Monaci*

✅ Prenotazione confermata!

Gentile *${dati.nomeCliente}*,
la tua prenotazione è stata confermata.

📋 *Dettagli:*
• Piazzola: #${dati.numeroPiazzola}
• Arrivo: ${dati.dataArrivo}
• Partenza: ${dati.dataPartenza}
• Importo: €${dati.importo || 0}
• Pagamento: ${dati.pagato ? '✅ Pagato' : '⏳ Da pagare'}

A presto! 🌿`;

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${numeroFormattato}`,
    body: messaggio
  });
};

module.exports = { inviaWhatsApp };
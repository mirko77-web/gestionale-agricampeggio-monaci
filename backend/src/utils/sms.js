/*const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const inviaSMSPrenotazione = async (numeroCellulare, dati) => {
  const {
    numeroPiazzola,
    nomeCliente,
    dataArrivo,
    dataPartenza,
    importo,
    pagato
  } = dati;

  const statoPage = pagato ? '✅ PAGATO' : '⏳ IN ATTESA DI PAGAMENTO';

  const messaggio = `
🏕️ PRENOTAZIONE CONFERMATA!

Ciao ${nomeCliente},

La tua prenotazione è stata confermata!

📍 Piazzola: #${numeroPiazzola}
📅 Arrivo: ${new Date(dataArrivo).toLocaleDateString('it-IT')}
🚪 Partenza: ${new Date(dataPartenza).toLocaleDateString('it-IT')}
💶 Importo: € ${importo || 'Da concordare'}
${statoPage}

Grazie! 🙏
  `.trim();

  try {
    await client.messages.create({
      body: messaggio,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: numeroCellulare
    });

    console.log(`✅ SMS inviato a ${numeroCellulare}`);
    return true;
  } catch (error) {
    console.error('❌ Errore invio SMS:', error);
    return false;
  }
};

module.exports = { inviaSMSPrenotazione };*/
const inviaSMSPrenotazione = async (numeroCellulare, dati) => {
  console.log('⚠️ SMS non configurato ancora');
  return true;
};

module.exports = { inviaSMSPrenotazione };
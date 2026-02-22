const nodemailer = require('nodemailer');

// Configura il trasportatore email (usa Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // La TUA email Gmail
    pass: process.env.EMAIL_PASSWORD   // La password dell'app Gmail
  }
});

const inviaEmailPrenotazione = async (email, dati) => {
  const {
    numeroPiazzola,
    nomeCliente,
    dataArrivo,
    dataPartenza,
    importo,
    pagato
  } = dati;

  const statoPage = pagato ? '✅ PAGATO' : '⏳ IN ATTESA DI PAGAMENTO';
  const coloreBg = pagato ? '#dcfce7' : '#fee2e2';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; }
          .content { background: white; padding: 20px; border: 1px solid #ddd; }
          .info { background: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0; }
          .info p { margin: 8px 0; }
          .status { background: ${coloreBg}; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; margin: 15px 0; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏕️ Prenotazione Confermata!</h1>
          </div>

          <div class="content">
            <p>Ciao <strong>${nomeCliente}</strong>,</p>

            <p>La tua prenotazione al nostro campeggio è stata <strong>confermata</strong>!</p>

            <div class="info">
              <p><strong>📍 Piazzola:</strong> #${numeroPiazzola}</p>
              <p><strong>📅 Check-in:</strong> ${new Date(dataArrivo).toLocaleDateString('it-IT')}</p>
              <p><strong>🚪 Check-out:</strong> ${new Date(dataPartenza).toLocaleDateString('it-IT')}</p>
              <p><strong>💶 Importo:</strong> € ${importo || 'Da concordare'}</p>
            </div>

            <div class="status">
              ${statoPage}
            </div>

            <p>Se hai domande o hai bisogno di modifiche, contattaci pure!</p>

            <p>Grazie per aver scelto il nostro campeggio! 🙏</p>

            <p style="margin-top: 30px; color: #999; font-size: 12px;">
              -- Il Team del Campeggio
            </p>
          </div>

          <div class="footer">
            <p>Questo è un messaggio automatico. Non rispondere a questa email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `🏕️ Prenotazione Confermata - Piazzola #${numeroPiazzola}`,
      html: htmlContent
    });

    console.log(`✅ Email inviata a ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Errore invio email:', error);
    return false;
  }
};

module.exports = { inviaEmailPrenotazione };

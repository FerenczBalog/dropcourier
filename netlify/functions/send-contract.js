const { Resend } = require('resend');
const multipart = require('lambda-multipart-parser');

exports.handler = async (event, context) => {
  // CORS Preflight kezelés
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Hiányzó RESEND_API_KEY környezeti változó.');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const targetEmail = event.queryStringParameters.target || 'balogferencz.artist@gmail.com';

    // 1. A beküldött adatok és csatolmányok feldolgozása
    const result = await multipart.parse(event);

    // 2. Szöveges mezők összefoglalása az e-mail törzséhez
    let fieldsHtml = '<h3>Formular nou trimis:</h3><ul>';
    Object.keys(result).forEach(key => {
      if (key !== 'files' && !key.startsWith('_')) {
        fieldsHtml += `<li><strong>${key}:</strong> ${result[key]}</li>`;
      }
    });
    fieldsHtml += '</ul>';

    // 3. Csatolmányok előkészítése a Resend API számára
    const attachments = (result.files || []).map(file => ({
      filename: file.filename,
      content: file.content // Buffer formátumban van
    }));

    const subject = result._subject || 'Contract nou Tasku';

    // 4. E-mail küldése
    const emailData = await resend.emails.send({
      from: 'DROP Fleet <onboarding@resend.dev>', // Ha igazoltad a saját domainedet, cseréld arra (pl. no-reply@dropcourier.ro)
      to: [targetEmail],
      subject: subject,
      html: fieldsHtml,
      attachments: attachments
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, data: emailData })
    };

  } catch (error) {
    console.error('Szerveroldali hiba (send-contract):', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: error.message || 'Hiba történt a szerveren.' })
    };
  }
};
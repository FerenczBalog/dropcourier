const { Resend } = require('resend');
const multipart = require('lambda-multipart-parser');

exports.handler = async (event, context) => {
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
    
    // Fő címzett a URL paraméterből vagy alapértelmezett
    const targetEmail = event.queryStringParameters.target || 'balogferencz.artist@gmail.com';

    // FormData feldolgozása
    const result = await multipart.parse(event);

    // Másolat címzett (CC) kiolvasása a form-ból vagy alapértelmezett cím
    // const ccEmail = result._cc || 'cristian@eastride.ro';

    // Szöveges mezők HTML formázása
    let fieldsHtml = '<h3>Detaliile contractului:</h3><ul>';
    Object.keys(result).forEach(key => {
      if (key !== 'files' && !key.startsWith('_')) {
        fieldsHtml += `<li><strong>${key}:</strong> ${result[key]}</li>`;
      }
    });
    fieldsHtml += '</ul>';

    // Csatolmányok előkészítése
    const attachments = (result.files || []).map(file => ({
      filename: file.filename,
      content: file.content
    }));

    const subject = result._subject || 'Contract nou Tasku';

    // E-mail küldése fő címzettnek ÉS CC másolatnak
    const emailData = await resend.emails.send({
      from: 'DROP ONBOARDING <onboarding@resend.dev>',
      to: [targetEmail],
      // cc: [ccEmail],  <-- ITT KÜLDI EL A MÁSODIK EMAIL CÍMRE IS!
      replyTo: result._replyto || undefined,
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
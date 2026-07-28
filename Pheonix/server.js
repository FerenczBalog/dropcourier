const express = require('express');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');

const app = express();
app.use(express.json());

// Szimulált adatbázis bejegyzés a felhasználóhoz
const user = {
    id: "123",
    email: "felhasznalo@example.com",
    // 1. Generálunk egy egyedi titkos kulcsot (Secret Key)
    twoFactorSecret: authenticator.generateSecret()
};

async function fetch2FASetup() {
    try {
        const response = await fetch('/api/setup-2fa');
        if (!response.ok) throw new Error('Szerver hiba');
        
        const data = await response.json();
        document.getElementById('qrImage').src = data.qrCode;
        document.getElementById('secretText').innerText = data.secret;
    } catch (error) {
        console.error('Hiba a betöltéskor:', error);
        document.getElementById('secretText').innerText = 'Sikertelen betöltés!';
    }
}

// QR-kód generáló végpont (Setup)
app.get('/api/setup-2fa', async (req, res) => {
    try {
        // 2. Létrehozzuk a TOTP uri-t (ezt értelmezi a Google Authenticator)
        const otpauthUrl = authenticator.keyuri(
            user.email,
            'Saját Weboldal',
            user.twoFactorSecret
        );

        // 3. Generálunk belőle egy Data URL formátumú QR-kód képet
        const qrCodeImageUrl = await QRCode.toDataURL(otpauthUrl);

        // Visszaküldjük a képet és a manuális kódot a kliensnek
        res.json({
            qrCode: qrCodeImageUrl,
            secret: user.twoFactorSecret // Arra az esetre, ha a kamerával nem tudja beolvasni
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba történt a QR-kód generálása során.' });
    }
});

app.listen(3000, () => {
    console.log('Szerver fut: http://localhost:3000');
});
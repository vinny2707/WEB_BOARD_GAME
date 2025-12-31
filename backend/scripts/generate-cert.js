const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

const sslDir = path.join(__dirname, '../ssl');

if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir);
}

console.log('Generating self-signed SSL certificates using Node.js...');

try {
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const options = { days: 365 };

    // Generate certificates
    // selfsigned.generate returns a Promise or object depending on version/sync
    // We handle it as direct object for simplicity as per previous debug success
    const pems = selfsigned.generate(attrs, options);

    // Save to files
    const keyPath = path.join(sslDir, 'key.pem');
    const certPath = path.join(sslDir, 'cert.pem');

    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);

    console.log('Certificates generated successfully in /ssl folder');
    console.log('   - key.pem');
    console.log('   - cert.pem');
} catch (error) {
    console.error('Error generating certificates:', error.message);
}

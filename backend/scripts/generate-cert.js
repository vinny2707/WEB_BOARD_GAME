const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

const sslDir = path.join(__dirname, '../ssl');

// Create ssl directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
}

console.log('Generating self-signed SSL certificates using Node.js...');

/**
 * Main async function to generate certificates
 * Note: selfsigned v5+ uses async/promises
 */
async function generateCertificates() {
    try {
        // Define certificate attributes
        const attrs = [
            { name: 'commonName', value: 'localhost' },
            { name: 'countryName', value: 'VN' },
            { name: 'organizationName', value: 'Board Game Development' },
            { shortName: 'ST', value: 'Local' },
            { shortName: 'OU', value: 'Development' }
        ];

        // Certificate options
        const options = {
            days: 365,
            algorithm: 'sha256',
            extensions: [
                {
                    name: 'basicConstraints',
                    cA: true
                },
                {
                    name: 'keyUsage',
                    keyCertSign: true,
                    digitalSignature: true,
                    nonRepudiation: true,
                    keyEncipherment: true,
                    dataEncipherment: true
                },
                {
                    name: 'subjectAltName',
                    altNames: [
                        {
                            type: 2, // DNS
                            value: 'localhost'
                        },
                        {
                            type: 7, // IP
                            ip: '127.0.0.1'
                        }
                    ]
                }
            ]
        };

        // Generate certificates (await the promise)
        const pems = await selfsigned.generate(attrs, options);

        // Validate generated certificates
        if (!pems || !pems.private || !pems.cert) {
            throw new Error('Failed to generate certificates. Please check the selfsigned library installation.');
        }

        // Save to files
        const keyPath = path.join(sslDir, 'key.pem');
        const certPath = path.join(sslDir, 'cert.pem');

        fs.writeFileSync(keyPath, pems.private, 'utf8');
        fs.writeFileSync(certPath, pems.cert, 'utf8');

        console.log('Certificates generated successfully in /ssl folder');
        console.log('key.pem');
        console.log('cert.pem');
        console.log('Note: These are self-signed certificates for development only.');
        console.log('Do NOT use in production environments!');
    } catch (error) {
        console.error('Error generating certificates:', error.message);
        console.error('Troubleshooting:');
        console.error('1. Make sure selfsigned package is installed: npm install selfsigned');
        console.error('2. Ensure you have Node.js v15.6.0 or higher (selfsigned v5+ requirement)');
        console.error('3. Try deleting node_modules and running: npm install');
        console.error('4. Check if you have write permissions in the ssl directory');
        process.exit(1);
    }
}

// Run the async function
generateCertificates();

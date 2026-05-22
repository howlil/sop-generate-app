const forge = require('node-forge');

const passphrase = process.argv[2] ?? 'change-me';
const now = new Date();
const expiresAt = new Date(now);
expiresAt.setFullYear(now.getFullYear() + 5);

function serial(suffix) {
  return `${new Date().getTime().toString(16)}${suffix}`;
}

const caKeys = forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 });
const signingKeys = forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 });

const caAttrs = [
  { name: 'commonName', value: 'Sistem Informasi SOP Root CA' },
  { name: 'organizationName', value: 'Internal TTE' },
  { name: 'organizationalUnitName', value: 'Certificate Authority' },
  { name: 'countryName', value: 'ID' },
];

const signingAttrs = [
  { name: 'commonName', value: 'Sistem Informasi SOP PDF Signing' },
  { name: 'organizationName', value: 'Internal TTE' },
  { name: 'organizationalUnitName', value: 'PDF Signing' },
  { name: 'countryName', value: 'ID' },
];

const caCert = forge.pki.createCertificate();
caCert.publicKey = caKeys.publicKey;
caCert.serialNumber = serial('ca');
caCert.validity.notBefore = now;
caCert.validity.notAfter = expiresAt;
caCert.setSubject(caAttrs);
caCert.setIssuer(caAttrs);
caCert.setExtensions([
  { name: 'basicConstraints', cA: true },
  { name: 'keyUsage', keyCertSign: true, cRLSign: true, digitalSignature: true },
  { name: 'subjectKeyIdentifier' },
]);
caCert.sign(caKeys.privateKey, forge.md.sha256.create());

const signingCert = forge.pki.createCertificate();
signingCert.publicKey = signingKeys.publicKey;
signingCert.serialNumber = serial('01');
signingCert.validity.notBefore = now;
signingCert.validity.notAfter = expiresAt;
signingCert.setSubject(signingAttrs);
signingCert.setIssuer(caAttrs);
signingCert.setExtensions([
  { name: 'basicConstraints', cA: false },
  { name: 'keyUsage', digitalSignature: true, nonRepudiation: true },
  { name: 'extKeyUsage', codeSigning: true, emailProtection: true },
  { name: 'authorityKeyIdentifier', keyIdentifier: caCert.generateSubjectKeyIdentifier().getBytes() },
  { name: 'subjectKeyIdentifier' },
]);
signingCert.sign(caKeys.privateKey, forge.md.sha256.create());

const p12Asn1 = forge.pkcs12.toPkcs12Asn1(signingKeys.privateKey, [signingCert, caCert], passphrase, {
  algorithm: '3des',
  friendlyName: 'SOP PDF Signing Certificate',
});
const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
const p12Base64 = Buffer.from(p12Der, 'binary').toString('base64');

console.log('PDF_SIGNING_ENABLED=true');
console.log(`PDF_SIGNING_P12_PASSPHRASE=${passphrase}`);
console.log(`PDF_SIGNING_P12_BASE64=${p12Base64}`);

import https from 'https';
import fs from 'fs';
import path from 'path';

export async function setupGigaChatCertificate() {
  const certUrl = 'https://gu-st.ru/content/lending/russian_trusted_root_ca_pem.crt';
  const certPath = path.join(process.cwd(), 'certs', 'russian_trusted_root_ca.crt');
  
  if (!fs.existsSync(path.dirname(certPath))) {
    fs.mkdirSync(path.dirname(certPath), { recursive: true });
  }

  if (!fs.existsSync(certPath)) {
    const response = await fetch(certUrl);
    const cert = await response.text();
    fs.writeFileSync(certPath, cert);
  }

  process.env.NODE_EXTRA_CA_CERTS = certPath;
}

import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { getPhonePeConfig, checkPhonePePaymentStatus } from './backend/src/services/phonepeService';

async function audit() {
  const cfg = getPhonePeConfig();
  console.log('--- PHONEPE CONFIG AUDIT ---');
  console.log('Environment:', cfg.env);
  console.log('Host URL:', cfg.hostUrl);
  console.log('Merchant ID:', cfg.merchantId);
  console.log('Salt Index:', cfg.saltIndex);
  console.log('Salt Key Configured:', Boolean(cfg.saltKey && cfg.saltKey.length > 5));

  console.log('\n--- CALLING LIVE PHONEPE UAT STATUS API ---');
  const res = await checkPhonePePaymentStatus('MCR_1788376007467_hyhxl');
  console.log('Raw Result from PhonePe status check:');
  console.log(JSON.stringify(res, null, 2));
}

audit();

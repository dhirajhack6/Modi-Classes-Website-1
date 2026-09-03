import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure backend/.env is reliably loaded regardless of execution working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import {
  getPhonePeConfig,
  checkPhonePePaymentStatus
} from './src/services/phonepeService';

async function audit() {
  try {
    const cfg = getPhonePeConfig();

    console.log('--- PHONEPE CONFIG AUDIT ---');

    console.log('Environment:', cfg.env);
    console.log('Host URL:', cfg.hostUrl);
    console.log('Merchant ID:', cfg.merchantId);
    console.log('Salt Index:', cfg.saltIndex);
    console.log(
      'Salt Key Configured:',
      Boolean(cfg.saltKey && cfg.saltKey.length > 5)
    );

    console.log('\n--- CALLING PHONEPE STATUS API ---');

    const res = await checkPhonePePaymentStatus(
      'MCR_1788376007467_hyhxl'
    );

    console.log('Raw Result from PhonePe status check:');
    console.log(JSON.stringify(res, null, 2));
  } catch (error) {
    console.error('PhonePe audit failed:', error);
    process.exitCode = 1;
  }
}

audit();

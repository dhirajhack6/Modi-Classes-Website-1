import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import crypto from 'crypto';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

// Prioritize IPv4 resolution to prevent Windows/dual-stack getaddrinfo ENOTFOUND issues
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Node < 17 compatibility fallback
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with proper precedence (defaults -> .env -> .env.local)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: true });


import { 
  INITIAL_BOOKS, 
  INITIAL_COUPONS, 
  INITIAL_USERS_LIST, 
  INITIAL_ORDERS, 
  INITIAL_REVIEWS, 
  INITIAL_BULK_INQUIRIES 
} from './src/data/initialData';
import { createPaymentRouter } from './src/routes/paymentRoutes';
import { createShippingRouter } from './src/routes/shippingRoutes';
import { createTestRouter } from './src/routes/testRoutes';
import { getShiprocketConfig } from './src/services/shiprocketService';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Helper to parse cookies from header
function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const list: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
}

// Password Hashing & Verification
const ADMIN_SALT = 'modi_railway_admin_salt_2026';
function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, ADMIN_SALT, 100000, 64, 'sha512').toString('hex');
}
function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!storedHash) return false;
  try {
    const computed = hashPassword(password);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

// Admin Config from Environment Variables (configurable via ADMIN_EMAIL & ADMIN_PASSWORD in .env)
function getAdminConfig() {
  return {
    email: (process.env.ADMIN_EMAIL || 'admin@modiclasses.in').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'ModiAdmin@2026'
  };
}

// Admin Token Generation & Verification (HMAC SHA-256)
const ADMIN_JWT_SECRET = process.env.JWT_SECRET || 'modi_railway_classes_secure_jwt_secret_2026_super_key';

function generateAdminToken(user: { id: string; email: string; name: string }): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifyAdminToken(token: string): { sub: string; email: string; name: string; role: string } | null {
  try {
    const [body, signature] = token.split('.');
    if (!body || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(body).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== 'admin') return null;
    return payload;
  } catch {
    return null;
  }
}

// Middleware: Require Admin Authentication & Authorization
async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const cookies = parseCookies(req.headers.cookie);
  const bearerHeader = req.headers.authorization;
  const token = (bearerHeader?.startsWith('Bearer ') ? bearerHeader.slice(7) : null) || cookies.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired admin session token.' });
  }

  if (isDbConfigured) {
    try {
      const userRes = await pool.query('SELECT id, name, email, phone, role FROM users WHERE id = $1', [payload.sub]);
      if (userRes.rows.length === 0) {
        return res.status(401).json({ error: 'Unauthorized: Admin user no longer exists.' });
      }
      const u = userRes.rows[0];
      if (u.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions. Admin role required.' });
      }
      (req as any).adminUser = u;
      return next();
    } catch (err: any) {
      console.error('Error verifying admin authorization in DB:', err);
      return res.status(500).json({ error: 'Database verification error.' });
    }
  } else {
    const u = INITIAL_USERS_LIST.find(user => user.id === payload.sub);
    if (!u || u.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions. Admin role required.' });
    }
    (req as any).adminUser = u;
    return next();
  }
}


// Safe Error Sanitizer: removes passwords, credentials, and tokens from error messages and logs
function sanitizeErrorMessage(err: any): string {
  if (!err) return 'Unknown error';
  let message = typeof err === 'string' ? err : (err.message || String(err));
  
  // Mask connection string passwords: postgresql://user:pass@host -> postgresql://user:****@host
  message = message.replace(/(postgres(?:ql)?:\/\/[^:]+:)[^@]+(@[^\/\s]+)/gi, '$1****$2');
  // Mask general password/secret query params
  message = message.replace(/(password|secret|token|key)=([^&\s]+)/gi, '$1=****');
  
  const code = err.code ? ` [Code: ${err.code}]` : '';
  const syscall = err.syscall ? ` [Syscall: ${err.syscall}]` : '';
  const hostname = err.hostname ? ` [Host: ${err.hostname}]` : '';
  
  return `${message}${code}${syscall}${hostname}`;
}

const rawDatabaseUrl = (process.env.DATABASE_URL || '').trim().replace(/^['"]|['"]$/g, '');
const isDbConfigured = Boolean(
  rawDatabaseUrl && 
  !rawDatabaseUrl.includes('username:password') &&
  (rawDatabaseUrl.startsWith('postgresql://') || rawDatabaseUrl.startsWith('postgres://'))
);

// Database state tracker for health checking and graceful startup
const dbState = {
  isConfigured: isDbConfigured,
  isInitialized: false,
  isConnecting: false,
  lastError: null as string | null,
  initAttempts: 0
};

if (!isDbConfigured) {
  console.warn('⚠️ WARNING: DATABASE_URL is not configured or is using placeholder values.');
  console.warn('The server will start in demo memory mode. Configure DATABASE_URL in .env for PostgreSQL persistence.');
}

const pool = new Pool({
  connectionString: isDbConfigured ? rawDatabaseUrl : undefined,
  ssl: isDbConfigured ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Prevent unhandled error crashes from idle pool client disconnects
pool.on('error', (err) => {
  console.error('⚠️ Unexpected idle PostgreSQL client error (non-fatal):', sanitizeErrorMessage(err));
});

// --- OTP Configuration & Transporter Initialization ---
let transporter: nodemailer.Transporter | null = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('📧 SMTP configuration loaded successfully.');
} else {
  console.log('⚠️ SMTP credentials not set. Email OTPs will run in Demo/Console mode.');
}

let twilioClient: any = null;
if (
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && 
  process.env.TWILIO_AUTH_TOKEN && 
  !process.env.TWILIO_AUTH_TOKEN.includes('your_')
) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('💬 Twilio client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Twilio client:', err);
  }
} else {
  console.log('⚠️ Twilio credentials not configured. SMS OTPs will run in Demo/Console mode.');
}

// PhonePe & UPI Payment Gateway Routes
app.use('/api/payment', createPaymentRouter(pool, isDbConfigured));
app.use('/api/shipping', createShippingRouter(pool, isDbConfigured, requireAdmin));

// TEMPORARY TEST ONLY - Shiprocket Order Payload Testing Endpoint
app.use('/api/test', createTestRouter(pool));

// Fallback in-memory OTP store in case database is not configured
interface MemoryOtp {
  otp: string;
  expiresAt: number;
  verified: boolean;
}
const memoryOtpStore = new Map<string, MemoryOtp>();

// Save OTP code to Database or Memory Store
async function saveOtp(identifier: string, otp: string, expiresAt: Date) {
  if (isDbConfigured) {
    await pool.query(
      `INSERT INTO otps (identifier, otp, expires_at, verified) VALUES ($1, $2, $3, FALSE)`,
      [identifier, otp, expiresAt]
    );
  } else {
    memoryOtpStore.set(identifier, {
      otp,
      expiresAt: expiresAt.getTime(),
      verified: false
    });
  }
}

// Verify OTP code in Database or Memory Store
async function verifyOtpInStore(identifier: string, otp: string): Promise<boolean> {
  if (isDbConfigured) {
    const result = await pool.query(
      `SELECT * FROM otps 
       WHERE identifier = $1 
         AND otp = $2 
         AND verified = FALSE 
         AND expires_at > CURRENT_TIMESTAMP 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [identifier, otp]
    );
    
    if (result.rows.length > 0) {
      const otpRow = result.rows[0];
      await pool.query('UPDATE otps SET verified = TRUE WHERE id = $1', [otpRow.id]);
      return true;
    }
    return false;
  } else {
    const record = memoryOtpStore.get(identifier);
    if (record && record.otp === otp && !record.verified && record.expiresAt > Date.now()) {
      record.verified = true;
      memoryOtpStore.set(identifier, record);
      return true;
    }
    return false;
  }
}

// Send OTP via Email
async function sendEmailOtp(email: string, otp: string): Promise<boolean> {
  if (!transporter) {
    console.log(`\n-----------------------------------------`);
    console.log(`🔥 [DEMO EMAIL OTP] Sent to: \x1b[36m${email}\x1b[0m`);
    console.log(`🔑 Verification Code: \x1b[32m${otp}\x1b[0m`);
    console.log(`-----------------------------------------\n`);
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_SENDER || `"Modi Railway Classes" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Modi Railway Classes - OTP Verification Code',
      text: `Your OTP for verification is: ${otp}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2874f0; text-align: center; margin-bottom: 20px;">Modi Railway Classes</h2>
          <p>Dear Student,</p>
          <p>Please use the following One-Time Password (OTP) to log in or complete your registration:</p>
          <div style="text-align: center; margin: 30px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #64748b;">This OTP is valid for 5 minutes and should not be shared with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2026 Modi Railway Classes. All rights reserved.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email OTP sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send Email OTP to ${email}:`, error);
    return false;
  }
}

// Send OTP via SMS
async function sendSmsOtp(phone: string, otp: string): Promise<boolean> {
  if (!twilioClient) {
    console.log(`\n-----------------------------------------`);
    console.log(`🔥 [DEMO SMS OTP] Sent to: \x1b[36m${phone}\x1b[0m`);
    console.log(`🔑 Verification Code: \x1b[32m${otp}\x1b[0m`);
    console.log(`-----------------------------------------\n`);
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: `Your Modi Railway Classes verification code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_FROM_NUMBER,
      to: phone
    });
    console.log(`✅ SMS OTP sent successfully to ${phone}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send SMS OTP to ${phone}:`, error);
    return false;
  }
}

// Database Initialization & Seeding helper with retry logic and error safety
async function initDb(maxRetries = 5, retryDelayMs = 2000): Promise<boolean> {
  if (!isDbConfigured) {
    console.log('ℹ️ Skipping DB Initialization: DATABASE_URL not configured.');
    dbState.isInitialized = true;
    return true;
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    dbState.initAttempts = attempt;
    dbState.isConnecting = true;
    let client;
    try {
      console.log(`📡 Connecting to PostgreSQL database (attempt ${attempt}/${maxRetries})...`);
      client = await pool.connect();
      console.log('✅ PostgreSQL connection established successfully.');
      console.log('Initializing PostgreSQL database schemas...');

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL,
        "enrolledBatches" JSONB,
        "savedAddresses" JSONB,
        "studentRollNumber" VARCHAR(100),
        "avatarUrl" TEXT,
        password_hash VARCHAR(255)
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
    `);

    // 2. Books Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id VARCHAR(100) PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        slug VARCHAR(255) UNIQUE,
        author VARCHAR(255),
        "authorDesignation" TEXT,
        "coverImage" TEXT,
        "formatAvailable" JSONB,
        "pricePdf" NUMERIC,
        "discountPricePdf" NUMERIC,
        "priceHardcopy" NUMERIC,
        "discountPriceHardcopy" NUMERIC,
        "priceCombo" NUMERIC,
        "discountPriceCombo" NUMERIC,
        "stockQuantity" INTEGER,
        "lowStockThreshold" INTEGER,
        exam VARCHAR(255),
        subject VARCHAR(255),
        "targetYear" VARCHAR(100),
        language VARCHAR(100),
        pages INTEGER,
        edition VARCHAR(255),
        isbn VARCHAR(50),
        rating NUMERIC,
        "reviewCount" INTEGER,
        "isBestseller" BOOLEAN,
        "isNewArrival" BOOLEAN,
        "isBatchExclusive" BOOLEAN,
        "linkedBatches" JSONB,
        "batchDiscountPercent" NUMERIC,
        description TEXT,
        highlights JSONB,
        "tableOfContents" JSONB,
        "samplePages" JSONB,
        "weightGrams" INTEGER,
        publisher VARCHAR(255),
        "isActive" BOOLEAN,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Coupons Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR(100) PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        "discountType" VARCHAR(50) NOT NULL,
        "discountValue" NUMERIC NOT NULL,
        "minCartValue" NUMERIC,
        "maxDiscount" NUMERIC,
        "validTill" VARCHAR(50),
        description TEXT,
        "applicableExam" VARCHAR(255),
        "batchCode" VARCHAR(255),
        "usageCount" INTEGER DEFAULT 0,
        "usageLimit" INTEGER DEFAULT 1000,
        "isActive" BOOLEAN DEFAULT TRUE
      );
    `);

    // 4. Reviews Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(100) PRIMARY KEY,
        "bookId" VARCHAR(100) NOT NULL,
        "userName" VARCHAR(255) NOT NULL,
        "userBatch" VARCHAR(255),
        rating INTEGER NOT NULL,
        date VARCHAR(100),
        comment TEXT,
        "verifiedPurchase" BOOLEAN,
        "formatPurchased" VARCHAR(50),
        likes INTEGER DEFAULT 0,
        "conceptRating" INTEGER,
        "printRating" INTEGER,
        "questionsRating" INTEGER
      );
    `);

    // 5. Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        "orderNumber" VARCHAR(100) UNIQUE NOT NULL,
        "userId" VARCHAR(100) NOT NULL,
        "customerName" VARCHAR(255),
        "customerEmail" VARCHAR(255),
        "customerPhone" VARCHAR(50),
        items JSONB NOT NULL,
        "itemsCount" INTEGER,
        subtotal NUMERIC,
        discount NUMERIC,
        "couponCode" VARCHAR(100),
        "shippingFee" NUMERIC,
        "codFee" NUMERIC,
        "taxAmount" NUMERIC,
        "totalAmount" NUMERIC,
        "hasDigitalItems" BOOLEAN,
        "hasPhysicalItems" BOOLEAN,
        "paymentMethod" VARCHAR(50),
        "paymentStatus" VARCHAR(50),
        "paymentTransactionId" VARCHAR(255),
        "orderStatus" VARCHAR(50),
        "courierPartner" VARCHAR(255),
        "trackingNumber" VARCHAR(255),
        "estimatedDeliveryDate" VARCHAR(100),
        "trackingTimeline" JSONB,
        "shippingAddress" JSONB,
        "digitalLicenses" JSONB,
        "invoiceNumber" VARCHAR(100),
        "createdAt" VARCHAR(100)
      );

      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "shippingStatus" VARCHAR(50) DEFAULT 'SHIPMENT_PENDING';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "fulfillmentStatus" VARCHAR(50) DEFAULT 'SHIPMENT_PENDING';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "fulfillmentError" TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "shiprocketOrderId" VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "shiprocketShipmentId" VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "shiprocketCourierId" INTEGER;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "shiprocketCourierName" VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "awbCode" VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "shipmentTrackingUrl" TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "pickupRequestId" VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "pickupStatus" VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "pickupScheduledDate" VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "lastShiprocketSyncAt" VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "paymentVerifiedAt" VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "gatewayOrderId" VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "idempotencyKey" VARCHAR(255);
    `);

    // 6. Bulk Inquiries Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bulk_inquiries (
        id VARCHAR(100) PRIMARY KEY,
        "institutionName" VARCHAR(255) NOT NULL,
        "contactPerson" VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        "targetExam" VARCHAR(255),
        "bookTitles" JSONB,
        "estimatedCopies" INTEGER,
        city VARCHAR(255),
        state VARCHAR(255),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'new',
        "createdAt" VARCHAR(100)
      );
    `);

    // 7. OTP Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Book Price History Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS book_price_history (
        id SERIAL PRIMARY KEY,
        book_id VARCHAR(100) NOT NULL,
        old_mrp NUMERIC,
        new_mrp NUMERIC,
        old_selling_price NUMERIC NOT NULL,
        new_selling_price NUMERIC NOT NULL,
        changed_by VARCHAR(255) NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Admin Settings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Schemas created successfully.');

    // --- Seeding ---
    // Seed Users
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const adminConfig = getAdminConfig();
    const defaultAdminHash = hashPassword(adminConfig.password);
    if (parseInt(usersCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial users...');
      for (const u of INITIAL_USERS_LIST) {
        const passHash = u.role === 'admin' ? defaultAdminHash : null;
        const userEmail = u.role === 'admin' ? adminConfig.email : u.email;
        await client.query(
          `INSERT INTO users (id, name, email, phone, role, "enrolledBatches", "savedAddresses", "studentRollNumber", "avatarUrl", password_hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [u.id, u.name, userEmail, u.phone, u.role, JSON.stringify(u.enrolledBatches), JSON.stringify(u.savedAddresses), u.studentRollNumber || null, u.avatarUrl || null, passHash]
        );
      }
    } else {
      // Ensure admin user exists and stays synchronized with .env credentials
      const adminRows = await client.query("SELECT id, email, password_hash FROM users WHERE role = 'admin' LIMIT 1");
      if (adminRows.rows.length === 0) {
        console.log('Creating initial admin user...');
        await client.query(
          `INSERT INTO users (id, name, email, phone, role, "enrolledBatches", "savedAddresses", "studentRollNumber", "avatarUrl", password_hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          ['usr-104', ' Sandeep', adminConfig.email, '+91 98100 88221', 'admin', '["RRB ALP Psycho Special Batch 2025"]', '[]', 'MC-FACULTY-001', null, defaultAdminHash]
        );
      } else {
        const adminRow = adminRows.rows[0];
        // If ADMIN_EMAIL or ADMIN_PASSWORD is set in env, synchronize DB record
        if (process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD) {
          await client.query(
            `UPDATE users 
             SET email = COALESCE($1, email),
                 password_hash = COALESCE($2, password_hash)
             WHERE id = $3`,
            [process.env.ADMIN_EMAIL ? adminConfig.email : null, process.env.ADMIN_PASSWORD ? defaultAdminHash : null, adminRow.id]
          );
        } else if (!adminRow.password_hash) {
          await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [defaultAdminHash, adminRow.id]);
        }
      }
    }

    // Seed Books
    const booksCount = await client.query('SELECT COUNT(*) FROM books');
    if (parseInt(booksCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial books...');
      for (const b of INITIAL_BOOKS) {
        await client.query(
          `INSERT INTO books (
             id, title, subtitle, slug, author, "authorDesignation", "coverImage", "formatAvailable",
             "pricePdf", "discountPricePdf", "priceHardcopy", "discountPriceHardcopy", "priceCombo", "discountPriceCombo",
             "stockQuantity", "lowStockThreshold", exam, subject, "targetYear", language, pages, edition, isbn, rating,
             "reviewCount", "isBestseller", "isNewArrival", "isBatchExclusive", "linkedBatches", "batchDiscountPercent",
             description, highlights, "tableOfContents", "samplePages", "weightGrams", publisher, "isActive"
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
             $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37
           )`,
          [
            b.id, b.title, b.subtitle || null, b.slug, b.author, b.authorDesignation || null, b.coverImage || null, JSON.stringify(b.formatAvailable),
            b.pricePdf, b.discountPricePdf, b.priceHardcopy, b.discountPriceHardcopy, b.priceCombo, b.discountPriceCombo,
            b.stockQuantity, b.lowStockThreshold, b.exam, b.subject, b.targetYear || null, b.language, b.pages, b.edition || null, b.isbn || null, b.rating,
            b.reviewCount, b.isBestseller || false, b.isNewArrival || false, b.isBatchExclusive || false, JSON.stringify(b.linkedBatches || []), b.batchDiscountPercent || 0,
            b.description, JSON.stringify(b.highlights || []), JSON.stringify(b.tableOfContents || []), JSON.stringify(b.samplePages || []), b.weightGrams, b.publisher || null, b.isActive
          ]
        );
      }
    }

    // Seed Coupons
    const couponsCount = await client.query('SELECT COUNT(*) FROM coupons');
    if (parseInt(couponsCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial coupons...');
      for (const c of INITIAL_COUPONS) {
        await client.query(
          `INSERT INTO coupons (
             id, code, "discountType", "discountValue", "minCartValue", "maxDiscount", "validTill",
             description, "applicableExam", "batchCode", "usageCount", "usageLimit", "isActive"
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            c.id, c.code, c.discountType, c.discountValue, c.minCartValue || 0, c.maxDiscount || null, c.validTill || null,
            c.description, c.applicableExam || null, c.batchCode || null, c.usageCount || 0, c.usageLimit || 1000, c.isActive
          ]
        );
      }
    }

    // Seed Reviews
    const reviewsCount = await client.query('SELECT COUNT(*) FROM reviews');
    if (parseInt(reviewsCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial reviews...');
      for (const r of INITIAL_REVIEWS) {
        await client.query(
          `INSERT INTO reviews (
             id, "bookId", "userName", "userBatch", rating, date, comment,
             "verifiedPurchase", "formatPurchased", likes, "conceptRating", "printRating", "questionsRating"
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            r.id, r.bookId, r.userName, r.userBatch || null, r.rating, r.date, r.comment,
            r.verifiedPurchase, r.formatPurchased, r.likes || 0, r.conceptRating || r.rating, r.printRating || r.rating, r.questionsRating || r.rating
          ]
        );
      }
    }

    // Seed Orders
    const ordersCount = await client.query('SELECT COUNT(*) FROM orders');
    if (parseInt(ordersCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial orders...');
      for (const o of INITIAL_ORDERS) {
        await client.query(
          `INSERT INTO orders (
             id, "orderNumber", "userId", "customerName", "customerEmail", "customerPhone",
             items, "itemsCount", subtotal, discount, "couponCode", "shippingFee", "codFee",
             "taxAmount", "totalAmount", "hasDigitalItems", "hasPhysicalItems", "paymentMethod",
             "paymentStatus", "paymentTransactionId", "orderStatus", "courierPartner",
             "trackingNumber", "estimatedDeliveryDate", "trackingTimeline", "shippingAddress",
             "digitalLicenses", "invoiceNumber", "createdAt"
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
           )`,
          [
            o.id, o.orderNumber, o.userId, o.customerName, o.customerEmail, o.customerPhone,
            JSON.stringify(o.items), o.itemsCount, o.subtotal, o.discount, o.couponCode || null, o.shippingFee, o.codFee,
            o.taxAmount, o.totalAmount, o.hasDigitalItems, o.hasPhysicalItems, o.paymentMethod,
            o.paymentStatus, o.paymentTransactionId || null, o.orderStatus, o.courierPartner || null,
            o.trackingNumber || null, o.estimatedDeliveryDate || null, JSON.stringify(o.trackingTimeline || []), JSON.stringify(o.shippingAddress || null),
            JSON.stringify(o.digitalLicenses || []), o.invoiceNumber, o.createdAt
          ]
        );
      }
    }

    // Seed Bulk Inquiries
    const bulkCount = await client.query('SELECT COUNT(*) FROM bulk_inquiries');
    if (parseInt(bulkCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial bulk inquiries...');
      for (const b of INITIAL_BULK_INQUIRIES) {
        await client.query(
          `INSERT INTO bulk_inquiries (
             id, "institutionName", "contactPerson", email, phone, "targetExam", "bookTitles",
             "estimatedCopies", city, state, notes, status, "createdAt"
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            b.id, b.institutionName, b.contactPerson, b.email, b.phone, b.targetExam, JSON.stringify(b.bookTitles || []),
            b.estimatedCopies, b.city, b.state, b.notes, b.status, b.createdAt
          ]
        );
      }
    }

    // Seed Admin Settings if empty
    const settingsCheck = await client.query('SELECT COUNT(*) FROM admin_settings');
    if (parseInt(settingsCheck.rows[0].count, 10) === 0) {
      const initialSettings = {
        storeName: 'Modi Railway Psychotest Classes',
        contactEmail: 'support@modiclasses.in',
        contactPhone: '+91 98100 88221',
        address: 'Modi Classes Academic Tower, Commercial Complex, Mukherjee Nagar, Delhi 110009',
        orderPrefix: 'MC-ALP-',
        codFee: 40,
        freeShippingThreshold: 0,
        defaultCourier: 'Delhivery Express Direct',
        dispatchHours: '48 Hours',
        emailNotifications: true,
        smsNotifications: true
      };
      await client.query(
        `INSERT INTO admin_settings (key, value) VALUES ('general', $1)`,
        [JSON.stringify(initialSettings)]
      );
    }

    console.log('Database seeding completed successfully.');
    dbState.isInitialized = true;
    dbState.lastError = null;
    dbState.isConnecting = false;
    return true;
  } catch (err: any) {
    const sanitizedMsg = sanitizeErrorMessage(err);
    dbState.lastError = sanitizedMsg;
    console.error(`❌ Database connection/initialization attempt ${attempt}/${maxRetries} failed:`, sanitizedMsg);

    if (attempt < maxRetries) {
      const delay = retryDelayMs * attempt;
      console.log(`⏳ Retrying database initialization in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  } finally {
    if (client) {
      try {
        client.release();
      } catch {
        // ignore release error
      }
    }
    dbState.isConnecting = false;
  }
}

  console.error('💥 FATAL: PostgreSQL database initialization failed after all retry attempts.');
  return false;
}

// Helper to convert DB fields (numeric fields need formatting to number type)
const parseBook = (row: any) => {
  if (!row) return row;
  
  const pricePdf = row.pricePdf !== undefined ? row.pricePdf : row.pricepdf;
  const discountPricePdf = row.discountPricePdf !== undefined ? row.discountPricePdf : row.discountpricepdf;
  const priceHardcopy = row.priceHardcopy !== undefined ? row.priceHardcopy : row.pricehardcopy;
  const discountPriceHardcopy = row.discountPriceHardcopy !== undefined ? row.discountPriceHardcopy : row.discountpricehardcopy;
  const priceCombo = row.priceCombo !== undefined ? row.priceCombo : row.pricecombo;
  const discountPriceCombo = row.discountPriceCombo !== undefined ? row.discountPriceCombo : row.discountpricecombo;
  
  const stockQuantity = row.stockQuantity !== undefined ? row.stockQuantity : row.stockquantity;
  const lowStockThreshold = row.lowStockThreshold !== undefined ? row.lowStockThreshold : row.lowstockthreshold;
  const targetYear = row.targetYear !== undefined ? row.targetYear : row.targetyear;
  const reviewCount = row.reviewCount !== undefined ? row.reviewCount : row.reviewcount;
  const isBestseller = row.isBestseller !== undefined ? row.isBestseller : row.isbestseller;
  const isNewArrival = row.isNewArrival !== undefined ? row.isNewArrival : row.isnewarrival;
  const isBatchExclusive = row.isBatchExclusive !== undefined ? row.isBatchExclusive : row.isbatchexclusive;
  const linkedBatches = row.linkedBatches !== undefined ? row.linkedBatches : row.linkedbatches;
  const batchDiscountPercent = row.batchDiscountPercent !== undefined ? row.batchDiscountPercent : row.batchdiscountpercent;
  const highlights = row.highlights !== undefined ? row.highlights : row.highlights;
  const tableOfContents = row.tableOfContents !== undefined ? row.tableOfContents : row.tableofcontents;
  const samplePages = row.samplePages !== undefined ? row.samplePages : row.samplepages;
  const weightGrams = row.weightGrams !== undefined ? row.weightGrams : row.weightgrams;
  const isActive = row.isActive !== undefined ? row.isActive : row.isactive;
  const authorDesignation = row.authorDesignation !== undefined ? row.authorDesignation : row.authordesignation;
  const coverImage = row.coverImage !== undefined ? row.coverImage : row.coverimage;
  const formatAvailable = row.formatAvailable !== undefined ? row.formatAvailable : row.formatavailable;
  const createdAt = row.createdAt !== undefined ? row.createdAt : row.createdat;

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    slug: row.slug,
    author: row.author,
    authorDesignation: authorDesignation,
    coverImage: coverImage,
    formatAvailable: typeof formatAvailable === 'string' ? JSON.parse(formatAvailable) : formatAvailable,
    pricePdf: pricePdf ? Number(pricePdf) : 0,
    discountPricePdf: discountPricePdf ? Number(discountPricePdf) : 0,
    priceHardcopy: priceHardcopy ? Number(priceHardcopy) : 0,
    discountPriceHardcopy: discountPriceHardcopy ? Number(discountPriceHardcopy) : 0,
    priceCombo: priceCombo ? Number(priceCombo) : 0,
    discountPriceCombo: discountPriceCombo ? Number(discountPriceCombo) : 0,
    stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
    lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 0,
    exam: row.exam,
    subject: row.subject,
    targetYear: targetYear,
    language: row.language,
    pages: row.pages ? Number(row.pages) : 0,
    edition: row.edition,
    isbn: row.isbn,
    rating: row.rating ? Number(row.rating) : 0,
    reviewCount: reviewCount ? Number(reviewCount) : 0,
    isBestseller: Boolean(isBestseller),
    isNewArrival: Boolean(isNewArrival),
    isBatchExclusive: Boolean(isBatchExclusive),
    linkedBatches: typeof linkedBatches === 'string' ? JSON.parse(linkedBatches) : linkedBatches,
    batchDiscountPercent: batchDiscountPercent ? Number(batchDiscountPercent) : 0,
    description: row.description,
    highlights: typeof highlights === 'string' ? JSON.parse(highlights) : highlights,
    tableOfContents: typeof tableOfContents === 'string' ? JSON.parse(tableOfContents) : tableOfContents,
    samplePages: typeof samplePages === 'string' ? JSON.parse(samplePages) : samplePages,
    weightGrams: weightGrams ? Number(weightGrams) : 0,
    publisher: row.publisher,
    isActive: Boolean(isActive),
    createdAt: createdAt
  };
};

const parseCoupon = (row: any) => {
  if (!row) return row;
  
  const discountType = row.discountType !== undefined ? row.discountType : row.discounttype;
  const discountValue = row.discountValue !== undefined ? row.discountValue : row.discountvalue;
  const minCartValue = row.minCartValue !== undefined ? row.minCartValue : row.mincartvalue;
  const maxDiscount = row.maxDiscount !== undefined ? row.maxDiscount : row.maxdiscount;
  const validTill = row.validTill !== undefined ? row.validTill : row.validtill;
  const applicableExam = row.applicableExam !== undefined ? row.applicableExam : row.applicableexam;
  const batchCode = row.batchCode !== undefined ? row.batchCode : row.batchcode;
  const usageCount = row.usageCount !== undefined ? row.usageCount : row.usagecount;
  const usageLimit = row.usageLimit !== undefined ? row.usageLimit : row.usagelimit;
  const isActive = row.isActive !== undefined ? row.isActive : row.isactive;

  return {
    id: row.id,
    code: row.code,
    discountType,
    discountValue: discountValue ? Number(discountValue) : 0,
    minCartValue: minCartValue ? Number(minCartValue) : 0,
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    validTill,
    description: row.description,
    applicableExam,
    batchCode,
    usageCount: usageCount ? Number(usageCount) : 0,
    usageLimit: usageLimit ? Number(usageLimit) : 0,
    isActive: Boolean(isActive)
  };
};

const parseOrder = (row: any) => {
  if (!row) return row;
  
  const subtotal = row.subtotal !== undefined ? row.subtotal : row.subtotal;
  const discount = row.discount !== undefined ? row.discount : row.discount;
  const shippingFee = row.shippingFee !== undefined ? row.shippingFee : row.shippingfee;
  const codFee = row.codFee !== undefined ? row.codFee : row.codfee;
  const taxAmount = row.taxAmount !== undefined ? row.taxAmount : row.taxamount;
  const totalAmount = row.totalAmount !== undefined ? row.totalAmount : row.totalamount;
  
  const orderNumber = row.orderNumber !== undefined ? row.orderNumber : row.ordernumber;
  const userId = row.userId !== undefined ? row.userId : row.userid;
  const customerName = row.customerName !== undefined ? row.customerName : row.customername;
  const customerEmail = row.customerEmail !== undefined ? row.customerEmail : row.customeremail;
  const customerPhone = row.customerPhone !== undefined ? row.customerPhone : row.customerphone;
  const itemsCount = row.itemsCount !== undefined ? row.itemsCount : row.itemscount;
  const hasDigitalItems = row.hasDigitalItems !== undefined ? row.hasDigitalItems : row.hasdigitalitems;
  const hasPhysicalItems = row.hasPhysicalItems !== undefined ? row.hasPhysicalItems : row.hasphysicalitems;
  const paymentMethod = row.paymentMethod !== undefined ? row.paymentMethod : row.paymentmethod;
  const paymentStatus = row.paymentStatus !== undefined ? row.paymentStatus : row.paymentstatus;
  const paymentTransactionId = row.paymentTransactionId !== undefined ? row.paymentTransactionId : row.paymenttransactionid;
  const orderStatus = row.orderStatus !== undefined ? row.orderStatus : row.orderstatus;
  const courierPartner = row.courierPartner !== undefined ? row.courierPartner : row.courierpartner;
  const trackingNumber = row.trackingNumber !== undefined ? row.trackingNumber : row.trackingnumber;
  const estimatedDeliveryDate = row.estimatedDeliveryDate !== undefined ? row.estimatedDeliveryDate : row.estimateddeliverydate;
  const trackingTimeline = row.trackingTimeline !== undefined ? row.trackingTimeline : row.trackingtimeline;
  const shippingAddress = row.shippingAddress !== undefined ? row.shippingAddress : row.shippingaddress;
  const digitalLicenses = row.digitalLicenses !== undefined ? row.digitalLicenses : row.digitallicenses;
  const invoiceNumber = row.invoiceNumber !== undefined ? row.invoiceNumber : row.invoicenumber;
  const createdAt = row.createdAt !== undefined ? row.createdAt : row.createdat;

  const shippingStatus = row.shippingStatus !== undefined ? row.shippingStatus : row.shippingstatus;
  const shiprocketOrderId = row.shiprocketOrderId !== undefined ? row.shiprocketOrderId : row.shiprocketorderid;
  const shiprocketShipmentId = row.shiprocketShipmentId !== undefined ? row.shiprocketShipmentId : row.shiprocketshipmentid;
  const awbCode = row.awbCode !== undefined ? row.awbCode : row.awbcode;
  const shipmentTrackingUrl = row.shipmentTrackingUrl !== undefined ? row.shipmentTrackingUrl : row.shipmenttrackingurl;
  const paymentVerifiedAt = row.paymentVerifiedAt !== undefined ? row.paymentVerifiedAt : row.paymentverifiedat;
  const gatewayOrderId = row.gatewayOrderId !== undefined ? row.gatewayOrderId : row.gatewayorderid;

  const finalAwb = awbCode || trackingNumber || null;

  return {
    id: row.id,
    orderNumber,
    userId,
    customerName,
    customerEmail,
    customerPhone,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    itemsCount: itemsCount ? Number(itemsCount) : 0,
    subtotal: subtotal ? Number(subtotal) : 0,
    discount: discount ? Number(discount) : 0,
    couponCode: row.couponCode !== undefined ? row.couponCode : row.couponcode,
    shippingFee: shippingFee ? Number(shippingFee) : 0,
    codFee: 0, // No COD
    taxAmount: taxAmount ? Number(taxAmount) : 0,
    totalAmount: totalAmount ? Number(totalAmount) : 0,
    hasDigitalItems: Boolean(hasDigitalItems),
    hasPhysicalItems: Boolean(hasPhysicalItems),
    paymentMethod,
    paymentStatus,
    paymentTransactionId,
    orderStatus,
    shippingStatus: shippingStatus || (orderStatus === 'delivered' ? 'DELIVERED' : (paymentStatus === 'PAID' || paymentStatus === 'paid' ? 'SHIPMENT_CREATED' : 'SHIPMENT_PENDING')),
    shiprocketOrderId: shiprocketOrderId || null,
    shiprocketShipmentId: shiprocketShipmentId || null,
    awbCode: finalAwb,
    courierPartner: courierPartner || 'Delhivery Express',
    trackingNumber: finalAwb,
    estimatedDeliveryDate: estimatedDeliveryDate || 'In 2-3 Business Days',
    shipmentTrackingUrl: shipmentTrackingUrl || (finalAwb ? `https://shiprocket.co/tracking/${finalAwb}` : null),
    paymentVerifiedAt: paymentVerifiedAt || null,
    gatewayOrderId: gatewayOrderId || null,
    trackingTimeline: typeof trackingTimeline === 'string' ? JSON.parse(trackingTimeline) : trackingTimeline,
    shippingAddress: typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress,
    digitalLicenses: typeof digitalLicenses === 'string' ? JSON.parse(digitalLicenses) : digitalLicenses,
    invoiceNumber,
    createdAt
  };
};

const parseUser = (row: any) => {
  if (!row) return row;
  const enrolledBatches = row.enrolledBatches !== undefined ? row.enrolledBatches : row.enrolledbatches;
  const savedAddresses = row.savedAddresses !== undefined ? row.savedAddresses : row.savedaddresses;
  const studentRollNumber = row.studentRollNumber !== undefined ? row.studentRollNumber : row.studentrollnumber;
  const avatarUrl = row.avatarUrl !== undefined ? row.avatarUrl : row.avatarurl;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    enrolledBatches: typeof enrolledBatches === 'string' ? JSON.parse(enrolledBatches) : enrolledBatches,
    savedAddresses: typeof savedAddresses === 'string' ? JSON.parse(savedAddresses) : savedAddresses,
    studentRollNumber,
    avatarUrl
  };
};


// --- API Endpoints ---

// --- Auth OTP API Endpoints ---
app.post('/api/auth/send-otp', async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Email or Mobile number is required' });
  }

  const clean = identifier.trim().toLowerCase();
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  try {
    await saveOtp(clean, otp, expiresAt);

    let sentReal = false;
    const isEmail = clean.includes('@');

    if (isEmail) {
      sentReal = await sendEmailOtp(clean, otp);
    } else {
      // Clean phone number (add +91 if 10 digits and doesn't start with +)
      let formattedPhone = clean.replace(/[^0-9+]/g, '');
      if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
      }
      sentReal = await sendSmsOtp(formattedPhone, otp);
    }

    if (!sentReal) {
  return res.status(500).json({
    success: false,
    error: 'Unable to send OTP. Please try again later.'
  });
}

    res.json({
      success: true,
      message: `OTP sent successfully to ${isEmail ? 'email' : 'mobile number'}.`
    });
  } catch (err: any) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp) {
    return res.status(400).json({ error: 'Identifier and OTP are required.' });
  }

  const clean = identifier.trim().toLowerCase();

  try {
    const isValid = await verifyOtpInStore(clean, otp.trim());
    if (isValid) {
      res.json({ success: true, message: 'OTP verified successfully.' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid or expired OTP. Please try again.' });
    }
  } catch (err: any) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// 1. Books API
app.get('/api/books', async (req, res) => {
  if (!isDbConfigured) return res.json(INITIAL_BOOKS);
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY id');
    res.json(result.rows.map(parseBook));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  const b = req.body;
  const id = b.id || 'book-' + Date.now();
  try {
    await pool.query(
      `INSERT INTO books (
         id, title, subtitle, slug, author, "authorDesignation", "coverImage", "formatAvailable",
         "pricePdf", "discountPricePdf", "priceHardcopy", "discountPriceHardcopy", "priceCombo", "discountPriceCombo",
         "stockQuantity", "lowStockThreshold", exam, subject, "targetYear", language, pages, edition, isbn, rating,
         "reviewCount", "isBestseller", "isNewArrival", "isBatchExclusive", "linkedBatches", "batchDiscountPercent",
         description, highlights, "tableOfContents", "samplePages", "weightGrams", publisher, "isActive"
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
         $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37
       )`,
      [
        id, b.title, b.subtitle || null, b.slug, b.author, b.authorDesignation || null, b.coverImage || null, JSON.stringify(b.formatAvailable || []),
        b.pricePdf || 0, b.discountPricePdf || 0, b.priceHardcopy || 0, b.discountPriceHardcopy || 0, b.priceCombo || 0, b.discountPriceCombo || 0,
        b.stockQuantity || 0, b.lowStockThreshold || 10, b.exam, b.subject, b.targetYear || null, b.language, b.pages || 0, b.edition || null, b.isbn || null, b.rating || 5.0,
        b.reviewCount || 0, b.isBestseller || false, b.isNewArrival || false, b.isBatchExclusive || false, JSON.stringify(b.linkedBatches || []), b.batchDiscountPercent || 0,
        b.description || '', JSON.stringify(b.highlights || []), JSON.stringify(b.tableOfContents || []), JSON.stringify(b.samplePages || []), b.weightGrams || 500, b.publisher || null, b.isActive !== false
      ]
    );
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    res.json(parseBook(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  const { id } = req.params;
  const updates = req.body;
  
  try {
    // Get existing book
    const existing = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    
    const b = { ...parseBook(existing.rows[0]), ...updates };
    
    await pool.query(
      `UPDATE books SET
         title = $2, subtitle = $3, slug = $4, author = $5, "authorDesignation" = $6, "coverImage" = $7, "formatAvailable" = $8,
         "pricePdf" = $9, "discountPricePdf" = $10, "priceHardcopy" = $11, "discountPriceHardcopy" = $12, "priceCombo" = $13, "discountPriceCombo" = $14,
         "stockQuantity" = $15, "lowStockThreshold" = $16, exam = $17, subject = $18, "targetYear" = $19, language = $20, pages = $21,
         edition = $22, isbn = $23, rating = $24, "reviewCount" = $25, "isBestseller" = $26, "isNewArrival" = $27, "isBatchExclusive" = $28,
         "linkedBatches" = $29, "batchDiscountPercent" = $30, description = $31, highlights = $32, "tableOfContents" = $33, "samplePages" = $34,
         "weightGrams" = $35, publisher = $36, "isActive" = $37
       WHERE id = $1`,
      [
        id, b.title, b.subtitle || null, b.slug, b.author, b.authorDesignation || null, b.coverImage || null, JSON.stringify(b.formatAvailable || []),
        b.pricePdf || 0, b.discountPricePdf || 0, b.priceHardcopy || 0, b.discountPriceHardcopy || 0, b.priceCombo || 0, b.discountPriceCombo || 0,
        b.stockQuantity || 0, b.lowStockThreshold || 10, b.exam, b.subject, b.targetYear || null, b.language, b.pages || 0, b.edition || null, b.isbn || null, b.rating || 5.0,
        b.reviewCount || 0, b.isBestseller || false, b.isNewArrival || false, b.isBatchExclusive || false, JSON.stringify(b.linkedBatches || []), b.batchDiscountPercent || 0,
        b.description || '', JSON.stringify(b.highlights || []), JSON.stringify(b.tableOfContents || []), JSON.stringify(b.samplePages || []), b.weightGrams || 500, b.publisher || null, b.isActive !== false
      ]
    );
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    res.json(parseBook(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM books WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Users API
app.get('/api/users', async (req, res) => {
  if (!isDbConfigured) return res.json(INITIAL_USERS_LIST);
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows.map(parseUser));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  const u = req.body;
  const id = u.id || 'usr-' + Date.now();
  
  // Strict Security Rule: NEVER allow public signup to assign role = 'admin'
  // Normal customer registration must ALWAYS create role = 'customer'
  const safeRole = 'customer';

  try {
    // Check if target is an existing admin - prevent modification via public registration
    const existing = await pool.query('SELECT id, role FROM users WHERE id = $1 OR LOWER(email) = LOWER($2)', [id, u.email]);
    if (existing.rows.length > 0 && existing.rows[0].role === 'admin') {
      return res.status(403).json({ error: 'Cannot modify administrative user accounts via public registration.' });
    }

    await pool.query(
      `INSERT INTO users (id, name, email, phone, role, "enrolledBatches", "savedAddresses", "studentRollNumber", "avatarUrl")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         role = 'customer',
         "enrolledBatches" = EXCLUDED."enrolledBatches",
         "savedAddresses" = EXCLUDED."savedAddresses",
         "studentRollNumber" = EXCLUDED."studentRollNumber",
         "avatarUrl" = EXCLUDED."avatarUrl"`,
      [id, u.name, u.email, u.phone, safeRole, JSON.stringify(u.enrolledBatches || []), JSON.stringify(u.savedAddresses || []), u.studentRollNumber || null, u.avatarUrl || null]
    );
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    res.json(parseUser(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  const { id } = req.params;
  const u = req.body;
  try {
    const existing = await pool.query('SELECT id, role FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    // Prevent modifying admin user accounts via public API
    if (existing.rows[0].role === 'admin') {
      return res.status(403).json({ error: 'Cannot modify administrative user accounts via public API.' });
    }

    await pool.query(
      `UPDATE users SET
         name = $2, email = $3, phone = $4, role = 'customer',
         "enrolledBatches" = $5, "savedAddresses" = $6,
         "studentRollNumber" = $7, "avatarUrl" = $8
       WHERE id = $1`,
      [id, u.name, u.email, u.phone, JSON.stringify(u.enrolledBatches || []), JSON.stringify(u.savedAddresses || []), u.studentRollNumber || null, u.avatarUrl || null]
    );
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    res.json(parseUser(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Orders API
app.get('/api/orders', async (req, res) => {
  if (!isDbConfigured) return res.json(INITIAL_ORDERS);
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows.map(parseOrder));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  const o = req.body;
  const id = o.id || 'ord-' + Date.now();
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Fetch active book from DB to snapshot authoritative current price
    const bookRes = await client.query('SELECT * FROM books WHERE id = $1', ['book-alp-psycho']);
    const activeBook = bookRes.rows.length > 0 ? parseBook(bookRes.rows[0]) : null;

    // 2. Validate items and enforce DB price snapshot (historical price preservation)
    const validatedItems = (o.items || []).map((item: any) => {
      const dbPrice = activeBook
        ? (item.format === 'pdf' ? activeBook.discountPricePdf : activeBook.discountPriceHardcopy)
        : (item.unitPrice || 499);
      
      const qty = Math.max(1, Number(item.quantity) || 1);
      return {
        bookId: item.bookId || (activeBook?.id || 'book-alp-psycho'),
        bookTitle: item.bookTitle || (activeBook?.title || 'RAILWAY Psychological/Aptitude Test For Asst. Loco Pilot'),
        author: item.author || (activeBook?.author || 'Sandeep Kumar (Vidyasagar Publication)'),
        format: item.format || 'hardcopy',
        quantity: qty,
        unitPrice: dbPrice,
        totalPrice: dbPrice * qty,
        coverImage: item.coverImage || (activeBook?.coverImage || '/assets/book.jpg'),
        digitalLicenseKey: item.digitalLicenseKey || undefined
      };
    });

    const subtotal = validatedItems.reduce((acc: number, item: any) => acc + item.totalPrice, 0);
    const discount = Math.max(0, Number(o.discount) || 0);
    const shippingFee = Math.max(0, Number(o.shippingFee) || 0);
    const codFee = o.paymentMethod === 'cod' ? (Number(o.codFee) || 40) : 0;
    const taxAmount = Math.max(0, Number(o.taxAmount) || Math.round(subtotal * 0.05));
    const totalAmount = Math.max(0, subtotal - discount + shippingFee + codFee);

    // 3. Insert order with immutable price snapshot
    await client.query(
      `INSERT INTO orders (
         id, "orderNumber", "userId", "customerName", "customerEmail", "customerPhone",
         items, "itemsCount", subtotal, discount, "couponCode", "shippingFee", "codFee",
         "taxAmount", "totalAmount", "hasDigitalItems", "hasPhysicalItems", "paymentMethod",
         "paymentStatus", "paymentTransactionId", "orderStatus", "courierPartner",
         "trackingNumber", "estimatedDeliveryDate", "trackingTimeline", "shippingAddress",
         "digitalLicenses", "invoiceNumber", "createdAt"
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
       )`,
      [
        id, o.orderNumber, o.userId, o.customerName, o.customerEmail, o.customerPhone,
        JSON.stringify(validatedItems), validatedItems.reduce((s: number, i: any) => s + i.quantity, 0), subtotal, discount, o.couponCode || null, shippingFee, codFee,
        taxAmount, totalAmount, Boolean(o.hasDigitalItems), Boolean(o.hasPhysicalItems), o.paymentMethod || 'upi',
        o.paymentStatus || 'pending', o.paymentTransactionId || null, o.orderStatus || 'confirmed', o.courierPartner || 'Delhivery Express',
        o.trackingNumber || `DEL-${Math.floor(10000000000 + Math.random() * 90000000000)}-IN`,
        o.estimatedDeliveryDate || 'In 2-3 Business Days',
        JSON.stringify(o.trackingTimeline || []), JSON.stringify(o.shippingAddress || null),
        JSON.stringify(o.digitalLicenses || []), o.invoiceNumber, o.createdAt || new Date().toISOString()
      ]
    );

    // Update book stock quantities
    for (const item of validatedItems) {
      if (item.format !== 'pdf') {
        await client.query(
          `UPDATE books SET "stockQuantity" = GREATEST(0, "stockQuantity" - $1) WHERE id = $2`,
          [item.quantity, item.bookId]
        );
      }
    }

    // Update coupon usage count if used
    if (o.couponCode) {
      await client.query(
        `UPDATE coupons SET "usageCount" = "usageCount" + 1 WHERE code = $1`,
        [o.couponCode]
      );
    }

    await client.query('COMMIT');

    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    res.json(parseOrder(result.rows[0]));
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/orders/:id', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  const { id } = req.params;
  const updates = req.body;
  try {
    const existing = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    
    const existingOrder = parseOrder(existing.rows[0]);
    // Security: Payment status CANNOT be manually changed to paid; only verified gateway callbacks can mark paid
    const safePaymentStatus = (existingOrder.paymentStatus === 'PAID' || existingOrder.paymentStatus === 'paid')
      ? existingOrder.paymentStatus
      : (updates.paymentStatus === 'paid' || updates.paymentStatus === 'PAID' ? existingOrder.paymentStatus : (updates.paymentStatus || existingOrder.paymentStatus));

    const o = { ...existingOrder, ...updates, paymentStatus: safePaymentStatus };
    
    await pool.query(
      `UPDATE orders SET
         "orderStatus" = $2,
         "courierPartner" = $3,
         "trackingNumber" = $4,
         "estimatedDeliveryDate" = $5,
         "trackingTimeline" = $6,
         "paymentStatus" = $7,
         "shippingStatus" = $8
       WHERE id = $1`,
      [
        id, o.orderStatus, o.courierPartner || null, o.trackingNumber || null,
        o.estimatedDeliveryDate || null, JSON.stringify(o.trackingTimeline || []),
        safePaymentStatus, o.shippingStatus || 'SHIPMENT_PENDING'
      ]
    );
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    res.json(parseOrder(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Reviews API
app.get('/api/reviews', async (req, res) => {
  if (!isDbConfigured) return res.json(INITIAL_REVIEWS);
  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY id DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  const r = req.body;
  const id = r.id || 'rev-' + Date.now();
  try {
    await pool.query(
      `INSERT INTO reviews (
         id, "bookId", "userName", "userBatch", rating, date, comment,
         "verifiedPurchase", "formatPurchased", likes, "conceptRating", "printRating", "questionsRating"
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id, r.bookId, r.userName, r.userBatch || null, r.rating, r.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), r.comment || '',
        r.verifiedPurchase || false, r.formatPurchased || 'pdf', r.likes || 0, r.conceptRating || r.rating, r.printRating || r.rating, r.questionsRating || r.rating
      ]
    );
    // Recalculate book average rating and reviewCount
    const reviewsResult = await pool.query('SELECT rating FROM reviews WHERE "bookId" = $1', [r.bookId]);
    const count = reviewsResult.rows.length;
    const avg = reviewsResult.rows.reduce((sum, row) => sum + row.rating, 0) / count;

    await pool.query(
      `UPDATE books SET rating = $1, "reviewCount" = $2 WHERE id = $3`,
      [Number(avg.toFixed(2)), count, r.bookId]
    );

    const result = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Coupons API
app.get('/api/coupons', async (req, res) => {
  if (!isDbConfigured) return res.json(INITIAL_COUPONS);
  try {
    const result = await pool.query('SELECT * FROM coupons ORDER BY id');
    res.json(result.rows.map(parseCoupon));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  const c = req.body;
  const id = c.id || 'c-' + Date.now();
  try {
    await pool.query(
      `INSERT INTO coupons (
         id, code, "discountType", "discountValue", "minCartValue", "maxDiscount", "validTill",
         description, "applicableExam", "batchCode", "usageCount", "usageLimit", "isActive"
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         code = EXCLUDED.code,
         "discountType" = EXCLUDED."discountType",
         "discountValue" = EXCLUDED."discountValue",
         "minCartValue" = EXCLUDED."minCartValue",
         "maxDiscount" = EXCLUDED."maxDiscount",
         "validTill" = EXCLUDED."validTill",
         description = EXCLUDED.description,
         "applicableExam" = EXCLUDED."applicableExam",
         "batchCode" = EXCLUDED."batchCode",
         "usageCount" = EXCLUDED."usageCount",
         "usageLimit" = EXCLUDED."usageLimit",
         "isActive" = EXCLUDED."isActive"`,
      [
        id, c.code, c.discountType, c.discountValue || 0, c.minCartValue || 0, c.maxDiscount || null, c.validTill || null,
        c.description || '', c.applicableExam || null, c.batchCode || null, c.usageCount || 0, c.usageLimit || 1000, c.isActive !== false
      ]
    );
    const result = await pool.query('SELECT * FROM coupons WHERE id = $1', [id]);
    res.json(parseCoupon(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Bulk Inquiries API
app.get('/api/bulk', async (req, res) => {
  if (!isDbConfigured) return res.json(INITIAL_BULK_INQUIRIES);
  try {
    const result = await pool.query('SELECT * FROM bulk_inquiries ORDER BY id DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bulk', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  const b = req.body;
  const id = b.id || 'blk-' + Date.now();
  try {
    await pool.query(
      `INSERT INTO bulk_inquiries (
         id, "institutionName", "contactPerson", email, phone, "targetExam", "bookTitles",
         "estimatedCopies", city, state, notes, status, "createdAt"
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status`,
      [
        id, b.institutionName, b.contactPerson, b.email, b.phone, b.targetExam, JSON.stringify(b.bookTitles || []),
        b.estimatedCopies || 0, b.city || '', b.state || '', b.notes || '', b.status || 'new', b.createdAt || new Date().toISOString()
      ]
    );
    const result = await pool.query('SELECT * FROM bulk_inquiries WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN API ENDPOINTS (PROTECTED UNDER /api/admin/*)
// ==========================================

// 1. Admin Authentication Endpoints
app.post('/api/admin/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const adminConfig = getAdminConfig();

  try {
    let adminUser: any = null;
    if (isDbConfigured) {
      // Query by cleanEmail, or if cleanEmail matches configured env admin email, find role = 'admin'
      const result = await pool.query(
        'SELECT * FROM users WHERE (LOWER(email) = $1 OR (role = $2 AND LOWER($1) = $3)) AND role = $2 LIMIT 1',
        [cleanEmail, 'admin', adminConfig.email]
      );
      if (result.rows.length > 0) {
        adminUser = result.rows[0];
        // If cleanEmail matches the env configured admin email and DB email differs, keep DB in sync
        if (cleanEmail === adminConfig.email && adminUser.email.toLowerCase() !== adminConfig.email) {
          await pool.query('UPDATE users SET email = $1 WHERE id = $2', [adminConfig.email, adminUser.id]);
          adminUser.email = adminConfig.email;
        }
      }
    } else {
      adminUser = INITIAL_USERS_LIST.find(
        u => (u.email.toLowerCase() === cleanEmail || (u.role === 'admin' && cleanEmail === adminConfig.email)) && u.role === 'admin'
      );
      if (adminUser && cleanEmail === adminConfig.email) {
        adminUser.email = adminConfig.email;
      }
    }

    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Validate password:
    // 1. Matches env configured password
    // 2. Matches stored password_hash in database
    const isEnvMatch = password === adminConfig.password;
    const isHashMatch = adminUser.password_hash ? verifyPassword(password, adminUser.password_hash) : false;

    const valid = isEnvMatch || isHashMatch;

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // If successfully logged in with env password and DB hash is outdated, sync hash in DB
    if (isEnvMatch && isDbConfigured) {
      const expectedHash = hashPassword(adminConfig.password);
      if (adminUser.password_hash !== expectedHash) {
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [expectedHash, adminUser.id]);
        adminUser.password_hash = expectedHash;
      }
    }

    const token = generateAdminToken({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name
    });

    res.setHeader(
      'Set-Cookie',
      `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.json({
      success: true,
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: 'admin',
        avatarUrl: adminUser.avatarUrl
      }
    });
  } catch (err: any) {
    console.error('Error during admin login:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.get('/api/admin/auth/me', requireAdmin, (req, res) => {
  const admin = (req as any).adminUser;
  res.json({
    success: true,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: 'admin',
      avatarUrl: admin.avatarUrl
    }
  });
});

app.post('/api/admin/auth/logout', requireAdmin, (req, res) => {
  res.setHeader(
    'Set-Cookie',
    'admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  );
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 2. Admin Dashboard Metrics (Aggregated from Real DB Data)
app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    if (!isDbConfigured) {
      const orders = INITIAL_ORDERS;
      const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
      const pendingOrders = orders.filter(o => ['pending', 'processing', 'confirmed'].includes(o.orderStatus)).length;
      const completedOrders = orders.filter(o => o.orderStatus === 'delivered').length;
      const ordersInDelivery = orders.filter(o => ['shipped', 'in_transit', 'out_for_delivery'].includes(o.orderStatus)).length;
      const pendingPayments = orders.filter(o => o.paymentStatus === 'pending').length;
      const booksSold = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.itemsCount, 0);

      return res.json({
        metrics: {
          totalOrders: orders.length,
          pendingOrders,
          completedOrders,
          totalRevenue,
          totalCustomers: INITIAL_USERS_LIST.filter(u => u.role === 'customer').length,
          booksSold,
          pendingPayments,
          ordersInDelivery
        },
        recentOrders: orders.slice(0, 8),
        statusCounts: {
          pending: pendingOrders,
          processing: orders.filter(o => o.orderStatus === 'processing').length,
          shipped: orders.filter(o => o.orderStatus === 'shipped').length,
          delivered: completedOrders,
          cancelled: orders.filter(o => o.orderStatus === 'cancelled').length
        }
      });
    }

    // Real DB Queries
    const ordersRes = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    const allOrders = ordersRes.rows.map(parseOrder);

    const customersCountRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'customer'");
    const totalCustomers = parseInt(customersCountRes.rows[0].count, 10);

    const totalOrders = allOrders.length;
    const paidOrders = allOrders.filter(o => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const pendingOrders = allOrders.filter(o => ['pending', 'processing', 'confirmed'].includes(o.orderStatus)).length;
    const completedOrders = allOrders.filter(o => o.orderStatus === 'delivered').length;
    const ordersInDelivery = allOrders.filter(o => ['shipped', 'in_transit', 'out_for_delivery', 'dispatched'].includes(o.orderStatus)).length;
    const pendingPayments = allOrders.filter(o => o.paymentStatus === 'pending').length;
    
    // Books sold: sum of physical items quantity in paid orders
    const booksSold = paidOrders.reduce((sum, o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      return sum + items.reduce((iSum: number, i: any) => iSum + (Number(i.quantity) || 1), 0);
    }, 0);

    const statusCounts = {
      pending: allOrders.filter(o => o.orderStatus === 'pending').length,
      confirmed: allOrders.filter(o => o.orderStatus === 'confirmed').length,
      processing: allOrders.filter(o => o.orderStatus === 'processing').length,
      shipped: allOrders.filter(o => o.orderStatus === 'shipped' || o.orderStatus === 'in_transit').length,
      delivered: completedOrders,
      cancelled: allOrders.filter(o => o.orderStatus === 'cancelled').length
    };

    const paymentCounts = {
      paid: paidOrders.length,
      pending: pendingPayments,
      failed: allOrders.filter(o => o.paymentStatus === 'failed').length,
      refunded: allOrders.filter(o => o.paymentStatus === 'refunded').length
    };

    res.json({
      metrics: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        totalCustomers,
        booksSold,
        pendingPayments,
        ordersInDelivery
      },
      recentOrders: allOrders.slice(0, 8),
      statusCounts,
      paymentCounts
    });
  } catch (err: any) {
    console.error('Error fetching admin dashboard:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Admin Orders Management
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const { search, orderStatus, paymentStatus, page = '1', limit = '50' } = req.query;
    
    if (!isDbConfigured) {
      let filtered = [...INITIAL_ORDERS];
      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter(o => 
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
        );
      }
      if (orderStatus && orderStatus !== 'all') {
        filtered = filtered.filter(o => o.orderStatus === orderStatus);
      }
      if (paymentStatus && paymentStatus !== 'all') {
        filtered = filtered.filter(o => o.paymentStatus === paymentStatus);
      }
      return res.json({ orders: filtered, total: filtered.length, page: 1, limit: 50 });
    }

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (search) {
      params.push(`%${String(search).trim()}%`);
      query += ` AND ("orderNumber" ILIKE $${params.length} OR "customerName" ILIKE $${params.length} OR "customerPhone" ILIKE $${params.length} OR "customerEmail" ILIKE $${params.length})`;
    }

    if (orderStatus && orderStatus !== 'all') {
      params.push(orderStatus);
      query += ` AND "orderStatus" = $${params.length}`;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      params.push(paymentStatus);
      query += ` AND "paymentStatus" = $${params.length}`;
    }

    query += ' ORDER BY id DESC';

    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 50);
    const offset = (p - 1) * l;

    const result = await pool.query(query, params);
    const parsed = result.rows.map(parseOrder);
    const paginated = parsed.slice(offset, offset + l);

    res.json({
      orders: paginated,
      total: parsed.length,
      page: p,
      limit: l
    });
  } catch (err: any) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (!isDbConfigured) {
      const ord = INITIAL_ORDERS.find(o => o.id === id);
      if (!ord) return res.status(404).json({ error: 'Order not found' });
      return res.json(ord);
    }
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(parseOrder(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus, courierPartner, trackingNumber, estimatedDeliveryDate, notes } = req.body;

  const validOrderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'];
  const validPaymentStatuses = ['paid', 'pending', 'failed', 'refunded'];

  if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
    return res.status(400).json({ error: `Invalid order status: ${orderStatus}. Allowed: ${validOrderStatuses.join(', ')}` });
  }
  if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ error: `Invalid payment status: ${paymentStatus}. Allowed: ${validPaymentStatuses.join(', ')}` });
  }

  try {
    if (!isDbConfigured) {
      const idx = INITIAL_ORDERS.findIndex(o => o.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Order not found' });
      const o = INITIAL_ORDERS[idx];
      if (orderStatus) o.orderStatus = orderStatus;
      if (paymentStatus) o.paymentStatus = paymentStatus;
      if (courierPartner) o.courierPartner = courierPartner;
      if (trackingNumber) o.trackingNumber = trackingNumber;
      if (estimatedDeliveryDate) o.estimatedDeliveryDate = estimatedDeliveryDate;
      return res.json(o);
    }

    const existingRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentOrder = parseOrder(existingRes.rows[0]);
    const updatedStatus = orderStatus || currentOrder.orderStatus;
    // CRITICAL: Payment status CANNOT be manually converted to paid by admin; only verified gateway callbacks can mark paid
    const updatedPayment = (currentOrder.paymentStatus === 'PAID' || currentOrder.paymentStatus === 'paid')
      ? currentOrder.paymentStatus
      : currentOrder.paymentStatus;

    const updatedShipping = req.body.shippingStatus || currentOrder.shippingStatus || 'SHIPMENT_PENDING';
    const updatedCourier = courierPartner !== undefined ? courierPartner : currentOrder.courierPartner;
    const updatedTracking = trackingNumber !== undefined ? trackingNumber : currentOrder.trackingNumber;
    const updatedEst = estimatedDeliveryDate !== undefined ? estimatedDeliveryDate : currentOrder.estimatedDeliveryDate;

    // Append to tracking timeline if status changed
    const timeline = Array.isArray(currentOrder.trackingTimeline) ? [...currentOrder.trackingTimeline] : [];
    if (orderStatus && orderStatus !== currentOrder.orderStatus) {
      timeline.push({
        status: (['shipped', 'out_for_delivery', 'delivered'].includes(orderStatus) ? orderStatus : 'packed') as any,
        title: `Order status updated to: ${orderStatus.toUpperCase()}`,
        description: notes || `Admin updated order status to ${orderStatus}. Carrier: ${updatedCourier || 'Delhivery Express'}.`,
        location: 'Central Fulfillment Facility',
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        done: true
      });
    }

    await pool.query(
      `UPDATE orders SET
         "orderStatus" = $2,
         "paymentStatus" = $3,
         "courierPartner" = $4,
         "trackingNumber" = $5,
         "estimatedDeliveryDate" = $6,
         "trackingTimeline" = $7,
         "shippingStatus" = $8
       WHERE id = $1`,
      [
        id,
        updatedStatus,
        updatedPayment,
        updatedCourier,
        updatedTracking,
        updatedEst,
        JSON.stringify(timeline),
        updatedShipping
      ]
    );

    const updatedRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    res.json(parseOrder(updatedRes.rows[0]));
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Admin Customer Management
app.get('/api/admin/customers', requireAdmin, async (req, res) => {
  try {
    const { search } = req.query;

    if (!isDbConfigured) {
      const customers = INITIAL_USERS_LIST.filter(u => u.role === 'customer').map(c => {
        const userOrders = INITIAL_ORDERS.filter(o => o.userId === c.id || o.customerEmail === c.email);
        const totalSpent = userOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          role: c.role,
          ordersCount: userOrders.length,
          totalSpent,
          lastOrderDate: userOrders[0]?.createdAt || null,
          joinedDate: '2025-01-15'
        };
      });
      return res.json(customers);
    }

    let query = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.role, u."studentRollNumber",
        COUNT(o.id) AS "ordersCount",
        COALESCE(SUM(CASE WHEN o."paymentStatus" = 'paid' THEN o."totalAmount" ELSE 0 END), 0) AS "totalSpent",
        MAX(o."createdAt") AS "lastOrderDate"
      FROM users u
      LEFT JOIN orders o ON u.id = o."userId" OR LOWER(u.email) = LOWER(o."customerEmail")
      WHERE u.role = 'customer'
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${String(search).trim()}%`);
      query += ` AND (u.name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)`;
    }

    query += ' GROUP BY u.id, u.name, u.email, u.phone, u.role, u."studentRollNumber" ORDER BY "totalSpent" DESC';

    const result = await pool.query(query, params);
    const customers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      studentRollNumber: row.studentRollNumber,
      ordersCount: parseInt(row.ordersCount, 10) || 0,
      totalSpent: parseFloat(row.totalSpent) || 0,
      lastOrderDate: row.lastOrderDate || null,
      joinedDate: '2025-01-15'
    }));

    res.json(customers);
  } catch (err: any) {
    console.error('Error fetching admin customers:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/customers/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (!isDbConfigured) {
      const u = INITIAL_USERS_LIST.find(user => user.id === id);
      if (!u) return res.status(404).json({ error: 'Customer not found' });
      const orders = INITIAL_ORDERS.filter(o => o.userId === u.id || o.customerEmail === u.email);
      return res.json({ customer: u, orders });
    }

    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    const customer = parseUser(userRes.rows[0]);

    const ordersRes = await pool.query(
      'SELECT * FROM orders WHERE "userId" = $1 OR LOWER("customerEmail") = LOWER($2) ORDER BY id DESC',
      [customer.id, customer.email]
    );
    const orders = ordersRes.rows.map(parseOrder);

    res.json({ customer, orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin Single-Book & Price Management
app.get('/api/admin/book', requireAdmin, async (req, res) => {
  try {
    if (!isDbConfigured) return res.json(INITIAL_BOOKS[0]);
    const result = await pool.query('SELECT * FROM books WHERE id = $1', ['book-alp-psycho']);
    if (result.rows.length === 0) {
      const fallback = await pool.query('SELECT * FROM books LIMIT 1');
      return res.json(parseBook(fallback.rows[0]));
    }
    res.json(parseBook(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/book', requireAdmin, async (req, res) => {
  const updates = req.body;
  const adminName = (req as any).adminUser?.name || 'Administrator';

  try {
    if (!isDbConfigured) {
      const b = { ...INITIAL_BOOKS[0], ...updates };
      INITIAL_BOOKS[0] = b;
      return res.json(b);
    }

    const existingRes = await pool.query('SELECT * FROM books WHERE id = $1', ['book-alp-psycho']);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Book record not found' });
    }
    const currentBook = parseBook(existingRes.rows[0]);

    // Validation
    const newMrp = updates.priceHardcopy !== undefined ? Number(updates.priceHardcopy) : currentBook.priceHardcopy;
    const newSelling = updates.discountPriceHardcopy !== undefined ? Number(updates.discountPriceHardcopy) : currentBook.discountPriceHardcopy;

    if (isNaN(newMrp) || newMrp <= 0) {
      return res.status(400).json({ error: 'MRP must be a valid positive number.' });
    }
    if (isNaN(newSelling) || newSelling <= 0) {
      return res.status(400).json({ error: 'Selling price must be a valid positive number.' });
    }
    if (newSelling > newMrp) {
      return res.status(400).json({ error: `Selling price (₹${newSelling}) cannot exceed MRP (₹${newMrp}).` });
    }

    // Audit price changes if altered
    const priceChanged = currentBook.discountPriceHardcopy !== newSelling || currentBook.priceHardcopy !== newMrp;
    if (priceChanged) {
      await pool.query(
        `INSERT INTO book_price_history (book_id, old_mrp, new_mrp, old_selling_price, new_selling_price, changed_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['book-alp-psycho', currentBook.priceHardcopy, newMrp, currentBook.discountPriceHardcopy, newSelling, adminName]
      );
    }

    const updatedTitle = updates.title !== undefined ? updates.title : currentBook.title;
    const updatedDesc = updates.description !== undefined ? updates.description : currentBook.description;
    const updatedStock = updates.stockQuantity !== undefined ? Number(updates.stockQuantity) : currentBook.stockQuantity;
    const updatedThreshold = updates.lowStockThreshold !== undefined ? Number(updates.lowStockThreshold) : currentBook.lowStockThreshold;
    const updatedIsbn = updates.isbn !== undefined ? updates.isbn : currentBook.isbn;
    const updatedEdition = updates.edition !== undefined ? updates.edition : currentBook.edition;
    const updatedIsActive = updates.isActive !== undefined ? Boolean(updates.isActive) : currentBook.isActive;

    await pool.query(
      `UPDATE books SET
         title = $2,
         description = $3,
         "priceHardcopy" = $4,
         "discountPriceHardcopy" = $5,
         "stockQuantity" = $6,
         "lowStockThreshold" = $7,
         isbn = $8,
         edition = $9,
         "isActive" = $10
       WHERE id = $1`,
      [
        'book-alp-psycho',
        updatedTitle,
        updatedDesc,
        newMrp,
        newSelling,
        updatedStock,
        updatedThreshold,
        updatedIsbn,
        updatedEdition,
        updatedIsActive
      ]
    );

    const finalRes = await pool.query('SELECT * FROM books WHERE id = $1', ['book-alp-psycho']);
    res.json(parseBook(finalRes.rows[0]));
  } catch (err: any) {
    console.error('Error updating book:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/book/price-history', requireAdmin, async (req, res) => {
  try {
    if (!isDbConfigured) {
      return res.json([
        {
          id: 1,
          book_id: 'book-alp-psycho',
          old_mrp: 899,
          new_mrp: 899,
          old_selling_price: 399,
          new_selling_price: 499,
          changed_by: 'Sandeep',
          changed_at: new Date().toISOString()
        }
      ]);
    }
    const result = await pool.query(
      'SELECT * FROM book_price_history ORDER BY changed_at DESC LIMIT 50'
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Admin Payments API
app.get('/api/admin/payments', requireAdmin, async (req, res) => {
  try {
    const { paymentStatus, search } = req.query;
    
    if (!isDbConfigured) {
      let payments = INITIAL_ORDERS.map(o => ({
        id: 'pay-' + o.id,
        orderId: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        amount: o.totalAmount,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        paymentTransactionId: o.paymentTransactionId || `UPI/${o.orderNumber.slice(-6)}`,
        date: o.createdAt
      }));
      if (paymentStatus && paymentStatus !== 'all') {
        payments = payments.filter(p => p.paymentStatus === paymentStatus);
      }
      return res.json(payments);
    }

    let query = `
      SELECT 
        id, "orderNumber", "customerName", "customerEmail", "customerPhone",
        "totalAmount", "paymentMethod", "paymentStatus", "paymentTransactionId", "createdAt"
      FROM orders
      WHERE 1=1
    `;
    const params: any[] = [];

    if (paymentStatus && paymentStatus !== 'all') {
      params.push(paymentStatus);
      query += ` AND "paymentStatus" = $${params.length}`;
    }

    if (search) {
      params.push(`%${String(search).trim()}%`);
      query += ` AND ("orderNumber" ILIKE $${params.length} OR "customerName" ILIKE $${params.length} OR "paymentTransactionId" ILIKE $${params.length})`;
    }

    query += ' ORDER BY id DESC';

    const result = await pool.query(query, params);
    const payments = result.rows.map(r => ({
      id: 'pay-' + r.id,
      orderId: r.id,
      orderNumber: r.orderNumber,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      customerPhone: r.customerPhone,
      amount: parseFloat(r.totalAmount) || 0,
      paymentMethod: r.paymentMethod,
      paymentStatus: r.paymentStatus,
      paymentTransactionId: r.paymentTransactionId || `UPI/${r.id.slice(-6)}`,
      date: r.createdAt
    }));

    res.json(payments);
  } catch (err: any) {
    console.error('Error fetching admin payments:', err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Admin Delivery Management API
app.get('/api/admin/delivery', requireAdmin, async (req, res) => {
  try {
    const { deliveryStatus, search } = req.query;

    if (!isDbConfigured) {
      let deliveries = INITIAL_ORDERS.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        shippingAddress: o.shippingAddress,
        orderDate: o.createdAt,
        deliveryProvider: o.courierPartner || 'Delhivery Express Direct',
        trackingNumber: o.trackingNumber || 'DEL-1029384756-IN',
        expectedDeliveryDate: o.estimatedDeliveryDate || 'In 2-3 Business Days',
        deliveryStatus: o.orderStatus === 'delivered' ? 'Delivered' : (o.orderStatus === 'shipped' ? 'In Transit' : 'Processing')
      }));
      return res.json(deliveries);
    }

    let query = `
      SELECT 
        id, "orderNumber", "customerName", "customerPhone", "shippingAddress",
        "courierPartner", "trackingNumber", "estimatedDeliveryDate", "orderStatus", "createdAt",
        "paymentStatus", "shippingStatus", "fulfillmentStatus", "fulfillmentError",
        "shiprocketOrderId", "shiprocketShipmentId", "shiprocketCourierId", "shiprocketCourierName",
        "awbCode", "shipmentTrackingUrl", "pickupRequestId", "pickupStatus", "lastShiprocketSyncAt"
      FROM orders
      WHERE 1=1
    `;
    const params: any[] = [];

    if (deliveryStatus && deliveryStatus !== 'all') {
      params.push(deliveryStatus);
      query += ` AND ("orderStatus" = $${params.length} OR "fulfillmentStatus" = $${params.length})`;
    }

    if (search) {
      params.push(`%${String(search).trim()}%`);
      query += ` AND ("orderNumber" ILIKE $${params.length} OR "customerName" ILIKE $${params.length} OR "trackingNumber" ILIKE $${params.length} OR "awbCode" ILIKE $${params.length})`;
    }

    query += ' ORDER BY id DESC';

    const result = await pool.query(query, params);
    const deliveries = result.rows.map(r => {
      const address = typeof r.shippingAddress === 'string' ? JSON.parse(r.shippingAddress) : r.shippingAddress;
      return {
        id: r.id,
        orderNumber: r.orderNumber,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        shippingAddress: address,
        orderDate: r.createdAt,
        paymentStatus: r.paymentStatus || 'PAID',
        deliveryProvider: r.shiprocketCourierName || r.courierPartner || 'Delhivery Express Direct',
        trackingNumber: r.awbCode || r.trackingNumber || 'Pending AWB',
        awbCode: r.awbCode || null,
        expectedDeliveryDate: r.estimatedDeliveryDate || 'In 2-3 Business Days',
        deliveryStatus: r.orderStatus,
        fulfillmentStatus: r.fulfillmentStatus || r.shippingStatus || 'SHIPMENT_PENDING',
        fulfillmentError: r.fulfillmentError || null,
        shiprocketOrderId: r.shiprocketOrderId || null,
        shiprocketShipmentId: r.shiprocketShipmentId || null,
        shiprocketCourierId: r.shiprocketCourierId || null,
        shipmentTrackingUrl: r.shipmentTrackingUrl || null,
        pickupRequestId: r.pickupRequestId || null,
        pickupStatus: r.pickupStatus || null,
        lastShiprocketSyncAt: r.lastShiprocketSyncAt || null
      };
    });

    res.json(deliveries);
  } catch (err: any) {
    console.error('Error fetching admin delivery:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/delivery/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { deliveryProvider, trackingNumber, expectedDeliveryDate, deliveryStatus } = req.body;

  try {
    if (!isDbConfigured) {
      const ord = INITIAL_ORDERS.find(o => o.id === id);
      if (!ord) return res.status(404).json({ error: 'Delivery record not found' });
      if (deliveryProvider) ord.courierPartner = deliveryProvider;
      if (trackingNumber) ord.trackingNumber = trackingNumber;
      if (expectedDeliveryDate) ord.estimatedDeliveryDate = expectedDeliveryDate;
      if (deliveryStatus) ord.orderStatus = deliveryStatus;
      return res.json({ success: true, order: ord });
    }

    const currentRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const current = parseOrder(currentRes.rows[0]);

    const updatedCourier = deliveryProvider !== undefined ? deliveryProvider : current.courierPartner;
    const updatedTracking = trackingNumber !== undefined ? trackingNumber : current.trackingNumber;
    const updatedEst = expectedDeliveryDate !== undefined ? expectedDeliveryDate : current.estimatedDeliveryDate;
    const updatedStatus = deliveryStatus !== undefined ? deliveryStatus : current.orderStatus;

    await pool.query(
      `UPDATE orders SET
         "courierPartner" = $2,
         "trackingNumber" = $3,
         "estimatedDeliveryDate" = $4,
         "orderStatus" = $5
       WHERE id = $1`,
      [id, updatedCourier, updatedTracking, updatedEst, updatedStatus]
    );

    const finalRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    res.json({ success: true, order: parseOrder(finalRes.rows[0]) });
  } catch (err: any) {
    console.error('Error updating delivery:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Admin Settings API
app.get('/api/admin/settings', requireAdmin, async (req, res) => {
  const defaultSettings = {
    storeName: 'Modi Railway Psychotest Classes',
    contactEmail: 'support@modiclasses.in',
    contactPhone: '+91 98100 88221',
    address: 'Modi Classes Academic Tower, Commercial Complex, Mukherjee Nagar, Delhi 110009',
    orderPrefix: 'MC-ALP-',
    codFee: 40,
    freeShippingThreshold: 0,
    defaultCourier: 'Delhivery Express Direct',
    dispatchHours: '48 Hours',
    emailNotifications: true,
    smsNotifications: true
  };

  try {
    if (!isDbConfigured) {
      return res.json({
        settings: defaultSettings,
        adminProfile: {
          name: (req as any).adminUser?.name || 'sandeep',
          email: (req as any).adminUser?.email || getAdminConfig().email
        }
      });
    }

    const settingsRes = await pool.query("SELECT value FROM admin_settings WHERE key = 'general'");
    const settings = settingsRes.rows.length > 0
      ? (typeof settingsRes.rows[0].value === 'string' ? JSON.parse(settingsRes.rows[0].value) : settingsRes.rows[0].value)
      : defaultSettings;

    res.json({
      settings,
      adminProfile: {
        id: (req as any).adminUser.id,
        name: (req as any).adminUser.name,
        email: (req as any).adminUser.email,
        phone: (req as any).adminUser.phone
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/settings', requireAdmin, async (req, res) => {
  const { settings, profile, passwordChange } = req.body;
  const adminId = (req as any).adminUser.id;

  try {
    if (!isDbConfigured) {
      return res.json({ success: true, message: 'Settings saved (memory mode).' });
    }

    // 1. Password update
    if (passwordChange && passwordChange.newPassword) {
      if (passwordChange.newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      }

      // Verify current password
      const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [adminId]);
      const storedHash = userRes.rows[0]?.password_hash;
      const adminConfig = getAdminConfig();
      const isValid = (storedHash && verifyPassword(passwordChange.currentPassword, storedHash))
        || passwordChange.currentPassword === adminConfig.password;

      if (!isValid) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }

      const newHash = hashPassword(passwordChange.newPassword);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, adminId]);
    }

    // 2. Admin profile update
    if (profile) {
      await pool.query(
        'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3',
        [profile.name || null, profile.phone || null, adminId]
      );
    }

    // 3. Store settings update
    if (settings) {
      await pool.query(
        `INSERT INTO admin_settings (key, value) VALUES ('general', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(settings)]
      );
    }

    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (err: any) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health Check API: Accurately reflects database readiness
app.get('/api/health', (req, res) => {
  if (dbState.isConfigured && !dbState.isInitialized) {
    return res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: 'Database initialization failed or is still in progress',
      lastError: dbState.lastError,
      timestamp: new Date().toISOString()
    });
  }
  return res.json({
    status: 'healthy',
    database: dbState.isConfigured ? 'connected' : 'memory_fallback',
    timestamp: new Date().toISOString()
  });
});

// Safe server startup: Express only begins accepting traffic after DB initialization succeeds
async function startServer() {
  const dbSuccess = await initDb();
  if (isDbConfigured && !dbSuccess) {
    console.error('🚨 SERVER STARTUP ABORTED: Database is configured but connection/initialization failed.');
    console.error('The Express server will not falsely report healthy status. Check database connection, credentials, and network/DNS settings.');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Express server running on port http://localhost:${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
    const srConfig = getShiprocketConfig();
    console.log(`📦 Shiprocket API token configured: ${Boolean(srConfig.apiToken)}`);
    console.log(`📦 Shiprocket pickup location: ${srConfig.pickupLocation || 'not configured'}`);
  });

  return server;
}

startServer();

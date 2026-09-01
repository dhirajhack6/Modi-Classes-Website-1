import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Load environment variables from .env.local and .env
dotenv.config({ path: '.env.local' });
dotenv.config();

import { 
  INITIAL_BOOKS, 
  INITIAL_COUPONS, 
  INITIAL_USERS_LIST, 
  INITIAL_ORDERS, 
  INITIAL_REVIEWS, 
  INITIAL_BULK_INQUIRIES 
} from './src/data/initialData';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const databaseUrl = process.env.DATABASE_URL;
const isDbConfigured = databaseUrl && !databaseUrl.includes('username:password');

if (!isDbConfigured) {
  console.warn('⚠️ WARNING: DATABASE_URL is not configured or is using placeholder values.');
  console.warn('The server will start, but database operations will fail. Please configure DATABASE_URL in .env.local.');
}

const pool = new Pool({
  connectionString: isDbConfigured ? databaseUrl : undefined,
  ssl: isDbConfigured ? { rejectUnauthorized: false } : false
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
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('💬 Twilio client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Twilio client:', err);
  }
} else {
  console.log('⚠️ Twilio credentials not set. SMS OTPs will run in Demo/Console mode.');
}

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

// Database Initialization & Seeding helper
async function initDb() {
  if (!isDbConfigured) {
    console.log('Skipping DB Initialization: DATABASE_URL not configured.');
    return;
  }

  const client = await pool.connect();
  try {
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
        "avatarUrl" TEXT
      );
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

    console.log('Schemas created successfully.');

    // --- Seeding ---
    // Seed Users
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial users...');
      for (const u of INITIAL_USERS_LIST) {
        await client.query(
          `INSERT INTO users (id, name, email, phone, role, "enrolledBatches", "savedAddresses", "studentRollNumber", "avatarUrl")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [u.id, u.name, u.email, u.phone, u.role, JSON.stringify(u.enrolledBatches), JSON.stringify(u.savedAddresses), u.studentRollNumber || null, u.avatarUrl || null]
        );
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

    console.log('Database seeding completed successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

// Initialize the Database
initDb();

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
    codFee: codFee ? Number(codFee) : 0,
    taxAmount: taxAmount ? Number(taxAmount) : 0,
    totalAmount: totalAmount ? Number(totalAmount) : 0,
    hasDigitalItems: Boolean(hasDigitalItems),
    hasPhysicalItems: Boolean(hasPhysicalItems),
    paymentMethod,
    paymentStatus,
    paymentTransactionId,
    orderStatus,
    courierPartner,
    trackingNumber,
    estimatedDeliveryDate,
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
      return res.json({
        success: true,
        debugOtp: otp,
        message: 'OTP generated in demo/fallback mode (credentials not configured).'
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
  try {
    await pool.query(
      `INSERT INTO users (id, name, email, phone, role, "enrolledBatches", "savedAddresses", "studentRollNumber", "avatarUrl")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         role = EXCLUDED.role,
         "enrolledBatches" = EXCLUDED."enrolledBatches",
         "savedAddresses" = EXCLUDED."savedAddresses",
         "studentRollNumber" = EXCLUDED."studentRollNumber",
         "avatarUrl" = EXCLUDED."avatarUrl"`,
      [id, u.name, u.email, u.phone, u.role || 'customer', JSON.stringify(u.enrolledBatches || []), JSON.stringify(u.savedAddresses || []), u.studentRollNumber || null, u.avatarUrl || null]
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
    await pool.query(
      `UPDATE users SET
         name = $2, email = $3, phone = $4, role = $5,
         "enrolledBatches" = $6, "savedAddresses" = $7,
         "studentRollNumber" = $8, "avatarUrl" = $9
       WHERE id = $1`,
      [id, u.name, u.email, u.phone, u.role, JSON.stringify(u.enrolledBatches || []), JSON.stringify(u.savedAddresses || []), u.studentRollNumber || null, u.avatarUrl || null]
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
    
    // Insert order
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
        JSON.stringify(o.items || []), o.itemsCount || 0, o.subtotal || 0, o.discount || 0, o.couponCode || null, o.shippingFee || 0, o.codFee || 0,
        o.taxAmount || 0, o.totalAmount || 0, o.hasDigitalItems || false, o.hasPhysicalItems || false, o.paymentMethod || 'cod',
        o.paymentStatus || 'pending', o.paymentTransactionId || null, o.orderStatus || 'processing', o.courierPartner || null,
        o.trackingNumber || null, o.estimatedDeliveryDate || null, JSON.stringify(o.trackingTimeline || []), JSON.stringify(o.shippingAddress || null),
        JSON.stringify(o.digitalLicenses || []), o.invoiceNumber, o.createdAt || new Date().toISOString()
      ]
    );

    // Update book stock quantities
    if (o.items && Array.isArray(o.items)) {
      for (const item of o.items) {
        if (item.format !== 'pdf') { // only physical items decrease stock quantity
          await client.query(
            `UPDATE books SET "stockQuantity" = GREATEST(0, "stockQuantity" - $1) WHERE id = $2`,
            [item.quantity || 1, item.bookId]
          );
        }
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
    
    const o = { ...parseOrder(existing.rows[0]), ...updates };
    
    await pool.query(
      `UPDATE orders SET
         "orderStatus" = $2,
         "courierPartner" = $3,
         "trackingNumber" = $4,
         "estimatedDeliveryDate" = $5,
         "trackingTimeline" = $6,
         "paymentStatus" = $7
       WHERE id = $1`,
      [
        id, o.orderStatus, o.courierPartner || null, o.trackingNumber || null,
        o.estimatedDeliveryDate || null, JSON.stringify(o.trackingTimeline || []),
        o.paymentStatus
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

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port http://localhost:${PORT}`);
});

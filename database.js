// Step 1: Make sure your Postgres database is running
// Install: npm i pg

const { Pool } = require('pg');
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:1234@localhost:5432/fintechCorp';

const pool = new Pool({ connectionString });

async function insertTransaksi({
  id,
  tipe,
  jumlah,
  mata_uang,
  tanggal,
  kategori,
  vendor,
  keterangan,
  status = 'pending',
}) {
  const q = `INSERT INTO public.transaksi (id, tipe, jumlah, mata_uang, tanggal, kategori, vendor, keterangan, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
  const values = [
    id,
    tipe,
    jumlah,
    mata_uang,
    tanggal,
    kategori,
    vendor,
    keterangan,
    status,
  ];
  return pool.query(q, values);
}

module.exports = { insertTransaksi, pool };

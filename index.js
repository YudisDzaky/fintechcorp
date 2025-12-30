const express = require('express');
const path = require('path');
const app = express();
const port = 8000;
const db = require('./database');

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Add New.html'));
});

app.get('/api/transaksi', async (req, res) => {
  try {
    const result = await db.pool.query(
      'SELECT * FROM public.transaksi ORDER BY tanggal DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Query error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Aggregated stats (total balance, pending count, pending amount)
app.get('/api/stats', async (req, res) => {
  try {
    const q = `SELECT
      COALESCE(SUM(CASE WHEN tipe::text IN ('pemasukan','income') THEN jumlah::numeric ELSE 0 END),0) AS income,
      COALESCE(SUM(CASE WHEN tipe::text IN ('pengeluaran','expense') THEN jumlah::numeric ELSE 0 END),0) AS expenses,
      COALESCE(SUM(CASE WHEN status::text = 'pending' THEN 1 ELSE 0 END),0) AS pending_count,
      COALESCE(SUM(CASE WHEN status::text = 'pending' THEN jumlah::numeric ELSE 0 END),0) AS pending_amount,
      COALESCE(SUM(CASE WHEN tipe::text IN ('pengeluaran','expense') AND date_trunc('month', tanggal::date) = date_trunc('month', current_date) THEN jumlah::numeric ELSE 0 END),0) AS monthly_burn
    FROM public.transaksi`;

    const result = await db.pool.query(q);
    const row = result.rows[0] || {};
    const income = Number(row.income || 0);
    const expenses = Number(row.expenses || 0);
    const pending_count = Number(row.pending_count || 0);
    const pending_amount = Number(row.pending_amount || 0);
    const monthly_burn = Number(row.monthly_burn || 0);
    const total_balance = income - expenses;

    res.json({
      total_balance,
      income,
      expenses,
      pending_count,
      pending_amount,
      monthly_burn,
    });
  } catch (err) {
    console.error('Stats query error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const id =
      (body.id && body.id.trim()) || 'TRX' + Date.now().toString().slice(-6);
    const tipe = body.tipe || 'pengeluaran';
    const jumlah = body.jumlah || 0;
    const mata_uang = body.mata_uang || 'IDR';
    const tanggal = body.tanggal || new Date().toISOString().slice(0, 10);
    const kategori = body.kategori || '';
    const vendor = body.vendor || '';
    const keterangan = body.keterangan || '';

    // mark new transactions as pending by default
    await db.insertTransaksi({
      id,
      tipe,
      jumlah,
      mata_uang,
      tanggal,
      kategori,
      vendor,
      keterangan,
      status: 'pending',
    });
    res.redirect(`Transaction Managemen.html?new=${encodeURIComponent(id)}`);
  } catch (err) {
    console.error('Insert error', err);
    res.status(500).send('Database error');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

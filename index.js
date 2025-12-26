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

app.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const id = (body.id && body.id.trim()) || ('TRX' + Date.now().toString().slice(-6));
    const tipe = body.tipe || 'pengeluaran';
    const jumlah = body.jumlah || 0;
    const mata_uang = body.mata_uang || 'IDR';
    const tanggal = body.tanggal || new Date().toISOString().slice(0,10);
    const kategori = body.kategori || '';
    const vendor = body.vendor || '';
    const keterangan = body.keterangan || '';

    await db.insertTransaksi({ id, tipe, jumlah, mata_uang, tanggal, kategori, vendor, keterangan });
    res.redirect('Transaction Managemen.html');
  } catch (err) {
    console.error('Insert error', err);
    res.status(500).send('Database error');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

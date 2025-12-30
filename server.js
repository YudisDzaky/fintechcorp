const express = require('express');
const app = express();
const port = 8000;

const bodyParser = require('body-parser');

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Add New.html');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.get('/submit', function (req, res) {
  console.log('Data Saved');
});

const { Pool, Client } = require('pg');
const connectionString =
  'postgresql://postgres:1234@localhost:5432/fintechCorp';

const client = new Client({
  connectionString: connectionString,
});

app.post('/', (req, res) => {
  const { id, tipe, jumlah, tanggal, kategori, vendor, keterangan } = req.body;

  client.connect();
  client.query(
    `INSERT INTO transaksi 
     (id, tipe, jumlah, tanggal, kategori, vendor, keterangan)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, tipe, jumlah, tanggal, kategori, vendor, keterangan],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      client.end();
    }
  );

  res.sendFile(__dirname + '/Add New.html');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

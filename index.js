const express = require('express');
const app = express();
const port = 3000;
const Riak = require('no-riak');

const client = new Riak.Client()

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.get('/', async  (req, res) => {
    let keys = await client.listKeys({
        bucket: 'mahasiswa'
    });
    let mahasiswas = [];
    mahasiswas = await Promise.all(keys.map(async (key) => {
        let mahasiswa = await client.get({
            bucket: 'mahasiswa',
            key: key
        });
        return mahasiswa.content[0].value;
    }));
    res.render('index.ejs', { 
        mahasiswas: mahasiswas,
        title: 'Daftar Mahasiswa'
    });
});
app.get('/tambah', (req, res) => {
    res.render('tambah.ejs', { title: 'Tambah Mahasiswa' });
});


app.post('/tambah', async (req, res) => {
    const nama = req.body.nama;
    const nim = req.body.nim;
    const jurusan = req.body.jurusan;

    const mahasiswa = {
        nama: nama,
        nim: nim,
        jurusan: jurusan
    };

    await client.put({
        bucket: 'mahasiswa',
        key: nim,
        content: {
            value: mahasiswa
        }
    });
    res.redirect('/');
});

app.get('/hapus/:nim', async (req, res) => {
    const nim = req.params.nim;
    await client.del({
        bucket: 'mahasiswa',
        key: nim
    });

    setTimeout(() => {
        res.redirect('/');
    }, 3000);
});

app.get('/edit/:nim', async (req, res) => {
    const nim = req.params.nim;
    const mahasiswa = await client.get({
        bucket: 'mahasiswa',
        key: nim
    });
    res.render('edit.ejs', { mahasiswa: mahasiswa.content[0].value, title: 'Edit Mahasiswa' });
});

app.post('/edit/:nim', async (req, res) => {
    const nim = req.params.nim;
    const nama = req.body.nama;
    const jurusan = req.body.jurusan;

    const mahasiswa = {
        nama: nama,
        nim: nim,
        jurusan: jurusan
    };

    await client.put({
        bucket: 'mahasiswa',
        key: nim,
        content: {
            value: mahasiswa
        }
    });
    res.redirect('/');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));